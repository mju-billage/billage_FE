import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Button from '../../components/Input/Button/Button';
import FilterPill from '../../components/Input/Filter/FilterPill';
import type { EntryListParams } from '../../services/entryService';
import {
  FILTER_APPLY_LABEL,
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
import { FOREGROUND_NEUTRAL_NORMAL } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

export type LedgerFilterType = 'all' | 'income' | 'expense';
export type LedgerFilterSort = 'latest' | 'oldest';

export type LedgerFilterValue = {
  type: LedgerFilterType;
  sort: LedgerFilterSort;
};

export const DEFAULT_LEDGER_FILTER: LedgerFilterValue = {
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

type LedgerFilterSheetProps = {
  visible: boolean;
  value: LedgerFilterValue;
  onClose: () => void;
  onApply: (value: LedgerFilterValue) => void;
};

function LedgerFilterSheet({
  visible,
  value,
  onClose,
  onApply,
}: LedgerFilterSheetProps) {
  const [draft, setDraft] = useState<LedgerFilterValue>(value);

  const handleReset = () => {
    setDraft(DEFAULT_LEDGER_FILTER);
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{FILTER_SHEET_TITLE}</Text>

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
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
