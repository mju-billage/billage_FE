import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../components/Input/Button/Button';
import CheckListItem from '../../components/Data Display/Lists/CheckListItem';
import Chip from '../../components/Data Display/Chips/Chip';
import {
  LEDGER_SELECT_CONFIRM_LABEL,
  LEDGER_SELECT_CREATE_NEW_LABEL,
  LEDGER_SELECT_EMPTY_GUIDE,
  LEDGER_SELECT_PREVIOUS_LABEL,
  LEDGER_SELECT_SHEET_TITLE,
} from '../../constants/transactionScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE, FOREGROUND_SECONDARY } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type LedgerOption = { id: string; name: string };

type LedgerMultiSelectContentProps = {
  options: LedgerOption[];
  initialSelectedIds: string[];
  onPrevious: () => void;
  onConfirm: (ledgerIds: string[]) => void;
  onPressCreateNewLedger: () => void;
};

function LedgerMultiSelectContent({
  options,
  initialSelectedIds,
  onPrevious,
  onConfirm,
  onPressCreateNewLedger,
}: LedgerMultiSelectContentProps) {
  const [draftIds, setDraftIds] = useState<string[]>(initialSelectedIds);

  const toggleLedger = (id: string) => {
    setDraftIds(current =>
      current.includes(id)
        ? current.filter(existing => existing !== id)
        : [...current, id],
    );
  };

  return (
    <>
      <Text style={styles.title}>{LEDGER_SELECT_SHEET_TITLE}</Text>

      {options.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyGuide}>{LEDGER_SELECT_EMPTY_GUIDE}</Text>
          <Pressable
            onPress={onPressCreateNewLedger}
            hitSlop={8}
            style={styles.emptyCreateLink}
          >
            <Text style={styles.emptyCreateLabel}>
              {LEDGER_SELECT_CREATE_NEW_LABEL}
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          {draftIds.length > 0 && (
            <View style={styles.chipRow}>
              {draftIds.map(id => {
                const option = options.find(item => item.id === id);
                return option ? (
                  <Chip
                    key={id}
                    label={option.name}
                    onRemove={() => toggleLedger(id)}
                  />
                ) : null;
              })}
            </View>
          )}

          <View style={styles.list}>
            {options.map(option => (
              <CheckListItem
                key={option.id}
                label={option.name}
                selected={draftIds.includes(option.id)}
                onPress={() => toggleLedger(option.id)}
              />
            ))}
          </View>
        </>
      )}

      <View style={styles.footer}>
        <View style={styles.footerPrevious}>
          <Button
            label={LEDGER_SELECT_PREVIOUS_LABEL}
            hierarchy="tertiary"
            onPress={onPrevious}
            fullWidth
          />
        </View>
        <View style={styles.footerConfirm}>
          <Button
            label={LEDGER_SELECT_CONFIRM_LABEL}
            onPress={() => onConfirm(draftIds)}
            disabled={draftIds.length === 0}
            fullWidth
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.h3,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 60,
  },
  emptyGuide: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    textAlign: 'center',
  },
  emptyCreateLink: {
    marginTop: 12,
  },
  emptyCreateLabel: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_SECONDARY,
    textDecorationLine: 'underline',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  list: {
    marginHorizontal: -20,
    gap: 0,
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

export default LedgerMultiSelectContent;
