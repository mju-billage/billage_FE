/** @screen DUE-2-PAGE-01-0 새 회비 생성 (step='basic') */
/** @screen DUE-3-PAGE-01-0 새 회비 생성_모임원 선택 (step='members') */
/**
 * 6-B(회비 생성, 총무 전용): 두 Screen ID를 한 컴포넌트의 내부 단계(step)로
 * 구현했다 — 2단계(모임원 선택)에서 "<"로 1단계로 돌아갈 때 입력값이 그대로
 * 남아 있어야 하는데, 두 화면을 진짜로 분리하면 라우트 파라미터로 기본 정보를
 * 왕복시켜야 해서 더 복잡해진다. `TransactionRegisterScreen`의 내부 stage 패턴과
 * 같은 방식이다.
 *
 * 0. 시작일 판단: 화면명세서(DUE-2-PAGE-01-0 No.5 "기간 선택")는 "회비 납부
 * 시작일과 마감일"을 요구하고 CTA 활성 조건에도 "기간"이 필수 4항목 중
 * 하나로 들어 있다 — 하지만 `POST /groups/{groupId}/dues`엔 `dueDate`(마감일)
 * 하나뿐, 시작일을 받을 필드가 없다(Dues.txt). ADD 화면 "담당자" 필드처럼
 * 입력받고 조용히 버리면 안 되므로, 아예 "마감일" 단일 입력으로 줄였다 —
 * docs/api-gaps.md (A) "회비 시작일 필드 부재", design-verification.md §5-4 참고.
 *
 * 기존 시트 재사용:
 *  - "장부 선택"(ADD-2-SHEET-03-0)은 `TransactionSingleSelectSheet`를 그대로
 *    가져다 썼다 — 이미 title/options/selectedKey/onSelect만 받는 완전히
 *    일반화된 컴포넌트라 손댈 필요가 없었다(내역 등록 화면 회귀 없음).
 *  - "기간 선택"(DTB-3-SHEET-01-0, `TransactionFilterSheet` 내부 커스텀 기간
 *    캘린더)은 **재사용하지 않았다** — 위 0번 판단으로 애초에 "기간"이 아니라
 *    단일 "마감일"만 받으면 되므로, 이미 완전히 일반화돼 있는 단일 날짜 시트
 *    `TransactionDateSheet`(ADD-2-SHEET-07-0, 내역 등록의 일자 선택과 동일
 *    컴포넌트)를 그대로 썼다 — 이쪽도 손댈 필요가 없었다.
 *  - 제목/금액은 화면명세서가 시트가 아니라 페이지에 바로 있는 텍스트 필드로
 *    정의해서(No.2/3), `TransactionRegisterScreen`류의 시트 패턴이 아니라
 *    `GroupCreateScreen`/`LedgerCreateScreen`류의 페이지 내 `TextField` 패턴을
 *    따랐다 — 시안과 기존 시트 스타일(테두리 버튼)이 다르지만 이번엔 맞추지
 *    않고 기존 폼 로우 스타일(`SelectionListItem`)로 통일했다(장부/마감일).
 */
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import TextField from '../../components/Input/Text Field/TextField';
import SelectionListItem from '../../components/Data Display/Lists/SelectionListItem';
import SearchField from '../../components/Input/Search/SearchField';
import MemberListItem from '../../components/Data Display/Lists/MemberListItem';
import CheckBox from '../../components/Input/Control/CheckBox';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import TransactionDateSheet from '../Transactions/TransactionDateSheet';
import TransactionSingleSelectSheet from '../Transactions/TransactionSingleSelectSheet';
import { getActiveGroup } from '../../types/group';
import type { Member } from '../../types/member';
import * as duesService from '../../services/duesService';
import * as ledgerService from '../../services/ledgerService';
import * as memberService from '../../services/memberService';
import { ApiError } from '../../services/apiClient';
import { todayKey } from '../../types/transaction';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  DUES_AMOUNT_MAX,
  DUES_CREATE_AMOUNT_LABEL,
  DUES_CREATE_AMOUNT_PLACEHOLDER,
  DUES_CREATE_DUE_DATE_LABEL,
  DUES_CREATE_DUE_DATE_PLACEHOLDER,
  DUES_CREATE_LEAVE_CANCEL_LABEL,
  DUES_CREATE_LEAVE_CONFIRM_LABEL,
  DUES_CREATE_LEAVE_DESCRIPTION,
  DUES_CREATE_LEAVE_TITLE,
  DUES_CREATE_LEDGER_LABEL,
  DUES_CREATE_LEDGER_PLACEHOLDER,
  DUES_CREATE_NEXT_LABEL,
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
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CLOSE_ICON = require('../../assets/icons/action/Close.png');

const SNACKBAR_AUTO_HIDE_MS = 1600;

type Step = 'basic' | 'members';
type ActiveSheet = 'none' | 'ledger' | 'dueDate';
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
  const [dueDate, setDueDate] = useState('');
  const [ledgerOptions, setLedgerOptions] = useState<{ id: string; name: string }[]>([]);
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>('none');
  const [leaveDialogVisible, setLeaveDialogVisible] = useState(false);

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
    dueDate.length > 0 ||
    selectedMemberIds.length > 0;

  const handleClose = () => {
    if (hasInput) {
      setLeaveDialogVisible(true);
    } else {
      navigation.goBack();
    }
  };

  const handleAmountChange = (text: string) => {
    const digitsOnly = text.replace(/[^0-9]/g, '');
    if (!digitsOnly) {
      setAmount(0);
      return;
    }
    setAmount(Math.min(Number(digitsOnly), DUES_AMOUNT_MAX));
  };

  const handleSelectLedger = (key: string) => {
    const option = ledgerOptions.find(item => item.id === key);
    setLedgerId(key);
    setLedgerName(option?.name ?? '');
  };

  const canProceed =
    title.trim().length > 0 && amount > 0 && ledgerId.length > 0 && dueDate.length > 0;

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
        dueDate: toIsoDate(dueDate),
        targetMemberIds: selectedMemberIds.map(Number),
        ledgerId,
      });
      showSnackbar(
        `${SNACKBAR_DUES_CREATED_PREFIX}${created.title}${SNACKBAR_DUES_CREATED_SUFFIX}`,
      );
      setTimeout(() => navigation.goBack(), SNACKBAR_AUTO_HIDE_MS);
    } catch (error) {
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
          value={title}
          onChangeText={text => setTitle(text.slice(0, DUES_TITLE_MAX_LENGTH))}
          placeholder={DUES_CREATE_TITLE_PLACEHOLDER}
          maxLength={DUES_TITLE_MAX_LENGTH}
        />
        <TextField
          label={DUES_CREATE_AMOUNT_LABEL}
          value={amount > 0 ? `${amount.toLocaleString()}원` : ''}
          onChangeText={handleAmountChange}
          placeholder={DUES_CREATE_AMOUNT_PLACEHOLDER}
          keyboardType="number-pad"
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
          title={DUES_CREATE_DUE_DATE_LABEL}
          required
          value={dueDate || DUES_CREATE_DUE_DATE_PLACEHOLDER}
          onPress={() => setActiveSheet('dueDate')}
        />
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
      <TransactionDateSheet
        visible={activeSheet === 'dueDate'}
        title={DUES_CREATE_DUE_DATE_LABEL}
        value={dueDate || todayKey()}
        onClose={() => setActiveSheet('none')}
        onSave={setDueDate}
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
