/** @screen ETC-3-PAGE-08-0 알림 설정 */
/**
 * 명세(Notification & Support.txt A-3)는 토글 6종을 모임과 무관한 "사용자 단위"
 * 설정이라고 하지만, 시안은 "일반/총무" 2종으로 화면을 나눈다(승인 요청·납부 관리
 * 토글은 총무 화면에만 있음). 두 화면 모두 같은 API·같은 데이터라 새 라우트가
 * 아니라 이 화면 하나의 권한 분기로 구현했다.
 *
 * 이 앱은 모임마다 권한(`OWNER`/`MEMBER`)이 다를 수 있어 "지금 총무인지"를 전역
 * 하나로 정하기 애매하다 — 다른 화면들(`MemberManageScreen` 등)이 쓰는
 * `getActiveGroup()?.myRole`(지금 보고 있는 모임 기준)을 그대로 재사용했다.
 * 활성 모임이 아직 없으면(캐시 미충전) 안전한 쪽인 "일반"으로 보여준다.
 */
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Switch from '../../components/Input/Control/Switch';
import Button from '../../components/Input/Button/Button';
import { getActiveGroup } from '../../types/group';
import * as supportService from '../../services/supportService';
import type { NotificationSettings } from '../../services/supportService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  NOTIFICATION_SETTINGS_APPROVAL_DESCRIPTION,
  NOTIFICATION_SETTINGS_APPROVAL_LABEL,
  NOTIFICATION_SETTINGS_DUES_DESCRIPTION,
  NOTIFICATION_SETTINGS_DUES_LABEL,
  NOTIFICATION_SETTINGS_GROUP_ACTIVITY_DESCRIPTION,
  NOTIFICATION_SETTINGS_GROUP_ACTIVITY_LABEL,
  NOTIFICATION_SETTINGS_LOADING,
  NOTIFICATION_SETTINGS_MARKETING_DESCRIPTION,
  NOTIFICATION_SETTINGS_MARKETING_LABEL,
  NOTIFICATION_SETTINGS_NIGHT_TIME_DESCRIPTION,
  NOTIFICATION_SETTINGS_NIGHT_TIME_LABEL,
  NOTIFICATION_SETTINGS_NOTICE_DESCRIPTION,
  NOTIFICATION_SETTINGS_NOTICE_LABEL,
  NOTIFICATION_SETTINGS_RETRY_LABEL,
  NOTIFICATION_SETTINGS_TITLE,
  NOTIFICATION_SETTINGS_UPDATE_ERROR,
} from '../../constants/settingsScreenText';
import {
  FEEDBACK_NEGATIVE_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type NotificationSettingsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'NotificationSettings'
>;

type LoadState = 'loading' | 'error' | 'ready';

type ToggleRow = {
  key: keyof NotificationSettings;
  label: string;
  description: string;
  /** 총무 전용 토글(승인 요청/납부 관리) — 일반 회원 화면에서는 숨긴다. */
  ownerOnly?: boolean;
};

const TOGGLE_ROWS: ToggleRow[] = [
  {
    key: 'groupActivity',
    label: NOTIFICATION_SETTINGS_GROUP_ACTIVITY_LABEL,
    description: NOTIFICATION_SETTINGS_GROUP_ACTIVITY_DESCRIPTION,
  },
  {
    key: 'approval',
    label: NOTIFICATION_SETTINGS_APPROVAL_LABEL,
    description: NOTIFICATION_SETTINGS_APPROVAL_DESCRIPTION,
    ownerOnly: true,
  },
  {
    key: 'dues',
    label: NOTIFICATION_SETTINGS_DUES_LABEL,
    description: NOTIFICATION_SETTINGS_DUES_DESCRIPTION,
    ownerOnly: true,
  },
  {
    key: 'noticeAndUpdate',
    label: NOTIFICATION_SETTINGS_NOTICE_LABEL,
    description: NOTIFICATION_SETTINGS_NOTICE_DESCRIPTION,
  },
  {
    key: 'marketing',
    label: NOTIFICATION_SETTINGS_MARKETING_LABEL,
    description: NOTIFICATION_SETTINGS_MARKETING_DESCRIPTION,
  },
  {
    key: 'nightTime',
    label: NOTIFICATION_SETTINGS_NIGHT_TIME_LABEL,
    description: NOTIFICATION_SETTINGS_NIGHT_TIME_DESCRIPTION,
  },
];

/** 알림 설정: 토글 6종(승인 요청/납부 관리는 총무만), 누르는 즉시 저장. */
function NotificationSettingsScreen() {
  const navigation = useNavigation<NotificationSettingsNavigationProp>();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [updateErrorKey, setUpdateErrorKey] = useState<keyof NotificationSettings | null>(
    null,
  );

  const viewerIsOwner = getActiveGroup()?.myRole === 'OWNER';

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
      const result = await supportService.getNotificationSettings();
      setSettings(result);
      setLoadState('ready');
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleToggle = async (key: keyof NotificationSettings, value: boolean) => {
    if (!settings) {
      return;
    }
    const previous = settings;
    setUpdateErrorKey(null);
    setSettings({ ...settings, [key]: value });
    try {
      const result = await supportService.updateNotificationSettings({ [key]: value });
      setSettings(result);
    } catch {
      setSettings(previous);
      setUpdateErrorKey(key);
    }
  };

  const visibleRows = TOGGLE_ROWS.filter(row => viewerIsOwner || !row.ownerOnly);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar
        type="sub"
        title={NOTIFICATION_SETTINGS_TITLE}
        onBackPress={() => navigation.goBack()}
      />

      {loadState === 'loading' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{NOTIFICATION_SETTINGS_LOADING}</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <Button
            label={NOTIFICATION_SETTINGS_RETRY_LABEL}
            onPress={load}
            hierarchy="secondary"
            style={{ alignSelf: 'center' }}
          />
        </View>
      )}

      {loadState === 'ready' && settings && (
        <ScrollView contentContainerStyle={styles.content}>
          {visibleRows.map(row => (
            <View key={row.key} style={styles.row}>
              <View style={styles.rowText}>
                <Text style={styles.rowLabel}>{row.label}</Text>
                <Text style={styles.rowDescription}>{row.description}</Text>
                {updateErrorKey === row.key && (
                  <Text style={styles.rowError}>{NOTIFICATION_SETTINGS_UPDATE_ERROR}</Text>
                )}
              </View>
              <Switch
                value={settings[row.key]}
                onValueChange={value => handleToggle(row.key, value)}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowText: {
    flex: 1,
    gap: 4,
  },
  rowLabel: {
    ...TYPOGRAPHY.subtitle3,
  },
  rowDescription: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  rowError: {
    ...TYPOGRAPHY.body3,
    color: FEEDBACK_NEGATIVE_BOLD,
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
});

export default NotificationSettingsScreen;
