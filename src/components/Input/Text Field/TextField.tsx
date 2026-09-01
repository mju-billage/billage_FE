import { useState } from 'react';
import {
  Image,
  KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FEEDBACK_NEGATIVE_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const EYE_ICON = require('../../../assets/icons/system/Eye.png');
const EYE_CLOSED_ICON = require('../../../assets/icons/system/Eye Closed.png');
const CLOSE_ICON = require('../../../assets/icons/action/Close.png');

type TextFieldProps = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  disabled?: boolean;
  secureTextEntry?: boolean;
  secureToggle?: boolean;
  /** 입력값이 있을 때 인라인 클리어(X) 아이콘을 보여주고, 누르면 이 콜백으로 값을 비운다. */
  onClear?: () => void;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
};

/** 라벨 + 입력 + 헬퍼/에러 텍스트로 구성된 공용 입력 필드. */
function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  helperText,
  error,
  success = false,
  disabled = false,
  secureTextEntry = false,
  secureToggle = false,
  onClear,
  maxLength,
  keyboardType,
  autoCapitalize,
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry || secureToggle);

  const underlineColor = disabled
    ? BORDER_NEUTRAL_NORMAL
    : error
    ? FEEDBACK_NEGATIVE_BOLD
    : success || isFocused
    ? FOREGROUND_SECONDARY
    : BORDER_NEUTRAL_NORMAL;

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
      )}
      <View style={[styles.inputRow, { borderBottomColor: underlineColor }]}>
        <TextInput
          style={[styles.input, disabled && styles.inputDisabled]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={FOREGROUND_DISABLED}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isSecure}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          editable={!disabled}
        />
        {secureToggle && !disabled && (
          <Pressable onPress={() => setIsSecure(!isSecure)}>
            <Image
              source={isSecure ? EYE_ICON : EYE_CLOSED_ICON}
              style={styles.toggleIcon}
            />
          </Pressable>
        )}
        {onClear && value.length > 0 && !disabled && (
          <Pressable onPress={onClear} hitSlop={8}>
            <Image source={CLOSE_ICON} style={styles.clearIcon} />
          </Pressable>
        )}
      </View>
      {(error || helperText) && (
        <Text
          style={
            error
              ? styles.errorText
              : success
              ? styles.successText
              : styles.helperText
          }
        >
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
    ...TYPOGRAPHY.subtitle3,
    marginBottom: 8,
  },
  labelDisabled: {
    color: FOREGROUND_DISABLED,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  input: {
    ...TYPOGRAPHY.body1,
    flex: 1,
    padding: 0,
    outlineWidth: 0,
    ...({ outlineStyle: 'none' } as any),
  },
  inputDisabled: {
    color: FOREGROUND_DISABLED,
  },
  toggleIcon: {
    width: 20,
    height: 20,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  clearIcon: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
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
  successText: {
    ...TYPOGRAPHY.body3,
    marginTop: 6,
    color: FOREGROUND_SECONDARY,
  },
});

export default TextField;
