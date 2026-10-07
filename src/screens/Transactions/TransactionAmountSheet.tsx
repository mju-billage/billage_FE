import { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Button from '../../components/Input/Button/Button';
import TextField from '../../components/Input/Text Field/TextField';
import {
  AMOUNT_SHEET_TITLE,
  TEXT_INPUT_SHEET_CANCEL_LABEL,
  TEXT_INPUT_SHEET_SAVE_LABEL,
  TRANSACTION_REGISTER_AMOUNT_PLACEHOLDER,
} from '../../constants/transactionScreenText';
import { TYPOGRAPHY } from '../../constants/typography';

const MAX_AMOUNT = 999_999_999;

type TransactionAmountSheetProps = {
  visible: boolean;
  value: number;
  onClose: () => void;
  onSave: (amount: number) => void;
};

function TransactionAmountSheet({
  visible,
  value,
  onClose,
  onSave,
}: TransactionAmountSheetProps) {
  const [digits, setDigits] = useState(value > 0 ? String(value) : '');
  const inputRef = useRef<TextInput>(null);

  const formatted = digits === '' ? '' : Number(digits).toLocaleString();

  const handleChangeText = (text: string) => {
    const nextDigits = text.replace(/[^0-9]/g, '').replace(/^0+(?=\d)/, '');
    if (Number(nextDigits) > MAX_AMOUNT || nextDigits === digits) {
      inputRef.current?.setNativeProps({ text: formatted });
      return;
    }
    setDigits(nextDigits);
  };

  const handleSave = () => {
    onSave(digits === '' ? 0 : Number(digits));
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{AMOUNT_SHEET_TITLE}</Text>

      <TextField
        ref={inputRef}
        value={formatted}
        onChangeText={handleChangeText}
        placeholder={TRANSACTION_REGISTER_AMOUNT_PLACEHOLDER}
        keyboardType="number-pad"
        suffix="원"
        autoFocus
        onClear={() => setDigits('')}
      />

      <View style={styles.footerRow}>
        <View style={styles.footerButton}>
          <Button
            label={TEXT_INPUT_SHEET_CANCEL_LABEL}
            hierarchy="secondary"
            onPress={onClose}
            fullWidth
          />
        </View>
        <View style={styles.footerButton}>
          <Button
            label={TEXT_INPUT_SHEET_SAVE_LABEL}
            onPress={handleSave}
            disabled={digits === ''}
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
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  footerButton: {
    flex: 1,
  },
});

export default TransactionAmountSheet;
