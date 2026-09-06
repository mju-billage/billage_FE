/** @screen DUE-3-PAGE-06-0 회비 수정 */
/** @screen DUE-4-MODAL-02-0 회비 수정_이탈 안내 (이 화면과 DuesMemberEditScreen이 공유) */
/**
 * 7-B-1(회비 수정·삭제·마감): 제목/장부/기간만 다룬다 — 금액은 서버가 절대
 * 수정 불가로 막는 필드라(Dues.txt §4 "amount는 수정할 수 없습니다",
 * `DUES_AMOUNT_IMMUTABLE 400`) 화면명세 그대로 값만 보여주고
 * `TextField disabled`로 입력을 막는다. 모임원(대상자) 변경은 명세상 이
 * 화면의 필드가 아니라 ⋮ 메뉴에서 바로 진입하는 별도 화면
 * (`DuesMemberEditScreen`, DUE-3-PAGE-02-0)이다 — `DuesCreateScreen`처럼
 * 한 컴포넌트의 내부 step으로 묶지 않았다(생성과 달리 수정은 두 화면이
 * 서로 독립적으로 각자 PATCH를 보내고 각자 회비 상세로 돌아간다).
 *
 * `UpdateDuesInput`에 startDate를 포함한 이유는 duesService.ts 주석 참고 —
 * PATCH 예시 바디엔 없지만 "금액 제외 전 필드 수정 가능" 정책 메모가 명시적.
 *
 * 화면명세서 표는 앱바 우측에 "X(닫기)"가 있다고 적었으나, 실제 목업
 * 이미지엔 좌측 "<"(백 버튼) 하나뿐이고 우측엔 아무 아이콘도 없다 — 다른
 * 표 셀을 복사해 오며 안 고친 것으로 보여 목업을 따랐다. 이탈 확인(입력값
 * 변경 시 "수정한 내용은 저장되지 않아요" 모달)은 그 "<" 버튼 자체에 붙인다.
 *
 * CLOSED 상태 회비는애초에 DuesDetailScreen의 ⋮ 메뉴에 "회비 수정" 항목을
 * 안 보여줘 이 화면에 진입할 방법이 없다 — 그래도 서버가 `DUES_ALREADY_CLOSED
 * (409)`로 다시 한번 막아준다(레이스 대비 최종 방어선).
 */
import { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import TextField from '../../components/Input/Text Field/TextField';
import SelectionListItem from '../../components/Data Display/Lists/SelectionListItem';
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
import { FOREGROUND_DISABLED } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SNACKBAR_AUTO_HIDE_MS = 1600;

type ActiveSheet = 'none' | 'ledger' | 'period';
type LoadState = 'loading' | 'error' | 'ready';
type LedgerOption = { id: string; name: string };

type DuesEditNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DuesEditRouteProp = RouteProp<RootStackParamList, 'DuesEdit'>;

/** 'YYYY-MM-DD'(서버) → 'YYYY.MM.DD'(이 화면/DuesDateRangeSheet 형식). */
function fromIsoDate(isoDate: string): string {
  return isoDate.replace(/-/g, '.');
}

/** 'YYYY.MM.DD' → 'YYYY-MM-DD'(Dues API 형식). */
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
      // 장부 목록 실패는 조용히 무시한다 — 시트를 열면 빈 목록 안내가 뜨고, 다시 열면 재시도된다.
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
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar type="sub" title={DUES_EDIT_TITLE} onBackPress={handleBack} />

      <ScrollView contentContainerStyle={styles.body}>
        <TextField
          label={DUES_CREATE_TITLE_FIELD_LABEL}
          value={title}
          onChangeText={text => setTitle(text.slice(0, DUES_TITLE_MAX_LENGTH))}
          placeholder={DUES_CREATE_TITLE_PLACEHOLDER}
          maxLength={DUES_TITLE_MAX_LENGTH}
        />
        <TextField
          label={DUES_CREATE_AMOUNT_LABEL}
          value={amount.toLocaleString()}
          onChangeText={() => {}}
          placeholder=""
          suffix="원"
          disabled
          helperText={DUES_EDIT_AMOUNT_LOCKED_HINT}
        />
        <SelectionListItem
          type="picker"
          title={DUES_CREATE_LEDGER_LABEL}
          required
          value={ledgerName || DUES_CREATE_LEDGER_PLACEHOLDER}
          onPress={handlePressLedgerField}
        />
        <SelectionListItem
          type="picker"
          title={DUES_CREATE_PERIOD_LABEL}
          required
          value={
            startDate && dueDate
              ? `${startDate} - ${dueDate}`
              : DUES_CREATE_PERIOD_PLACEHOLDER
          }
          onPress={() => setActiveSheet('period')}
        />
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
        title={DUES_CREATE_PERIOD_LABEL}
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

      {snackbarMessage && (
        <View style={styles.snackbarWrapper}>
          <Snackbar visible title={snackbarMessage} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    gap: 4,
  },
  footer: {
    paddingHorizontal: 24,
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
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
});

export default DuesEditScreen;
