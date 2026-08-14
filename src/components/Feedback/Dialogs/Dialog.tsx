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
} from '../../../constants/colors';

type DialogProps = {
  visible: boolean;
  title: string;
  description?: string;
  showTextField?: boolean;
  textFieldValue?: string;
  onChangeTextField?: (text: string) => void;
  textFieldPlaceholder?: string;
  textFieldKeyboardType?: KeyboardTypeOptions;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
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
  cancelLabel = '취소',
  confirmLabel = '확인',
  onCancel,
  onConfirm,
}: DialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
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
              />
            </View>
          )}
          <View style={styles.footer}>
            <TextButton
              label={cancelLabel}
              hierarchy="tertiary"
              onPress={onCancel}
            />
            <TextButton
              label={confirmLabel}
              hierarchy="secondary"
              onPress={onConfirm}
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
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
    fontSize: 17,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 8,
    fontSize: 14,
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
