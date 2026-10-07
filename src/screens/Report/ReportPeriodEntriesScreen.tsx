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
