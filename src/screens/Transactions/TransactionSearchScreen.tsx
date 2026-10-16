import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import SearchField from '../../components/Input/Search/SearchField';
import Divider from '../../components/Data Display/Divider/Divider';
import TransactionListItem from '../../components/Data Display/Lists/TransactionListItem';
import type { EntrySummary } from '../../types/entry';
import { groupEntriesByDate } from '../../types/entry';
import { getActiveGroup } from '../../types/group';
import * as entryService from '../../services/entryService';
import * as groupService from '../../services/groupService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  NO_ACTIVE_GROUP_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
  toUserErrorMessage,
} from '../../constants/apiErrorMessages';
import { LEDGER_ENTRIES_LOADING_MORE, LEDGER_SEARCH_EMPTY } from '../../constants/ledgerScreenText';
import {
  TRANSACTION_SEARCH_PLACEHOLDER,
  TRANSACTIONS_COUNT_SUFFIX,
  TRANSACTIONS_EMPTY,
  TRANSACTIONS_RETRY_LABEL,
  TRANSACTIONS_TITLE,
} from '../../constants/transactionScreenText';
import { formatDateHeader } from '../../utils/dateHeader';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_NORMAL, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  SNACKBAR_LOAD_MORE_FAILED,
} from '../../constants/commonText';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';

const SEARCH_DEBOUNCE_MS = 300;

type TransactionSearchNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'TransactionSearch'
>;

type SearchState = 'loading' | 'error' | 'ready';

function TransactionSearchScreen() {
  const navigation = useNavigation<TransactionSearchNavigationProp>();
  const [query, setQuery] = useState('');
  const [entries, setEntries] = useState<EntrySummary[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchState, setSearchState] = useState<SearchState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const loadMoreFailedRef = useRef(false);
  const requestIdRef = useRef(0);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), 1600);
  };
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code, error.message);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const search = useCallback(async (keyword: string) => {
    const trimmed = keyword.trim();
    const requestId = ++requestIdRef.current;
    setSearchState('loading');
    try {
      let group = getActiveGroup();
      if (!group) {
        await groupService.getMyGroups();
        group = getActiveGroup();
      }
      if (!group) {
        if (requestId !== requestIdRef.current) {
          return;
        }
        setErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setSearchState('error');
        return;
      }
      const firstPage = await entryService.getGroupEntries(group.id, {
        keyword: trimmed || undefined,
        page: 0,
      });
      if (requestId !== requestIdRef.current) {
        return;
      }
      setEntries(firstPage.items);
      setPage(firstPage.page);
      setHasMore(!firstPage.last);
      setTotalElements(firstPage.totalElements);
      loadMoreFailedRef.current = false;
      setSearchState('ready');
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      setErrorMessage(toErrorMessage(error));
      setSearchState('error');
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (!query.trim()) {
      search(query);
      return;
    }
    debounceRef.current = setTimeout(() => {
      search(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const loadMoreEntries = useCallback(async () => {
    if (loadMoreFailedRef.current || isLoadingMore || !hasMore) {
      return;
    }
    const group = getActiveGroup();
    if (!group) {
      return;
    }
    setIsLoadingMore(true);
    try {
      const nextPage = await entryService.getGroupEntries(group.id, {
        keyword: query.trim() || undefined,
        page: page + 1,
      });
      setEntries(current => [...current, ...nextPage.items]);
      setPage(nextPage.page);
      setHasMore(!nextPage.last);
    } catch (error) {
      loadMoreFailedRef.current = true;
      showSnackbar(toUserErrorMessage(error, SNACKBAR_LOAD_MORE_FAILED));
    } finally {
      setIsLoadingMore(false);
    }
  }, [query, page, isLoadingMore, hasMore]);

  const sections = groupEntriesByDate(entries).map(group => ({
    title: formatDateHeader(group.date),
    data: group.items,
  }));

  return (
    <ScreenContainer
      background="secondary"
      snackbar={snackbarMessage ? <Snackbar visible title={snackbarMessage} /> : undefined}
    >
      <AppBar
        type="sub"
        title={TRANSACTIONS_TITLE}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.body}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          onClear={() => setQuery('')}
          placeholder={TRANSACTION_SEARCH_PLACEHOLDER}
          variant="outline"
        />

        {searchState === 'ready' && (
          <>
            <View style={styles.countRow}>
              <Text style={styles.countText}>
                {totalElements}
                {TRANSACTIONS_COUNT_SUFFIX}
              </Text>
            </View>
            <View style={styles.dividerBleed}>
              <Divider />
            </View>
          </>
        )}

        {searchState === 'loading' ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="small" />
          </View>
        ) : searchState === 'error' ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{errorMessage}</Text>
            <Button
              label={TRANSACTIONS_RETRY_LABEL}
              onPress={() => search(query)}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          </View>
        ) : entries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {query.trim() ? LEDGER_SEARCH_EMPTY : TRANSACTIONS_EMPTY}
            </Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            onEndReachedThreshold={0.4}
            onEndReached={loadMoreEntries}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={styles.loadingMoreRow}>
                  <ActivityIndicator size="small" />
                  <Text style={styles.loadingMoreText}>
                    {LEDGER_ENTRIES_LOADING_MORE}
                  </Text>
                </View>
              ) : null
            }
            renderSectionHeader={({ section }) => (
              <Text style={styles.sectionHeader}>{section.title}</Text>
            )}
            renderItem={({ item }) => (
              <TransactionListItem
                label={item.ledgerName}
                itemName={item.title}
                amount={item.type === 'INCOME' ? item.amount : -item.amount}
                hasReceipt={item.receiptCount > 0}
                isPendingApproval={item.approvalStatus === 'PENDING'}
                onPress={() =>
                  navigation.navigate('TransactionDetail', {
                    transactionId: item.id,
                  })
                }
              />
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
  },
  countRow: {
    height: 39,
    justifyContent: 'center',
    marginTop: 16,
  },
  countText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  dividerBleed: {
    marginHorizontal: -20,
  },
  listContent: {
    paddingBottom: 24,
  },
  sectionHeader: {
    ...TYPOGRAPHY.caption,
    color: FOREGROUND_NEUTRAL_NORMAL,
    marginTop: 12,
    marginBottom: 6,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 40,
  },
  stateText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 56,
  },
  emptyTitle: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  loadingMoreRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  loadingMoreText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default TransactionSearchScreen;
