import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Button from '../../components/Input/Button/Button';
import TextField from '../../components/Input/Text Field/TextField';
import {
  TEXT_INPUT_SHEET_CANCEL_LABEL,
  TEXT_INPUT_SHEET_SAVE_LABEL,
} from '../../constants/transactionScreenText';
import { TYPOGRAPHY } from '../../constants/typography';

type TransactionTextInputSheetProps = {
  visible: boolean;
  title: string;
  placeholder: string;
  maxLength?: number;
  value: string;
  onClose: () => void;
  onSave: (value: string) => void;
};

function TransactionTextInputSheet({
  visible,
  title,
  placeholder,
  maxLength,
  value,
  onClose,
  onSave,
}: TransactionTextInputSheetProps) {
  const [draft, setDraft] = useState(value);

  const handleSave = () => {
    onSave(draft);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{title}</Text>

      <TextField
        value={draft}
        onChangeText={setDraft}
        placeholder={placeholder}
        maxLength={maxLength}
        onClear={() => setDraft('')}
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
            disabled={draft.trim().length === 0}
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

export default TransactionTextInputSheet;
