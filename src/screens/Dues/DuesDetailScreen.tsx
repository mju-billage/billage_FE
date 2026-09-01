/** @screen DUE-2-PAGE-03-0 회비 상세 */
/** @screen DUE-2-PAGE-03-1 회비 상세_마감된 회비 / 회비 상세_예정된 회비 (state로 분기) */
/**
 * 6-A(DUE 화면 구현, 조회 전용): "회비 상세_마감된 회비"와 "회비 상세_예정된
 * 회비" 명세가 같은 Screen ID(`DUE-2-PAGE-03-1`)를 쓴다 — 확인 결과 오기가
 * 아니라 **같은 화면의 두 상태 변형**이다. 레이아웃(앱바+캐러셀 카드+탭+리스트)
 * 이 세 파일(기본/마감/예정) 모두 번호 1~7까지 완전히 동일하고, 각 파일이
 * 스스로를 "마감된/예정된 회비이므로 미납부·납부완료 전환이 불가능해 요약
 * 정보 작성 기준만 달라진다"고 설명한다. 그래서 이 파일 하나로 세 상태를
 * `status`(서버)와 `paidCount===0`(클라이언트 판정)로 분기해 구현했다.
 *
 * 상태 판정:
 *  - CLOSED → "마감된 회비": 배지 "마감", 기본 탭 '납부 완료'
 *  - OPEN && paidCount===0 → "예정된 회비": 배지에 시작일(createdAt) 표시,
 *    기본 탭 '미납부'. ⚠️ "시작일" 필드가 명세에 없어 생성일로 대체했다
 *    (실측 기반 가정 — 명세 확인 필요, docs/api-gaps.md).
 *  - 그 외 OPEN → "진행 중": D-day 배지(마감 임박도별 색), 기본 탭 '미납부'
 *
 * 수정/모임원 선택/마감/삭제(앱바 "⋮" 메뉴)와 납부 상태 변경(체크박스+CTA
 * 버튼)은 전부 총무 전용 쓰기 액션이라 6-C에서 붙인다 — 이번엔 메뉴 자체와
 * 체크박스/버튼을 렌더링하지 않는다(3-A 이후 정착된 "쓰기 진입점 비활성화"
 * 관례). "회비 요청하기"도 대응 API 자체가 없어(알림 도메인 부재) 같이 뺐다.
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
import Tabs from '../../components/Navigation/Tabs/Tabs';
import DuesStatusCard from '../../components/Data Display/Card/DuesStatusCard';
import MemberListItem from '../../components/Data Display/Lists/MemberListItem';
import type { DuesDetail, DuesMember } from '../../types/dues';
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
  DUES_DETAIL_CARD_TITLE,
  DUES_DETAIL_LOADING,
  DUES_DETAIL_RETRY_LABEL,
  DUES_MEMBER_COUNT_SUFFIX,
  DUES_MEMBER_LIST_EMPTY,
  DUES_MEMBER_TAB_PAID,
  DUES_MEMBER_TAB_UNPAID,
} from '../../constants/duesScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

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
      try {
        const result = await duesService.getDuesMembers(duesId, {
          status: nextTab === 'paid' ? 'PAID' : 'UNPAID',
        });
        setMembers([...result].sort((a, b) => a.name.localeCompare(b.name, 'ko')));
      } catch {
        setMembers([]);
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

  if (loadState === 'loading' || loadState === 'error') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <AppBar title="" onBackPress={() => navigation.goBack()} />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {loadState === 'loading' ? DUES_DETAIL_LOADING : loadErrorMessage}
          </Text>
          {loadState === 'error' && (
            <Button label={DUES_DETAIL_RETRY_LABEL} onPress={load} hierarchy="secondary" />
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (!detail) {
    return null;
  }

  const isClosed = detail.status === 'CLOSED';
  const isUpcoming = !isClosed && detail.paidCount === 0;
  const daysLeft = daysUntil(detail.dueDate);
  const dDayLabel = isClosed
    ? DUES_BADGE_CLOSED
    : isUpcoming
    ? formatDateDot(detail.createdAt)
    : formatDDayLabel(daysLeft);
  const badgeStatus: 'positive' | 'warning' | 'destructive' | 'neutral' =
    !isClosed && !isUpcoming ? getDDaySeverity(daysLeft) : 'neutral';
  const memberCount = tab === 'paid' ? detail.paidCount : detail.unpaidCount;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar title={detail.title} onBackPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.content}>
        <DuesStatusCard
          title={DUES_DETAIL_CARD_TITLE}
          dDayLabel={dDayLabel}
          badgeStatus={badgeStatus}
          paidMemberCount={detail.paidCount}
          totalMemberCount={detail.targetCount}
          paidAmount={detail.paidCount * detail.amount}
          totalAmount={detail.expectedTotalAmount}
          periodStart={formatDateDot(detail.createdAt)}
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

        <Text style={styles.memberCountText}>
          {memberCount}{DUES_MEMBER_COUNT_SUFFIX}
        </Text>

        {isMembersLoading ? (
          <Text style={styles.stateText}>{DUES_DETAIL_LOADING}</Text>
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
                showCheckbox={false}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  tabsWrapper: {
    marginTop: 20,
  },
  memberCountText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 8,
    marginBottom: 4,
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
});

export default DuesDetailScreen;
