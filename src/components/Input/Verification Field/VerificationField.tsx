import { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import {
  BACKGROUND_PRIMARY,
  FILL_DISABLED,
  FILL_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_DISABLED,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';

type VerificationFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  length?: number;
  disabled?: boolean;
};

/** 인증 코드 입력용 자릿수 박스 UI(이메일 인증 6자리, 계좌 인증 3자리 등). 숨겨진 입력창 하나로 값을 받아 시각화한다. */
function VerificationField({
  value,
  onChangeText,
  length = 6,
  disabled = false,
}: VerificationFieldProps) {
  const inputRef = useRef<TextInput>(null);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  return (
    <Pressable
      style={styles.row}
      onPress={() => !disabled && inputRef.current?.focus()}
    >
      {digits.map((digit, index) => {
        const isActive = index === value.length;
        const isFilled = digit !== '';
        return (
          <View
            key={index}
            style={[
              styles.box,
              isFilled && !isActive && styles.boxFilled,
              isActive && !disabled && styles.boxActive,
              disabled && styles.boxDisabled,
            ]}
          >
            <Text style={[styles.digit, disabled && styles.digitDisabled]}>
              {digit}
            </Text>
          </View>
        );
      })}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={text => onChangeText(text.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        maxLength={length}
        editable={!disabled}
      />
    </Pressable>
  );
}

const BOX_SIZE = 44;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: 8,
    backgroundColor: FILL_NEUTRAL_NORMAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxFilled: {
    backgroundColor: BACKGROUND_PRIMARY,
  },
  boxActive: {
    borderWidth: 1,
    borderColor: FOREGROUND_SECONDARY,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
  },
  boxDisabled: {
    backgroundColor: FILL_DISABLED,
  },
  digit: {
    fontSize: 18,
    fontWeight: 'bold',
    color: FOREGROUND_SECONDARY,
  },
  digitDisabled: {
    color: FOREGROUND_DISABLED,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});

export default VerificationField;
