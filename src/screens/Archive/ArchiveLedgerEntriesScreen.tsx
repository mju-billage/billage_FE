import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import AmountCard from '../../components/Data Display/Card/AmountCard';
import ReportEntryList from '../Report/ReportEntryList';
import type { ArchivedEntry } from '../../types/archive';
import { formatDateDot } from '../../utils/dueDate';
import { REPORT_DETAIL_PERIOD_LABEL } from '../../constants/reportScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type ArchiveLedgerEntriesNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ArchiveLedgerEntriesRouteProp = RouteProp<RootStackParamList, 'ArchiveLedgerEntries'>;

function ArchiveLedgerEntriesScreen() {
  const navigation = useNavigation<ArchiveLedgerEntriesNavigationProp>();
  const route = useRoute<ArchiveLedgerEntriesRouteProp>();
  const { ledgerName, startDate, endDate, totalIncome, totalExpense, entries } = route.params;

  return (
    <ScreenContainer
      background="primary"
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
          navigation.navigate('ArchiveEntryDetail', {
            ledgerName,
            entry: entry as unknown as ArchivedEntry & { ledgerName: string },
          })
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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

export default ArchiveLedgerEntriesScreen;
