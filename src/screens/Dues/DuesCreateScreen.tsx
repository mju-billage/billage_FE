/** @screen DUE-2-PAGE-01-0 새 회비 생성 (step='basic') */
/** @screen DUE-3-PAGE-01-0 새 회비 생성_모임원 선택 (step='members') */
/**
 * 6-B(회비 생성, 총무 전용): 두 Screen ID를 한 컴포넌트의 내부 단계(step)로
 * 구현했다 — 2단계(모임원 선택)에서 "<"로 1단계로 돌아갈 때 입력값이 그대로
 * 남아 있어야 하는데, 두 화면을 진짜로 분리하면 라우트 파라미터로 기본 정보를
 * 왕복시켜야 해서 더 복잡해진다. `TransactionRegisterScreen`의 내부 stage 패턴과
 * 같은 방식이다.
 *
 * 0. 기간 입력 복원(2026-09-04, 7-A 이후 정합성 복구): 6-B 당시엔 "서버에
 * 시작일 필드가 없다"고 판단해 화면명세서(DUE-2-PAGE-01-0 No.5 "기간 선택")가
 * 요구하는 시작~마감 범위를 마감일 단일 입력으로 줄였는데, 그 판단의 근거가
 * 틀렸다 — 개발 서버 실호출로 `startDate`가 실제로 필수 필드임을 확정했다
 * (`docs/api-gaps.md` "확정됨" 절: 없으면 400, `fieldErrors:[{field:"startDate"}]`).
 * 명세대로 기간 범위 입력을 되돌렸다.
 *
 * 기존 시트 재사용:
 *  - "장부 선택"(ADD-2-SHEET-03-0)은 `TransactionSingleSelectSheet`를 그대로
 *    가져다 썼다 — 이미 title/options/selectedKey/onSelect만 받는 완전히
 *    일반화된 컴포넌트라 손댈 필요가 없었다(내역 등록 화면 회귀 없음).
 *  - "기간 선택"(DTB-3-SHEET-01-0)은 `TransactionFilterSheet` 내부에 커스텀
 *    기간 캘린더가 있지만, 그 시트는 장부·구분·정렬까지 같이 묶인 내역 필터
 *    전용 컴포넌트라 그대로 가져다 쓸 수 없었다(억지로 재사용하면 내역 필터
 *    동작에 회귀 위험) — 대신 같은 상호작용을 새 컴포넌트
 *    `DuesDateRangeSheet`로 옮겨 적었다. 진짜 재사용 가능한 조각(`Calendar`
 *    컴포넌트 자체)은 그대로 썼다 — `TransactionFilterSheet`는 손대지 않았다.
 *  - 제목/금액은 화면명세서가 시트가 아니라 페이지에 바로 있는 텍스트 필드로
 *    정의해서(No.2/3), `TransactionRegisterScreen`류의 시트 패턴이 아니라
 *    `GroupCreateScreen`/`LedgerCreateScreen`류의 페이지 내 `TextField` 패턴을
 *    따랐다 — 시안과 기존 시트 스타일(테두리 버튼)이 다르지만 이번엔 맞추지
 *    않고 기존 폼 로우 스타일(`SelectionListItem`)로 통일했다(장부/기간).
 */
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
import { SafeAreaView } from 'react-native-safe-area-context';
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
  BACKGROUND_SECONDARY,
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

/** 'YYYY.MM.DD' → 'YYYY-MM-DD'(Dues API 형식). */
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

  // 안드로이드 하드웨어 back(ReportCreateByLedgerScreen 패턴). `members` 단계에선
  // 화면 상단 back 버튼과 같이 `basic` 단계로 되돌아간다(입력값 유지, 이탈 아님).
  // `basic` 단계에선 `handleClose`와 동일하게 입력값이 있을 때만 이탈 확인을 띄운다.
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

  /**
   * 자릿수(최대 9자, `DUES_AMOUNT_MAX`=999,999,999가 9자리 최댓값이라 자릿수
   * 제한만으로 상한이 그대로 지켜진다) 기준으로 막는다 — 콤마가 섞인 표시
   * 문자열엔 maxLength를 못 쓴다(자릿수와 문자 길이가 안 맞음).
   *
   * 10번째 숫자를 누르거나(자릿수 초과) 실제 값이 그대로인 입력(예: 빈
   * 칸에서 "0")이 들어오면 setState를 아예 안 한다(클램프해서 되돌리는 게
   * 아니라 그 입력 자체를 무시). 근데 React는 controlled TextInput의 `value`
   * prop이 이전 렌더와 값이 같으면(Object.is 동일) 그 prop을 네이티브로
   * 다시 안 내려보낸다 — 리렌더 자체가 스킵되는 게 아니라(컴포넌트 함수는
   * 다시 돌아도), 리컨실러가 "값 안 바뀐 prop"을 커밋 단계에서 걸러내는
   * 것이라 네이티브 EditText는 이미 그려버린 초과/무효 글자를 그대로 들고
   * 있는다. 그래서 이 두 경우엔 `setNativeProps`로 TextInput 인스턴스를
   * 직접 건드려 강제로 되돌린다 — React 밖에서 명령형으로 native text를
   * 다시 쓰는 것이라 prop diffing을 안 거치고 무조건 반영된다.
   */
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
      // 장부 목록 실패는 조용히 무시한다 — 시트를 열면 빈 목록 안내가 뜨고, 다시 열면 재시도된다.
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
      // DUE-4-SNACKBAR-01-0: 생성 화면이 아니라 납부관리 메인 목록에서
      // 스낵바를 보여준다(시안 확인) — DuesDetailScreen 삭제/마감과 같은 패턴.
      // navigate가 아니라 reset — 생성 폼(및 그 위에 쌓였을 수 있는 화면)을
      // 스택에서 걷어내 뒤로가기로 폼에 못 돌아가게 한다(design-verification.md §5-11).
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
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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

        {snackbarMessage && (
          <View style={styles.snackbarWrapper}>
            <Snackbar visible title={snackbarMessage} />
          </View>
        )}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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

      {snackbarMessage && (
        <View style={styles.snackbarWrapper}>
          <Snackbar visible title={snackbarMessage} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // DUE-2-PAGE-01-0/DUE-3-PAGE-01-0(새 회비 생성 및 모임원 선택) 둘 다 시안이
  // 흰 배경 — design-verification.md §5-7 규칙, §2 표 갱신.
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_SECONDARY,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
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
    paddingHorizontal: 24,
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
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
});

export default DuesCreateScreen;
