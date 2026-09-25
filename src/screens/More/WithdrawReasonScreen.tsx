/** @screen COM-2-PAGE-05-0 탈퇴하기_사유 선택 */
/** @screen COM-3-MODAL-01-0 탈퇴하기_최종 확인 모달 (confirmDialogVisible) */
/**
 * 회원 탈퇴 플로우 마지막 단계: 탈퇴 사유(다중 선택 + 직접 입력)를 고른 뒤,
 * 최종 확인 모달에서 실제로 `DELETE /auth/me`를 호출한다. 이전 단계에서 받은
 * `ownershipTransfers`(없으면 빈 배열, [Case B])를 그대로 같이 보낸다 — 권한
 * 이전과 계정 삭제가 한 트랜잭션이라서다(Auth.txt 11번 정책 메모).
 *
 * CTA 버튼 문구는 "탈퇴하기"다 — UI 요소 표(No.4)와 Case A
 * 프레임은 "선택 완료"라 적었지만, 같은 화면의 메인 프레임 2장(COM-2-PAGE-05-0)과
 * 다음 화면(COM-3-MODAL-01-0)의 배경 프레임까지 총 3곳이 "탈퇴하기"로 그려져
 * 있어 시각적 다수를 따랐다(`WITHDRAW_REASON_SUBMIT_LABEL` 주석 참고). 이 CTA는
 * 실제 탈퇴를 실행하지 않고 다음(최종 확인 모달)으로 넘어가기만 한다.
 */
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import CardBase from '../../components/Data Display/Card/CardBase';
import CheckBox from '../../components/Input/Control/CheckBox';
import TextField from '../../components/Input/Text Field/TextField';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import * as authService from '../../services/authService';
import type { WithdrawReasonCode } from '../../services/authService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  SNACKBAR_WITHDRAW_COMPLETE,
  WITHDRAW_CONFIRM_CANCEL_LABEL,
  WITHDRAW_CONFIRM_DESCRIPTION,
  WITHDRAW_CONFIRM_SUBMIT_LABEL,
  WITHDRAW_CONFIRM_TITLE,
  WITHDRAW_REASON_ETC_LABEL,
  WITHDRAW_REASON_ETC_MAX_LENGTH,
  WITHDRAW_REASON_ETC_PLACEHOLDER,
  WITHDRAW_REASON_HEADING,
  WITHDRAW_REASON_MISSING_FEATURE_LABEL,
  WITHDRAW_REASON_NO_LONGER_NEEDED_LABEL,
  WITHDRAW_REASON_REJOIN_LABEL,
  WITHDRAW_REASON_SUBMIT_LABEL,
  WITHDRAW_REASON_TITLE,
  WITHDRAW_REASON_USAGE_UNCLEAR_LABEL,
} from '../../constants/settingsScreenText';
import { FEEDBACK_NEGATIVE_BOLD } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CLOSE_ICON = require('../../assets/icons/action/Close.png');

type NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WithdrawReason'
>;
type RouteProps = RouteProp<RootStackParamList, 'WithdrawReason'>;

const REASON_OPTIONS: { code: WithdrawReasonCode; label: string }[] = [
  { code: 'USAGE_UNCLEAR', label: WITHDRAW_REASON_USAGE_UNCLEAR_LABEL },
  { code: 'REJOIN', label: WITHDRAW_REASON_REJOIN_LABEL },
  { code: 'MISSING_FEATURE', label: WITHDRAW_REASON_MISSING_FEATURE_LABEL },
  { code: 'NO_LONGER_NEEDED', label: WITHDRAW_REASON_NO_LONGER_NEEDED_LABEL },
  { code: 'ETC', label: WITHDRAW_REASON_ETC_LABEL },
];

/** "탈퇴하기" 마지막 단계: 사유 선택 + 최종 확인 모달. */
function WithdrawReasonScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { ownershipTransfers } = route.params;

  const [selectedReasons, setSelectedReasons] = useState<
    WithdrawReasonCode[]
  >([]);
  const [reasonDetail, setReasonDetail] = useState('');
  const [confirmDialogVisible, setConfirmDialogVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const etcSelected = selectedReasons.includes('ETC');
  const etcInvalid = etcSelected && reasonDetail.trim().length === 0;
  const canSubmit = selectedReasons.length > 0 && !etcInvalid;

  const toggleReason = (code: WithdrawReasonCode) => {
    setErrorMessage('');
    setSelectedReasons(prev =>
      prev.includes(code) ? prev.filter(item => item !== code) : [...prev, code],
    );
  };

  const handleClose = () => navigation.navigate('MyProfile');

  const handleWithdraw = async () => {
    setIsSubmitting(true);
    try {
      await authService.withdraw({
        ownershipTransfers,
        reasons: selectedReasons,
        reasonDetail: etcSelected ? reasonDetail.trim() : undefined,
      });
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [
            { name: 'Login', params: { snackbarMessage: SNACKBAR_WITHDRAW_COMPLETE } },
          ],
        }),
      );
    } catch (error) {
      setConfirmDialogVisible(false);
      setErrorMessage(
        isNetworkError(error)
          ? API_NETWORK_ERROR_MESSAGE
          : error instanceof ApiError
          ? getApiErrorMessage(error.code)
          : API_ERROR_DEFAULT_MESSAGE,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer background="primary">
      <AppBar
        type="sub"
        title={WITHDRAW_REASON_TITLE}
        onBackPress={() => navigation.goBack()}
        rightIcons={[{ icon: CLOSE_ICON, onPress: handleClose }]}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.heading}>{WITHDRAW_REASON_HEADING}</Text>

        <CardBase>
          {REASON_OPTIONS.map(option => (
            <View key={option.code}>
              <View style={styles.reasonRow}>
                <Text style={styles.reasonLabel}>{option.label}</Text>
                <CheckBox
                  checked={selectedReasons.includes(option.code)}
                  onToggle={() => toggleReason(option.code)}
                />
              </View>
              {option.code === 'ETC' && etcSelected && (
                <View style={styles.etcFieldWrapper}>
                  <TextField
                    value={reasonDetail}
                    onChangeText={setReasonDetail}
                    placeholder={WITHDRAW_REASON_ETC_PLACEHOLDER}
                    maxLength={WITHDRAW_REASON_ETC_MAX_LENGTH}
                  />
                </View>
              )}
            </View>
          ))}
        </CardBase>

        {errorMessage.length > 0 && (
          <Text style={styles.errorText}>{errorMessage}</Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={WITHDRAW_REASON_SUBMIT_LABEL}
          onPress={() => setConfirmDialogVisible(true)}
          disabled={!canSubmit}
          fullWidth
        />
      </View>

      <Dialog
        visible={confirmDialogVisible}
        title={WITHDRAW_CONFIRM_TITLE}
        description={WITHDRAW_CONFIRM_DESCRIPTION}
        cancelLabel={WITHDRAW_CONFIRM_CANCEL_LABEL}
        confirmLabel={WITHDRAW_CONFIRM_SUBMIT_LABEL}
        destructive
        confirmDisabled={isSubmitting}
        onCancel={() => setConfirmDialogVisible(false)}
        onConfirm={handleWithdraw}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  heading: {
    ...TYPOGRAPHY.subtitle2,
    marginBottom: 16,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  reasonLabel: {
    ...TYPOGRAPHY.body1,
  },
  etcFieldWrapper: {
    marginBottom: 8,
  },
  errorText: {
    ...TYPOGRAPHY.body3,
    color: FEEDBACK_NEGATIVE_BOLD,
    marginTop: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
});

export default WithdrawReasonScreen;
