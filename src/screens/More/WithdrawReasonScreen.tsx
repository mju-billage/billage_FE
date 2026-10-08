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
  WITHDRAW_OWNER_TRANSFER_REQUIRED_ERROR,
  WITHDRAW_SUCCESSOR_NOT_FOUND_ERROR,
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
      if (error instanceof ApiError && error.code === 'OWNER_TRANSFER_REQUIRED') {
        setErrorMessage(WITHDRAW_OWNER_TRANSFER_REQUIRED_ERROR);
        return;
      }
      if (error instanceof ApiError && error.code === 'MEMBERSHIP_NOT_FOUND') {
        setErrorMessage(WITHDRAW_SUCCESSOR_NOT_FOUND_ERROR);
        return;
      }
      setErrorMessage(
        isNetworkError(error)
          ? API_NETWORK_ERROR_MESSAGE
          : error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
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
