import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/AppBar';
import NotificationListItem from './NotificationListItem';
import { MOCK_NOTIFICATIONS } from '../../types/notification';
import {
  NOTIFICATION_SCREEN_TITLE,
  NOTIFICATION_SETTINGS_ACCESSIBILITY_LABEL,
} from '../../constants/notificationScreenText';
import { BACKGROUND_SECONDARY } from '../../constants/colors';

const SETTINGS_ICON = require('../../assets/icons/system/Setting.png');

type NotificationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Notification'
>;

/** 알림 목록 화면. */
function NotificationScreen() {
  const navigation = useNavigation<NotificationScreenNavigationProp>();

  const handlePressSettings = () => {
    // TODO: 알림 설정 화면 구현 후 연결
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar
        title={NOTIFICATION_SCREEN_TITLE}
        onBackPress={() => navigation.goBack()}
        rightIcon={SETTINGS_ICON}
        onRightPress={handlePressSettings}
        rightAccessibilityLabel={NOTIFICATION_SETTINGS_ACCESSIBILITY_LABEL}
      />
      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <NotificationListItem item={item} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND_SECONDARY,
  },
});

export default NotificationScreen;
