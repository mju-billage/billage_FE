import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
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
    <ScreenContainer background="secondary">
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
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
