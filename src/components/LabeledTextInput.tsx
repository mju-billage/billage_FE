import { useState } from 'react';
import {
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ERROR_RED, LINK_BLUE } from '../constants/colors';

type LabeledTextInputProps = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  helperText?: string;
  error?: string;
  secureTextEntry?: boolean;
  secureToggle?: boolean;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

/** 라벨 + 입력 + 헬퍼/에러 텍스트로 구성된 회원가입 폼 공용 입력 필드. */
function LabeledTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  helperText,
  error,
  secureTextEntry = false,
  secureToggle = false,
  maxLength,
  keyboardType,
  autoCapitalize,
}: LabeledTextInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry || secureToggle);

  const underlineColor = error ? ERROR_RED : isFocused ? LINK_BLUE : '#D9D9D9';

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputRow, { borderBottomColor: underlineColor }]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#ADB5BD"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecure}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
        />
        {secureToggle && (
          <Pressable onPress={() => setIsSecure(!isSecure)}>
            <Text style={styles.toggleIcon}>{isSecure ? '👁' : '🙈'}</Text>
          </Pressable>
        )}
      </View>
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
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  toggleIcon: {
    fontSize: 16,
  },
  helperText: {
    marginTop: 6,
    fontSize: 12,
    color: '#868E96',
  },
  errorText: {
    marginTop: 6,
    fontSize: 12,
    color: ERROR_RED,
  },
});

export default LabeledTextInput;
