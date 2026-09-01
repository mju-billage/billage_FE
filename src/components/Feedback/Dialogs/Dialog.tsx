import {
  KeyboardTypeOptions,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import TextButton from '../../Input/Button/TextButton';
import TextField from '../../Input/Text Field/TextField';
import {
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_NEUTRAL_SUBTLE,
  OVERLAY_SCRIM,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type DialogProps = {
  visible: boolean;
  title: string;
  description?: string;
  showTextField?: boolean;
  textFieldValue?: string;
  onChangeTextField?: (text: string) => void;
  textFieldPlaceholder?: string;
  textFieldKeyboardType?: KeyboardTypeOptions;
  textFieldMaxLength?: number;
  /** 서버 fieldErrors 등 인라인 필드 에러 — 있으면 입력 필드 아래에 그대로 보여준다. */
  textFieldError?: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel?: () => void;
  onConfirm: () => void;
  /** true면 취소 버튼 없이 confirm 버튼 하나만 보여준다(단순 안내 모달용). */
  singleButton?: boolean;
  /** true면 confirm 버튼을 빨간색(파괴적 액션)으로 보여준다. */
  destructive?: boolean;
  /** true면 confirm 버튼을 비활성화한다(요청 진행 중 중복 제출 방지 등). */
  confirmDisabled?: boolean;
};

/** 제목/설명/입력필드를 조합할 수 있는 확인 모달. */
function Dialog({
  visible,
  title,
  description,
  showTextField = false,
  textFieldValue = '',
  onChangeTextField,
  textFieldPlaceholder,
  textFieldKeyboardType,
  textFieldMaxLength,
  textFieldError,
  cancelLabel = '취소',
  confirmLabel = '확인',
  onCancel,
  onConfirm,
  singleButton = false,
  destructive = false,
  confirmDisabled = false,
}: DialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel ?? onConfirm}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
          {showTextField && (
            <View style={styles.textFieldWrapper}>
              <TextField
                value={textFieldValue}
                onChangeText={onChangeTextField ?? (() => {})}
                placeholder={textFieldPlaceholder ?? '텍스트'}
                keyboardType={textFieldKeyboardType}
                maxLength={textFieldMaxLength}
                error={textFieldError}
              />
            </View>
          )}
          <View style={styles.footer}>
            {!singleButton && (
              <TextButton
                label={cancelLabel}
                hierarchy="tertiary"
                onPress={onCancel ?? onConfirm}
              />
            )}
            <TextButton
              label={confirmLabel}
              hierarchy={destructive ? 'negative' : 'secondary'}
              onPress={onConfirm}
              disabled={confirmDisabled}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: OVERLAY_SCRIM,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    ...TYPOGRAPHY.subtitle1,
  },
  description: {
    ...TYPOGRAPHY.body2,
    marginTop: 8,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  textFieldWrapper: {
    marginTop: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
});

export default Dialog;
