import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import CardBase from '../../components/Data Display/Card/CardBase';
import Avatar from '../../components/Data Display/Avatar/Avatar';
import Button from '../../components/Input/Button/Button';
import ToolsMenu from '../../components/Navigation/Menu/ToolsMenu';
import * as authService from '../../services/authService';
import type { AuthUserResponse } from '../../services/authService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  SETTINGS_APP_VERSION_LABEL,
  SETTINGS_INQUIRY_LABEL,
  SETTINGS_LOADING,
  SETTINGS_NOTICE_LABEL,
  SETTINGS_NOTIFICATION_LABEL,
  SETTINGS_RETRY_LABEL,
  SETTINGS_SUPPORT_SECTION_TITLE,
  SETTINGS_TERMS_LABEL,
  SETTINGS_TITLE,
} from '../../constants/settingsScreenText';
import {
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_NORMAL,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
const { version: APP_VERSION } = require('../../../package.json');

const BELL_ICON = require('../../assets/icons/communication/Bell.png');
const CHEVRON_RIGHT_ICON = require('../../assets/icons/nav/Chevron Right.png');
const NOTICE_ICON = require('../../assets/icons/communication/Notice.png');
const INQUIRY_ICON = require('../../assets/icons/communication/Contact.png');
const TERMS_ICON = require('../../assets/icons/user/Privacy Policy.png');
const VERSION_ICON = require('../../assets/icons/system/Version.png');

type SettingsNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;

type LoadState = 'loading' | 'error' | 'ready';

function SettingsScreen() {
  const navigation = useNavigation<SettingsNavigationProp>();
  const [profile, setProfile] = useState<AuthUserResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const result = await authService.getCurrentUser();
      setProfile(result);
      setLoadState('ready');
    } catch (error) {
      setErrorMessage(
        isNetworkError(error)
          ? API_NETWORK_ERROR_MESSAGE
          : error instanceof ApiError
          ? getApiErrorMessage(error.code, error.message)
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

  return (
    <ScreenContainer background="primary">
      <AppBar
        type="sub"
        title={SETTINGS_TITLE}
        onBackPress={() => navigation.goBack()}
      />

      {loadState === 'loading' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{SETTINGS_LOADING}</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <Button
            label={SETTINGS_RETRY_LABEL}
            onPress={load}
            hierarchy="secondary"
            style={{ alignSelf: 'center' }}
          />
        </View>
      )}

      {loadState === 'ready' && profile && (
        <View style={styles.content}>
          <CardBase
            onPress={() => navigation.navigate('MyProfile')}
            style={styles.profileRow}
          >
            <Avatar
              type={profile.profileImageUrl ? 'image' : 'icon'}
              imageUri={profile.profileImageUrl ?? ''}
            />
            <Text style={styles.profileName}>{profile.name}</Text>
          </CardBase>

          <CardBase onPress={() => navigation.navigate('NotificationSettings')}>
            <Pressable style={styles.menuRow}>
              <Image source={BELL_ICON} style={styles.menuIcon} />
              <Text style={styles.menuLabel}>{SETTINGS_NOTIFICATION_LABEL}</Text>
              <Image source={CHEVRON_RIGHT_ICON} style={styles.menuChevron} />
            </Pressable>
          </CardBase>

          <CardBase style={styles.supportCard}>
            <ToolsMenu
              flush
              sections={[
                {
                  title: SETTINGS_SUPPORT_SECTION_TITLE,
                  items: [
                    {
                      key: 'notice',
                      icon: NOTICE_ICON,
                      label: SETTINGS_NOTICE_LABEL,
                      onPress: () => navigation.navigate('NoticeList'),
                    },
                    {
                      key: 'inquiry',
                      icon: INQUIRY_ICON,
                      label: SETTINGS_INQUIRY_LABEL,
                      onPress: () => navigation.navigate('Inquiry'),
                    },
                    {
                      key: 'terms',
                      icon: TERMS_ICON,
                      label: SETTINGS_TERMS_LABEL,
                      onPress: () => navigation.navigate('Terms'),
                    },
                    {
                      key: 'version',
                      icon: VERSION_ICON,
                      label: SETTINGS_APP_VERSION_LABEL,
                      tag: `v${APP_VERSION}`,
                      onPress: () => {},
                    },
                  ],
                },
              ]}
            />
          </CardBase>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileName: {
    ...TYPOGRAPHY.subtitle2,
  },
  supportCard: {
    paddingTop: 16,
    paddingBottom: 4,
    paddingHorizontal: 12,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: FOREGROUND_NEUTRAL_NORMAL,
  },
  menuLabel: {
    ...TYPOGRAPHY.subtitle3,
    flex: 1,
  },
  menuChevron: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_DISABLED,
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

export default SettingsScreen;
