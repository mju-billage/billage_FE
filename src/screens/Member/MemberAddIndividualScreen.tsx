/** @screen DUE-4-PAGE-01-0 모임원 추가_개별 */
/** @screen DUE-5-PAGE-01-0 태그 입력 (개별 추가 화면 내부 스텝으로 구현) */
/** @screen DUE-5-SNACKBAR-03-0 모임원 개별 추가 완료 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useNavigation } from '@react-navigation/native';
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
import { isValidPhoneNumber } from '../../utils/phone';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  MEMBER_ADD_INDIVIDUAL_TITLE,
  MEMBER_ADD_SUBMIT_LABEL,
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
  SNACKBAR_MEMBER_ADDED,
} from '../../constants/memberScreenText';
import { FEEDBACK_NEGATIVE_BOLD, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SNACKBAR_AUTO_HIDE_MS = 1600;

type MemberAddIndividualNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MemberAddIndividual'
>;

type Step = 'form' | 'tags';

/**
 * 모임원 개별 추가: 이름/전화번호/태그/메모 입력. 태그 입력(DUE-5-PAGE-01-0)은
 * 명세상 별도 페이지지만 여기선 별도 라우트로 만들지 않고 내부 스텝으로
 * 구현했다 — 회비 생성 화면(6-B, DuesCreateScreen)의 step 패턴과 동일하게,
 * 라우트 파라미터로 값을 주고받는 대신 상태를 그대로 들고 있어야 "뒤로가기
 * 시 입력값 유지"가 자연스럽다. 태그 입력 화면의 자체 뒤로가기(취소)는
 * 이번 세션에서 편집한 태그만 버리고 이전 확정값으로 복귀한다(draftTags).
 */
function MemberAddIndividualScreen() {
  const navigation = useNavigation<MemberAddIndividualNavigationProp>();
  const [step, setStep] = useState<Step>('form');

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [draftTags, setDraftTags] = useState<string[]>([]);
  const [memo, setMemo] = useState('');

  const [nameError, setNameError] = useState<string | undefined>();
  const [phoneError, setPhoneError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const openTagStep = () => {
    setDraftTags(tags);
    setStep('tags');
  };

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

    setIsSubmitting(true);
    try {
      await memberService.createMember(group.id, {
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
          setFormError(getApiErrorMessage(error.code));
        }
      } else {
        setFormError(API_ERROR_DEFAULT_MESSAGE);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
      snackbar={snackbarVisible ? <Snackbar visible title={SNACKBAR_MEMBER_ADDED} /> : undefined}
      snackbarOffset={68}
    >
      <AppBar
        type="sub"
        title={MEMBER_ADD_INDIVIDUAL_TITLE}
        onBackPress={() => navigation.goBack()}
      />
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
          label={MEMBER_ADD_SUBMIT_LABEL}
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

export default MemberAddIndividualScreen;
