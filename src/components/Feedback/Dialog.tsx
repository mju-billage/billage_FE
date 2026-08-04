import { Modal, StyleSheet, Text, View } from 'react-native';
import ActionButton from '../Button/ActionButton';
import TextField from '../Field/TextField';

type DialogProps = {
  visible: boolean;
  title: string;
  description?: string;
  showTextField?: boolean;
  textFieldValue?: string;
  onChangeTextField?: (text: string) => void;
  textFieldPlaceholder?: string;
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
              />
            </View>
          )}
          <View style={styles.footer}>
            <ActionButton
              label={cancelLabel}
              style="neutral"
              onPress={onCancel}
            />
            <ActionButton
              label={confirmLabel}
              style="success"
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
    backgroundColor: '#FFFFFF',
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
    color: '#868E96',
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
