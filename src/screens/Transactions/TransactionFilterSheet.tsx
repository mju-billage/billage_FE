import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Button from '../../components/Input/Button/Button';
import FilterChip from '../../components/Input/Filter/FilterChip';
import DateRangeField from '../../components/Input/Date Field/DateRangeField';
import Chip from '../../components/Data Display/Chips/Chip';
import Calendar from '../../components/Data Display/Calendar/Calendar';
import LedgerMultiSelectContent from './LedgerMultiSelectContent';
import {
  DEFAULT_ENTRY_LIST_FILTER,
  type EntryListFilterValue,
} from '../../types/entry';
import { formatDateKey } from '../../utils/calendarGrid';
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
  FILTER_PERIOD_SHEET_TITLE,
  LEDGER_SELECT_CONFIRM_LABEL,
  LEDGER_SELECT_PREVIOUS_LABEL,
} from '../../constants/transactionScreenText';
import { TYPOGRAPHY } from '../../constants/typography';

type LedgerOption = { id: string; name: string };

type TransactionFilterSheetProps = {
  visible: boolean;
  value: EntryListFilterValue;
  ledgerOptions: LedgerOption[];
  onClose: () => void;
  onApply: (value: EntryListFilterValue) => void;
  onPressCreateNewLedger: () => void;
};

type SheetStep = 'filter' | 'period' | 'ledger';

type PeriodDraft = { start?: string; end?: string };

function toShortDate(dateKey?: string): string | undefined {
  return dateKey ? dateKey.slice(2) : undefined;
}

function TransactionFilterSheet({
  visible,
  value,
  ledgerOptions,
  onClose,
  onApply,
  onPressCreateNewLedger,
}: TransactionFilterSheetProps) {
  const [step, setStep] = useState<SheetStep>('filter');
  const [draft, setDraft] = useState<EntryListFilterValue>(value);
  const [periodDraft, setPeriodDraft] = useState<PeriodDraft>({});
  const [calendarYear, setCalendarYear] = useState(() =>
    new Date().getFullYear(),
  );
  const [calendarMonth, setCalendarMonth] = useState(
    () => new Date().getMonth() + 1,
  );

  useEffect(() => {
    if (visible) {
      setDraft(value);
      setStep('filter');
    }
  }, [visible, value]);

  const handleSheetClose = () => {
    if (step === 'filter') {
      onClose();
    } else {
      setStep('filter');
    }
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
    if (!periodDraft.start || (periodDraft.start && periodDraft.end)) {
      setPeriodDraft({ start: date, end: undefined });
    } else if (date < periodDraft.start) {
      setPeriodDraft({ start: date, end: periodDraft.start });
    } else {
      setPeriodDraft({ ...periodDraft, end: date });
    }
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

  const todayKey = formatDateKey(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate(),
  );

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

          <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
            {FILTER_LEDGER_LABEL}
          </Text>
          {draft.ledgerIds.length > 0 && (
            <View style={styles.ledgerChipRow}>
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
          <FilterChip
            label={FILTER_LEDGER_ADD_LABEL}
            active={false}
            style={styles.ledgerAddChip}
            onPress={() => setStep('ledger')}
          />

          <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
            {FILTER_TYPE_LABEL}
          </Text>
          <View style={styles.chipRow}>
            <FilterChip
              label={FILTER_TYPE_ALL}
              showIcon={false}
              style={styles.chipFlex}
              active={draft.type === 'all'}
              onPress={() => setDraft({ ...draft, type: 'all' })}
            />
            <FilterChip
              label={FILTER_TYPE_INCOME}
              showIcon={false}
              style={styles.chipFlex}
              active={draft.type === 'income'}
              onPress={() => setDraft({ ...draft, type: 'income' })}
            />
            <FilterChip
              label={FILTER_TYPE_EXPENSE}
              showIcon={false}
              style={styles.chipFlex}
              active={draft.type === 'expense'}
              onPress={() => setDraft({ ...draft, type: 'expense' })}
            />
          </View>

          <Text style={[styles.sectionLabel, styles.sectionLabelSpaced]}>
            {FILTER_SORT_LABEL}
          </Text>
          <View style={styles.chipRow}>
            <FilterChip
              label={FILTER_SORT_LATEST}
              showIcon={false}
              style={styles.chipFlex}
              active={draft.sort === 'latest'}
              onPress={() => setDraft({ ...draft, sort: 'latest' })}
            />
            <FilterChip
              label={FILTER_SORT_OLDEST}
              showIcon={false}
              style={styles.chipFlex}
              active={draft.sort === 'oldest'}
              onPress={() => setDraft({ ...draft, sort: 'oldest' })}
            />
          </View>

          <View style={styles.filterFooter}>
            <View style={styles.footerReset}>
              <Button
                label={FILTER_RESET_LABEL}
                hierarchy="tertiary"
                onPress={handleReset}
                fullWidth
              />
            </View>
            <View style={styles.footerApply}>
              <Button
                label={FILTER_APPLY_LABEL}
                onPress={handleApply}
                fullWidth
              />
            </View>
          </View>
        </>
      )}

      {step === 'period' && (
        <>
          <Text style={styles.title}>{FILTER_PERIOD_SHEET_TITLE}</Text>
          <Calendar
            variant="picker"
            showHeader
            year={calendarYear}
            month={calendarMonth}
            selectedStartDate={periodDraft.start}
            selectedEndDate={periodDraft.end}
            outlinedDates={[todayKey]}
            showDateFields={!!periodDraft.start}
            onSelectDate={handleSelectPeriodDate}
            onChangeMonth={handleChangeMonth}
          />
          <View style={styles.footer}>
            <View style={styles.footerPrevious}>
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
            <View style={styles.footerConfirm}>
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

      {step === 'ledger' && (
        <LedgerMultiSelectContent
          options={ledgerOptions}
          initialSelectedIds={draft.ledgerIds}
          onPrevious={() => setStep('filter')}
          onConfirm={ledgerIds => {
            setDraft({ ...draft, ledgerIds });
            setStep('filter');
          }}
          onPressCreateNewLedger={() => {
            onClose();
            onPressCreateNewLedger();
          }}
        />
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
    marginBottom: 12,
  },
  sectionLabelSpaced: {
    marginTop: 24,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  ledgerChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  chipFlex: {
    flex: 1,
  },
  dateRangeFieldWrapper: {
    marginTop: 8,
  },
  ledgerAddChip: {
    alignSelf: 'stretch',
  },
  filterFooter: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 36,
  },
  footerReset: {
    width: 74,
  },
  footerApply: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  footerPrevious: {
    width: 74,
  },
  footerConfirm: {
    flex: 1,
  },
});

export default TransactionFilterSheet;
