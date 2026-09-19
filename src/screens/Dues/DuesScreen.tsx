/** @screen DUE-1-PAGE-01-0 납부관리 메인 */
/** @screen DUE-4-SNACKBAR-01-0 회비 생성 완료 (DuesCreateScreen 성공 시 route.params.snackbarMessage로 렌더) */
/** @screen DUE-4-SNACKBAR-02-0 회비 마감 완료 (DuesDetailScreen 마감 성공 시 렌더) */
/** @screen DUE-4-SNACKBAR-03-0 회비 삭제 완료 (DuesDetailScreen 삭제 성공 시 렌더) */
/**
 * 6-A(DUE 화면 구현, 조회 전용): 목 데이터 없이 처음부터 실 API로 붙인다.
 * "+"(회비 생성, 6-B)와 "모임원 관리" 아이콘(7-A)은 이제 둘 다 연결돼 있다.
 *
 * 정렬은 서버가 명세 순서(예정 시작일순 → 진행중 마감임박순 → 마감)로 고정
 * 정렬해 내려준다 — 클라이언트 재정렬을 하지 않는다(2026-09-04 정합성 복구,
 * `docs/api-gaps.md` 참고. 예전엔 서버가 정렬을 안 준다고 잘못 판단해
 * `sortDuesForList`로 재정렬했었다). D-day는 여전히 클라이언트 계산이다 — 서버는
 * `startDate`/`dueDate` 원본 날짜만 주고 D-day 문자열 자체는 안 준다(Dues.txt).
 *
 * 7-B-1(회비 수정·삭제·마감): `DuesDetailScreen`의 삭제·마감 확인 모달이 성공
 * 후 `navigation.navigate('Main', {screen:'Dues', params:{snackbarMessage}})`로
 * 이 화면까지 라우팅하며 스낵바 문구를 실어 보낸다 — 삭제는 상세 화면 자체가
 * 없어지고, 마감은 명세가 상세가 아니라 이 목록으로 돌아가도록 정해 두 액션
 * 다 이 화면에서 결과를 보여준다. `useFocusEffect(load)`가 재포커스마다
 * 어차피 다시 불러오므로 목록 자체는 별도 갱신 로직 없이 최신 상태로 보인다.
 */
import { useCallback, useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import Tabs from '../../components/Navigation/Tabs/Tabs';
import DuesProgressCard from '../../components/Data Display/Card/DuesProgressCard';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { getActiveGroup } from '../../types/group';
import type { DuesSummary } from '../../types/dues';
import * as duesService from '../../services/duesService';
import * as groupService from '../../services/groupService';
import { ApiError } from '../../services/apiClient';
import { daysUntil, formatDateDot, formatDDayLabel, getDDaySeverity } from '../../utils/dueDate';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  NO_ACTIVE_GROUP_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  DUES_ADD_ACCESSIBILITY_LABEL,
  DUES_BADGE_CLOSED,
  DUES_COUNT_SUFFIX,
  DUES_EMPTY_MESSAGE,
  DUES_LOADING,
  DUES_MAIN_TITLE,
  DUES_MEMBER_MANAGE_ACCESSIBILITY_LABEL,
  DUES_RETRY_LABEL,
  DUES_TAB_ALL,
  DUES_TAB_IN_PROGRESS,
} from '../../constants/duesScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const PLUS_ICON = require('../../assets/icons/action/Plus.png');
const MEMBER_BOOK_ICON = require('../../assets/icons/user/Member Book.png');

type DuesFilter = 'all' | 'inProgress';
type LoadState = 'loading' | 'error' | 'ready';

type DuesNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DuesRouteProp = RouteProp<MainTabParamList, 'Dues'>;

const SNACKBAR_AUTO_HIDE_MS = 1600;

function toCardProps(dues: DuesSummary) {
  const isClosed = dues.status === 'CLOSED';
  const isScheduled = dues.status === 'SCHEDULED';
  const state: 'active' | 'upcoming' | 'ended' = isClosed
    ? 'ended'
    : isScheduled
    ? 'upcoming'
    : 'active';
  const daysLeft = daysUntil(dues.dueDate);
  const dateBadgeLabel = isClosed
    ? DUES_BADGE_CLOSED
    : isScheduled
    ? `${formatDateDot(dues.startDate)} ${formatDDayLabel(daysUntil(dues.startDate))}`
    : formatDDayLabel(daysLeft);
  const dateBadgeStatus: 'positive' | 'warning' | 'destructive' | 'neutral' =
    !isClosed && !isScheduled ? getDDaySeverity(daysLeft) : 'neutral';
  const totalAmount = dues.amount * dues.targetCount;
  const paidAmount = dues.amount * dues.paidCount;
  return {
    state,
    dateBadgeLabel,
    dateBadgeStatus,
    paidMemberCount: dues.paidCount,
    totalMemberCount: dues.targetCount,
    paidAmount,
    totalAmount,
    progressRatio: dues.targetCount > 0 ? dues.paidCount / dues.targetCount : 0,
  };
}

