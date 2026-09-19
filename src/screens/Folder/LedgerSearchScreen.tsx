/** @screen FDR-3-PAGE-02-0 내역 검색_장부 */
import { useCallback, useEffect, useState } from 'react';
import { Keyboard, SectionList, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import SearchField from '../../components/Input/Search/SearchField';
import TextButton from '../../components/Input/Button/TextButton';
import Button from '../../components/Input/Button/Button';
import TransactionListItem from '../../components/Data Display/Lists/TransactionListItem';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { groupEntriesByDate, type EntrySummary } from '../../types/entry';
import { formatDateHeader } from '../../utils/dateHeader';
import * as entryService from '../../services/entryService';
import LedgerFilterSheet, {
  DEFAULT_LEDGER_FILTER,
  toEntryFilterQuery,
  type LedgerFilterValue,
} from './LedgerFilterSheet';
import {
  LEDGER_DETAIL_RETRY_LABEL,
  LEDGER_ENTRIES_LOADING_MORE,
  LEDGER_ENTRY_SEARCH_EMPTY,
  LEDGER_SEARCH_PLACEHOLDER,
} from '../../constants/ledgerScreenText';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const FILTER_LABEL = '필터';

type LedgerSearchNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LedgerSearch'
>;
type LedgerSearchRouteProp = RouteProp<RootStackParamList, 'LedgerSearch'>;

/** 장부 상세에서 진입하는 내역 검색 화면: 제목/메모 검색(keyword) + 필터 시트. */
function LedgerSearchScreen() {
  const navigation = useNavigation<LedgerSearchNavigationProp>();
  const route = useRoute<LedgerSearchRouteProp>();
  const { ledgerId, ledgerName } = route.params;

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<LedgerFilterValue>(DEFAULT_LEDGER_FILTER);
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [results, setResults] = useState<EntrySummary[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchError, setSearchError] = useState<string | undefined>();

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const search = useCallback(
    async (reset: boolean) => {
      const nextPage = reset ? 0 : page + 1;
      if (!reset) {
        setIsLoadingMore(true);
      }
      try {
        const result = await entryService.getEntries(ledgerId, {
          keyword: query.trim() || undefined,
          ...toEntryFilterQuery(filter),
          page: nextPage,
        });
        setResults(current => (reset ? result.items : [...current, ...result.items]));
        setPage(result.page);
        setHasMore(!result.last);
        if (reset) {
          setSearchError(undefined);
        }
      } catch (error) {
        // "결과 없음"과 "요청 실패"를 구분한다 — 전에는 둘 다 빈 목록으로만
        // 보여서 사용자가 검색이 실패한 건지 그냥 결과가 없는 건지 알 수 없었다.
        if (reset) {
          setResults([]);
          setHasMore(false);
          setSearchError(toErrorMessage(error));
        }
      } finally {
        setIsLoadingMore(false);
      }
    },
    [ledgerId, query, filter, page],
  );

  useEffect(() => {
    search(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ledgerId, query, filter]);

  // 서버가 발생일 순으로 내려주므로 받은 순서 그대로 같은 날짜끼리 묶는다(최신순/과거순 모두).
  const sections = groupEntriesByDate(results).map(group => ({
    title: formatDateHeader(group.date),
    data: group.items,
  }));

  // 설명표 No.1: 백버튼은 키보드를 내리고 검색어를 파기한 뒤 이전 화면으로 돌아간다. 검색어(`query`)는
  // 이 화면의 로컬 상태라 화면이 pop되면 함께 사라지므로 파기를 따로 할 필요는 없다 — 키보드만 내린다.
  const handleBack = () => {
    Keyboard.dismiss();
    navigation.goBack();
  };

  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      search(false);
    }
  };

  return (
    <ScreenContainer background="secondary">
      <AppBar type="sub" title={ledgerName} onBackPress={handleBack} />

      <View style={styles.body}>
        <View style={styles.searchWrapper}>
          <SearchField
            variant="outline"
            autoFocus
            value={query}
            onChangeText={setQuery}
            onClear={() => setQuery('')}
            placeholder={LEDGER_SEARCH_PLACEHOLDER}
          />
        </View>

        <View style={styles.filterRow}>
          <TextButton
            label={FILTER_LABEL}
            hierarchy="tertiary"
            onPress={() => setFilterSheetVisible(true)}
          />
        </View>

        {searchError ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{searchError}</Text>
            <Button
              label={LEDGER_DETAIL_RETRY_LABEL}
              onPress={() => search(true)}
              hierarchy="secondary"
              style={styles.retryButton}
            />
          </View>
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>{LEDGER_ENTRY_SEARCH_EMPTY}</Text>
          </View>
        ) : (
          // 시안: 날짜 그룹 헤더(`4월 16일 목요일`) 단위로 묶고, 리스트를 스크롤하면 시야 확보를 위해
          // 키보드가 자동으로 닫힌다(설명표 No.3 [액션] Dismiss). `handled`는 키보드가 떠 있어도 행을
          // 첫 탭에 바로 열게 한다.
          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            stickySectionHeadersEnabled={false}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
            onEndReachedThreshold={0.4}
            onEndReached={loadMore}
            ListFooterComponent={
              isLoadingMore ? (
                <Text style={styles.loadingMoreText}>{LEDGER_ENTRIES_LOADING_MORE}</Text>
              ) : null
            }
            renderSectionHeader={({ section }) => (
              <Text style={styles.sectionHeader}>{section.title}</Text>
            )}
            renderItem={({ item }) => (
              <TransactionListItem
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

      <LedgerFilterSheet
        visible={filterSheetVisible}
        value={filter}
        onClose={() => setFilterSheetVisible(false)}
        onApply={setFilter}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // 앱바(`AppBar`) 아래 좌우 24 본문. 예전 `paddingTop: 60` 하드코딩은 앱바가 상단 여백을 대신해 없앴다.
  body: {
    flex: 1,
    paddingHorizontal: 24,
  },
  // 시안: 검색 필드는 앱바 아래 별도 줄.
  searchWrapper: {
    marginTop: 8,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 24,
  },
  // 장부 상세·내역 메인과 같은 그룹 헤더(12px+Bold는 정식 스타일에 없어 body3+bold 예외).
  sectionHeader: {
    ...TYPOGRAPHY.body3,
    fontWeight: 'bold',
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 12,
    marginBottom: 6,
  },
  loadingMoreText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    textAlign: 'center',
    paddingVertical: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    gap: 12,
  },
  emptyTitle: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  retryButton: {
    marginTop: 4,
  },
});

export default LedgerSearchScreen;
