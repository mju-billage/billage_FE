import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from './BottomSheet';
import TextField from '../../Input/Text Field/TextField';
import Button from '../../Input/Button/Button';
import { capDigits } from '../../../utils/currency';
import { TEXT_FIELD_MAX_LENGTH_ERROR } from '../../../constants/commonText';
import {
  BUDGET_SAVE_LABEL,
  BUDGET_SHEET_CANCEL_LABEL,
  BUDGET_SHEET_PLACEHOLDER,
  BUDGET_SHEET_TITLE,
} from '../../../constants/folderScreenText';
import { LEDGER_BUDGET_MAX } from '../../../constants/ledgerScreenText';
import { TYPOGRAPHY } from '../../../constants/typography';

const LEDGER_BUDGET_MAX_DIGITS = String(LEDGER_BUDGET_MAX).length;

type LedgerBudgetSheetProps = {
  visible: boolean;
  ledgerName: string;
  value: string;
  error?: string;
  isSaving?: boolean;
  onChangeValue: (value: string, error: string | undefined) => void;
  onSave: () => void;
  onClose: () => void;
};

function LedgerBudgetSheet({
  visible,
  ledgerName,
  value,
  error,
  isSaving = false,
  onChangeValue,
  onSave,
  onClose,
}: LedgerBudgetSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title} numberOfLines={1}>
        {BUDGET_SHEET_TITLE(ledgerName)}
      </Text>
      <TextField
        value={value}
        onChangeText={text => {
          const { value: next, overflow } = capDigits(
            text.replace(/[^0-9]/g, ''),
            LEDGER_BUDGET_MAX_DIGITS,
          );
          onChangeValue(
            next,
            overflow ? TEXT_FIELD_MAX_LENGTH_ERROR(LEDGER_BUDGET_MAX_DIGITS) : undefined,
          );
        }}
        placeholder={BUDGET_SHEET_PLACEHOLDER}
        keyboardType="number-pad"
        error={error}
        suffix="원"
        autoFocus
      />
      <View style={styles.buttonRow}>
        <View style={styles.cancelButton}>
          <Button
            label={BUDGET_SHEET_CANCEL_LABEL}
            hierarchy="tertiary"
            onPress={onClose}
            fullWidth
          />
        </View>
        <View style={styles.saveButton}>
          <Button
            label={BUDGET_SAVE_LABEL}
            disabled={!value.trim() || isSaving}
            onPress={onSave}
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
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  cancelButton: {
    width: 75,
  },
  saveButton: {
    flex: 1,
  },
});

export default LedgerBudgetSheet;
