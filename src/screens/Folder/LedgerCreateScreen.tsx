import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/BackButton';
import PrimaryButton from '../../components/Button/PrimaryButton';
import TextField from '../../components/Field/TextField';
import Dialog from '../../components/Feedback/Dialog';
import Snackbar from '../../components/Feedback/Snackbar';
import { addLedgerNode } from '../../types/folder';
import {
  LEDGER_BUDGET_LABEL,
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

  const handleSubmit = () => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    const parsedBudget = budget.trim() ? Number(budget.trim()) : null;
    addLedgerNode(parentId, trimmedName, parsedBudget);
    setSnackbarVisible(true);
    setTimeout(() => {
      navigation.goBack();
    }, SNACKBAR_AUTO_HIDE_MS);
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
          onChangeText={text => setName(text.slice(0, LEDGER_NAME_MAX_LENGTH))}
          placeholder={LEDGER_NAME_PLACEHOLDER}
          helperText={LEDGER_NAME_HELPER}
          maxLength={LEDGER_NAME_MAX_LENGTH}
        />
        <TextField
          label={LEDGER_BUDGET_LABEL}
          value={budget}
          onChangeText={text => setBudget(text.replace(/[^0-9]/g, ''))}
          placeholder={LEDGER_BUDGET_PLACEHOLDER}
          keyboardType="number-pad"
        />
      </View>

      <View style={styles.footer}>
        <PrimaryButton
          label={LEDGER_CREATE_SUBMIT_LABEL}
          disabled={!name.trim()}
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
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
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
