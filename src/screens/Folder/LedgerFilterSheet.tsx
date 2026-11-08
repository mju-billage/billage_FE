import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Button from '../../components/Input/Button/Button';
import FilterPill from '../../components/Input/Filter/FilterPill';
import FilterChip from '../../components/Input/Filter/FilterChip';
import DateRangeField from '../../components/Input/Date Field/DateRangeField';
import Calendar from '../../components/Data Display/Calendar/Calendar';
import type { EntryListParams } from '../../services/entryService';
import { getEntryListFilterDateRange } from '../../types/entry';
import { nextRangeSelection, todayKey } from '../../utils/calendarGrid';
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
  FILTER_PERIOD_SHEET_TITLE,
  LEDGER_SELECT_CONFIRM_LABEL,
  LEDGER_SELECT_PREVIOUS_LABEL,
} from '../../constants/transactionScreenText';
import { FOREGROUND_NEUTRAL_NORMAL } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

export type LedgerFilterPeriod = 'all' | '1month' | '3month' | '6month' | 'custom';
export type LedgerFilterType = 'all' | 'income' | 'expense';
export type LedgerFilterSort = 'latest' | 'oldest';

export type LedgerFilterValue = {
  period: LedgerFilterPeriod;
  customStart?: string;
  customEnd?: string;
  type: LedgerFilterType;
  sort: LedgerFilterSort;
};

export const DEFAULT_LEDGER_FILTER: LedgerFilterValue = {
  period: 'all',
  type: 'all',
  sort: 'latest',
};

export function toEntryFilterQuery(
  value: LedgerFilterValue,
): Pick<EntryListParams, 'type' | 'sort'> {
  return {
    type: value.type === 'income' ? 'INCOME' : value.type === 'expense' ? 'EXPENSE' : undefined,
    sort: value.sort === 'oldest' ? 'occurredOn,asc' : undefined,
  };
}

/**
 * 기간 → from/to 변환은 내역 탭과 같은 getEntryListFilterDateRange 를 재사용한다
 * (함수를 복제하지 않는다, 7-6). type/sort/ledgerIds 는 그 함수가 쓰지 않는 더미 값이다.
 */
export function getLedgerFilterDateRange(
  value: LedgerFilterValue,
): { from?: string; to?: string } {
  if (value.period === 'all') {
    return {};
  }
  return getEntryListFilterDateRange({
    period: value.period,
    customStart: value.customStart,
    customEnd: value.customEnd,
    ledgerIds: [],
    type: 'all',
    sort: 'latest',
  });
}

type LedgerFilterSheetProps = {
  visible: boolean;
  value: LedgerFilterValue;
  onClose: () => void;
  onApply: (value: LedgerFilterValue) => void;
};

type SheetStep = 'filter' | 'period';
type PeriodDraft = { start?: string; end?: string };

function toShortDate(dateKey?: string): string | undefined {
  return dateKey ? dateKey.slice(2) : undefined;
}

