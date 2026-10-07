import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Button from '../../components/Input/Button/Button';
import TextButton from '../../components/Input/Button/TextButton';
import CheckListItem from '../../components/Data Display/Lists/CheckListItem';
import {
  LEDGER_SELECT_CANCEL_LABEL,
  LEDGER_SELECT_CONFIRM_LABEL,
  LEDGER_SELECT_CREATE_NEW_LABEL,
  LEDGER_SELECT_EMPTY_GUIDE,
} from '../../constants/transactionScreenText';
import { FOREGROUND_SECONDARY } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

export type SelectOption = { key: string; label: string };

type TransactionSingleSelectSheetProps = {
  visible: boolean;
  title: string;
  options: SelectOption[];
  selectedKey?: string;
  onClose: () => void;
  onSelect: (key: string) => void;
  emptyStateCreateLabel?: string;
  onPressEmptyStateCreate?: () => void;
};

function TransactionSingleSelectSheet({
  visible,
  title,
  options,
  selectedKey,
  onClose,
  onSelect,
  emptyStateCreateLabel,
  onPressEmptyStateCreate,
}: TransactionSingleSelectSheetProps) {
  const [draftKey, setDraftKey] = useState(selectedKey);

  const handleConfirm = () => {
    if (draftKey) {
      onSelect(draftKey);
    }
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{title}</Text>

      {options.length === 0 ? (
        <>
          <Text style={styles.emptyGuide}>{LEDGER_SELECT_EMPTY_GUIDE}</Text>
          {emptyStateCreateLabel && (
            <TextButton
              label={emptyStateCreateLabel ?? LEDGER_SELECT_CREATE_NEW_LABEL}
              onPress={onPressEmptyStateCreate ?? (() => {})}
            />
          )}
        </>
      ) : (
        <View style={styles.list}>
          {options.map(option => (
            <CheckListItem
              key={option.key}
              label={option.label}
              selected={draftKey === option.key}
              onPress={() => setDraftKey(option.key)}
            />
          ))}
        </View>
      )}

      <View style={styles.footerRow}>
        <View style={styles.footerButton}>
          <Button
            label={LEDGER_SELECT_CANCEL_LABEL}
            hierarchy="secondary"
            onPress={onClose}
            fullWidth
          />
        </View>
        <View style={styles.footerButton}>
          <Button
            label={LEDGER_SELECT_CONFIRM_LABEL}
            onPress={handleConfirm}
            disabled={options.length > 0 && !draftKey}
            fullWidth
          />
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
  emptyGuide: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_SECONDARY,
    marginBottom: 12,
  },
  list: {
    gap: 4,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  footerButton: {
    flex: 1,
  },
});

export default TransactionSingleSelectSheet;
