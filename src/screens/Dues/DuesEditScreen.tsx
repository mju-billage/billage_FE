/** @screen DUE-3-PAGE-06-0 회비 수정 */
/** @screen DUE-4-MODAL-02-0 회비 수정_이탈 안내 (이 화면과 DuesMemberEditScreen이 공유) */
/** @screen DUE-4-SNACKBAR-04-0 회비 수정 완료 (화면 자체에서 표시 후 1.6초 뒤 상세로 복귀) */
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
 * **2026-09-17 정정**: "CLOSED 상태는 진입 방법이 없다"고 적었던 건 틀렸다 —
 * DUE-2-PAGE-03-0 시안 Case A(마감된 회비)를 다시 대조하니 "회비 수정" 메뉴가
 * CLOSED에서도 그대로 노출된다(숨는 건 "모임원 선택"/"회비 마감"뿐). 그래서
 * CLOSED 상태로도 이 화면에 정상 진입할 수 있고, 제목/장부/기간은 이 화면이
 * 상태를 안 보고 항상 편집 가능하게 둔다(시안에 CLOSED 전용 잠금 규정이
 * 없음 — design-verification.md §5-13). 금액만 항상 비활성(서버 강제).
 * 제출 시엔 서버가 `DUES_ALREADY_CLOSED(409)`로 막는다 — 즉 CLOSED 회비는
 * "값은 고칠 수 있어 보이지만 저장은 항상 실패"하는 상태다(현재 동작 그대로 둠).
 */
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

  // 안드로이드 하드웨어 back도 같은 이탈 확인을 거치게 한다(ReportCreateByLedgerScreen 패턴).
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
