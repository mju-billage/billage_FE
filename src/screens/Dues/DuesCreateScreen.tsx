import { useCallback, useRef, useState } from 'react';
import {
  BackHandler,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import TextField from '../../components/Input/Text Field/TextField';
import SearchField from '../../components/Input/Search/SearchField';
import MemberListItem from '../../components/Data Display/Lists/MemberListItem';
import CheckBox from '../../components/Input/Control/CheckBox';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import DuesDateRangeSheet from './DuesDateRangeSheet';
import TransactionSingleSelectSheet from '../Transactions/TransactionSingleSelectSheet';
import { getActiveGroup } from '../../types/group';
import type { Member } from '../../types/member';
import * as duesService from '../../services/duesService';
import * as ledgerService from '../../services/ledgerService';
import * as memberService from '../../services/memberService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  DUES_CREATE_AMOUNT_LABEL,
  DUES_CREATE_AMOUNT_PLACEHOLDER,
  DUES_CREATE_LEAVE_CANCEL_LABEL,
  DUES_CREATE_LEAVE_CONFIRM_LABEL,
  DUES_CREATE_LEAVE_DESCRIPTION,
  DUES_CREATE_LEAVE_TITLE,
  DUES_CREATE_LEDGER_LABEL,
  DUES_CREATE_LEDGER_PLACEHOLDER,
  DUES_CREATE_NEXT_LABEL,
  DUES_CREATE_PERIOD_LABEL,
  DUES_CREATE_PERIOD_PLACEHOLDER,
  DUES_CREATE_TITLE,
  DUES_CREATE_TITLE_FIELD_LABEL,
  DUES_CREATE_TITLE_PLACEHOLDER,
  DUES_MEMBER_SELECT_ALL_LABEL,
  DUES_MEMBER_SELECT_COUNT_SUFFIX,
  DUES_MEMBER_SELECT_EMPTY,
  DUES_MEMBER_SELECT_LOADING,
  DUES_MEMBER_SELECT_RETRY_LABEL,
  DUES_MEMBER_SELECT_SEARCH_PLACEHOLDER,
  DUES_MEMBER_SELECT_SUBMIT_LABEL,
  DUES_MEMBER_SELECT_TITLE,
  DUES_TITLE_MAX_LENGTH,
  SNACKBAR_DUES_CREATED_PREFIX,
  SNACKBAR_DUES_CREATED_SUFFIX,
} from '../../constants/duesScreenText';
import { DATE_SHEET_CONFIRM_LABEL } from '../../constants/transactionScreenText';
import {
  BORDER_NEUTRAL_NORMAL,
  FEEDBACK_NEGATIVE_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CLOSE_ICON = require('../../assets/icons/action/Close.png');
const CALENDAR_ICON = require('../../assets/icons/system/Calendar.png');

const SNACKBAR_AUTO_HIDE_MS = 1600;

type Step = 'basic' | 'members';
type ActiveSheet = 'none' | 'ledger' | 'period';
type MemberLoadState = 'loading' | 'error' | 'ready';

type DuesCreateNavigationProp = NativeStackNavigationProp<RootStackParamList>;

function toIsoDate(dotDate: string): string {
  return dotDate.replace(/\./g, '-');
}

function DuesCreateScreen() {
  const navigation = useNavigation<DuesCreateNavigationProp>();

  const [step, setStep] = useState<Step>('basic');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState(0);
  const [ledgerId, setLedgerId] = useState('');
  const [ledgerName, setLedgerName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [ledgerOptions, setLedgerOptions] = useState<{ id: string; name: string }[]>([]);
  const amountInputRef = useRef<TextInput>(null);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('none');
  const [leaveDialogVisible, setLeaveDialogVisible] = useState(false);
  const [periodError, setPeriodError] = useState<string | undefined>();

  const [members, setMembers] = useState<Member[]>([]);
  const [memberLoadState, setMemberLoadState] = useState<MemberLoadState>('loading');
  const [memberLoadError, setMemberLoadError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const hasInput =
    title.trim().length > 0 ||
    amount > 0 ||
    ledgerId.length > 0 ||
    startDate.length > 0 ||
    dueDate.length > 0 ||
    selectedMemberIds.length > 0;

  const handleClose = () => {
    if (hasInput) {
      setLeaveDialogVisible(true);
    } else {
      navigation.goBack();
    }
  };

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (step === 'members') {
          setStep('basic');
          return true;
        }
        if (hasInput) {
          setLeaveDialogVisible(true);
          return true;
        }
        return false;
      });
      return () => subscription.remove();
    }, [step, hasInput]),
  );

  const handleAmountChange = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, '');
    const revertNative = () => {
      amountInputRef.current?.setNativeProps({
        text: amount > 0 ? amount.toLocaleString() : '',
      });
    };
    if (digitsOnly.length > 9) {
      revertNative();
      return;
    }
    const next = digitsOnly ? Number(digitsOnly) : 0;
    if (next === amount) {
      revertNative();
      return;
    }
    setAmount(next);
  };

  const handleSelectLedger = (key: string) => {
    const option = ledgerOptions.find(item => item.id === key);
    setLedgerId(key);
    setLedgerName(option?.name ?? '');
  };

  const canProceed =
    title.trim().length > 0 &&
    amount > 0 &&
    ledgerId.length > 0 &&
    startDate.length > 0 &&
    dueDate.length > 0;

  const loadLedgerOptions = useCallback(async () => {
    const group = getActiveGroup();
    if (!group) {
      return;
    }
    try {
      const ledgers = await ledgerService.getAllLedgersInGroup(group.id);
      setLedgerOptions(ledgers.map(l => ({ id: l.id, name: l.name })));
    } catch {
    }
  }, []);

  const loadMembers = useCallback(async () => {
    const group = getActiveGroup();
    if (!group) {
      return;
    }
    setMemberLoadState('loading');
    try {
      const result = await memberService.getMembers(group.id);
      setMembers([...result].sort((a, b) => a.name.localeCompare(b.name, 'ko')));
      setMemberLoadState('ready');
    } catch (error) {
      setMemberLoadError(toErrorMessage(error));
      setMemberLoadState('error');
    }
  }, []);

  const handlePressLedgerField = () => {
    if (ledgerOptions.length === 0) {
      loadLedgerOptions();
    }
    setActiveSheet('ledger');
  };

  const handleProceedToMembers = () => {
    if (!canProceed) {
      return;
    }
    setStep('members');
    if (memberLoadState === 'loading' && members.length === 0) {
      loadMembers();
    }
  };

  const filteredMembers = searchQuery.trim()
    ? members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : members;

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds(current =>
      current.includes(memberId)
        ? current.filter(id => id !== memberId)
        : [...current, memberId],
    );
  };

  const allSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every(member => selectedMemberIds.includes(member.memberId));

  const toggleSelectAll = () => {
    if (allSelected) {
      const filteredIds = new Set(filteredMembers.map(m => m.memberId));
      setSelectedMemberIds(current => current.filter(id => !filteredIds.has(id)));
    } else {
      setSelectedMemberIds(current => [
        ...current,
        ...filteredMembers.filter(m => !current.includes(m.memberId)).map(m => m.memberId),
      ]);
    }
  };

  const handleSubmit = async () => {
    const group = getActiveGroup();
    if (!group || selectedMemberIds.length === 0 || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      const created = await duesService.createDues(group.id, {
        title: title.trim(),
        amount,
        startDate: toIsoDate(startDate),
        dueDate: toIsoDate(dueDate),
        targetMemberIds: selectedMemberIds.map(Number),
        ledgerId,
      });
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            params: {
              screen: 'Dues',
              params: {
                snackbarMessage: `${SNACKBAR_DUES_CREATED_PREFIX}${created.title}${SNACKBAR_DUES_CREATED_SUFFIX}`,
              },
            },
          },
        ],
      });
    } catch (error) {
      if (error instanceof ApiError) {
        const periodFieldError = error.fieldErrors.find(
          fe => fe.field === 'startDate' || fe.field === 'dueDate',
        );
        if (periodFieldError) {
          setPeriodError(periodFieldError.reason);
          setStep('basic');
          return;
        }
      }
      showSnackbar(toErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === 'members') {
    return (
      <ScreenContainer
        background="secondary"
        snackbar={
          snackbarMessage ? (
            <Snackbar visible title={snackbarMessage} />
          ) : undefined
        }
        snackbarOffset={68}
      >
        <AppBar
          type="sub"
          title={DUES_MEMBER_SELECT_TITLE}
          onBackPress={() => setStep('basic')}
          rightIcons={[{ icon: CLOSE_ICON, onPress: handleClose, accessibilityLabel: 'close' }]}
        />

        <View style={styles.body}>
          <SearchField
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={DUES_MEMBER_SELECT_SEARCH_PLACEHOLDER}
            variant="outline"
          />

          {memberLoadState === 'loading' && (
            <View style={styles.stateContainer}>
              <Text style={styles.stateText}>{DUES_MEMBER_SELECT_LOADING}</Text>
            </View>
          )}

          {memberLoadState === 'error' && (
            <View style={styles.stateContainer}>
              <Text style={styles.stateText}>{memberLoadError}</Text>
              <Button
                label={DUES_MEMBER_SELECT_RETRY_LABEL}
                onPress={loadMembers}
                hierarchy="secondary"
                style={{ alignSelf: 'center' }}
              />
            </View>
          )}

          {memberLoadState === 'ready' && (
            <>
              {members.length === 0 ? (
                <View style={styles.stateContainer}>
                  <Text style={styles.emptyText}>{DUES_MEMBER_SELECT_EMPTY}</Text>
                </View>
              ) : (
                <ScrollView contentContainerStyle={styles.memberListContent}>
                  <View style={styles.selectAllRow}>
                    <CheckBox checked={allSelected} onToggle={toggleSelectAll} />
                    <Text style={styles.selectAllLabel}>{DUES_MEMBER_SELECT_ALL_LABEL}</Text>
                    <Text style={styles.selectAllCount}>
                      {selectedMemberIds.length}{DUES_MEMBER_SELECT_COUNT_SUFFIX}
                    </Text>
                  </View>
                  {filteredMembers.map(member => (
                    <MemberListItem
                      key={member.memberId}
                      name={member.name}
                      showAmount={false}
                      selected={selectedMemberIds.includes(member.memberId)}
                      onPress={() => toggleMember(member.memberId)}
                    />
                  ))}
                </ScrollView>
              )}

              <View style={styles.footer}>
                <Button
                  label={DUES_MEMBER_SELECT_SUBMIT_LABEL}
                  onPress={handleSubmit}
                  disabled={selectedMemberIds.length === 0 || isSubmitting}
                  fullWidth
                />
              </View>
            </>
          )}
        </View>

        <Dialog
          visible={leaveDialogVisible}
          title={DUES_CREATE_LEAVE_TITLE}
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

  return (
    <ScreenContainer
      background="secondary"
      snackbar={
        snackbarMessage ? (
          <Snackbar visible title={snackbarMessage} />
        ) : undefined
      }
      snackbarOffset={68}
    >
      <AppBar
        type="titleOnly"
        title={DUES_CREATE_TITLE}
        rightIcons={[{ icon: CLOSE_ICON, onPress: handleClose, accessibilityLabel: 'close' }]}
      />

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
          ref={amountInputRef}
          label={DUES_CREATE_AMOUNT_LABEL}
          required
          value={amount > 0 ? amount.toLocaleString() : ''}
          onChangeText={handleAmountChange}
          placeholder={DUES_CREATE_AMOUNT_PLACEHOLDER}
          keyboardType="number-pad"
          suffix="원"
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
          {periodError && <Text style={styles.periodError}>{periodError}</Text>}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={DUES_CREATE_NEXT_LABEL}
          onPress={handleProceedToMembers}
          disabled={!canProceed}
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
          setPeriodError(undefined);
        }}
      />

      <Dialog
        visible={leaveDialogVisible}
        title={DUES_CREATE_LEAVE_TITLE}
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
  periodError: {
    ...TYPOGRAPHY.body3,
    color: FEEDBACK_NEGATIVE_BOLD,
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
    paddingTop: 40,
  },
  stateText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
  },
  emptyText: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  memberListContent: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  selectAllLabel: {
    ...TYPOGRAPHY.body2,
    flex: 1,
  },
  selectAllCount: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default DuesCreateScreen;
