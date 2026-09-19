/** @screen FDR-3-PAGE-03-0 새 장부 생성 */
import { useCallback, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import Button from '../../components/Input/Button/Button';
import TextField from '../../components/Input/Text Field/TextField';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import * as ledgerService from '../../services/ledgerService';
import { getActiveGroup } from '../../types/group';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  LEDGER_BUDGET_LABEL,
  LEDGER_BUDGET_MAX,
  LEDGER_BUDGET_PLACEHOLDER,
  LEDGER_CREATE_SUBMIT_LABEL,
  LEDGER_CREATE_SUBTITLE,
  LEDGER_CREATE_TITLE,
  LEDGER_LEAVE_CANCEL_LABEL,
  LEDGER_LEAVE_CONFIRM_DESCRIPTION,
  LEDGER_LEAVE_CONFIRM_LABEL,
  LEDGER_LEAVE_CONFIRM_TITLE,
  LEDGER_NAME_HELPER,
  LEDGER_NAME_LABEL,
  LEDGER_NAME_MAX_LENGTH,
  LEDGER_NAME_PLACEHOLDER,
} from '../../constants/ledgerScreenText';
import { SNACKBAR_LEDGER_CREATED_SUFFIX } from '../../constants/folderScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SNACKBAR_AUTO_HIDE_MS = 1600;

type LedgerCreateNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'LedgerCreate'
>;
type LedgerCreateRouteProp = RouteProp<RootStackParamList, 'LedgerCreate'>;

/** "새 장부 생성하기": 이름(필수, 최대 10자)과 예산(선택)을 입력해 장부를 만든다. */
function LedgerCreateScreen() {
  const navigation = useNavigation<LedgerCreateNavigationProp>();
  const route = useRoute<LedgerCreateRouteProp>();
  const parentId = route.params.parentId;

  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [nameError, setNameError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [leaveConfirmVisible, setLeaveConfirmVisible] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);

  const hasInput = name.trim().length > 0 || budget.trim().length > 0;

  const handleBack = () => {
    if (hasInput) {
      setLeaveConfirmVisible(true);
    } else {
      navigation.goBack();
    }
  };

  // 안드로이드 하드웨어 back도 같은 이탈 확인을 거치게 한다(ReportCreateByLedgerScreen 패턴).
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (hasInput) {
          setLeaveConfirmVisible(true);
          return true;
        }
        return false;
      });
      return () => subscription.remove();
    }, [hasInput]),
  );

  const handleSubmit = async () => {
    const trimmedName = name.trim();
    if (!trimmedName || isSubmitting) {
      return;
    }
    setNameError(undefined);
    setIsSubmitting(true);
    try {
      const parsedBudget = budget.trim() ? Number(budget.trim()) : null;
      if (parentId) {
        await ledgerService.createLedger(parentId, trimmedName, parsedBudget);
      } else {
        // 최상위(폴더 탭 루트)에서 진입한 경우 — 2026-09-13 신설된
        // POST /groups/{groupId}/ledgers로 만든다(백엔드 노티 03번).
        const group = getActiveGroup();
        if (!group) {
          setNameError(API_ERROR_DEFAULT_MESSAGE);
          setIsSubmitting(false);
          return;
        }
        await ledgerService.createLedgerInGroup(group.id, {
          name: trimmedName,
          budget: parsedBudget,
          folderId: null,
        });
      }
      setSnackbarVisible(true);
      setTimeout(() => {
        navigation.goBack();
      }, SNACKBAR_AUTO_HIDE_MS);
    } catch (error) {
      if (isNetworkError(error)) {
        setNameError(API_NETWORK_ERROR_MESSAGE);
      } else if (error instanceof ApiError) {
        const nameFieldError = error.fieldErrors.find(fe => fe.field === 'name');
        setNameError(nameFieldError?.reason ?? getApiErrorMessage(error.code));
      } else {
        setNameError(API_ERROR_DEFAULT_MESSAGE);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <BackButton onPress={handleBack} />
      </View>

      <Text style={styles.title}>{LEDGER_CREATE_TITLE}</Text>
      <Text style={styles.subtitle}>{LEDGER_CREATE_SUBTITLE}</Text>

      <View style={styles.form}>
        <TextField
          label={LEDGER_NAME_LABEL}
          value={name}
          onChangeText={text => {
            setName(text.slice(0, LEDGER_NAME_MAX_LENGTH));
            setNameError(undefined);
          }}
          placeholder={LEDGER_NAME_PLACEHOLDER}
          helperText={LEDGER_NAME_HELPER}
          error={nameError}
          maxLength={LEDGER_NAME_MAX_LENGTH}
        />
        <TextField
          label={LEDGER_BUDGET_LABEL}
          value={budget}
          onChangeText={text => {
            const digitsOnly = text.replace(/[^0-9]/g, '');
            const clamped =
              digitsOnly && Number(digitsOnly) > LEDGER_BUDGET_MAX
                ? String(LEDGER_BUDGET_MAX)
                : digitsOnly;
            setBudget(clamped);
          }}
          placeholder={LEDGER_BUDGET_PLACEHOLDER}
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.footer}>
        <Button
          label={LEDGER_CREATE_SUBMIT_LABEL}
          disabled={!name.trim() || isSubmitting}
          fullWidth
          onPress={handleSubmit}
        />
      </View>

      {snackbarVisible && (
        <View style={styles.snackbarWrapper}>
          <Snackbar
            visible
            title={`'${name.trim()}'${SNACKBAR_LEDGER_CREATED_SUFFIX}`}
          />
        </View>
      )}

      <Dialog
        visible={leaveConfirmVisible}
        title={LEDGER_LEAVE_CONFIRM_TITLE}
        description={LEDGER_LEAVE_CONFIRM_DESCRIPTION}
        cancelLabel={LEDGER_LEAVE_CANCEL_LABEL}
        confirmLabel={LEDGER_LEAVE_CONFIRM_LABEL}
        onCancel={() => setLeaveConfirmVisible(false)}
        onConfirm={() => {
          setLeaveConfirmVisible(false);
          navigation.goBack();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  headerRow: {
    marginBottom: 8,
  },
  title: {
    ...TYPOGRAPHY.h1,
  },
  subtitle: {
    marginTop: 6,
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  form: {
    marginTop: 32,
  },
  footer: {
    marginTop: 'auto',
    paddingVertical: 16,
  },
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 88,
  },
});

export default LedgerCreateScreen;
