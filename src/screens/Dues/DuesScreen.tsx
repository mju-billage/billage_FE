/** @screen DUE-1-PAGE-01-0 납부관리 메인 */
/**
 * 6-A(DUE 화면 구현, 조회 전용): 목 데이터 없이 처음부터 실 API로 붙인다.
 *
 * "+"(회비 생성)와 "모임원 관리" 아이콘은 진입점만 두고 비활성(no-op)이다 —
 * 회비 생성은 6-B, 모임원 관리 화면 자체가 아직 없다(Member 도메인 API는
 * 있지만 화면 신규 개발 대상, docs/api-integration-plan.md 참고). 둘 다 다른
 * 화면(DashboardScreen의 빠른 서비스 등)에서 이미 쓰는 "진입점만 두고 TODO로
 * 남기는" 관례를 그대로 따랐다 — 아직 없는 화면이라 역할(myRole) 게이팅도
 * 지금은 의미가 없다(생기면 그때 총무 전용으로 막는다).
 *
 * 리스트 정렬(예정→진행중→마감)과 D-day는 전부 클라이언트 계산이다 — 서버는
 * `dueDate`만 주고 D-day·진행률·정렬 순서를 안 준다(Dues.txt, docs/api-gaps.md).
 */
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import Tabs from '../../components/Navigation/Tabs/Tabs';
import DuesProgressCard from '../../components/Data Display/Card/DuesProgressCard';
import { getActiveGroup } from '../../types/group';
import type { DuesSummary } from '../../types/dues';
import * as duesService from '../../services/duesService';
import { ApiError } from '../../services/apiClient';
import { daysUntil, formatDDayLabel, getDDaySeverity } from '../../utils/dueDate';
import { isUpcomingDues, sortDuesForList } from '../../utils/duesSort';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  DUES_ADD_ACCESSIBILITY_LABEL,
  DUES_BADGE_CLOSED,
  DUES_BADGE_UPCOMING,
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

function toCardProps(dues: DuesSummary) {
  const isClosed = dues.status === 'CLOSED';
  const isUpcoming = !isClosed && isUpcomingDues(dues);
  const state: 'active' | 'upcoming' | 'ended' = isClosed
    ? 'ended'
    : isUpcoming
    ? 'upcoming'
    : 'active';
  const daysLeft = daysUntil(dues.dueDate);
  const dateBadgeLabel = isClosed
    ? DUES_BADGE_CLOSED
    : isUpcoming
    ? DUES_BADGE_UPCOMING
    : formatDDayLabel(daysLeft);
  const dateBadgeStatus: 'positive' | 'warning' | 'destructive' | 'neutral' =
    !isClosed && !isUpcoming ? getDDaySeverity(daysLeft) : 'neutral';
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

  const [filter, setFilter] = useState<DuesFilter>('all');
  const [dues, setDues] = useState<DuesSummary[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');

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
    const group = getActiveGroup();
    if (!group) {
      return;
    }
    setLoadState('loading');
    try {
      const result = await duesService.getDuesList(group.id, {
        status: filter === 'inProgress' ? 'OPEN' : undefined,
      });
      setDues(sortDuesForList(result));
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

  const viewerIsOwner = getActiveGroup()?.myRole === 'OWNER';

  const handlePressCreate = () => {
    navigation.navigate('DuesCreate');
  };

  const handlePressMemberManage = () => {
    // TODO: 모임원 관리 화면 구현 후 연결(Member 도메인 API는 준비됐으나 화면 자체가 없음)
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
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
            <Button label={DUES_RETRY_LABEL} onPress={load} hierarchy="secondary" />
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
