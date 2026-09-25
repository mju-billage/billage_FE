/** @screen ETC-4-PAGE-05-0 보고서_장부 상세 조회 */
/** @screen ETC-4-PAGE-05-1 보고서_장부 상세(수입/지출) — 05-0의 탭 상태, 별도 라우트 아님(ReportEntryList.tsx 탭) */
/**
 * 장부별 보고서 상세(ETC-3-PAGE-02-0)의 장부 카드, 기간별 보고서 상세
 * (ETC-3-PAGE-03-0)의 장부 리스트 행 — 양쪽 모두 이 화면으로 뎁스인한다
 * (같은 Screen ID, 시안 UI 요소 6개가 번호·설명까지 동일). 단건 조회 API가
 * 없어(`GET /reports/{reportId}`가 이미 전체를 스냅샷으로 내려줌) 부모
 * 화면이 이미 들고 있던 데이터를 route params로 그대로 받는다 — 재조회
 * 없음.
 *
 * 탭·건수·일자별 리스트는 `ReportEntryList`(장부별·기간별 공용 조각)로 뺐다.
 *
 * ⚠️ 2026-09-06 등급 하향([구현]→[부족함], `design-verification.md` §2) —
 * 리스트 행의 영수증 아이콘이 빠졌다(스냅샷에 `receiptCount` 없음). 자세한
 * 사유는 `ReportEntryList.tsx` 파일 상단 주석 참고.
 */
import { StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import AmountCard from '../../components/Data Display/Card/AmountCard';
import ReportEntryList from './ReportEntryList';
import { formatDateDot } from '../../utils/dueDate';
import { REPORT_DETAIL_PERIOD_LABEL } from '../../constants/reportScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type ReportLedgerEntriesNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReportLedgerEntriesRouteProp = RouteProp<RootStackParamList, 'ReportLedgerEntries'>;

function ReportLedgerEntriesScreen() {
  const navigation = useNavigation<ReportLedgerEntriesNavigationProp>();
  const route = useRoute<ReportLedgerEntriesRouteProp>();
  const { ledgerName, startDate, endDate, totalIncome, totalExpense, entries } = route.params;

  return (
    <ScreenContainer
      background="primary"
      // 하단 안전영역은 흰 목록 영역이 직접 채운다(안 그러면 그 자리에 파란 띠가 남는다).
      edges={['top']}
    >
      <AppBar type="sub" title={ledgerName} onBackPress={() => navigation.goBack()} />

      <View style={styles.header}>
        <Text style={styles.periodText}>
          {REPORT_DETAIL_PERIOD_LABEL} {formatDateDot(startDate)} - {formatDateDot(endDate)}
        </Text>

        <AmountCard type="incomeExpense" income={totalIncome} expense={totalExpense} />
      </View>

      <ReportEntryList
        sheet
        entries={entries.map(entry => ({ ...entry, ledgerName }))}
        onPressEntry={entry =>
          navigation.navigate('ReportEntryDetail', { ledgerName, entry })
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // 기간 줄 + 요약 카드(파란 영역). 아래 16은 흰 목록 영역과의 파란 간격.
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 12,
  },
  periodText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default ReportLedgerEntriesScreen;
