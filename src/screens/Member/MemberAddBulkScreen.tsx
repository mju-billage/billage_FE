/** @screen DUE-4-PAGE-02-0 모임원 추가_일괄 */
/** @screen DUE-5-SNACKBAR-01-0 모임원 추가_일괄 완료 */
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import TextArea from '../../components/Input/Text Field/TextArea';
import Button from '../../components/Input/Button/Button';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import { getActiveGroup } from '../../types/group';
import * as memberService from '../../services/memberService';
import { ApiError } from '../../services/apiClient';
import { parseMemberNames } from '../../utils/memberNames';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  MEMBER_ADD_BULK_HELPER,
  MEMBER_ADD_BULK_MAX_COUNT,
  MEMBER_ADD_BULK_NAME_TOO_LONG_ERROR,
  MEMBER_ADD_BULK_PLACEHOLDER,
  MEMBER_ADD_BULK_TEXT_MAX_LENGTH,
  MEMBER_ADD_BULK_TITLE,
  MEMBER_ADD_BULK_TOO_MANY_ERROR,
  MEMBER_ADD_SUBMIT_LABEL,
  MEMBER_NAME_MAX_LENGTH,
  SNACKBAR_MEMBER_BULK_ADDED_DESCRIPTION,
  SNACKBAR_MEMBER_BULK_ADDED_SUFFIX,
} from '../../constants/memberScreenText';

const SNACKBAR_AUTO_HIDE_MS = 1600;

type MemberAddBulkNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MemberAddBulk'
>;

/**
 * 모임원 일괄 추가: 이름만 받는다(전화번호·태그·메모는 개별 수정 대상,
 * Member.txt §3). 서버가 `names` 원문을 쉼표/띄어쓰기/줄바꿈으로 직접
 * 자르므로 클라이언트는 미리 자르지 않고 원문을 그대로 보낸다 —
 * `parseMemberNames`는 버튼 활성화·사전 검증에만 쓴다.
 */
function MemberAddBulkScreen() {
  const navigation = useNavigation<MemberAddBulkNavigationProp>();
  const [text, setText] = useState('');
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarInfo, setSnackbarInfo] = useState<{ count: number } | null>(null);

  const parsedNames = parseMemberNames(text);
  const canSubmit = parsedNames.length > 0 && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) {
      return;
    }
    setFormError(undefined);

    if (parsedNames.length > MEMBER_ADD_BULK_MAX_COUNT) {
      setFormError(MEMBER_ADD_BULK_TOO_MANY_ERROR);
      return;
    }
    if (parsedNames.some(name => name.length > MEMBER_NAME_MAX_LENGTH)) {
      setFormError(MEMBER_ADD_BULK_NAME_TOO_LONG_ERROR);
      return;
    }

    const group = getActiveGroup();
    if (!group) {
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await memberService.createMembersBulk(group.id, text.trim());
      setSnackbarInfo({ count: created.length });
      setTimeout(() => {
        navigation.goBack();
      }, SNACKBAR_AUTO_HIDE_MS);
    } catch (error) {
      if (isNetworkError(error)) {
        setFormError(API_NETWORK_ERROR_MESSAGE);
      } else if (error instanceof ApiError) {
        setFormError(getApiErrorMessage(error.code));
      } else {
        setFormError(API_ERROR_DEFAULT_MESSAGE);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      background="secondary"
      snackbar={
        snackbarInfo ? (
          <Snackbar
            visible
            title={`${snackbarInfo.count}${SNACKBAR_MEMBER_BULK_ADDED_SUFFIX}`}
            description={SNACKBAR_MEMBER_BULK_ADDED_DESCRIPTION}
          />
        ) : undefined
      }
      snackbarOffset={68}
    >
      <AppBar
        type="sub"
        title={MEMBER_ADD_BULK_TITLE}
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.content}>
        <TextArea
          value={text}
          onChangeText={setText}
          placeholder={MEMBER_ADD_BULK_PLACEHOLDER}
          helperText={formError ? undefined : MEMBER_ADD_BULK_HELPER}
          error={formError}
          maxLength={MEMBER_ADD_BULK_TEXT_MAX_LENGTH}
          rows={8}
        />
      </View>
      <View style={styles.footer}>
        <Button
          label={MEMBER_ADD_SUBMIT_LABEL}
          disabled={!canSubmit}
          fullWidth
          onPress={handleSubmit}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});

export default MemberAddBulkScreen;
