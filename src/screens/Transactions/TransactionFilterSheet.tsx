/** @screen DTB-2-SHEET-01-0 내역 필터링 */
/** @screen DTB-3-SHEET-01-0 기간 선택 캘린더 (customStart/customEnd 커스텀 기간용 내부 Calendar 시트) */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Button from '../../components/Input/Button/Button';
import TextButton from '../../components/Input/Button/TextButton';
import FilterPill from '../../components/Input/Filter/FilterPill';
import FilterChip from '../../components/Input/Filter/FilterChip';
import Chip from '../../components/Data Display/Chips/Chip';
import Calendar from '../../components/Data Display/Calendar/Calendar';
import TransactionLedgerMultiSelectSheet from './TransactionLedgerMultiSelectSheet';
import {
  DEFAULT_ENTRY_LIST_FILTER,
  type EntryListFilterValue,
} from '../../types/entry';
import {
  FILTER_APPLY_LABEL,
  FILTER_PERIOD_1MONTH,
  FILTER_PERIOD_3MONTH,
  FILTER_PERIOD_6MONTH,
  FILTER_PERIOD_CUSTOM,
  FILTER_PERIOD_LABEL,
  FILTER_RESET_LABEL,
  FILTER_SHEET_TITLE,
  FILTER_SORT_LABEL,
  FILTER_SORT_LATEST,
  FILTER_SORT_OLDEST,
  FILTER_TYPE_ALL,
  FILTER_TYPE_EXPENSE,
  FILTER_TYPE_INCOME,
  FILTER_TYPE_LABEL,
} from '../../constants/ledgerScreenText';
import {
  FILTER_LEDGER_ADD_LABEL,
  FILTER_LEDGER_LABEL,
} from '../../constants/transactionScreenText';
import { FOREGROUND_NEUTRAL_NORMAL } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CALENDAR_ICON = require('../../assets/icons/system/Calendar.png');

type LedgerOption = { id: string; name: string };

type TransactionFilterSheetProps = {
  visible: boolean;
  value: EntryListFilterValue;
  /** 실 API(`ledgerService.getAllLedgersInGroup`)에서 부모가 가져와 내려준다 —
   * 이 시트와 하위 `TransactionLedgerMultiSelectSheet`가 열릴 때마다 따로
   * 부르지 않는다. */
  ledgerOptions: LedgerOption[];
  onClose: () => void;
  onApply: (value: EntryListFilterValue) => void;
  onPressCreateNewLedger: () => void;
};

