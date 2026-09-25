import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import CardBase from '../../components/Data Display/Card/CardBase';
import ProgressBar from '../../components/Feedback/Progress Bar/ProgressBar';
import FolderItem from '../../components/Data Display/Folder/FolderItem';
import { formatExpense, formatWon } from '../../utils/currency';
import type {
  StatisticsBudgetUsageItem,
  StatisticsExpenseShareItem,
  StatisticsOverview,
} from '../../types/statistics';
import { getActiveGroup } from '../../types/group';
import * as groupService from '../../services/groupService';
import * as statisticsService from '../../services/statisticsService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  NO_ACTIVE_GROUP_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  STATISTICS_ACTIVE_BUDGET_LABEL,
  STATISTICS_ACTIVE_BUDGET_UNSET,
  STATISTICS_ACTIVE_EXPENSE_LABEL,
  STATISTICS_ACTIVE_INCOME_LABEL,
  STATISTICS_ACTIVE_SUBTITLE_PREFIX,
  STATISTICS_ACTIVE_SUBTITLE_SUFFIX,
  STATISTICS_BUDGET_USAGE_COLLAPSED_COUNT,
  STATISTICS_BUDGET_USAGE_COLLAPSE_LABEL,
  STATISTICS_BUDGET_USAGE_EXPAND_LABEL,
  STATISTICS_BUDGET_USAGE_TITLE,
  STATISTICS_EMPTY_SUBTITLE,
  STATISTICS_EMPTY_TITLE,
  STATISTICS_EXPENSE_SHARE_OTHERS_NAME,
  STATISTICS_LOADING,
  STATISTICS_RETRY_LABEL,
  STATISTICS_TITLE,
  statisticsActiveTitle,
  statisticsExpenseShareTitle,
} from '../../constants/statisticsScreenText';
import {
  BLUE_300,
  BLUE_500,
  FEEDBACK_POSITIVE_BOLD,
  FEEDBACK_NEGATIVE_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
  FOREGROUND_SECONDARY,
  GREY_300,
  NAVY_800,
  YELLOW_500,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type StatisticsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  never
>;
type LoadState = 'loading' | 'error' | 'ready';

const EXPENSE_SHARE_COLORS = [NAVY_800, YELLOW_500, BLUE_500, BLUE_300];

function isEmptyOverview(overview: StatisticsOverview): boolean {
  return (
    overview.mostActiveLedger === null &&
    overview.budgetUsage.length === 0 &&
    overview.expenseShare.items.length === 0
  );
}

function expenseShareColor(item: StatisticsExpenseShareItem, index: number): string {
  if (item.ledgerId === null) {
    return GREY_300;
  }
  return EXPENSE_SHARE_COLORS[index] ?? GREY_300;
}

function StatisticsScreen() {
  const navigation = useNavigation<StatisticsScreenNavigationProp>();
  const [overview, setOverview] = useState<StatisticsOverview | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [budgetUsageExpanded, setBudgetUsageExpanded] = useState(false);

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
      const result = await statisticsService.getStatistics(group.id);
      setOverview(result);
      setBudgetUsageExpanded(false);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const renderBody = () => {
    if (!overview) {
      return null;
    }

    if (isEmptyOverview(overview)) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{STATISTICS_EMPTY_TITLE}</Text>
          <Text style={styles.emptySubtitle}>{STATISTICS_EMPTY_SUBTITLE}</Text>
        </View>
      );
    }

    const { mostActiveLedger, budgetUsage, expenseShare } = overview;
    const visibleBudgetUsage = budgetUsageExpanded
      ? budgetUsage
      : budgetUsage.slice(0, STATISTICS_BUDGET_USAGE_COLLAPSED_COUNT);
    const topExpenseLedgerName = expenseShare.items[0]?.name;

    return (
      <>
        {mostActiveLedger && (
          <CardBase style={styles.card}>
            <Text style={styles.cardTitle}>
              {statisticsActiveTitle(mostActiveLedger.name)}
            </Text>
            <Text style={styles.cardSubtitle}>
              {STATISTICS_ACTIVE_SUBTITLE_PREFIX}
              {mostActiveLedger.recentEntryCount}
              {STATISTICS_ACTIVE_SUBTITLE_SUFFIX}
            </Text>

            <FolderItem
              kind="ledger"
              name={mostActiveLedger.name}
              subtitle=""
              layout="list"
              onPress={() =>
                navigation.navigate('LedgerDetail', {
                  ledgerId: mostActiveLedger.ledgerId,
                })
              }
            />

            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>{STATISTICS_ACTIVE_INCOME_LABEL}</Text>
              <Text style={[styles.amountValue, styles.incomeValue]}>
                {mostActiveLedger.totalIncome > 0 ? '+' : ''}
                {formatWon(mostActiveLedger.totalIncome)}원
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>{STATISTICS_ACTIVE_EXPENSE_LABEL}</Text>
              <Text style={[styles.amountValue, styles.expenseValue]}>
                {formatExpense(mostActiveLedger.totalExpense)}
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>{STATISTICS_ACTIVE_BUDGET_LABEL}</Text>
              <Text style={styles.amountValue}>
                {mostActiveLedger.budget != null
                  ? `${formatWon(mostActiveLedger.budget)}원`
                  : STATISTICS_ACTIVE_BUDGET_UNSET}
              </Text>
            </View>

            {mostActiveLedger.budget != null && (
              <View style={styles.activeBudgetBar}>
                <Text style={styles.activeBudgetPercent}>
                  {Math.round(mostActiveLedger.budgetUsageRate ?? 0)}%
                </Text>
                <ProgressBar
                  progress={Math.min(
                    Math.max((mostActiveLedger.budgetUsageRate ?? 0) / 100, 0),
                    1,
                  )}
                />
              </View>
            )}
          </CardBase>
        )}

        {budgetUsage.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{STATISTICS_BUDGET_USAGE_TITLE}</Text>
            {visibleBudgetUsage.map(item => (
              <BudgetUsageRow key={item.ledgerId} item={item} />
            ))}
            {budgetUsage.length > STATISTICS_BUDGET_USAGE_COLLAPSED_COUNT && (
              <Button
                label={
                  budgetUsageExpanded
                    ? STATISTICS_BUDGET_USAGE_COLLAPSE_LABEL
                    : STATISTICS_BUDGET_USAGE_EXPAND_LABEL
                }
                onPress={() => setBudgetUsageExpanded(prev => !prev)}
                hierarchy="tertiary"
                style={styles.expandButton}
              />
            )}
          </View>
        )}

        {expenseShare.items.length > 0 && topExpenseLedgerName && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {statisticsExpenseShareTitle(topExpenseLedgerName)}
            </Text>
            <View style={styles.stackedBar}>
              {expenseShare.items.map((item, index) => (
                <View
                  key={item.ledgerId ?? STATISTICS_EXPENSE_SHARE_OTHERS_NAME}
                  style={{
                    flexGrow: Math.max(item.share, 1),
                    backgroundColor: expenseShareColor(item, index),
                  }}
                />
              ))}
            </View>
            {expenseShare.items.map((item, index) => (
              <View key={item.ledgerId ?? STATISTICS_EXPENSE_SHARE_OTHERS_NAME} style={styles.expenseShareRow}>
                <View
                  style={[
                    styles.expenseShareDot,
                    { backgroundColor: expenseShareColor(item, index) },
                  ]}
                />
                <View style={styles.expenseShareNameColumn}>
                  <Text style={styles.expenseShareName}>{item.name}</Text>
                  <Text style={styles.expenseSharePercent}>{item.share}%</Text>
                </View>
                <Text style={styles.expenseShareAmount}>
                  {formatExpense(item.totalExpense)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </>
    );
  };

  return (
    <ScreenContainer background="secondary">
      <AppBar title={STATISTICS_TITLE} onBackPress={() => navigation.goBack()} />

      {loadState === 'loading' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{STATISTICS_LOADING}</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{loadErrorMessage}</Text>
          <Button
            label={STATISTICS_RETRY_LABEL}
            onPress={load}
            hierarchy="secondary"
            style={{ alignSelf: 'center' }}
          />
        </View>
      )}

      {loadState === 'ready' && (
        <View style={styles.scrollContent}>{renderBody()}</View>
      )}
    </ScreenContainer>
  );
}

function BudgetUsageRow({ item }: { item: StatisticsBudgetUsageItem }) {
  return (
    <View style={styles.budgetUsageRow}>
      <Text style={styles.budgetUsageName} numberOfLines={1}>
        {item.name}
      </Text>
      <View style={styles.budgetUsageBar}>
        <ProgressBar progress={Math.min(Math.max(item.budgetUsageRate / 100, 0), 1)} />
      </View>
      <Text style={styles.budgetUsagePercent}>{Math.round(item.budgetUsageRate)}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 24,
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
  emptyTitle: {
    ...TYPOGRAPHY.subtitle3,
  },
  emptySubtitle: {
    marginTop: 6,
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    textAlign: 'center',
  },
  card: {
    gap: 8,
  },
  cardTitle: {
    ...TYPOGRAPHY.subtitle2,
    color: FOREGROUND_PRIMARY,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.caption,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginBottom: 4,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  amountLabel: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  amountValue: {
    ...TYPOGRAPHY.subtitle3,
  },
  incomeValue: {
    color: FEEDBACK_POSITIVE_BOLD,
  },
  expenseValue: {
    color: FEEDBACK_NEGATIVE_BOLD,
  },
  activeBudgetBar: {
    marginTop: 8,
  },
  activeBudgetPercent: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subtitle2,
  },
  expandButton: {
    alignSelf: 'center',
  },
  budgetUsageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  budgetUsageName: {
    ...TYPOGRAPHY.body2,
    width: 64,
  },
  budgetUsageBar: {
    flex: 1,
  },
  budgetUsagePercent: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    width: 36,
    textAlign: 'right',
  },
  stackedBar: {
    flexDirection: 'row',
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  expenseShareRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  expenseShareDot: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  expenseShareNameColumn: {
    flex: 1,
  },
  expenseShareName: {
    ...TYPOGRAPHY.body2,
  },
  expenseSharePercent: {
    ...TYPOGRAPHY.caption,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  expenseShareAmount: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_SECONDARY,
  },
});

export default StatisticsScreen;
