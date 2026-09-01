/** @screen ETC-4-SHEET-01-0 모임 참여 */
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import TextField from '../../components/Input/Text Field/TextField';
import Button from '../../components/Input/Button/Button';
import type { GroupSummary } from '../../types/group';
import * as groupService from '../../services/groupService';
import { API_NETWORK_ERROR_MESSAGE, isNetworkError } from '../../constants/apiErrorMessages';
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

/** "코드로 참여하기" 시트: 초대 코드를 입력해 모임에 참여한다. */
function JoinGroupSheet({ visible, onClose, onJoined }: JoinGroupSheetProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    setCode('');
    setError(undefined);
    onClose();
  };

  const handleSubmit = async () => {
    if (!code.trim() || isSubmitting) {
      return;
    }
    setError(undefined);
    setIsSubmitting(true);
    try {
      const group = await groupService.joinGroup(code.trim());
      setCode('');
      onJoined(group);
    } catch (fetchError) {
      // 명세(GroupMembership §3)에 잘못된 초대 코드의 에러 코드가 정의돼 있지 않아
      // 네트워크 실패가 아닌 모든 실패를 "유효하지 않은 초대 코드"로 보여준다.
      setError(
        isNetworkError(fetchError)
          ? API_NETWORK_ERROR_MESSAGE
          : JOIN_GROUP_INVALID_CODE_ERROR,
      );
    } finally {
      setIsSubmitting(false);
    }
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
    ...TYPOGRAPHY.subtitle1,
    marginBottom: 16,
  },
});

export default JoinGroupSheet;
