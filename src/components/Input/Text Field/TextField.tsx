import { forwardRef, useState } from 'react';
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
  FOREGROUND_PRIMARY,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const EYE_ICON = require('../../../assets/icons/system/Eye.png');
const EYE_CLOSED_ICON = require('../../../assets/icons/system/Eye Closed.png');
const CLOSE_ICON = require('../../../assets/icons/action/Close.png');

type TextFieldProps = {
  label?: string;
  required?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  helperText?: string;
  error?: string;
  success?: boolean;
  disabled?: boolean;
  secureTextEntry?: boolean;
  secureToggle?: boolean;
  onClear?: () => void;
  suffix?: string;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoFocus?: boolean;
  onBlur?: () => void;
};

const TextField = forwardRef<TextInput, TextFieldProps>(function TextFieldInner(
  {
    label,
    required = false,
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
    suffix,
    maxLength,
    keyboardType,
    autoCapitalize,
    autoFocus = false,
    onBlur,
  },
  ref,
) {
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
          {required && <Text style={styles.requiredMark}> *</Text>}
        </Text>
      )}
      <View style={[styles.inputRow, { borderBottomColor: underlineColor }]}>
        <TextInput
          ref={ref}
          style={[styles.input, disabled && styles.inputDisabled]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={FOREGROUND_DISABLED}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          secureTextEntry={isSecure}
          maxLength={maxLength}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoFocus={autoFocus}
          editable={!disabled}
        />
        {onClear && value.length > 0 && !disabled && (
          <Pressable onPress={onClear} hitSlop={8}>
            <Image source={CLOSE_ICON} style={styles.clearIcon} />
          </Pressable>
        )}
        {suffix && (
          <Text style={[styles.suffix, disabled && styles.inputDisabled]}>
            {suffix}
          </Text>
        )}
        {secureToggle && !disabled && (
          <Pressable onPress={() => setIsSecure(!isSecure)}>
            <Image
              source={isSecure ? EYE_CLOSED_ICON : EYE_ICON}
              style={styles.toggleIcon}
            />
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
});

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
  requiredMark: {
    color: FOREGROUND_SECONDARY,
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
    color: FOREGROUND_PRIMARY,
    outlineWidth: 0,
    ...({ outlineStyle: 'none' } as any),
  },
  inputDisabled: {
    color: FOREGROUND_DISABLED,
  },
  suffix: {
    ...TYPOGRAPHY.body1,
    color: FOREGROUND_PRIMARY,
    marginLeft: 4,
  },
  toggleIcon: {
    width: 20,
    height: 20,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  clearIcon: {
    marginRight: 4,
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

TextField.displayName = 'TextField';

export default TextField;
