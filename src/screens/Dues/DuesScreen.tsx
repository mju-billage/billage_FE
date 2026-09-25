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
import { BOTTOM_NAVIGATION_HEIGHT } from '../../components/Navigation/Bottom Navigation/BottomNavigation';

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
    paddingHorizontal: 20,
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
    paddingBottom: BOTTOM_NAVIGATION_HEIGHT + 24,
  },
});

export default DuesScreen;
