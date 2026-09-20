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
  /** true면 라벨 우측에 파란 별표(필수 표시)를 붙인다 — 시안 실측 `#3772E4`(6개 시트 전부 파랑), 토큰은 `FOREGROUND_SECONDARY`. */
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
  /** 입력값이 있을 때 인라인 클리어(X) 아이콘을 보여주고, 누르면 이 콜백으로 값을 비운다. */
  onClear?: () => void;
  /** "원" 같은 단위를 value 문자열에 섞지 않고 입력 오른쪽에 별도로 보여준다
   * (value에 섞으면 커서가 항상 단위 뒤에 붙어버린다). */
  suffix?: string;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoFocus?: boolean;
  /** 포커스가 필드를 벗어났을 때 호출된다(입력 중이 아닌 시점에 검증 에러를 띄우려는 화면용). */
  onBlur?: () => void;
};

/**
 * 라벨 + 입력 + 헬퍼/에러 텍스트로 구성된 공용 입력 필드.
 * ref를 넘기면 내부 TextInput 인스턴스를 그대로 받는다 — 컨트롤드 입력값이
 * 이전과 같아 리렌더가 스킵될 때(React의 Object.is 동일 판정) 네이티브가
 * JS state와 어긋난 채로 남는 경우, 호출부에서 `ref.current?.setNativeProps(...)`로
 * 직접 되돌리는 용도(예: DuesCreateScreen 금액 필드).
 */
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
            {/* 시안(로그인·가입 정보 입력·비밀번호 변경 시트 공통): 마스킹 중 = 사선 눈, 노출 중 = 열린 눈(사선 사라짐). */}
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
