import { useCallback, useEffect, useState } from 'react';
import { BackHandler, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import TextField from '../../components/Input/Text Field/TextField';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import DuesDateRangeSheet from './DuesDateRangeSheet';
import TransactionSingleSelectSheet from '../Transactions/TransactionSingleSelectSheet';
import * as duesService from '../../services/duesService';
import * as ledgerService from '../../services/ledgerService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  DUES_CREATE_AMOUNT_LABEL,
  DUES_CREATE_LEAVE_CANCEL_LABEL,
  DUES_CREATE_LEAVE_CONFIRM_LABEL,
  DUES_CREATE_LEAVE_DESCRIPTION,
  DUES_CREATE_LEDGER_LABEL,
  DUES_CREATE_LEDGER_PLACEHOLDER,
  DUES_CREATE_PERIOD_LABEL,
  DUES_CREATE_PERIOD_PLACEHOLDER,
  DUES_CREATE_TITLE_FIELD_LABEL,
  DUES_CREATE_TITLE_PLACEHOLDER,
  DUES_DETAIL_RETRY_LABEL,
  DUES_EDIT_AMOUNT_LOCKED_HINT,
  DUES_EDIT_LEAVE_TITLE,
  DUES_EDIT_LOADING,
  DUES_EDIT_SUBMIT_LABEL,
  DUES_EDIT_TITLE,
  DUES_TITLE_MAX_LENGTH,
  SNACKBAR_DUES_UPDATED,
} from '../../constants/duesScreenText';
import { DATE_SHEET_CONFIRM_LABEL } from '../../constants/transactionScreenText';
import {
  BORDER_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_PRIMARY,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CALENDAR_ICON = require('../../assets/icons/system/Calendar.png');

const SNACKBAR_AUTO_HIDE_MS = 1600;

type ActiveSheet = 'none' | 'ledger' | 'period';
type LoadState = 'loading' | 'error' | 'ready';
type LedgerOption = { id: string; name: string };

type DuesEditNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DuesEditRouteProp = RouteProp<RootStackParamList, 'DuesEdit'>;

function fromIsoDate(isoDate: string): string {
  return isoDate.replace(/-/g, '.');
}

function toIsoDate(dotDate: string): string {
  return dotDate.replace(/\./g, '-');
}

function DuesEditScreen() {
  const navigation = useNavigation<DuesEditNavigationProp>();
  const route = useRoute<DuesEditRouteProp>();
  const duesId = route.params.duesId;

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');

  const [groupId, setGroupId] = useState('');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(0);
  const [ledgerId, setLedgerId] = useState('');
  const [ledgerName, setLedgerName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [ledgerOptions, setLedgerOptions] = useState<LedgerOption[]>([]);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('none');
  const [leaveDialogVisible, setLeaveDialogVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const [initial, setInitial] = useState({
    title: '',
    ledgerId: '',
    startDate: '',
    dueDate: '',
  });

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const detail = await duesService.getDuesDetail(duesId);
      setGroupId(detail.groupId);
      setTitle(detail.title);
      setAmount(detail.amount);
      setLedgerId(detail.ledger.id);
      setLedgerName(detail.ledger.name);
      setStartDate(fromIsoDate(detail.startDate));
      setDueDate(fromIsoDate(detail.dueDate));
      setInitial({
        title: detail.title,
        ledgerId: detail.ledger.id,
        startDate: detail.startDate,
        dueDate: detail.dueDate,
      });
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [duesId]);

  useEffect(() => {
    load();
  }, [load]);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const hasChanges =
    title.trim() !== initial.title ||
    ledgerId !== initial.ledgerId ||
    toIsoDate(startDate) !== initial.startDate ||
    toIsoDate(dueDate) !== initial.dueDate;

  const handleBack = () => {
    if (hasChanges) {
      setLeaveDialogVisible(true);
    } else {
      navigation.goBack();
    }
  };

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (hasChanges) {
          setLeaveDialogVisible(true);
          return true;
        }
        return false;
      });
      return () => subscription.remove();
    }, [hasChanges]),
  );

  const handlePressLedgerField = () => {
    if (ledgerOptions.length === 0) {
      loadLedgerOptions();
    }
    setActiveSheet('ledger');
  };

  const loadLedgerOptions = async () => {
    try {
      const ledgers = await ledgerService.getAllLedgersInGroup(groupId);
      setLedgerOptions(ledgers.map(l => ({ id: l.id, name: l.name })));
    } catch {
    }
  };

  const handleSelectLedger = (key: string) => {
    const option = ledgerOptions.find(item => item.id === key);
    setLedgerId(key);
    setLedgerName(option?.name ?? '');
  };

  const canSubmit = title.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }
    if (!hasChanges) {
      navigation.goBack();
      return;
    }
    setIsSubmitting(true);
    try {
      const trimmedTitle = title.trim();
      const isoStart = toIsoDate(startDate);
      const isoDue = toIsoDate(dueDate);
      await duesService.updateDues(duesId, {
        ...(trimmedTitle !== initial.title ? { title: trimmedTitle } : {}),
        ...(ledgerId !== initial.ledgerId ? { ledgerId } : {}),
        ...(isoStart !== initial.startDate ? { startDate: isoStart } : {}),
        ...(isoDue !== initial.dueDate ? { dueDate: isoDue } : {}),
      });
      showSnackbar(SNACKBAR_DUES_UPDATED);
      setTimeout(() => navigation.goBack(), SNACKBAR_AUTO_HIDE_MS);
    } catch (error) {
      showSnackbar(toErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadState === 'loading' || loadState === 'error') {
    return (
      <ScreenContainer background="secondary">
        <AppBar type="sub" title={DUES_EDIT_TITLE} onBackPress={() => navigation.goBack()} />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {loadState === 'loading' ? DUES_EDIT_LOADING : loadErrorMessage}
          </Text>
          {loadState === 'error' && (
            <Button
              label={DUES_DETAIL_RETRY_LABEL}
              onPress={load}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          )}
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      background="secondary"
      snackbar={
        snackbarMessage ? <Snackbar visible title={snackbarMessage} /> : undefined
      }
    >
      <AppBar type="sub" title={DUES_EDIT_TITLE} onBackPress={handleBack} />

      <ScrollView contentContainerStyle={styles.body}>
        <TextField
          label={DUES_CREATE_TITLE_FIELD_LABEL}
          required
          value={title}
          onChangeText={text => setTitle(text.slice(0, DUES_TITLE_MAX_LENGTH))}
          placeholder={DUES_CREATE_TITLE_PLACEHOLDER}
          maxLength={DUES_TITLE_MAX_LENGTH}
        />
        <TextField
          label={DUES_CREATE_AMOUNT_LABEL}
          required
          value={amount.toLocaleString()}
          onChangeText={() => {}}
          placeholder=""
          suffix="원"
          disabled
          helperText={DUES_EDIT_AMOUNT_LOCKED_HINT}
        />
        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{DUES_CREATE_LEDGER_LABEL}</Text>
          <Pressable style={styles.ledgerBox} onPress={handlePressLedgerField}>
            <Text style={ledgerName ? styles.ledgerValue : styles.ledgerPlaceholder}>
              {ledgerName || DUES_CREATE_LEDGER_PLACEHOLDER}
            </Text>
          </Pressable>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{DUES_CREATE_PERIOD_LABEL}</Text>
          <Pressable style={styles.periodBox} onPress={() => setActiveSheet('period')}>
            <Text style={startDate && dueDate ? styles.periodValue : styles.periodPlaceholder}>
              {startDate && dueDate ? `${startDate} ~ ${dueDate}` : DUES_CREATE_PERIOD_PLACEHOLDER}
            </Text>
            <Image source={CALENDAR_ICON} style={styles.periodIcon} />
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={DUES_EDIT_SUBMIT_LABEL}
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          fullWidth
        />
      </View>

      <TransactionSingleSelectSheet
        visible={activeSheet === 'ledger'}
        title={DUES_CREATE_LEDGER_LABEL}
        options={ledgerOptions.map(option => ({ key: option.id, label: option.name }))}
        selectedKey={ledgerId || undefined}
        onClose={() => setActiveSheet('none')}
        onSelect={handleSelectLedger}
      />
      <DuesDateRangeSheet
        visible={activeSheet === 'period'}
        confirmLabel={DATE_SHEET_CONFIRM_LABEL}
        startDate={startDate || undefined}
        endDate={dueDate || undefined}
        onClose={() => setActiveSheet('none')}
        onSave={(nextStart, nextEnd) => {
          setStartDate(nextStart);
          setDueDate(nextEnd);
        }}
      />

      <Dialog
        visible={leaveDialogVisible}
        title={DUES_EDIT_LEAVE_TITLE}
        description={DUES_CREATE_LEAVE_DESCRIPTION}
        cancelLabel={DUES_CREATE_LEAVE_CANCEL_LABEL}
        confirmLabel={DUES_CREATE_LEAVE_CONFIRM_LABEL}
        onCancel={() => setLeaveDialogVisible(false)}
        onConfirm={() => {
          setLeaveDialogVisible(false);
          navigation.goBack();
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    ...TYPOGRAPHY.subtitle3,
  },
  ledgerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
    borderRadius: 8,
    paddingVertical: 12,
  },
  ledgerPlaceholder: {
    ...TYPOGRAPHY.body1,
    color: FOREGROUND_DISABLED,
  },
  ledgerValue: {
    ...TYPOGRAPHY.body1,
    color: FOREGROUND_PRIMARY,
  },
  periodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  periodPlaceholder: {
    ...TYPOGRAPHY.body1,
    color: FOREGROUND_DISABLED,
  },
  periodValue: {
    ...TYPOGRAPHY.body1,
    color: FOREGROUND_PRIMARY,
  },
  periodIcon: {
    width: 20,
    height: 20,
    tintColor: FOREGROUND_DISABLED,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
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
});

export default DuesEditScreen;
