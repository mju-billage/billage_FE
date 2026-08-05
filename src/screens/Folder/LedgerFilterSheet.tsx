import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../../components/Feedback/BottomSheet';
import PrimaryButton from '../../components/Button/PrimaryButton';
import TextButton from '../../components/Button/TextButton';
import Calendar from '../../components/DataDisplay/Calendar';
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
  BORDER_NEUTRAL_NORMAL,
  FOREGROUND_INVERSE,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_SECONDARY,
} from '../../constants/colors';

export type LedgerFilterPeriod = 'all' | '1m' | '3m' | '6m' | 'custom';
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

type LedgerFilterSheetProps = {
  visible: boolean;
  value: LedgerFilterValue;
  onClose: () => void;
  onApply: (value: LedgerFilterValue) => void;
};

/** 내역 검색 화면에서 사용하는 필터 바텀시트: 기간/구분/정렬. */
function LedgerFilterSheet({
  visible,
  value,
  onClose,
  onApply,
}: LedgerFilterSheetProps) {
  const [draft, setDraft] = useState<LedgerFilterValue>(value);
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
    setDraft(DEFAULT_LEDGER_FILTER);
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{FILTER_SHEET_TITLE}</Text>
        <TextButton
          label={FILTER_RESET_LABEL}
          hierarchy="tertiary"
          onPress={handleReset}
        />
      </View>

      <Text style={styles.sectionLabel}>{FILTER_PERIOD_LABEL}</Text>
      <View style={styles.chipRow}>
        <FilterPill
          label={FILTER_PERIOD_1MONTH}
          active={draft.period === '1m'}
          onPress={() => setDraft({ ...draft, period: '1m' })}
        />
        <FilterPill
          label={FILTER_PERIOD_3MONTH}
          active={draft.period === '3m'}
          onPress={() => setDraft({ ...draft, period: '3m' })}
        />
        <FilterPill
          label={FILTER_PERIOD_6MONTH}
          active={draft.period === '6m'}
          onPress={() => setDraft({ ...draft, period: '6m' })}
        />
        <FilterPill
          label={FILTER_PERIOD_CUSTOM}
          active={draft.period === 'custom'}
          onPress={() => setDraft({ ...draft, period: 'custom' })}
        />
      </View>

      {draft.period === 'custom' && (
        <View style={styles.calendarWrapper}>
          <Calendar
            year={calendarYear}
            month={calendarMonth}
            selectedStartDate={draft.customStart}
            selectedEndDate={draft.customEnd}
            onSelectDate={handleSelectDate}
            onChangeMonth={handleChangeMonth}
          />
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
        <PrimaryButton label={FILTER_APPLY_LABEL} onPress={handleApply} />
      </View>
    </BottomSheet>
  );
}

function FilterPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.pill, active && styles.pillActive]}
      onPress={onPress}
    >
      <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: FOREGROUND_NEUTRAL_NORMAL,
    marginTop: 16,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  pillActive: {
    borderColor: FOREGROUND_SECONDARY,
    backgroundColor: FOREGROUND_SECONDARY,
  },
  pillLabel: {
    fontSize: 13,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  pillLabelActive: {
    color: FOREGROUND_INVERSE,
    fontWeight: 'bold',
  },
  calendarWrapper: {
    marginTop: 12,
  },
  footer: {
    marginTop: 24,
  },
});

export default LedgerFilterSheet;