/** 납부관리 메인: 회비 목록(전체/진행중 탭)을 카드로 보여준다. */
function DuesScreen() {
  const navigation = useNavigation<DuesNavigationProp>();
  const route = useRoute<DuesRouteProp>();

  const [filter, setFilter] = useState<DuesFilter>('all');
  const [dues, setDues] = useState<DuesSummary[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
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

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      let group = getActiveGroup();
      if (!group) {
        // [치명1] 로그인 직후 첫 포커스처럼 모임 캐시가 아직 없는 순간 대비 —
        // "다시 시도"가 실제로 동작하도록 여기서 한 번 더 직접 불러온다.
        await groupService.getMyGroups();
        group = getActiveGroup();
      }
      if (!group) {
        setLoadErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setLoadState('error');
        return;
      }
      const result = await duesService.getDuesList(group.id, {
        status: filter === 'inProgress' ? 'OPEN' : undefined,
      });
      setDues(result);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  // 회비 삭제·마감(7-B-1, DuesDetailScreen) 완료 후 이 화면으로 라우팅하며
  // 넘겨준 스낵바 문구 — 삭제된 회비는 상세로 돌아갈 곳이 없고, 마감은
  // 명세가 상세가 아니라 이 목록으로 돌아가도록 정해뒀다(둘 다 회비 상세의
  // 확인 모달에서 시작). 소비 즉시 파라미터를 지워 재포커스 시 중복 노출을 막는다.
  useEffect(() => {
    if (route.params?.snackbarMessage) {
      setSnackbarMessage(route.params.snackbarMessage);
      navigation.setParams({ snackbarMessage: undefined });
    }
  }, [route.params?.snackbarMessage, navigation]);

  useEffect(() => {
    if (!snackbarMessage) {
      return;
    }
    const timer = setTimeout(
      () => setSnackbarMessage(null),
      SNACKBAR_AUTO_HIDE_MS,
    );
    return () => clearTimeout(timer);
  }, [snackbarMessage]);

  const viewerIsOwner = getActiveGroup()?.myRole === 'OWNER';

  const handlePressCreate = () => {
    navigation.navigate('DuesCreate');
  };

  const handlePressMemberManage = () => {
    navigation.navigate('MemberManage');
  };

  return (
    <ScreenContainer
      background="primary"
      avoidKeyboard={false}
      snackbar={
        snackbarMessage ? (
          <Snackbar visible title={snackbarMessage} />
        ) : undefined
      }
    >
      <AppBar
        type="titleOnly"
        title={DUES_MAIN_TITLE}
        rightIcons={[
          // 회비 생성은 총무 전용(Dues.txt) — 일반 관리자에겐 버튼 자체를 숨긴다(2단계
          // UI 우선 차단 패턴). 모임원 관리는 대상 화면이 아직 없어 계속 no-op.
          ...(viewerIsOwner
            ? [
                {
                  icon: PLUS_ICON,
                  onPress: handlePressCreate,
                  accessibilityLabel: DUES_ADD_ACCESSIBILITY_LABEL,
                },
              ]
            : []),
          {
            icon: MEMBER_BOOK_ICON,
            onPress: handlePressMemberManage,
            accessibilityLabel: DUES_MEMBER_MANAGE_ACCESSIBILITY_LABEL,
          },
        ]}
      />

      <View style={styles.body}>
        <Tabs
          items={[
            { label: DUES_TAB_ALL, value: 'all' },
            { label: DUES_TAB_IN_PROGRESS, value: 'inProgress' },
          ]}
          value={filter}
          onChange={setFilter}
          showIcon={false}
        />

        {loadState === 'loading' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{DUES_LOADING}</Text>
          </View>
        )}

        {loadState === 'error' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{loadErrorMessage}</Text>
            <Button label={DUES_RETRY_LABEL} onPress={load} hierarchy="secondary" style={{ alignSelf: 'center' }} />
          </View>
        )}

        {loadState === 'ready' && (
          <>
            <Text style={styles.countText}>
              {dues.length}{DUES_COUNT_SUFFIX}
            </Text>

            {dues.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{DUES_EMPTY_MESSAGE}</Text>
              </View>
            ) : (
              <FlatList
                data={dues}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <DuesProgressCard
                    type="paymentManagement"
                    title={item.title}
                    fullWidth
                    {...toCardProps(item)}
                    onPress={() =>
                      navigation.navigate('DuesDetail', { duesId: item.id })
                    }
                  />
                )}
              />
            )}
          </>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  countText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 8,
    marginBottom: 12,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  listContent: {
    gap: 12,
    paddingBottom: 24,
  },
});

export default DuesScreen;
