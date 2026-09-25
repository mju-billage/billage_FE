import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FEEDBACK_NEGATIVE_BOLD,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type TextAreaProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  rows?: number;
  maxLength?: number;
  /** true면 화면 진입 시 이 영역에 자동 포커스 + 시스템 키보드를 띄운다. */
  autoFocus?: boolean;
  /** true면 입력 박스 배경을 흰색으로 채운다(옅은 블루 화면 위에서 박스가 배경에 묻히지 않게). 기본 false(투명). */
  filled?: boolean;
};

/** 여러 줄 입력이 가능한 박스형 텍스트 영역. */
function TextArea({
  value,
  onChangeText,
  placeholder,
  helperText,
  error,
  rows = 4,
  maxLength,
  autoFocus,
  filled = false,
}: TextAreaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderColor = error
    ? FEEDBACK_NEGATIVE_BOLD
    : isFocused
    ? FOREGROUND_SECONDARY
    : BORDER_NEUTRAL_NORMAL;

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          filled && styles.inputFilled,
          { borderColor },
          { height: rows * 24 },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={FOREGROUND_DISABLED}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        maxLength={maxLength}
        multiline
        textAlignVertical="top"
        autoFocus={autoFocus}
      />
      {(error || helperText) && (
        <Text style={error ? styles.errorText : styles.helperText}>
          {error ?? helperText}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  input: {
    ...TYPOGRAPHY.body2,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    outlineWidth: 0,
    ...({ outlineStyle: 'none' } as any),
  },
  inputFilled: {
    backgroundColor: FILL_NEUTRAL_SUBTLE,
  },
  helperText: {
    ...TYPOGRAPHY.body3,
    marginTop: 6,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  errorText: {
    ...TYPOGRAPHY.body3,
    marginTop: 6,
    color: FEEDBACK_NEGATIVE_BOLD,
  },
});

export default TextArea;
