import { forwardRef, useEffect, useState } from 'react';
import {
  Image,
  KeyboardTypeOptions,
  LayoutChangeEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  View,
} from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FEEDBACK_NEGATIVE_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_INVERSE,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';
import { TEXT_FIELD_MAX_LENGTH_ERROR } from '../../../constants/commonText';

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
  autoCorrect?: boolean;
  autoFocus?: boolean;
  onBlur?: () => void;
  /** true면 secureToggle 눈 아이콘을 포커스 중일 때만 보여준다(QA 결정: 옵트인, 기본 false) */
  secureToggleOnFocusOnly?: boolean;
  /** 글자 크기 등 입력칸 타이포만 바꿀 때 쓴다(예: 내역 금액의 큰 숫자, FT-22). 입력칸·숨은 측정 글자·'원' 모두에 같이 적용돼야 위치가 안 어긋난다. */
  inputStyle?: StyleProp<TextStyle>;
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
    autoCorrect,
    autoFocus = false,
    onBlur,
    secureToggleOnFocusOnly = false,
    inputStyle,
  },
  ref,
) {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry || secureToggle);
  const [measuredTextWidth, setMeasuredTextWidth] = useState<number | null>(null);
  const [overflow, setOverflow] = useState(false);
  const showIcon = isFocused || value.length > 0;
  const showSecureToggleIcon = secureToggleOnFocusOnly ? isFocused : showIcon;
  const showSuffix = Boolean(suffix) && value.length > 0;
  const effectiveOnClear =
    onClear ?? (secureTextEntry || secureToggle ? undefined : () => onChangeText(''));
  const overflowError =
    overflow && maxLength != null ? TEXT_FIELD_MAX_LENGTH_ERROR(maxLength) : undefined;
  const effectiveError = overflowError ?? error;

  useEffect(() => {
    if (maxLength != null && Array.from(value).length < maxLength && overflow) {
      setOverflow(false);
    }
  }, [value, maxLength, overflow]);

  const handleMeasureLayout = (event: LayoutChangeEvent) => {
    setMeasuredTextWidth(event.nativeEvent.layout.width);
  };

  const handleChangeText = (text: string) => {
    if (maxLength == null) {
      onChangeText(text);
      return;
    }
    const chars = Array.from(text);
    if (chars.length > maxLength) {
      setOverflow(true);
      onChangeText(chars.slice(0, maxLength).join(''));
      return;
    }
    setOverflow(false);
    onChangeText(text);
  };

  const underlineColor = disabled
    ? BORDER_NEUTRAL_NORMAL
    : effectiveError
    ? FEEDBACK_NEGATIVE_BOLD
    : success || isFocused
    ? FOREGROUND_SECONDARY
    : BORDER_NEUTRAL_NORMAL;

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={[styles.label, disabled && styles.labelDisabled]}>
            {label}
          </Text>
          {required && <Text style={styles.requiredMark}>*</Text>}
        </View>
      )}
      <View style={[styles.inputRow, { borderBottomColor: underlineColor }]}>
        <TextInput
          ref={ref}
          style={[
            styles.input,
            inputStyle,
            disabled && styles.inputDisabled,
            showSuffix && measuredTextWidth != null && styles.inputWithSuffix,
            showSuffix && measuredTextWidth != null
              ? { width: measuredTextWidth + 2 }
              : null,
          ]}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={FOREGROUND_DISABLED}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            setOverflow(false);
            onBlur?.();
          }}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          autoFocus={autoFocus}
          editable={!disabled}
        />
        {suffix != null && (
          <Text
            style={[styles.hiddenMeasure, inputStyle]}
            numberOfLines={1}
            onLayout={handleMeasureLayout}
          >
            {value}
          </Text>
        )}
        {showSuffix && (
          <Text style={[styles.suffix, inputStyle, disabled && styles.inputDisabled]}>
            {suffix}
          </Text>
        )}
        {effectiveOnClear && !disabled && (
          <Pressable
            onPress={effectiveOnClear}
            hitSlop={8}
            pointerEvents={isFocused && value.length > 0 ? 'auto' : 'none'}
            style={[
              styles.clearButton,
              isFocused && value.length > 0 ? styles.iconShown : styles.iconHidden,
            ]}
          >
            <View style={styles.clearCircle}>
              <Image source={CLOSE_ICON} style={styles.clearIcon} />
            </View>
          </Pressable>
        )}
        {secureToggle && !disabled && (
          <Pressable
            onPress={() => setIsSecure(!isSecure)}
            pointerEvents={showSecureToggleIcon ? 'auto' : 'none'}
            style={showSecureToggleIcon ? styles.iconShown : styles.iconHidden}
          >
            <Image
              source={isSecure ? EYE_CLOSED_ICON : EYE_ICON}
              style={styles.toggleIcon}
            />
          </Pressable>
        )}
      </View>
      {(effectiveError || helperText) && (
        <Text
          style={
            effectiveError
              ? styles.errorText
              : success
              ? styles.successText
              : styles.helperText
          }
        >
          {effectiveError ?? helperText}
        </Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  label: {
    ...TYPOGRAPHY.subtitle2,
    flexShrink: 1,
  },
  labelDisabled: {
    color: FOREGROUND_DISABLED,
  },
  requiredMark: {
    color: FOREGROUND_SECONDARY,
    fontSize: 12,
    lineHeight: 14,
    marginLeft: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 10,
  },
  input: {
    ...TYPOGRAPHY.body1,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    padding: 0,
    color: FOREGROUND_NEUTRAL_NORMAL,
    outlineWidth: 0,
    ...({ outlineStyle: 'none' } as any),
  },
  inputDisabled: {
    color: FOREGROUND_DISABLED,
  },
  inputWithSuffix: {
    flexGrow: 0,
    flexShrink: 1,
    flexBasis: 'auto',
  },
  hiddenMeasure: {
    ...TYPOGRAPHY.body1,
    position: 'absolute',
    left: 0,
    top: 0,
    opacity: 0,
  },
  suffix: {
    ...TYPOGRAPHY.body1,
    color: FOREGROUND_PRIMARY,
    marginLeft: 0,
  },
  toggleIcon: {
    width: 20,
    height: 20,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  iconShown: {
    opacity: 1,
  },
  iconHidden: {
    opacity: 0,
  },
  clearButton: {
    marginLeft: 'auto',
  },
  clearCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: FOREGROUND_NEUTRAL_SUBTLE,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  clearIcon: {
    width: 10,
    height: 10,
    tintColor: FOREGROUND_INVERSE,
  },
  helperText: {
    ...TYPOGRAPHY.body3,
    marginTop: 6,
    color: FOREGROUND_NEUTRAL_NORMAL,
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