function LedgerFilterSheet({
  visible,
  value,
  onClose,
  onApply,
}: LedgerFilterSheetProps) {
  const [step, setStep] = useState<SheetStep>('filter');
  const [draft, setDraft] = useState<LedgerFilterValue>(value);
  const [periodDraft, setPeriodDraft] = useState<PeriodDraft>({});
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth() + 1);

  const handleReset = () => {
    setDraft(DEFAULT_LEDGER_FILTER);
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  const handleSheetClose = () => {
    if (step === 'filter') {
      onClose();
    } else {
      setStep('filter');
    }
  };

  const openPeriodStep = () => {
    const start = draft.customStart;
    setPeriodDraft({ start, end: draft.customEnd });
    if (start) {
      const [year, month] = start.split('.').map(Number);
      setCalendarYear(year);
      setCalendarMonth(month);
    } else {
      setCalendarYear(new Date().getFullYear());
      setCalendarMonth(new Date().getMonth() + 1);
    }
    setStep('period');
  };

  const handleChangeMonth = (delta: number) => {
    const next = new Date(calendarYear, calendarMonth - 1 + delta, 1);
    setCalendarYear(next.getFullYear());
    setCalendarMonth(next.getMonth() + 1);
  };

  const handleSelectPeriodDate = (date: string) => {
    setPeriodDraft(nextRangeSelection(periodDraft, date));
  };

  const confirmPeriod = () => {
    if (!periodDraft.start || !periodDraft.end) {
      return;
    }
    setDraft({
      ...draft,
      period: 'custom',
      customStart: periodDraft.start,
      customEnd: periodDraft.end,
    });
    setStep('filter');
  };

  return (
    <BottomSheet visible={visible} onClose={handleSheetClose}>
      {step === 'filter' && (
        <>
          <Text style={styles.title}>{FILTER_SHEET_TITLE}</Text>

          <Text style={styles.sectionLabel}>{FILTER_PERIOD_LABEL}</Text>
          <View style={styles.chipRow}>
            <FilterChip
              label={FILTER_PERIOD_1MONTH}
              showIcon={false}
              style={styles.chipFlex}
              active={draft.period === '1month'}
              onPress={() => setDraft({ ...draft, period: '1month' })}
            />
            <FilterChip
              label={FILTER_PERIOD_3MONTH}
              showIcon={false}
              style={styles.chipFlex}
              active={draft.period === '3month'}
              onPress={() => setDraft({ ...draft, period: '3month' })}
            />
            <FilterChip
              label={FILTER_PERIOD_6MONTH}
              showIcon={false}
              style={styles.chipFlex}
              active={draft.period === '6month'}
              onPress={() => setDraft({ ...draft, period: '6month' })}
            />
            <FilterChip
              label={FILTER_PERIOD_CUSTOM}
              showIcon={false}
              style={styles.chipFlex}
              active={draft.period === 'custom'}
              onPress={() => setDraft({ ...draft, period: 'custom' })}
            />
          </View>
          {draft.period === 'custom' && (
            <View style={styles.dateRangeFieldWrapper}>
              <DateRangeField
                startDate={toShortDate(draft.customStart)}
                endDate={toShortDate(draft.customEnd)}
                onPress={openPeriodStep}
              />
            </View>
          )}

          <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>{FILTER_TYPE_LABEL}</Text>
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

          <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>{FILTER_SORT_LABEL}</Text>
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
            <View style={styles.resetButton}>
              <Button
                label={FILTER_RESET_LABEL}
                hierarchy="tertiary"
                onPress={handleReset}
                fullWidth
              />
            </View>
            <View style={styles.applyButton}>
              <Button label={FILTER_APPLY_LABEL} onPress={handleApply} fullWidth />
            </View>
          </View>
        </>
      )}

      {step === 'period' && (
        <>
          <Text style={styles.title}>{FILTER_PERIOD_SHEET_TITLE}</Text>
          <Calendar
            variant="default"
            showHeader
            year={calendarYear}
            month={calendarMonth}
            selectedStartDate={periodDraft.start}
            selectedEndDate={periodDraft.end}
            outlinedDates={[todayKey()]}
            showDateFields={!!periodDraft.start}
            onSelectDate={handleSelectPeriodDate}
            onChangeMonth={handleChangeMonth}
          />
          <View style={styles.footer}>
            <View style={styles.resetButton}>
              <Button
                label={LEDGER_SELECT_PREVIOUS_LABEL}
                hierarchy="tertiary"
                onPress={() => {
                  setPeriodDraft({});
                  setStep('filter');
                }}
                fullWidth
              />
            </View>
            <View style={styles.applyButton}>
              <Button
                label={LEDGER_SELECT_CONFIRM_LABEL}
                onPress={confirmPeriod}
                disabled={!periodDraft.start || !periodDraft.end}
                fullWidth
              />
            </View>
          </View>
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.subtitle1,
    marginBottom: 16,
  },
  sectionLabel: {
    ...TYPOGRAPHY.body3,
    fontWeight: 'bold',
    color: FOREGROUND_NEUTRAL_NORMAL,
    marginTop: 16,
    marginBottom: 10,
  },
  sectionLabelSpaced: {
    marginTop: 16,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipFlex: {
    flex: 1,
  },
  dateRangeFieldWrapper: {
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  resetButton: {
    width: 75,
  },
  applyButton: {
    flex: 1,
  },
});

export default LedgerFilterSheet;
