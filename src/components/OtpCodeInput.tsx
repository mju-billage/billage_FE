import { useRef } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LINK_BLUE } from '../constants/colors';

type OtpCodeInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  length?: number;
};

/** 이메일 인증 코드 입력용 자릿수 박스 UI. 숨겨진 입력창 하나로 값을 받아 시각화한다. */
function OtpCodeInput({ value, onChangeText, length = 6 }: OtpCodeInputProps) {
  const inputRef = useRef<TextInput>(null);
  const digits = Array.from({ length }, (_, index) => value[index] ?? '');

  return (
    <Pressable style={styles.row} onPress={() => inputRef.current?.focus()}>
      {digits.map((digit, index) => (
        <View
          key={index}
          style={[styles.box, index === value.length && styles.boxActive]}
        >
          <Text style={styles.digit}>{digit}</Text>
        </View>
      ))}
      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={text => onChangeText(text.replace(/[^0-9]/g, ''))}
        keyboardType="number-pad"
        maxLength={length}
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
    backgroundColor: '#F1F3F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    borderWidth: 1,
    borderColor: LINK_BLUE,
    backgroundColor: '#FFFFFF',
  },
  digit: {
    fontSize: 18,
    fontWeight: 'bold',
    color: LINK_BLUE,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
});

export default OtpCodeInput;
