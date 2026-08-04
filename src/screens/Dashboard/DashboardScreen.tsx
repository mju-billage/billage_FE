import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList } from '../../navigation/MainTabNavigator';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import FAB from '../../components/Button/FAB';
import IconButton from '../../components/Button/IconButton';
import MiniCalendarCard from './MiniCalendarCard';
import DuesProgressCard from '../../components/DataDisplay/DuesProgressCard';
import QuickServiceCard from './QuickServiceCard';
import { MOCK_DASHBOARD_SUMMARY } from '../../types/dashboard';
import {
  DASHBOARD_DUES_SECTION_TITLE,
  DASHBOARD_NOTIFICATION_ACCESSIBILITY_LABEL,
  DASHBOARD_QUICK_SERVICE_SUBTITLE_SUFFIX,
  DASHBOARD_QUICK_SERVICE_TITLE,
} from '../../constants/dashboardScreenText';
import {
  BACKGROUND_PRIMARY,
  FOREGROUND_NEUTRAL_NORMAL,
} from '../../constants/colors';

const BELL_ICON = require('../../assets/icons/communication/Bell.png');

type DashboardScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

/** 홈 탭 대시보드 화면: 회비 진행 현황과 빠른 서비스 진입점을 보여준다. */
function DashboardScreen() {
  const navigation = useNavigation<DashboardScreenNavigationProp>();
  const summary = MOCK_DASHBOARD_SUMMARY;

  const handlePressNotification = () => {
    navigation.navigate('Notification');
  };

  const handlePressMiniCalendar = () => {
    navigation.navigate('Calendar');
  };

  const handlePressAddTransaction = () => {
    // TODO: 내역 추가(ADD) 화면 구현 후 연결
  };

  const handlePressQuickService = () => {
    // TODO: 보고서 생성 / 통계·분석(DSH-2-PAGE-05-0) / 증빙자료 앨범 화면 구현 후 연결
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.headerRow}>
          <Text style={styles.nickname}>{summary.userNickname}</Text>
          <IconButton
            icon={BELL_ICON}
            onPress={handlePressNotification}
            accessibilityLabel={DASHBOARD_NOTIFICATION_ACCESSIBILITY_LABEL}
          />
        </View>

        <MiniCalendarCard
          data={summary.miniCalendar}
          onPress={handlePressMiniCalendar}
        />

        <Text style={styles.sectionTitle}>{DASHBOARD_DUES_SECTION_TITLE}</Text>
        <FlatList
          horizontal
          data={summary.duesProgressList}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <DuesProgressCard type="dashboard" progress={item} />
          )}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.duesListContent}
        />

        <Text style={styles.quickServiceSubtitle}>
          {summary.userNickname} {DASHBOARD_QUICK_SERVICE_SUBTITLE_SUFFIX}
        </Text>
        <Text style={styles.sectionTitle}>{DASHBOARD_QUICK_SERVICE_TITLE}</Text>
        <View style={styles.quickServiceRow}>
          {summary.quickServices.map(item => (
            <QuickServiceCard
              key={item.id}
              item={item}
              onPress={handlePressQuickService}
            />
          ))}
        </View>
      </ScrollView>
      <FAB onPress={handlePressAddTransaction} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BACKGROUND_PRIMARY,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  nickname: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
  },
  duesListContent: {
    gap: 12,
  },
  quickServiceSubtitle: {
    fontSize: 14,
    color: FOREGROUND_NEUTRAL_NORMAL,
    marginTop: 32,
  },
  quickServiceRow: {
    flexDirection: 'row',
    gap: 12,
  },
});

export default DashboardScreen;
