/** @screen ETC-4-PAGE-17-0 비밀번호 변경 */
/**
 * 서버 미구현(2026-09-06 기준, `authService.changePassword` 참고) — 화면은
 * 명세대로 실제 호출을 만들어두고, 지금은 호출하면 에러 상태가 뜨는 게
 * 정상이다(서버가 열리면 코드 수정 없이 붙는다).
 */
import { useCallback, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import TextField from '../../components/Input/Text Field/TextField';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import * as authService from '../../services/authService';
import { ApiError } from '../../services/apiClient';
import { isValidPassword } from '../../utils/validators';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  PASSWORD_CHANGE_CONFIRM_LABEL,
  PASSWORD_CHANGE_CURRENT_LABEL,
  PASSWORD_CHANGE_CURRENT_MISMATCH_ERROR,
  PASSWORD_CHANGE_CURRENT_PLACEHOLDER,
  PASSWORD_CHANGE_FORMAT_ERROR,
  PASSWORD_CHANGE_LEAVE_CANCEL_LABEL,
  PASSWORD_CHANGE_LEAVE_CONFIRM_LABEL,
  PASSWORD_CHANGE_LEAVE_DESCRIPTION,
  PASSWORD_CHANGE_LEAVE_TITLE,
  PASSWORD_CHANGE_MISMATCH_ERROR,
  PASSWORD_CHANGE_NEW_LABEL,
  PASSWORD_CHANGE_NEW_PLACEHOLDER,
  PASSWORD_CHANGE_SUBMIT_LABEL,
  PASSWORD_CHANGE_TITLE,
  SNACKBAR_PASSWORD_CHANGED,
} from '../../constants/settingsScreenText';

type PasswordChangeNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PasswordChange'
>;

/** "비밀번호 변경": 현재/새/새 비밀번호 확인 3필드. */
function PasswordChangeScreen() {
  const navigation = useNavigation<PasswordChangeNavigationProp>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState<string | undefined>();
  const [newPasswordError, setNewPasswordError] = useState<string | undefined>();
  const [confirmError, setConfirmError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveDialogVisible, setLeaveDialogVisible] = useState(false);

  const hasInput =
    currentPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;
  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    !isSubmitting;

  const handleBack = () => {
    if (hasInput) {
      setLeaveDialogVisible(true);
    } else {
      navigation.goBack();
    }
  };

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (hasInput) {
          setLeaveDialogVisible(true);
          return true;
        }
        return false;
      });
      return () => subscription.remove();
    }, [hasInput]),
  );

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    setCurrentPasswordError(undefined);
    setNewPasswordError(undefined);
    setConfirmError(undefined);

    if (!isValidPassword(newPassword)) {
      setNewPasswordError(PASSWORD_CHANGE_FORMAT_ERROR);
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError(PASSWORD_CHANGE_MISMATCH_ERROR);
      return;
    }

    setIsSubmitting(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      navigation.navigate('MyProfile', {
        snackbarMessage: SNACKBAR_PASSWORD_CHANGED,
      });
    } catch (error) {
      if (isNetworkError(error)) {
        setCurrentPasswordError(API_NETWORK_ERROR_MESSAGE);
      } else if (error instanceof ApiError && error.code === 'INVALID_CREDENTIALS') {
        setCurrentPasswordError(PASSWORD_CHANGE_CURRENT_MISMATCH_ERROR);
      } else if (error instanceof ApiError) {
        setCurrentPasswordError(getApiErrorMessage(error.code));
      } else {
        setCurrentPasswordError(API_ERROR_DEFAULT_MESSAGE);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer background="secondary">
      <AppBar type="sub" title={PASSWORD_CHANGE_TITLE} onBackPress={handleBack} />

      <View style={styles.body}>
        <TextField
          label={PASSWORD_CHANGE_CURRENT_LABEL}
          value={currentPassword}
          onChangeText={text => {
            setCurrentPassword(text);
            setCurrentPasswordError(undefined);
          }}
          placeholder={PASSWORD_CHANGE_CURRENT_PLACEHOLDER}
          secureToggle
          error={currentPasswordError}
        />
        <TextField
          label={PASSWORD_CHANGE_NEW_LABEL}
          value={newPassword}
          onChangeText={text => {
            setNewPassword(text);
            setNewPasswordError(undefined);
            if (confirmPassword.length > 0) {
              setConfirmError(text === confirmPassword ? undefined : PASSWORD_CHANGE_MISMATCH_ERROR);
            }
          }}
          placeholder={PASSWORD_CHANGE_NEW_PLACEHOLDER}
          secureToggle
          error={newPasswordError}
        />
        <TextField
          label={PASSWORD_CHANGE_CONFIRM_LABEL}
          value={confirmPassword}
          onChangeText={text => {
            setConfirmPassword(text);
            setConfirmError(
              text.length > 0 && text !== newPassword
                ? PASSWORD_CHANGE_MISMATCH_ERROR
                : undefined,
            );
          }}
          placeholder={PASSWORD_CHANGE_NEW_PLACEHOLDER}
          secureToggle
          error={confirmError}
        />
      </View>

      <View style={styles.footer}>
        <Button
          label={PASSWORD_CHANGE_SUBMIT_LABEL}
          onPress={handleSubmit}
          disabled={!canSubmit}
          fullWidth
        />
      </View>

      <Dialog
        visible={leaveDialogVisible}
        title={PASSWORD_CHANGE_LEAVE_TITLE}
        description={PASSWORD_CHANGE_LEAVE_DESCRIPTION}
        cancelLabel={PASSWORD_CHANGE_LEAVE_CANCEL_LABEL}
        confirmLabel={PASSWORD_CHANGE_LEAVE_CONFIRM_LABEL}
        destructive
        onCancel={() => setLeaveDialogVisible(false)}
        onConfirm={() => {
          setLeaveDialogVisible(false);
          navigation.goBack();
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
});

export default PasswordChangeScreen;
