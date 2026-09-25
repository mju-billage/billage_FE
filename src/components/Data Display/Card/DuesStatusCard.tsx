import { useState } from 'react';
import {
  Image,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Badge from '../Badge/Badge';
import Divider from '../Divider/Divider';
import CarouselIndicator from '../../Navigation/Carousel Indicator/CarouselIndicator';
import CardBase from './CardBase';
import { formatWon } from '../../../utils/currency';
import {
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const MEMBER_ICON = require('../../../assets/icons/user/Member.png');
const MONEY_ICON = require('../../../assets/icons/content/Money.png');

type DuesStatusCardProps = {
  title: string;
  dDayLabel: string;
  /** D-day 배지 색상. 회비 상세(DUE-2-PAGE-03-0류)는 상태에 따라 다른 색이 필요하다
   * (진행 중=위험도별 색, 마감/예정=중립) — 기본값은 기존 호출부 동작을 유지한다. */
  badgeStatus?: 'positive' | 'warning' | 'destructive' | 'neutral';
  paidMemberCount: number;
  totalMemberCount: number;
  paidAmount: number;
  totalAmount: number;
  periodStart: string;
  periodEnd: string;
  ledgerName: string;
  duesAmount: number;
};

/** 회비 납부 현황(인원/금액)과 납부 기간/장부 정보를 흰 카드 두 장으로 나눠 가로로 넘겨 보는 캐러셀.
 * 1페이지: 회비가 모이기까지(D-day·인원·금액), 2페이지: 납부 기간·장부·회비 금액.
 * 슬라이드 폭은 화면 전체(카드 여백은 슬라이드 안쪽 패딩)라 부모의 좌우 패딩 24를 음수 마진으로 상쇄한다
 * — 장부 상세 캐러셀(`LedgerDetailScreen`)과 같은 방식. */
function DuesStatusCard({
  title,
  dDayLabel,
  badgeStatus = 'positive',
  paidMemberCount,
  totalMemberCount,
  paidAmount,
  totalAmount,
  periodStart,
  periodEnd,
  ledgerName,
  duesAmount,
}: DuesStatusCardProps) {
  const { width: windowWidth } = useWindowDimensions();
  const [pageIndex, setPageIndex] = useState(0);
  // 두 카드 높이를 큰 쪽에 맞춘다 — 슬라이드 높이를 측정해 `minHeight`로 준다(flex 늘리기에 기대지 않음).
  const [slideHeights, setSlideHeights] = useState<[number, number]>([0, 0]);
  const cardMinHeight = Math.max(slideHeights[0], slideHeights[1]);

  const handleSlideLayout = (index: 0 | 1) => (event: LayoutChangeEvent) => {
    const height = event.nativeEvent.layout.height;
    setSlideHeights(current =>
      current[index] === height
        ? current
        : index === 0
        ? [height, current[1]]
        : [current[0], height],
    );
  };

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setPageIndex(Math.round(event.nativeEvent.contentOffset.x / windowWidth));
  };

  return (
    <View>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        style={styles.carousel}
        decelerationRate="fast"
      >
        <View
          style={[styles.slide, { width: windowWidth }]}
          onLayout={handleSlideLayout(0)}
        >
          <CardBase style={{ minHeight: cardMinHeight }}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{title}</Text>
              <Badge label={dDayLabel} status={badgeStatus} />
            </View>

            <View style={styles.statusSection}>
              <View style={styles.summaryItem}>
                <Image source={MEMBER_ICON} style={styles.icon} />
                <Text style={styles.summaryDenominator}>
                  <Text style={styles.summaryHighlight}>{paidMemberCount}</Text> /{' '}
                  {totalMemberCount}명
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Image source={MONEY_ICON} style={styles.icon} />
                <Text style={styles.summaryDenominator}>
                  <Text style={styles.summaryHighlight}>
                    {paidAmount.toLocaleString()}
                  </Text>{' '}
                  / {formatWon(totalAmount)}
                </Text>
              </View>
            </View>
          </CardBase>
        </View>

        <View
          style={[styles.slide, { width: windowWidth }]}
          onLayout={handleSlideLayout(1)}
        >
          <CardBase style={{ minHeight: cardMinHeight }}>
            <View style={styles.periodColumn}>
              <Text style={styles.fieldLabel}>납부 기간</Text>
              <Text style={styles.fieldValue}>
                {periodStart} ~ {periodEnd}
              </Text>
            </View>

            <View style={styles.twoColumnRow}>
              <View style={styles.twoColumn}>
                <Text style={styles.fieldLabel}>장부</Text>
                <Text style={styles.fieldValue}>{ledgerName}</Text>
              </View>
              <View style={styles.columnDividerWrapper}>
                <Divider orientation="vertical" />
              </View>
              <View style={styles.twoColumn}>
                <Text style={styles.fieldLabel}>회비 금액</Text>
                <Text style={styles.fieldValue}>{formatWon(duesAmount)}</Text>
              </View>
            </View>
          </CardBase>
        </View>
      </ScrollView>
      <View style={styles.indicatorRow}>
        <CarouselIndicator count={2} selectedIndex={pageIndex} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  carousel: {
    flexGrow: 0,
    marginHorizontal: -20,
  },
  slide: {
    paddingHorizontal: 20,
  },
  indicatorRow: {
    alignItems: 'center',
    marginTop: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_PRIMARY,
  },
  statusSection: {
    gap: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  summaryDenominator: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  summaryHighlight: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_SECONDARY,
  },
  periodColumn: {
    gap: 4,
    marginBottom: 16,
  },
  twoColumnRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  twoColumn: {
    flex: 1,
    gap: 4,
  },
  columnDividerWrapper: {
    marginHorizontal: 16,
  },
  fieldLabel: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  fieldValue: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_PRIMARY,
  },
});

export default DuesStatusCard;
