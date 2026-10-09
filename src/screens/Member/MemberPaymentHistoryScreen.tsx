import { useCallback, useState } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import TransactionListItem from '../../components/Data Display/Lists/TransactionListItem';
import { getActiveGroup } from '../../types/group';
import type { MemberPayment } from '../../types/member';
import * as memberService from '../../services/memberService';
import { ApiError } from '../../services/apiClient';
import { formatWon } from '../../utils/currency';
import { formatDateHeader } from '../../utils/dateHeader';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  NO_ACTIVE_GROUP_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  MEMBER_DETAIL_TOTAL_PAID_LABEL,
  MEMBER_DETAIL_TOTAL_PAID_SUFFIX,
  MEMBER_MANAGE_RETRY_LABEL,
  MEMBER_PAYMENT_COUNT_SUFFIX,
  MEMBER_PAYMENT_EMPTY,
  MEMBER_PAYMENT_HISTORY_TITLE,
  MEMBER_PAYMENT_LOADING,
} from '../../constants/memberScreenText';
import {
  BACKGROUND_PRIMARY,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type LoadState = 'loading' | 'error' | 'ready';
type MemberPaymentHistoryRouteProp = RouteProp<RootStackParamList, 'MemberPaymentHistory'>;
type MemberPaymentHistoryNavigationProp = NativeStackNavigationProp<RootStackParamList>;

function groupPaymentsByDate(
  list: MemberPayment[],
): { date: string; items: MemberPayment[] }[] {
  const groups: { date: string; items: MemberPayment[] }[] = [];
  for (const payment of list) {
    const date = payment.paidAt.slice(0, 10);
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === date) {
      lastGroup.items.push(payment);
    } else {
      groups.push({ date, items: [payment] });
    }
  }
  return groups;
}

function MemberPaymentHistoryScreen() {
  const navigation = useNavigation<MemberPaymentHistoryNavigationProp>();
  const route = useRoute<MemberPaymentHistoryRouteProp>();
  const memberId = route.params.memberId;

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [totalPaidAmount, setTotalPaidAmount] = useState(0);
  const [payments, setPayments] = useState<MemberPayment[]>([]);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code, error.message);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const group = getActiveGroup();
      if (!group) {
        setLoadErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setLoadState('error');
        return;
      }
      const result = await memberService.getMemberPayments(group.id, memberId);
      setTotalPaidAmount(result.totalPaidAmount);
      setPayments(result.items);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [memberId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (loadState === 'loading' || loadState === 'error') {
    return (
      <ScreenContainer background="primary">
        <AppBar
          type="sub"
          title={MEMBER_PAYMENT_HISTORY_TITLE}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {loadState === 'loading' ? MEMBER_PAYMENT_LOADING : loadErrorMessage}
          </Text>
          {loadState === 'error' && (
            <Button
              label={MEMBER_MANAGE_RETRY_LABEL}
              onPress={load}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          )}
        </View>
      </ScreenContainer>
    );
  }

  const sections = groupPaymentsByDate(payments).map(group => ({
    title: formatDateHeader(group.date),
    data: group.items,
  }));

  return (
    <ScreenContainer background="primary">
      <AppBar
        type="sub"
        title={MEMBER_PAYMENT_HISTORY_TITLE}
        onBackPress={() => navigation.goBack()}
      />

      <View style={styles.body}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>{MEMBER_DETAIL_TOTAL_PAID_LABEL}</Text>
          <Text style={styles.summaryValue}>
            {formatWon(totalPaidAmount)}
            {MEMBER_DETAIL_TOTAL_PAID_SUFFIX}
          </Text>
        </View>

        <Text style={styles.countText}>
          {payments.length}
          {MEMBER_PAYMENT_COUNT_SUFFIX}
        </Text>

        {payments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{MEMBER_PAYMENT_EMPTY}</Text>
          </View>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item, index) => `${item.duesId}-${index}`}
            contentContainerStyle={styles.listContent}
            renderSectionHeader={({ section }) => (
              <Text style={styles.sectionHeader}>{section.title}</Text>
            )}
            renderItem={({ item }) => (
              <TransactionListItem
                label={item.ledgerName}
                itemName={item.duesTitle}
                amount={item.amount}
              />
            )}
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
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
  summaryCard: {
    borderRadius: 12,
    padding: 16,
    backgroundColor: BACKGROUND_PRIMARY,
  },
  summaryLabel: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  summaryValue: {
    ...TYPOGRAPHY.subtitle1,
    marginTop: 4,
  },
  countText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
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
    paddingBottom: 24,
  },
  sectionHeader: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 12,
    marginBottom: 4,
  },
});

export default MemberPaymentHistoryScreen;
