import {
  KeyboardTypeOptions,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { KeyboardStickyView, useKeyboardState } from 'react-native-keyboard-controller';
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
  textFieldError?: string;
  autoFocusTextField?: boolean;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel?: () => void;
  onConfirm: () => void;
  singleButton?: boolean;
  destructive?: boolean;
  confirmDisabled?: boolean;
};

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
  autoFocusTextField = false,
  cancelLabel = '취소',
  confirmLabel = '확인',
  onCancel,
  onConfirm,
  singleButton = false,
  destructive = false,
  confirmDisabled = false,
}: DialogProps) {
  const isKeyboardVisible = useKeyboardState(state => state.isVisible);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel ?? onConfirm}
    >
      <View style={[styles.overlay, isKeyboardVisible && styles.overlayDocked]}>
        <KeyboardStickyView style={styles.stickyWrapper}>
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
                  autoFocus={autoFocusTextField}
                  onClear={onChangeTextField ? () => onChangeTextField('') : undefined}
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
        </KeyboardStickyView>
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
  overlayDocked: {
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  stickyWrapper: {
    width: '100%',
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
