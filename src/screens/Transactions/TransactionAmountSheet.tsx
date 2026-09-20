/** @screen ADD-2-SHEET-06-0 금액 입력 */
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

/** Entry(최대 999,999,999)와 Dues(최대 999,999,999) 둘 다 같은 상한이라 공용 시트에
 * 하드코딩했다 — 다른 상한이 필요한 도메인이 생기면 그때 prop으로 뺀다. */
const MAX_AMOUNT = 999_999_999;

type TransactionAmountSheetProps = {
  visible: boolean;
  value: number;
  onClose: () => void;
  onSave: (amount: number) => void;
};

/** 금액 입력 바텀시트. 안드로이드 기본 숫자 키보드로 입력받는다(키보드 위치는 `BottomSheet`가 처리). */
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
      // 상한 초과·변화 없음이면 state가 그대로라 리렌더가 스킵돼 네이티브 입력창이 어긋난다 — 되돌린다.
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
