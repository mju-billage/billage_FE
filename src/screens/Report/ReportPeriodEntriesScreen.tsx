/** @screen ETC-4-PAGE-07-0 보고서_시간순 (전체 장부 통합) */
/** @screen ETC-4-PAGE-07-1 보고서_시간순(수입/지출) — 07-0의 탭 상태, 별도 라우트 아님(ReportEntryList.tsx 탭) */
/**
 * 기간별 보고서 상세(ETC-3-PAGE-03-0)의 헤더 카드(요약)를 눌러 들어오는
 * "이 기간 모든 장부의 내역을 한 리스트로" 화면. 시안 파일명은
 * `더보기_보고서생성_기간보고서조회.png`인데 그 표 헤더가 `ETC-4-PAGE-05-0`로
 * 적혀 있다 — **명세서 오기다**(IA 171행은 이 내용을 07-0으로 정의, 05-0은
 * 장부 하나만 보여주는 별개 화면인데 이 시안은 캐러셀+장부명 태그가 붙은
 * 통합 리스트라 07-0 쪽 설명과 일치한다). `docs/design-verification.md`
 * §5-4에 기획 확인 항목으로 남겼다 — 이 파일은 IA 기준(07-0)으로 구현했다.
 *
 * 캐러셀은 새 라이브러리 없이 `ScrollView horizontal pagingEnabled` +
 * `CarouselIndicator`로 만들었다 — `LedgerDetailScreen`이 이미 쓰는 패턴
 * 그대로 가져왔다(`react-native-gesture-handler` 등은 이 프로젝트에 없다).
 *
 * ⚠️ 2026-09-06 등급 하향([구현]→[부족함], `design-verification.md` §2) —
 * `ETC-4-PAGE-05-0`과 같은 리스트(`ReportEntryList`)를 써서 같은 이유로
 * 영수증 아이콘이 빠졌다. 자세한 사유는 `ReportEntryList.tsx` 참고.
 */
import { useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import AmountCard from '../../components/Data Display/Card/AmountCard';
import CarouselIndicator from '../../components/Navigation/Carousel Indicator/CarouselIndicator';
import ReportEntryList from './ReportEntryList';
import { formatDateDot } from '../../utils/dueDate';
import { REPORT_DETAIL_PERIOD_LABEL } from '../../constants/reportScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type ReportPeriodEntriesNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReportPeriodEntriesRouteProp = RouteProp<RootStackParamList, 'ReportPeriodEntries'>;

function ReportPeriodEntriesScreen() {
  const navigation = useNavigation<ReportPeriodEntriesNavigationProp>();
  const route = useRoute<ReportPeriodEntriesRouteProp>();
  const { reportTitle, startDate, endDate, summary, ledgers } = route.params;
  const [cardIndex, setCardIndex] = useState(0);
  const { width: windowWidth } = useWindowDimensions();

  // 캐러셀 스냅 결함 수정(2026-09-18): 카드 폭(화면폭-48)과 스크롤뷰의
  // paddingLeft(24, 우측 없음)가 서로 안 맞아 2페이지부터 어긋났다 —
  // LedgerDetailScreen과 같은 원인, 같은 수정. 슬라이드를 화면 폭 그대로 채우고
  // 카드 여백은 슬라이드 안쪽 padding으로 옮겨 snapToInterval 없이
  // pagingEnabled 기본 동작만으로 맞춘다.
  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(e.nativeEvent.contentOffset.x / windowWidth);
    setCardIndex(index);
  };

  const entries = ledgers.flatMap(ledger =>
    ledger.entries.map(entry => ({ ...entry, ledgerName: ledger.ledgerName })),
  );

  return (
    <ScreenContainer background="primary">
      <AppBar type="sub" title={reportTitle} onBackPress={() => navigation.goBack()} />

      <View style={styles.body}>
        <Text style={styles.periodText}>
          {REPORT_DETAIL_PERIOD_LABEL} {formatDateDot(startDate)} - {formatDateDot(endDate)}
        </Text>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScrollEnd}
          style={styles.carousel}
          decelerationRate="fast"
        >
          <View style={[styles.cardSlide, { width: windowWidth }]}>
            {/* 명세(더보기_보고서생성_기간보고서조회.png) No.3: Card 1은 수입/지출
                2행뿐, 합계 행이 없다 — 합계 행은 ETC-4-PAGE-05-0(장부 상세) 전용. */}
            <AmountCard
              type="incomeExpense"
              income={summary.totalIncome}
              expense={summary.totalExpense}
              showTotal={false}
            />
          </View>
          <View style={[styles.cardSlide, { width: windowWidth }]}>
            <AmountCard
              type="balance"
              startBalance={summary.openingBalance ?? 0}
              endBalance={summary.closingBalance ?? 0}
            />
          </View>
        </ScrollView>
        <View style={styles.indicatorRow}>
          <CarouselIndicator count={2} selectedIndex={cardIndex} />
        </View>

        <ReportEntryList
          entries={entries}
          onPressEntry={entry =>
            navigation.navigate('ReportEntryDetail', { ledgerName: entry.ledgerName, entry })
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  periodText: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  carousel: {
    flexGrow: 0,
    marginTop: 12,
    marginHorizontal: -20,
  },
  // 슬라이드 하나 = 화면 폭 전체(JSX에서 width: windowWidth로 덮어씀) — 카드
  // 여백은 스크롤뷰가 아니라 이 안쪽 padding으로 준다(캐러셀 스냅 결함 수정,
  // 2026-09-18).
  cardSlide: {
    paddingHorizontal: 20,
  },
  indicatorRow: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
});

export default ReportPeriodEntriesScreen;
