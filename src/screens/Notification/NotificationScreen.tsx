/** @screen DSH-2-PAGE-01-0 알림 목록 */
/**
 * `GET/PATCH /notifications`로 알림을 조회·읽음 처리한다. 항목 탭 시 읽음 처리 후 `targetType`에 따라 해당 상세로 이동한다
 * (`GROUP`은 대응하는 단일 상세 화면이 없어 읽음 처리만 하고 이동은 생략).
 */
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import NotificationListItem from './NotificationListItem';
import * as supportService from '../../services/supportService';
import type { NotificationItem } from '../../services/supportService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  NOTIFICATION_SCREEN_TITLE,
  NOTIFICATION_SETTINGS_ACCESSIBILITY_LABEL,
} from '../../constants/notificationScreenText';
import { FOREGROUND_DISABLED } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SETTINGS_ICON = require('../../assets/icons/system/Setting.png');

const NOTIFICATION_LOADING = '알림을 불러오는 중이에요.';
const NOTIFICATION_EMPTY = '아직 알림이 없어요.';
const NOTIFICATION_RETRY_LABEL = '다시 시도';

type NotificationScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Notification'
>;

type LoadState = 'loading' | 'error' | 'ready';

/** 알림 목록 화면. */
function NotificationScreen() {
  const navigation = useNavigation<NotificationScreenNavigationProp>();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const result = await supportService.getNotifications();
      setNotifications(result);
      setLoadState('ready');
    } catch (error) {
      setErrorMessage(
        isNetworkError(error)
          ? API_NETWORK_ERROR_MESSAGE
          : error instanceof ApiError
          ? getApiErrorMessage(error.code)
          : API_ERROR_DEFAULT_MESSAGE,
      );
      setLoadState('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handlePressSettings = () => {
    navigation.navigate('NotificationSettings');
  };

  const handlePressNotification = async (item: NotificationItem) => {
    setNotifications(current =>
      current.map(notification =>
        notification.id === item.id
          ? { ...notification, readAt: notification.readAt ?? new Date().toISOString() }
          : notification,
      ),
    );
    try {
      await supportService.markNotificationRead(item.id);
    } catch {
      // 읽음 처리 실패는 조용히 무시한다 — 화면 이동 자체를 막을 정도의 문제는 아니다.
    }

    if (item.targetType === 'ENTRY') {
      navigation.navigate('TransactionDetail', { transactionId: item.targetId });
    } else if (item.targetType === 'DUES') {
      navigation.navigate('DuesDetail', { duesId: item.targetId });
    } else if (item.targetType === 'NOTICE') {
      navigation.navigate('NoticeDetail', { noticeId: item.targetId });
    }
    // targetType === 'GROUP'은 대응하는 단일 상세 화면이 없어 읽음 처리만 한다.
  };

  return (
    <ScreenContainer background="secondary">
      <AppBar
        title={NOTIFICATION_SCREEN_TITLE}
        onBackPress={() => navigation.goBack()}
        rightIcons={[
          {
            icon: SETTINGS_ICON,
            onPress: handlePressSettings,
            accessibilityLabel: NOTIFICATION_SETTINGS_ACCESSIBILITY_LABEL,
          },
        ]}
      />

      {loadState === 'loading' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{NOTIFICATION_LOADING}</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <Button
            label={NOTIFICATION_RETRY_LABEL}
            onPress={load}
            hierarchy="secondary"
            style={{ alignSelf: 'center' }}
          />
        </View>
      )}

      {loadState === 'ready' && notifications.length === 0 && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{NOTIFICATION_EMPTY}</Text>
        </View>
      )}

      {loadState === 'ready' && notifications.length > 0 && (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <NotificationListItem
              item={item}
              onPress={() => handlePressNotification(item)}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
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
});

export default NotificationScreen;
