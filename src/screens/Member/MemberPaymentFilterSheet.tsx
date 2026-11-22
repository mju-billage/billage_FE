import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Button from '../../components/Input/Button/Button';
import FilterChip from '../../components/Input/Filter/FilterChip';
import FilterPill from '../../components/Input/Filter/FilterPill';
import DateRangeField from '../../components/Input/Date Field/DateRangeField';
import Calendar from '../../components/Data Display/Calendar/Calendar';
import TransactionSingleSelectSheet from '../Transactions/TransactionSingleSelectSheet';
import {
  DEFAULT_LEDGER_FILTER,
  getLedgerFilterDateRange,
  type LedgerFilterPeriod,
  type LedgerFilterSort,
} from '../Folder/LedgerFilterSheet';
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
} from '../../constants/ledgerScreenText';
import {
  FILTER_LEDGER_LABEL,
  FILTER_PERIOD_SHEET_TITLE,
  LEDGER_SELECT_CONFIRM_LABEL,
  LEDGER_SELECT_PREVIOUS_LABEL,
  LEDGER_SELECT_SHEET_TITLE,
} from '../../constants/transactionScreenText';
import { MEMBER_PAYMENT_FILTER_LEDGER_ADD_LABEL } from '../../constants/memberScreenText';
import { FOREGROUND_PRIMARY } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

export type MemberPaymentFilterValue = {
  period: LedgerFilterPeriod;
  customStart?: string;
  customEnd?: string;
  ledgerId?: string;
  ledgerName?: string;
  sort: LedgerFilterSort;
};

export const DEFAULT_MEMBER_PAYMENT_FILTER: MemberPaymentFilterValue = {
  period: 'all',
  sort: 'latest',
};

export function getMemberPaymentFilterDateRange(
  value: MemberPaymentFilterValue,
): { from?: string; to?: string } {
  return getLedgerFilterDateRange({
    ...DEFAULT_LEDGER_FILTER,
    period: value.period,
    customStart: value.customStart,
    customEnd: value.customEnd,
  });
}

type LedgerOption = { id: string; name: string };

type MemberPaymentFilterSheetProps = {
  visible: boolean;
  value: MemberPaymentFilterValue;
  ledgerOptions: LedgerOption[];
  onClose: () => void;
  onApply: (value: MemberPaymentFilterValue) => void;
};

type SheetStep = 'filter' | 'period';
type PeriodDraft = { start?: string; end?: string };

function toShortDate(dateKey?: string): string | undefined {
  return dateKey ? dateKey.slice(2) : undefined;
}

function MemberPaymentFilterSheet({
  visible,
  value,
  ledgerOptions,
  onClose,
  onApply,
}: MemberPaymentFilterSheetProps) {
  const [step, setStep] = useState<SheetStep>('filter');
  const [draft, setDraft] = useState<MemberPaymentFilterValue>(value);
  const [periodDraft, setPeriodDraft] = useState<PeriodDraft>({});
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth() + 1);
  const [ledgerSheetVisible, setLedgerSheetVisible] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraft(value);
      setStep('filter');
    }
  }, [visible, value]);

  const handleReset = () => {
    setDraft(DEFAULT_MEMBER_PAYMENT_FILTER);
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

  const togglePeriod = (period: LedgerFilterPeriod) => {
    if (draft.period === period) {
      setDraft({ ...draft, period: 'all', customStart: undefined, customEnd: undefined });
    } else {
      setDraft({ ...draft, period });
    }
  };

  const toggleLedgerField = () => {
    if (draft.ledgerId) {
      setDraft({ ...draft, ledgerId: undefined, ledgerName: undefined });
    } else {
      setLedgerSheetVisible(true);
    }
  };

  const handleSelectLedger = (key: string) => {
    const option = ledgerOptions.find(item => item.id === key);
    setDraft({ ...draft, ledgerId: key, ledgerName: option?.name });
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
              onPress={() => togglePeriod('1month')}
            />
            <FilterChip
              label={FILTER_PERIOD_3MONTH}
              showIcon={false}
              style={styles.chipFlex}
              active={draft.period === '3month'}
              onPress={() => togglePeriod('3month')}
            />
            <FilterChip
              label={FILTER_PERIOD_6MONTH}
              showIcon={false}
              style={styles.chipFlex}
              active={draft.period === '6month'}
              onPress={() => togglePeriod('6month')}
            />
            <FilterChip
              label={FILTER_PERIOD_CUSTOM}
              showIcon={false}
              style={styles.chipFlex}
              active={draft.period === 'custom'}
              onPress={() => togglePeriod('custom')}
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

          <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>{FILTER_LEDGER_LABEL}</Text>
          <FilterChip
            label={draft.ledgerName || MEMBER_PAYMENT_FILTER_LEDGER_ADD_LABEL}
            showIcon={!draft.ledgerId}
            active={!!draft.ledgerId}
            onPress={toggleLedgerField}
          />

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

          <TransactionSingleSelectSheet
            visible={ledgerSheetVisible}
            title={LEDGER_SELECT_SHEET_TITLE}
            options={ledgerOptions.map(option => ({ key: option.id, label: option.name }))}
            selectedKey={draft.ledgerId}
            onClose={() => setLedgerSheetVisible(false)}
            onSelect={handleSelectLedger}
          />
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
    ...TYPOGRAPHY.h3,
    marginBottom: 16,
  },
  sectionLabel: {
    ...TYPOGRAPHY.subtitle2,
    color: FOREGROUND_PRIMARY,
    marginBottom: 12,
  },
  sectionLabelSpaced: {
    marginTop: 24,
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

export default MemberPaymentFilterSheet;
