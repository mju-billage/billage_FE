/** @screen ADD-2-SHEET-01-0 내역명 입력 */
/** @screen ADD-2-SHEET-04-0 메모 입력 */
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

/** 내역명/메모 등 한 줄 텍스트 입력용 공용 바텀시트. placeholder 자체가 글자수 제한 안내문이다. */
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
