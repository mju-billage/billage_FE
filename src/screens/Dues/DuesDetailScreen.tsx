/** @screen DUE-2-PAGE-03-0 회비 상세 */
/** @screen DUE-2-PAGE-03-1 회비 상세_마감된 회비 / 회비 상세_예정된 회비 (state로 분기) */
/** @screen DUE-3-MODAL-01-0 회비 삭제 (확인 Dialog) */
/** @screen DUE-3-MODAL-02-0 회비 마감 (확인 Dialog, OPEN 상태에서만 노출) */
/** @screen DUE-3-SNACKBAR-01-0 입금 확인 ("납부 완료하기" 성공 시) */
/** @screen DUE-3-SNACKBAR-02-0 입금 취소 ("납부 취소하기" 성공 시) */
/**
 * 6-A(DUE 화면 구현, 조회 전용): "회비 상세_마감된 회비"와 "회비 상세_예정된
 * 회비" 명세가 같은 Screen ID(`DUE-2-PAGE-03-1`)를 쓴다 — 확인 결과 오기가
 * 아니라 **같은 화면의 두 상태 변형**이다. 레이아웃(앱바+캐러셀 카드+탭+리스트)
 * 이 세 파일(기본/마감/예정) 모두 번호 1~7까지 완전히 동일하고, 각 파일이
 * 스스로를 "마감된/예정된 회비이므로 미납부·납부완료 전환이 불가능해 요약
 * 정보 작성 기준만 달라진다"고 설명한다. 그래서 이 파일 하나로 세 상태를
 * `status`로 분기해 구현했다.
 *
 * 상태 판정(2026-09-04 정합성 복구 — 서버 `status`를 그대로 신뢰한다):
 *  - `CLOSED` → "마감된 회비": 배지 "마감", 기본 탭 '납부 완료'
 *  - `SCHEDULED` → "예정된 회비": 배지에 시작일(`startDate`) 표시, 기본 탭
 *    '미납부'. 예전엔 이 상태를 `paidCount===0`(아직 아무도 안 냄)으로
 *    추정했는데 — "시작 전"과 "시작했는데 아무도 안 냄"은 다른 상황이라
 *    틀린 판단이었다. 서버가 `SCHEDULED`를 직접 내려준다(`docs/api-gaps.md`
 *    "확정됨" 절, 시작일 기준으로 서버가 파생 — 별도 전환 API 없음).
 *  - `OPEN` → "진행 중": D-day 배지(마감 임박도별 색), 기본 탭 '미납부'
 *
 * 상태별 메뉴 차이(명세·Dues.txt §1 aside 기준, 7-B-1에서 구현):
 *  - `SCHEDULED`: 회비 수정 / 모임원 선택 / 회비 삭제
 *  - `OPEN`: 위 + 회비 마감
 *  - `CLOSED`: 명세엔 "회비 수정"이 남아 있으나 서버는 `DUES_ALREADY_CLOSED
 *    (409)`로 막는다 — 기획 확인 대기 항목이라(`design-verification.md`
 *    §5-4) 수정 메뉴를 넣지 않는다. API 문서 자체도 CLOSED 메뉴를 "수정·삭제"
 *    둘로만 적어놨지만 그중 수정도 위 이유로 뺐다 — 그래서 CLOSED는 삭제
 *    하나만 남는다. 메뉴 전체가 총무(OWNER) 전용이라 ⋮ 버튼 자체를 일반
 *    관리자에게 숨긴다(2단계 UI 우선 차단 패턴).
 *
 * 납부 상태 일괄 변경(7-B-2): `canChangeStatus = viewerIsOwner && status
 * === 'OPEN'`일 때만 체크박스·CTA를 그린다 — `SCHEDULED`(`DUES_NOT_STARTED
 * 409`)와 `CLOSED`(`DUES_ALREADY_CLOSED 409`, Dues.txt §9)는 서버가 어차피
 * 막지만, **비활성화가 아니라 아예 숨긴다**. 목업(`회비상세_마감된회비.png`/
 * `_예정된회비.png`) 둘 다 이 두 상태에서 체크박스·CTA 자체가 없다 — 회색
 * 비활성 버튼이 아니라 렌더링을 안 한다.
 *
 * `PATCH /dues/{duesId}/members`(일괄)는 명세 "미구현"이었지만 착수 전
 * 실호출로 정상 동작을 확인했다(대조표가 맞았다, `docs/backend-requests.md`
 * 확정 이동) — 그래서 단건 API 순차 호출이 아니라 이 일괄 API를 직접 쓴다.
 * 서버가 원자적으로 처리해 "일부 성공·일부 실패"가 없다(하나라도 잘못되면
 * 전체 취소) — 성공 시 서버가 돌려준 `changedCount`로 스낵바 문구를 채운다
 * (선택 인원수와 다를 수 있다 — 이미 그 상태인 대상자는 조용히 스킵됨).
 * `duesService.updateDuesMembersPaymentStatus()`가 이 API 하나로 감싸져 있어,
 * 나중에 이 엔드포인트가 막히면 그 함수 내부만(단건 반복으로) 바꾸면 된다.
 *
 * 수정(`DuesEditScreen`)·모임원 선택(`DuesMemberEditScreen`)은 각각 독립된
 * 화면이라 이 파일에서 직접 폼을 그리지 않고 navigate만 한다. 삭제·마감은
 * 이 화면의 확인 `Dialog` → 성공 시 `Main`/`Dues`로 라우팅하며 스낵바 문구를
 * 실어 보낸다(DuesScreen.tsx 참고) — 삭제된 회비는 이 화면 자체가 다시 열릴
 * 수 없고, 마감도 명세가 상세가 아니라 목록으로 돌아가도록 정해서다. 실패는
 * 이 화면에 머문 채 인라인 스낵바로 보여준다(TransactionDetailScreen의
 * 삭제/승인 에러 패턴과 동일).
 *
 * "회비 요청하기"는 대응 API 자체가 없어(알림 도메인 부재, Dues.txt "회비
 * 요청 — 서버 기능이 아닙니다") 여전히 뺐다.
 */
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import TextButton from '../../components/Input/Button/TextButton';
import Tabs from '../../components/Navigation/Tabs/Tabs';
import DuesStatusCard from '../../components/Data Display/Card/DuesStatusCard';
import MemberListItem from '../../components/Data Display/Lists/MemberListItem';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import FolderMoreMenu from '../Folder/FolderMoreMenu';
import type { MenuItem } from '../../components/Navigation/Menu/Menu';
import type { DuesDetail, DuesMember, PaymentStatus } from '../../types/dues';
import { getActiveGroup } from '../../types/group';
import * as duesService from '../../services/duesService';
import { ApiError } from '../../services/apiClient';
import {
  daysUntil,
  formatDDayLabel,
  formatDateDot,
  getDDaySeverity,
} from '../../utils/dueDate';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  DUES_BADGE_CLOSED,
  DUES_CLOSE_CONFIRM_DESCRIPTION,
  DUES_CLOSE_CONFIRM_LABEL,
  DUES_CLOSE_CONFIRM_TITLE,
  DUES_DELETE_CONFIRM_DESCRIPTION,
  DUES_DELETE_CONFIRM_LABEL,
  DUES_DELETE_CONFIRM_TITLE,
  DUES_DETAIL_CARD_TITLE,
  DUES_DETAIL_LOADING,
  DUES_DETAIL_RETRY_LABEL,
  DUES_MEMBER_COUNT_SUFFIX,
  DUES_MEMBER_LIST_EMPTY,
  DUES_MEMBER_TAB_PAID,
  DUES_MEMBER_TAB_UNPAID,
  DUES_MENU_ACCESSIBILITY_LABEL,
  DUES_MENU_CLOSE_LABEL,
  DUES_MENU_DELETE_LABEL,
  DUES_MENU_EDIT_LABEL,
  DUES_MENU_MEMBERS_LABEL,
  DUES_PAYMENT_MARK_PAID_LABEL,
  DUES_PAYMENT_MARK_UNPAID_LABEL,
  DUES_REQUEST_ENTRY_LABEL,
  SNACKBAR_DUES_CLOSED_PREFIX,
  SNACKBAR_DUES_CLOSED_SUFFIX,
  SNACKBAR_DUES_DELETED_PREFIX,
  SNACKBAR_DUES_DELETED_SUFFIX,
  SNACKBAR_DUES_PAYMENT_CANCELLED_SUFFIX,
  SNACKBAR_DUES_PAYMENT_CONFIRMED_SUFFIX,
} from '../../constants/duesScreenText';
import {
  BACKGROUND_PRIMARY,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const MENU_ICON = require('../../assets/icons/action/Menu Vertical.png');

const SNACKBAR_AUTO_HIDE_MS = 1600;

type DuesDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DuesDetailRouteProp = RouteProp<RootStackParamList, 'DuesDetail'>;

type MemberTab = 'unpaid' | 'paid';
type LoadState = 'loading' | 'error' | 'ready';

function DuesDetailScreen() {
  const navigation = useNavigation<DuesDetailNavigationProp>();
  const route = useRoute<DuesDetailRouteProp>();
  const duesId = route.params.duesId;

  const [detail, setDetail] = useState<DuesDetail | null>(null);
  const [tab, setTab] = useState<MemberTab>('unpaid');
  const [members, setMembers] = useState<DuesMember[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [isMembersLoading, setIsMembersLoading] = useState(false);
  const [membersLoadError, setMembersLoadError] = useState('');
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [closeDialogVisible, setCloseDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const loadMembers = useCallback(
    async (nextTab: MemberTab) => {
      setIsMembersLoading(true);
      setMembersLoadError('');
      setSelectedMemberIds([]);
      try {
        const result = await duesService.getDuesMembers(duesId, {
          status: nextTab === 'paid' ? 'PAID' : 'UNPAID',
        });
        setMembers([...result].sort((a, b) => a.name.localeCompare(b.name, 'ko')));
      } catch (error) {
        // 실패를 조용히 "대상자가 없어요."로 보여주면 진짜 0명인지 요청 실패인지
        // 구분이 안 돼, 다른 화면과 같은 표준 에러 패턴(문구+다시 시도)으로 통일한다.
        // (2026-09-05 정정: "목록이 안 보인다"는 별개 제보는 이 catch와 무관한
        // 레이아웃 버그였다 — Divider.tsx 참고. 이 catch는 진짜 네트워크 실패
        // 케이스만 다룬다.)
        setMembers([]);
        setMembersLoadError(toErrorMessage(error));
      } finally {
        setIsMembersLoading(false);
      }
    },
    [duesId],
  );

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const result = await duesService.getDuesDetail(duesId);
      setDetail(result);
      const initialTab: MemberTab = result.status === 'CLOSED' ? 'paid' : 'unpaid';
      setTab(initialTab);
      await loadMembers(initialTab);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [duesId, loadMembers]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleChangeTab = (nextTab: MemberTab) => {
    setTab(nextTab);
    loadMembers(nextTab);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMemberIds(current =>
      current.includes(memberId)
        ? current.filter(id => id !== memberId)
        : [...current, memberId],
    );
  };

  const handleChangePaymentStatus = async () => {
    if (selectedMemberIds.length === 0 || isChangingStatus) {
      return;
    }
    const nextStatus: PaymentStatus = tab === 'unpaid' ? 'PAID' : 'UNPAID';
    setIsChangingStatus(true);
    try {
      const result = await duesService.updateDuesMembersPaymentStatus(
        duesId,
        selectedMemberIds,
        nextStatus,
      );
      showSnackbar(
        nextStatus === 'PAID'
          ? `${result.changedCount}${SNACKBAR_DUES_PAYMENT_CONFIRMED_SUFFIX}`
          : `${result.changedCount}${SNACKBAR_DUES_PAYMENT_CANCELLED_SUFFIX}`,
      );
      // [3-B 서버 재조회 패턴] 응답에 이미 paidCount/unpaidCount가 있지만,
      // 캐러셀 카드(expectedTotalAmount 등)까지 한 번에 맞추려고 상세를
      // 통째로 다시 부른다 — 목록은 loadMembers가 현재 탭 기준으로 다시 가져온다.
      const updatedDetail = await duesService.getDuesDetail(duesId);
      setDetail(updatedDetail);
      await loadMembers(tab);
    } catch (error) {
      showSnackbar(toErrorMessage(error));
    } finally {
      setIsChangingStatus(false);
    }
  };

  const viewerIsOwner = getActiveGroup()?.myRole === 'OWNER';

  // DUE-2-PAGE-03-0 시안 Case A(CLOSED): 메뉴는 "회비 수정 / 회비 삭제"만 남는다
  // — "회비 수정"은 CLOSED에서도 노출된다("모임원 선택"/"회비 마감"만 숨는다).
  // design-verification.md §5-13 참고.
  const menuItems: MenuItem[] = detail
    ? [
        { key: 'edit', label: DUES_MENU_EDIT_LABEL },
        ...(detail.status !== 'CLOSED'
          ? [{ key: 'members', label: DUES_MENU_MEMBERS_LABEL }]
          : []),
        ...(detail.status === 'OPEN'
          ? [{ key: 'close', label: DUES_MENU_CLOSE_LABEL }]
          : []),
        { key: 'delete', label: DUES_MENU_DELETE_LABEL, destructive: true },
      ]
    : [];

  const handleSelectMenu = (key: string) => {
    setMoreMenuVisible(false);
    if (key === 'edit') {
      navigation.navigate('DuesEdit', { duesId });
    } else if (key === 'members') {
      navigation.navigate('DuesMemberEdit', { duesId });
    } else if (key === 'close') {
      setCloseDialogVisible(true);
    } else if (key === 'delete') {
      setDeleteDialogVisible(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!detail || isDeleting) {
      return;
    }
    setIsDeleting(true);
    try {
      await duesService.deleteDues(detail.id);
      // navigate가 아니라 reset — 삭제된 상세 화면을 스택에서 걷어내 뒤로가기로
      // 되돌아갈 수 없게 한다(design-verification.md §5-11).
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            params: {
              screen: 'Dues',
              params: {
                snackbarMessage: `${SNACKBAR_DUES_DELETED_PREFIX}${detail.title}${SNACKBAR_DUES_DELETED_SUFFIX}`,
              },
            },
          },
        ],
      });
    } catch (error) {
      setDeleteDialogVisible(false);
      showSnackbar(toErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleConfirmClose = async () => {
    if (!detail || isClosing) {
      return;
    }
    setIsClosing(true);
    try {
      await duesService.closeDues(detail.id);
      // navigate가 아니라 reset — 마감 폼/상세를 스택에서 걷어내 뒤로가기로
      // 되돌아갈 수 없게 한다(design-verification.md §5-11).
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Main',
            params: {
              screen: 'Dues',
              params: {
                snackbarMessage: `${SNACKBAR_DUES_CLOSED_PREFIX}${detail.title}${SNACKBAR_DUES_CLOSED_SUFFIX}`,
              },
            },
          },
        ],
      });
    } catch (error) {
      setCloseDialogVisible(false);
      showSnackbar(toErrorMessage(error));
    } finally {
      setIsClosing(false);
    }
  };

  if (loadState === 'loading' || loadState === 'error') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <AppBar title="" onBackPress={() => navigation.goBack()} />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {loadState === 'loading' ? DUES_DETAIL_LOADING : loadErrorMessage}
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

  if (!detail) {
    return null;
  }

  const isClosed = detail.status === 'CLOSED';
  const isScheduled = detail.status === 'SCHEDULED';
  const canChangeStatus = viewerIsOwner && detail.status === 'OPEN';
  const daysLeft = daysUntil(detail.dueDate);
  const dDayLabel = isClosed
    ? DUES_BADGE_CLOSED
    : isScheduled
    ? formatDateDot(detail.startDate)
    : formatDDayLabel(daysLeft);
  const badgeStatus: 'positive' | 'warning' | 'destructive' | 'neutral' =
    !isClosed && !isScheduled ? getDDaySeverity(daysLeft) : 'neutral';
  const memberCount = tab === 'paid' ? detail.paidCount : detail.unpaidCount;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar
        title={detail.title}
        onBackPress={() => navigation.goBack()}
        rightIcons={
          viewerIsOwner
            ? [
                {
                  icon: MENU_ICON,
                  onPress: () => setMoreMenuVisible(true),
                  accessibilityLabel: DUES_MENU_ACCESSIBILITY_LABEL,
                },
              ]
            : []
        }
      />

      <ScrollView contentContainerStyle={styles.content}>
        <DuesStatusCard
          title={DUES_DETAIL_CARD_TITLE}
          dDayLabel={dDayLabel}
          badgeStatus={badgeStatus}
          paidMemberCount={detail.paidCount}
          totalMemberCount={detail.targetCount}
          paidAmount={detail.paidCount * detail.amount}
          totalAmount={detail.expectedTotalAmount}
          periodStart={formatDateDot(detail.startDate)}
          periodEnd={formatDateDot(detail.dueDate)}
          ledgerName={detail.ledger.name}
          duesAmount={detail.amount}
        />

        <View style={styles.tabsWrapper}>
          <Tabs
            items={[
              { label: DUES_MEMBER_TAB_UNPAID, value: 'unpaid' },
              { label: DUES_MEMBER_TAB_PAID, value: 'paid' },
            ]}
            value={tab}
            onChange={handleChangeTab}
            showIcon={false}
          />
        </View>

        <View style={styles.memberCountRow}>
          <Text style={styles.memberCountText}>
            {memberCount}{DUES_MEMBER_COUNT_SUFFIX}
          </Text>
          {viewerIsOwner && tab === 'unpaid' && (
            <TextButton
              label={DUES_REQUEST_ENTRY_LABEL}
              hierarchy="tertiary"
              onPress={() => navigation.navigate('DuesRequest')}
            />
          )}
        </View>

        {isMembersLoading ? (
          <Text style={styles.stateText}>{DUES_DETAIL_LOADING}</Text>
        ) : membersLoadError ? (
          <View style={styles.membersErrorContainer}>
            <Text style={styles.stateText}>{membersLoadError}</Text>
            <Button
              label={DUES_DETAIL_RETRY_LABEL}
              onPress={() => loadMembers(tab)}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          </View>
        ) : members.length === 0 ? (
          <Text style={styles.emptyText}>{DUES_MEMBER_LIST_EMPTY}</Text>
        ) : (
          <View style={styles.memberList}>
            {members.map(member => (
              <MemberListItem
                key={member.memberId}
                name={member.name}
                amount={detail.amount}
                showAmount={tab === 'paid'}
                showCheckbox={canChangeStatus}
                selected={selectedMemberIds.includes(member.memberId)}
                onPress={
                  canChangeStatus
                    ? () => toggleMemberSelection(member.memberId)
                    : undefined
                }
              />
            ))}
          </View>
        )}
      </ScrollView>

      {canChangeStatus && (
        <View style={styles.ctaWrapper}>
          <Button
            label={
              tab === 'unpaid'
                ? DUES_PAYMENT_MARK_PAID_LABEL
                : DUES_PAYMENT_MARK_UNPAID_LABEL
            }
            onPress={handleChangePaymentStatus}
            disabled={selectedMemberIds.length === 0 || isChangingStatus}
            fullWidth
          />
        </View>
      )}

      <FolderMoreMenu
        visible={moreMenuVisible}
        onClose={() => setMoreMenuVisible(false)}
        items={menuItems}
        onSelect={handleSelectMenu}
      />

      <Dialog
        visible={deleteDialogVisible}
        title={DUES_DELETE_CONFIRM_TITLE}
        description={DUES_DELETE_CONFIRM_DESCRIPTION}
        confirmLabel={DUES_DELETE_CONFIRM_LABEL}
        destructive
        confirmDisabled={isDeleting}
        onCancel={() => setDeleteDialogVisible(false)}
        onConfirm={handleConfirmDelete}
      />

      <Dialog
        visible={closeDialogVisible}
        title={DUES_CLOSE_CONFIRM_TITLE}
        description={DUES_CLOSE_CONFIRM_DESCRIPTION}
        confirmLabel={DUES_CLOSE_CONFIRM_LABEL}
        confirmDisabled={isClosing}
        onCancel={() => setCloseDialogVisible(false)}
        onConfirm={handleConfirmClose}
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
  // DUE-2-PAGE-03-0(+03-1 진행중/예정/마감 상태 전부 같은 파일) 시안이 옅은
  // 블루 — design-verification.md §5-7/§5-13.
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_PRIMARY,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
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
  membersErrorContainer: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 24,
  },
  tabsWrapper: {
    marginTop: 20,
  },
  memberCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 4,
  },
  memberCountText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  emptyText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 24,
    textAlign: 'center',
  },
  memberList: {
    marginTop: 4,
  },
  ctaWrapper: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
  },
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 24,
  },
});

export default DuesDetailScreen;
