/** @screen ADD-2-SHEET-06-0 금액 입력 */
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Button from '../../components/Input/Button/Button';
import NumericKeypad from '../../components/Input/Keypad/NumericKeypad';
import {
  AMOUNT_SHEET_TITLE,
  TEXT_INPUT_SHEET_CANCEL_LABEL,
  TEXT_INPUT_SHEET_SAVE_LABEL,
  TRANSACTION_REGISTER_AMOUNT_PLACEHOLDER,
} from '../../constants/transactionScreenText';
import {
  BORDER_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CLOSE_ICON = require('../../assets/icons/action/Close.png');

/** Entry(최대 999,999,999)와 Dues(최대 999,999,999) 둘 다 같은 상한이라 공용 시트에
 * 하드코딩했다 — 다른 상한이 필요한 도메인이 생기면 그때 prop으로 뺀다. */
const MAX_AMOUNT = 999_999_999;

type TransactionAmountSheetProps = {
  visible: boolean;
  value: number;
  onClose: () => void;
  onSave: (amount: number) => void;
};

/** 금액 입력 바텀시트. 시스템 키보드 대신 커스텀 숫자패드로 입력받는다. */
function TransactionAmountSheet({
  visible,
  value,
  onClose,
  onSave,
}: TransactionAmountSheetProps) {
  const [digits, setDigits] = useState(value > 0 ? String(value) : '');

  const appendDigit = (digit: string) => {
    setDigits(current => {
      const next = current + digit;
      return Number(next) > MAX_AMOUNT ? current : next;
    });
  };

  const handleSave = () => {
    onSave(digits === '' ? 0 : Number(digits));
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{AMOUNT_SHEET_TITLE}</Text>

      <View style={styles.inputRow}>
        {digits === '' ? (
          <Text style={styles.placeholder}>
            {TRANSACTION_REGISTER_AMOUNT_PLACEHOLDER}
          </Text>
        ) : (
          <Text style={styles.value}>{Number(digits).toLocaleString()}원</Text>
        )}
        {digits.length > 0 && (
          <Pressable onPress={() => setDigits('')} hitSlop={8}>
            <Image source={CLOSE_ICON} style={styles.clearIcon} />
          </Pressable>
        )}
      </View>

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

      <View style={styles.keypadWrapper}>
        <NumericKeypad
          onPressDigit={appendDigit}
          onPressDecimal={() => {}}
          onBackspace={() => setDigits(current => current.slice(0, -1))}
          onConfirm={handleSave}
        />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.subtitle1,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: BORDER_NEUTRAL_NORMAL,
    paddingBottom: 8,
  },
  placeholder: {
    ...TYPOGRAPHY.body1,
    color: FOREGROUND_DISABLED,
  },
  value: {
    ...TYPOGRAPHY.subtitle1,
  },
  clearIcon: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  footerButton: {
    flex: 1,
  },
  keypadWrapper: {
    marginTop: 20,
  },
});

export default TransactionAmountSheet;
