import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import IconButton from '../../components/Input/Button/IconButton';
import Chip from '../../components/Data Display/Chips/Chip';
import ReceiptGrid from './ReceiptGrid';
import ReceiptFilterSheet from './ReceiptFilterSheet';
import { getActiveGroup } from '../../types/group';
import type { Receipt } from '../../types/receipt';
import {
  DEFAULT_ENTRY_LIST_FILTER,
  getEntryListFilterDateRange,
  type EntryListFilterValue,
} from '../../types/entry';
import * as receiptService from '../../services/receiptService';
import * as ledgerService from '../../services/ledgerService';
import * as groupService from '../../services/groupService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  NO_ACTIVE_GROUP_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  RECEIPT_ALBUM_COUNT_SUFFIX,
  RECEIPT_ALBUM_EMPTY,
  RECEIPT_ALBUM_LOADING,
  RECEIPT_ALBUM_RETRY_LABEL,
  RECEIPT_ALBUM_TITLE,
} from '../../constants/receiptScreenText';
import {
  FILTER_TYPE_EXPENSE,
  FILTER_TYPE_INCOME,
} from '../../constants/ledgerScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const FILTER_ICON = require('../../assets/icons/system/Filter.png');
const SEARCH_ICON = require('../../assets/icons/system/Search.png');

type LoadState = 'loading' | 'error' | 'ready';
type LedgerOption = { id: string; name: string };
type ReceiptAlbumNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type FilterChipInfo = { key: string; label: string };

function getFilterChips(
  filter: EntryListFilterValue,
  ledgerOptions: LedgerOption[],
): FilterChipInfo[] {
  const chips: FilterChipInfo[] = [];
  if (filter.type === 'income') {
    chips.push({ key: 'type', label: FILTER_TYPE_INCOME });
  } else if (filter.type === 'expense') {
    chips.push({ key: 'type', label: FILTER_TYPE_EXPENSE });
  }
  for (const id of filter.ledgerIds) {
    const option = ledgerOptions.find(item => item.id === id);
    if (option) {
      chips.push({ key: `ledger-${id}`, label: option.name });
    }
  }
  return chips;
}

function ReceiptAlbumScreen() {
  const navigation = useNavigation<ReceiptAlbumNavigationProp>();
  const [filter, setFilter] = useState<EntryListFilterValue>(DEFAULT_ENTRY_LIST_FILTER);
  const [ledgerOptions, setLedgerOptions] = useState<LedgerOption[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const buildParams = useCallback(
    (pageToLoad: number): receiptService.ReceiptListParams => {
      const range = getEntryListFilterDateRange(filter);
      return {
        ledgerIds: filter.ledgerIds.length > 0 ? filter.ledgerIds : undefined,
        type: filter.type === 'income' ? 'INCOME' : filter.type === 'expense' ? 'EXPENSE' : undefined,
        from: range.from,
        to: range.to,
        page: pageToLoad,
      };
    },
    [filter],
  );

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      let group = getActiveGroup();
      if (!group) {
        await groupService.getMyGroups();
        group = getActiveGroup();
      }
      if (!group) {
        setLoadErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setLoadState('error');
        return;
      }
      const firstPage = await receiptService.getReceipts(group.id, buildParams(0));
      setReceipts(firstPage.items);
      setPage(firstPage.page);
      setHasMore(!firstPage.last);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [buildParams]);

  const loadLedgerOptions = useCallback(async () => {
    let group = getActiveGroup();
    if (!group) {
      await groupService.getMyGroups();
      group = getActiveGroup();
    }
    if (!group) {
      return;
    }
    try {
      const ledgers = await ledgerService.getAllLedgersInGroup(group.id);
      setLedgerOptions(ledgers.map(l => ({ id: l.id, name: l.name })));
    } catch {
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) {
      return;
    }
    const group = getActiveGroup();
    if (!group) {
      return;
    }
    setIsLoadingMore(true);
    try {
      const nextPage = await receiptService.getReceipts(group.id, buildParams(page + 1));
      setReceipts(current => [...current, ...nextPage.items]);
      setPage(nextPage.page);
      setHasMore(!nextPage.last);
    } catch {
    } finally {
      setIsLoadingMore(false);
    }
  }, [buildParams, page, isLoadingMore, hasMore]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useFocusEffect(
    useCallback(() => {
      loadLedgerOptions();
    }, [loadLedgerOptions]),
  );

  const filterChips = getFilterChips(filter, ledgerOptions);

  const removeFilterChip = (key: string) => {
    if (key === 'type') {
      setFilter({ ...filter, type: 'all' });
    } else if (key.startsWith('ledger-')) {
      const ledgerId = key.slice('ledger-'.length);
      setFilter({ ...filter, ledgerIds: filter.ledgerIds.filter(id => id !== ledgerId) });
    }
  };

  const handlePressReceipt = (item: Receipt) => {
    navigation.navigate('ReceiptDetail', {
      fileId: item.fileId,
      fileUrl: item.fileUrl,
      entryId: item.entryId,
      entryTitle: item.entryTitle,
      occurredOn: item.occurredOn,
    });
  };

  return (
    <ScreenContainer background="secondary">
      <AppBar type="sub" title={RECEIPT_ALBUM_TITLE} onBackPress={() => navigation.goBack()} />

      <View style={styles.body}>
        <View style={styles.iconRow}>
          <IconButton icon={FILTER_ICON} onPress={() => setFilterSheetVisible(true)} />
          <IconButton icon={SEARCH_ICON} onPress={() => navigation.navigate('ReceiptSearch')} />
        </View>

        {filterChips.length > 0 && (
          <View style={styles.chipRow}>
            {filterChips.map(chip => (
              <Chip key={chip.key} label={chip.label} onRemove={() => removeFilterChip(chip.key)} />
            ))}
          </View>
        )}

        {loadState === 'loading' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{RECEIPT_ALBUM_LOADING}</Text>
          </View>
        )}

        {loadState === 'error' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{loadErrorMessage}</Text>
            <Button
              label={RECEIPT_ALBUM_RETRY_LABEL}
              onPress={load}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          </View>
        )}

        {loadState === 'ready' && (
          <>
            <Text style={styles.countText}>
              {receipts.length}
              {RECEIPT_ALBUM_COUNT_SUFFIX}
            </Text>
            <ReceiptGrid
              items={receipts}
              emptyText={RECEIPT_ALBUM_EMPTY}
              onEndReached={loadMore}
              onPressItem={handlePressReceipt}
            />
          </>
        )}
      </View>

      <ReceiptFilterSheet
        visible={filterSheetVisible}
        value={filter}
        ledgerOptions={ledgerOptions}
        onClose={() => setFilterSheetVisible(false)}
        onApply={setFilter}
        onPressCreateNewLedger={() => navigation.navigate('LedgerCreate', { parentId: null })}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 8,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  stateText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
  },
  countText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default ReceiptAlbumScreen;
