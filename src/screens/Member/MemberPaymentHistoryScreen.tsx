/** @screen DUE-4-PAGE-04-0 모임원 상세_납부 내역 */
/**
 * 7-C: 모임원 상세의 "총 납부 금액" 카드에서 뎁스인하는 조회 전용 화면
 * (Member.txt §7). 리스트 항목을 눌러도 이동하지 않는다 — 회비 상세로 가는
 * 경로가 시안·API 둘 다에 없다(§7 "리스트는 조회 전용이며 항목을 눌러도
 * 이동하지 않는다").
 *
 * ⚠️ 명세는 이 API가 `page`/`size` 페이지네이션을 지원한다고 적었지만,
 * 2026-09-05 실호출로 확인한 실제 응답은 `payments`가 페이지 객체가 아니라
 * **배열 그대로**다 — `size=1`을 보내도 전체 목록이 온다(`from`/`to` 기간
 * 필터는 정상 동작). 그래서 무한 스크롤(`TransactionsScreen` 패턴)이 아니라
 * 한 번에 전체를 받는 일반 목록으로 구현했다 — `memberService.ts` 주석,
 * `docs/backend-requests.md` 정정 요청 참고. 서버가 나중에 진짜 페이지네이션을
 * 붙이면 이 화면도 무한 스크롤로 바꿔야 한다.
 *
 * 시안(No.3)은 이 화면에 장부 상세와 "완전히 동일하게 동작"하는 필터/검색
 * 툴바가 있다고 적었지만, 실제 API는 `from`/`to` 기간 파라미터만 받고
 * `keyword`나 장부 필터는 받지 않는다 — 장부 상세의 필터 시트를 그대로
 * 붙이면 대부분의 옵션이 화면만 있고 서버에 반영되지 않는 죽은 UI가 된다.
 * 그래서 이번엔 필터/검색 UI를 만들지 않고 목록만 구현했다 — 기간 필터가
 * 실제로 필요한지는 기획 확인 항목으로 남긴다(`design-verification.md` §5-4).
 */
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

/** `paidAt`(ISO datetime) 날짜 부분 기준으로 묶는다(TransactionsScreen의
 * `groupEntriesByDate`와 같은 방식). 서버가 최신순으로 내려주므로 그룹 내부는
 * 재정렬하지 않는다. */
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
      return getApiErrorMessage(error.code);
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
