import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import TextArea from '../../components/Input/Text Field/TextArea';
import Button from '../../components/Input/Button/Button';
import { getActiveGroup } from '../../types/group';
import * as memberService from '../../services/memberService';
import { useSubmitLock } from '../../hooks/useSubmitLock';
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

type MemberAddBulkNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MemberAddBulk'
>;

function MemberAddBulkScreen() {
  const navigation = useNavigation<MemberAddBulkNavigationProp>();
  const [text, setText] = useState('');
  const [formError, setFormError] = useState<string | undefined>();
  const { isLocked: isSubmitting, run } = useSubmitLock();

  const parsedNames = parseMemberNames(text);
  const canSubmit = parsedNames.length > 0 && !isSubmitting;

  const handleSubmit = () => {
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

    run(async () => {
    try {
      const created = await memberService.createMembersBulk(group.id, text.trim());
      navigation.popTo(
        'MemberManage',
        {
          snackbarMessage: `${created.length}${SNACKBAR_MEMBER_BULK_ADDED_SUFFIX}`,
          snackbarDescription: SNACKBAR_MEMBER_BULK_ADDED_DESCRIPTION,
        },
        { merge: true },
      );
      return true;
    } catch (error) {
      if (isNetworkError(error)) {
        setFormError(API_NETWORK_ERROR_MESSAGE);
      } else if (error instanceof ApiError) {
        setFormError(getApiErrorMessage(error.code, error.message));
      } else {
        setFormError(API_ERROR_DEFAULT_MESSAGE);
      }
      return false;
    }
    }, { keepLockedOnSuccess: true });
  };

  return (
    <ScreenContainer background="secondary">
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