/** 내역 메인 화면의 필터 바텀시트: 장부/기간/구분/정렬 순서. */
function TransactionFilterSheet({
  visible,
  value,
  ledgerOptions,
  onClose,
  onApply,
  onPressCreateNewLedger,
}: TransactionFilterSheetProps) {
  const [draft, setDraft] = useState<EntryListFilterValue>(value);
  const [ledgerSheetVisible, setLedgerSheetVisible] = useState(false);
  const [calendarSheetVisible, setCalendarSheetVisible] = useState(false);
  const [calendarYear, setCalendarYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date().getMonth() + 1,
  );

  const handleSelectDate = (date: string) => {
    if (!draft.customStart || (draft.customStart && draft.customEnd)) {
      setDraft({ ...draft, customStart: date, customEnd: undefined });
    } else if (date < draft.customStart) {
      setDraft({ ...draft, customStart: date, customEnd: draft.customStart });
    } else {
      setDraft({ ...draft, customEnd: date });
    }
  };

  const handleChangeMonth = (delta: number) => {
    const next = new Date(calendarYear, calendarMonth - 1 + delta, 1);
    setCalendarYear(next.getFullYear());
    setCalendarMonth(next.getMonth() + 1);
  };

  const handleReset = () => {
    setDraft(DEFAULT_ENTRY_LIST_FILTER);
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const removeLedger = (id: string) => {
    setDraft({ ...draft, ledgerIds: draft.ledgerIds.filter(l => l !== id) });
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{FILTER_SHEET_TITLE}</Text>

      <Text style={styles.sectionLabel}>{FILTER_PERIOD_LABEL}</Text>
      <View style={styles.chipRow}>
        <FilterPill
          label={FILTER_PERIOD_1MONTH}
          active={draft.period === '1month'}
          onPress={() => setDraft({ ...draft, period: '1month' })}
        />
        <FilterPill
          label={FILTER_PERIOD_3MONTH}
          active={draft.period === '3month'}
          onPress={() => setDraft({ ...draft, period: '3month' })}
        />
        <FilterPill
          label={FILTER_PERIOD_6MONTH}
          active={draft.period === '6month'}
          onPress={() => setDraft({ ...draft, period: '6month' })}
        />
        <FilterPill
          label={FILTER_PERIOD_CUSTOM}
          active={draft.period === 'custom'}
          onPress={() => setDraft({ ...draft, period: 'custom' })}
        />
      </View>

      {draft.period === 'custom' && (
        <TextButton
          label={
            draft.customStart && draft.customEnd
              ? `${draft.customStart} ~ ${draft.customEnd}`
              : FILTER_PERIOD_CUSTOM
          }
          hierarchy="secondary"
          icon={CALENDAR_ICON}
          onPress={() => setCalendarSheetVisible(true)}
        />
      )}

      <Text style={styles.sectionLabel}>{FILTER_LEDGER_LABEL}</Text>
      <View style={styles.chipRow}>
        <FilterChip
          label={FILTER_LEDGER_ADD_LABEL}
          active={draft.ledgerIds.length > 0}
          onPress={() => setLedgerSheetVisible(true)}
        />
      </View>
      {draft.ledgerIds.length > 0 && (
        <View style={styles.chipRow}>
          {draft.ledgerIds.map(id => {
            const option = ledgerOptions.find(item => item.id === id);
            return option ? (
              <Chip
                key={id}
                label={option.name}
                onRemove={() => removeLedger(id)}
              />
            ) : null;
          })}
        </View>
      )}

      <Text style={styles.sectionLabel}>{FILTER_TYPE_LABEL}</Text>
      <View style={styles.chipRow}>
        <FilterPill
          label={FILTER_TYPE_ALL}
          active={draft.type === 'all'}
          onPress={() => setDraft({ ...draft, type: 'all' })}
        />
        <FilterPill
          label={FILTER_TYPE_INCOME}
          active={draft.type === 'income'}
          onPress={() => setDraft({ ...draft, type: 'income' })}
        />
        <FilterPill
          label={FILTER_TYPE_EXPENSE}
          active={draft.type === 'expense'}
          onPress={() => setDraft({ ...draft, type: 'expense' })}
        />
      </View>

      <Text style={styles.sectionLabel}>{FILTER_SORT_LABEL}</Text>
      <View style={styles.chipRow}>
        <FilterPill
          label={FILTER_SORT_LATEST}
          active={draft.sort === 'latest'}
          onPress={() => setDraft({ ...draft, sort: 'latest' })}
        />
        <FilterPill
          label={FILTER_SORT_OLDEST}
          active={draft.sort === 'oldest'}
          onPress={() => setDraft({ ...draft, sort: 'oldest' })}
        />
      </View>

      <View style={styles.footer}>
        <TextButton
          label={FILTER_RESET_LABEL}
          hierarchy="tertiary"
          onPress={handleReset}
        />
        <View style={styles.applyButton}>
          <Button label={FILTER_APPLY_LABEL} onPress={handleApply} fullWidth />
        </View>
      </View>

      <TransactionLedgerMultiSelectSheet
        visible={ledgerSheetVisible}
        options={ledgerOptions}
        selectedIds={draft.ledgerIds}
        onClose={() => setLedgerSheetVisible(false)}
        onApply={ledgerIds => setDraft({ ...draft, ledgerIds })}
        onPressCreateNewLedger={() => {
          onClose();
          onPressCreateNewLedger();
        }}
      />

      <BottomSheet
        visible={calendarSheetVisible}
        onClose={() => setCalendarSheetVisible(false)}
      >
        <Calendar
          year={calendarYear}
          month={calendarMonth}
          selectedStartDate={draft.customStart}
          selectedEndDate={draft.customEnd}
          onSelectDate={handleSelectDate}
          onChangeMonth={handleChangeMonth}
        />
        <View style={styles.footer}>
          <Button
            label={FILTER_APPLY_LABEL}
            onPress={() => setCalendarSheetVisible(false)}
            disabled={!draft.customStart || !draft.customEnd}
            fullWidth
          />
        </View>
      </BottomSheet>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.subtitle1,
    marginBottom: 16,
  },
  sectionLabel: {
    // 12px 1:1 대응 Bold 스타일이 시맨틱에 없어 body3(Regular family)에 fontWeight만 덧씌움.
    ...TYPOGRAPHY.body3,
    fontWeight: 'bold',
    color: FOREGROUND_NEUTRAL_NORMAL,
    marginTop: 16,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 24,
  },
  applyButton: {
    flex: 1,
  },
});

export default TransactionFilterSheet;
