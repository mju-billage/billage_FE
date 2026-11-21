import { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import TextField from '../../components/Input/Text Field/TextField';
import Button from '../../components/Input/Button/Button';
import type { GroupSummary } from '../../types/group';
import * as groupService from '../../services/groupService';
import { useSubmitLock } from '../../hooks/useSubmitLock';
import { ApiError } from '../../services/apiClient';
import {
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  JOIN_GROUP_INVALID_CODE_ERROR,
  JOIN_GROUP_PLACEHOLDER,
  JOIN_GROUP_SHEET_TITLE,
  JOIN_GROUP_SUBMIT_LABEL,
} from '../../constants/groupManagerScreenText';
import { TYPOGRAPHY } from '../../constants/typography';

type JoinGroupSheetProps = {
  visible: boolean;
  onClose: () => void;
  onJoined: (group: GroupSummary) => void;
};

function JoinGroupSheet({ visible, onClose, onJoined }: JoinGroupSheetProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const { isLocked: isSubmitting, run, release } = useSubmitLock();

  useEffect(() => {
    if (visible) {
      release();
    }
  }, [visible, release]);

  const handleClose = () => {
    setCode('');
    setError(undefined);
    onClose();
  };

  const handleSubmit = () => {
    if (!code.trim()) {
      return;
    }
    setError(undefined);
    run(async () => {
      try {
        const group = await groupService.joinGroup(code.trim());
        setCode('');
        onJoined(group);
        return true;
      } catch (fetchError) {
        if (isNetworkError(fetchError)) {
          setError(API_NETWORK_ERROR_MESSAGE);
        } else if (fetchError instanceof ApiError) {
          if (
            fetchError.code === 'INVALID_INVITATION_CODE' ||
            fetchError.code === 'INVITATION_NOT_FOUND'
          ) {
            setError(JOIN_GROUP_INVALID_CODE_ERROR);
          } else {
            setError(getApiErrorMessage(fetchError.code, fetchError.message));
          }
        } else {
          setError(JOIN_GROUP_INVALID_CODE_ERROR);
        }
        return false;
      }
    }, { keepLockedOnSuccess: true });
  };

  return (
    <BottomSheet visible={visible} onClose={handleClose}>
      <Text style={styles.title}>{JOIN_GROUP_SHEET_TITLE}</Text>
      <TextField
        value={code}
        onChangeText={text => {
          setCode(text);
          setError(undefined);
        }}
        placeholder={JOIN_GROUP_PLACEHOLDER}
        error={error}
        onClear={() => setCode('')}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <Button
        label={JOIN_GROUP_SUBMIT_LABEL}
        onPress={handleSubmit}
        disabled={!code.trim() || isSubmitting}
        fullWidth
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.h3,
    marginBottom: 16,
  },
});

export default JoinGroupSheet;
