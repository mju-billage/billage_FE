import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FEEDBACK_NEGATIVE_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../constants/colors';

type TextAreaProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  helperText?: string;
  error?: string;
  rows?: number;
};

/** 여러 줄 입력이 가능한 박스형 텍스트 영역. */
function TextArea({
  value,
  onChangeText,
  placeholder,
  helperText,
  error,
  rows = 4,
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
        style={[styles.input, { borderColor }, { height: rows * 22 }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={FOREGROUND_DISABLED}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        multiline
        textAlignVertical="top"
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
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
  },
  helperText: {
    marginTop: 6,
    fontSize: 12,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: FEEDBACK_NEGATIVE_BOLD,
  },
});

export default TextArea;
