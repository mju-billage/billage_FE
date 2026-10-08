import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import TextField from '../../components/Input/Text Field/TextField';
import TextArea from '../../components/Input/Text Field/TextArea';
import SelectionListItem from '../../components/Data Display/Lists/SelectionListItem';
import TagField from '../../components/Input/Tag Field/TagField';
import Button from '../../components/Input/Button/Button';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import { getActiveGroup } from '../../types/group';
import * as memberService from '../../services/memberService';
import { ApiError } from '../../services/apiClient';
import { formatPhoneNumber, isValidPhoneNumber } from '../../utils/phone';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  NO_ACTIVE_GROUP_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  MEMBER_EDIT_SUBMIT_LABEL,
  MEMBER_EDIT_TITLE,
  MEMBER_DETAIL_LOADING,
  MEMBER_MANAGE_RETRY_LABEL,
  MEMBER_MEMO_LABEL,
  MEMBER_MEMO_MAX_LENGTH,
  MEMBER_MEMO_PLACEHOLDER,
  MEMBER_NAME_LABEL,
  MEMBER_NAME_MAX_LENGTH,
  MEMBER_NAME_PLACEHOLDER,
  MEMBER_PHONE_INVALID_ERROR,
  MEMBER_PHONE_LABEL,
  MEMBER_PHONE_PLACEHOLDER,
  MEMBER_TAG_EMPTY_VALUE,
  MEMBER_TAG_INPUT_HELPER,
  MEMBER_TAG_INPUT_PLACEHOLDER,
  MEMBER_TAG_INPUT_SUBMIT_LABEL,
  MEMBER_TAG_INPUT_TITLE,
  MEMBER_TAG_LABEL,
  MEMBER_TAG_MAX_COUNT,
  SNACKBAR_MEMBER_UPDATED,
} from '../../constants/memberScreenText';
import {
  FEEDBACK_NEGATIVE_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SNACKBAR_AUTO_HIDE_MS = 1600;

type MemberEditNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type MemberEditRouteProp = RouteProp<RootStackParamList, 'MemberEdit'>;
type LoadState = 'loading' | 'error' | 'ready';
type Step = 'form' | 'tags';

function MemberEditScreen() {
  const navigation = useNavigation<MemberEditNavigationProp>();
  const route = useRoute<MemberEditRouteProp>();
  const memberId = route.params.memberId;

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [step, setStep] = useState<Step>('form');

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [memo, setMemo] = useState('');

  const [initial, setInitial] = useState({
    name: '',
    phoneNumber: '',
    tags: [] as string[],
    memo: '',
  });

  const [nameError, setNameError] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code, error.message);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const group = getActiveGroup();
      if (!group) {
        setLoadErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setLoadState('error');
        return;
      }
      const detail = await memberService.getMemberDetail(group.id, memberId);
      const phone = detail.phoneNumber ? formatPhoneNumber(detail.phoneNumber) : '';
      setName(detail.name);
      setPhoneNumber(phone);
      setTags(detail.tags);
      setMemo(detail.memo ?? '');
      setInitial({
        name: detail.name,
        phoneNumber: phone,
        tags: detail.tags,
        memo: detail.memo ?? '',
      });
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [memberId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const openTagStep = () => {
    setDraftTags(tags);
    setStep('tags');
  };

  const sameTags = (a: string[], b: string[]): boolean =>
    a.length === b.length && a.every((tag, index) => tag === b[index]);

  const hasChanges =
    name.trim() !== initial.name ||
    phoneNumber.trim() !== initial.phoneNumber ||
    memo.trim() !== initial.memo ||
    !sameTags(tags, initial.tags);

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) {
      return;
    }
    setNameError(undefined);
    setPhoneError(undefined);
    setFormError(undefined);

    const trimmedPhone = phoneNumber.trim();
    if (trimmedPhone && !isValidPhoneNumber(trimmedPhone)) {
      setPhoneError(MEMBER_PHONE_INVALID_ERROR);
      return;
    }

    const group = getActiveGroup();
    if (!group) {
      return;
    }

    if (!hasChanges) {
      navigation.goBack();
      return;
    }

    setIsSubmitting(true);
    try {
      await memberService.updateMember(group.id, memberId, {
        name: trimmedName,
        phoneNumber: trimmedPhone || undefined,
        tags: tags.length > 0 ? tags : undefined,
        memo: memo.trim() || undefined,
      });
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, SNACKBAR_AUTO_HIDE_MS);
    } catch (error) {
      if (isNetworkError(error)) {
        setFormError(API_NETWORK_ERROR_MESSAGE);
      } else if (error instanceof ApiError) {
        const nameFieldError = error.fieldErrors.find(fe => fe.field === 'name');
        const phoneFieldError = error.fieldErrors.find(
          fe => fe.field === 'phoneNumber',
        );
        if (nameFieldError || phoneFieldError) {
          setNameError(nameFieldError?.reason);
          setPhoneError(phoneFieldError?.reason);
        } else {
          setFormError(getApiErrorMessage(error.code, error.message));
        }
      } else {
        setFormError(API_ERROR_DEFAULT_MESSAGE);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadState === 'loading' || loadState === 'error') {
    return (
      <ScreenContainer background="secondary">
        <AppBar type="sub" title={MEMBER_EDIT_TITLE} onBackPress={() => navigation.goBack()} />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {loadState === 'loading' ? MEMBER_DETAIL_LOADING : loadErrorMessage}
          </Text>
          {loadState === 'error' && (
            <Button
              label={MEMBER_MANAGE_RETRY_LABEL}
              onPress={load}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          )}
        </View>
      </ScreenContainer>
    );
  }

  if (step === 'tags') {
    return (
      <ScreenContainer background="secondary">
        <AppBar
          type="sub"
          title={MEMBER_TAG_INPUT_TITLE}
          onBackPress={() => setStep('form')}
        />
        <View style={styles.content}>
          <TagField
            tags={draftTags}
            onChangeTags={setDraftTags}
            maxTags={MEMBER_TAG_MAX_COUNT}
            placeholder={MEMBER_TAG_INPUT_PLACEHOLDER}
          />
          <Text style={styles.tagHelper}>{MEMBER_TAG_INPUT_HELPER}</Text>
        </View>
        <View style={styles.footer}>
          <Button
            label={MEMBER_TAG_INPUT_SUBMIT_LABEL}
            fullWidth
            onPress={() => {
              setTags(draftTags);
              setStep('form');
            }}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      background="secondary"
      snackbar={snackbarVisible ? <Snackbar visible title={SNACKBAR_MEMBER_UPDATED} /> : undefined}
      snackbarOffset={68}
    >
      <AppBar type="sub" title={MEMBER_EDIT_TITLE} onBackPress={() => navigation.goBack()} />
      <ScrollView
        style={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextField
          label={MEMBER_NAME_LABEL}
          value={name}
          onChangeText={text => {
            setName(text);
            setNameError(undefined);
          }}
          placeholder={MEMBER_NAME_PLACEHOLDER}
          maxLength={MEMBER_NAME_MAX_LENGTH}
          error={nameError}
        />
        <TextField
          label={MEMBER_PHONE_LABEL}
          value={phoneNumber}
          onChangeText={text => {
            setPhoneNumber(text);
            setPhoneError(undefined);
          }}
          placeholder={MEMBER_PHONE_PLACEHOLDER}
          keyboardType="phone-pad"
          error={phoneError}
        />
        <SelectionListItem
          type="picker"
          title={MEMBER_TAG_LABEL}
          value={
            tags.length > 0 ? tags.map(tag => `#${tag}`).join(' ') : MEMBER_TAG_EMPTY_VALUE
          }
          onPress={openTagStep}
        />
        <View style={styles.memoWrapper}>
          <Text style={styles.memoLabel}>{MEMBER_MEMO_LABEL}</Text>
          <TextArea
            value={memo}
            onChangeText={setMemo}
            placeholder={MEMBER_MEMO_PLACEHOLDER}
            maxLength={MEMBER_MEMO_MAX_LENGTH}
            rows={3}
          />
        </View>
        {formError && <Text style={styles.formError}>{formError}</Text>}
      </ScrollView>
      <View style={styles.footer}>
        <Button
          label={MEMBER_EDIT_SUBMIT_LABEL}
          disabled={!name.trim() || isSubmitting}
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
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  stateText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
  },
  memoWrapper: {
    marginBottom: 20,
  },
  memoLabel: {
    ...TYPOGRAPHY.subtitle3,
    marginBottom: 8,
  },
  tagHelper: {
    ...TYPOGRAPHY.body3,
    marginTop: 8,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  formError: {
    ...TYPOGRAPHY.body3,
    color: FEEDBACK_NEGATIVE_BOLD,
    marginTop: 4,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});

export default MemberEditScreen;
