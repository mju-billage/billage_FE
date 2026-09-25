import { useCallback, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import CardBase from '../../components/Data Display/Card/CardBase';
import Avatar from '../../components/Data Display/Avatar/Avatar';
import Divider from '../../components/Data Display/Divider/Divider';
import Button from '../../components/Input/Button/Button';
import TextButton from '../../components/Input/Button/TextButton';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import * as authService from '../../services/authService';
import type { AuthUserResponse } from '../../services/authService';
import { ApiError } from '../../services/apiClient';
import { formatDateDot } from '../../utils/dueDate';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  MY_PROFILE_ACCOUNT_LABEL,
  MY_PROFILE_EDIT_LABEL,
  MY_PROFILE_JOINED_AT_PREFIX,
  MY_PROFILE_LOADING,
  MY_PROFILE_LOGOUT_CANCEL_LABEL,
  MY_PROFILE_LOGOUT_CONFIRM_LABEL,
  MY_PROFILE_LOGOUT_CONFIRM_TITLE,
  MY_PROFILE_LOGOUT_LABEL,
  MY_PROFILE_PASSWORD_CHANGE_LABEL,
  MY_PROFILE_RETRY_LABEL,
  MY_PROFILE_TITLE,
  MY_PROFILE_WITHDRAW_LABEL,
} from '../../constants/settingsScreenText';
import {
  FOREGROUND_DISABLED,
  FOREGROUND_INVERSE,
  FOREGROUND_NEUTRAL_SUBTLE,
  SOCIAL_KAKAO_YELLOW,
  SOCIAL_NAVER_GREEN,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CHEVRON_RIGHT_ICON = require('../../assets/icons/nav/Chevron Right.png');
const PROFILE_EDIT_ICON = require('../../assets/icons/user/User.png');
const LOCK_ICON = require('../../assets/icons/system/Lock.png');

type MyProfileNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'MyProfile'
>;
type MyProfileRouteProp = RouteProp<RootStackParamList, 'MyProfile'>;

type LoadState = 'loading' | 'error' | 'ready';

const SOCIAL_BADGE_LABEL: Record<string, string> = {
  KAKAO: 'K',
  NAVER: 'N',
  GOOGLE: 'G',
};

const SOCIAL_BADGE_COLOR: Record<string, string> = {
  KAKAO: SOCIAL_KAKAO_YELLOW,
  NAVER: SOCIAL_NAVER_GREEN,
  GOOGLE: FOREGROUND_DISABLED,
};

function SocialBadge({ provider }: { provider: string }) {
  return (
    <View
      style={[
        styles.socialBadge,
        { backgroundColor: SOCIAL_BADGE_COLOR[provider] ?? FOREGROUND_DISABLED },
      ]}
    >
      <Text style={styles.socialBadgeText}>
        {SOCIAL_BADGE_LABEL[provider] ?? '?'}
      </Text>
    </View>
  );
}

function MyProfileScreen() {
  const navigation = useNavigation<MyProfileNavigationProp>();
  const route = useRoute<MyProfileRouteProp>();
  const [profile, setProfile] = useState<AuthUserResponse | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [logoutDialogVisible, setLogoutDialogVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(
    null,
  );

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
          ? getApiErrorMessage(error.code)
          : API_ERROR_DEFAULT_MESSAGE,
      );
      setLoadState('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
      if (route.params?.snackbarMessage) {
        const message = route.params.snackbarMessage;
        setSnackbarMessage(message);
        navigation.setParams({ snackbarMessage: undefined });
        setTimeout(() => setSnackbarMessage(null), 1600);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load, route.params?.snackbarMessage]),
  );

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
    } finally {
      setIsLoggingOut(false);
      setLogoutDialogVisible(false);
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }),
      );
    }
  };

  const isEmailLogin = profile?.loginProvider === 'EMAIL';

  return (
    <ScreenContainer
      background="primary"
      snackbar={
        snackbarMessage ? <Snackbar visible title={snackbarMessage} /> : undefined
      }
    >
      <AppBar
        type="sub"
        title={MY_PROFILE_TITLE}
        onBackPress={() => navigation.goBack()}
      />

      {loadState === 'loading' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{MY_PROFILE_LOADING}</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <Button
            label={MY_PROFILE_RETRY_LABEL}
            onPress={load}
            hierarchy="secondary"
            style={{ alignSelf: 'center' }}
          />
        </View>
      )}

      {loadState === 'ready' && profile && (
        <View style={styles.content}>
          <CardBase style={styles.card}>
            <View style={styles.profileRow}>
              <Avatar
                type={profile.profileImageUrl ? 'image' : 'icon'}
                imageUri={profile.profileImageUrl ?? ''}
              />
              <Text style={styles.profileName}>{profile.name}</Text>
            </View>
            <Divider />
            <MenuRow
              icon={PROFILE_EDIT_ICON}
              label={MY_PROFILE_EDIT_LABEL}
              onPress={() => navigation.navigate('ProfileEdit')}
            />
            {isEmailLogin && (
              <MenuRow
                icon={LOCK_ICON}
                label={MY_PROFILE_PASSWORD_CHANGE_LABEL}
                onPress={() => navigation.navigate('PasswordChange')}
              />
            )}
          </CardBase>

          <CardBase style={styles.accountCard}>
            <Text style={styles.accountLabel}>{MY_PROFILE_ACCOUNT_LABEL}</Text>
            <View style={styles.accountEmailRow}>
              {profile.loginProvider && profile.loginProvider !== 'EMAIL' && (
                <SocialBadge provider={profile.loginProvider} />
              )}
              <Text style={styles.accountEmail}>{profile.email}</Text>
            </View>
            {profile.createdAt && (
              <Text style={styles.joinedAt}>
                {MY_PROFILE_JOINED_AT_PREFIX}
                {formatDateDot(profile.createdAt)}
              </Text>
            )}
          </CardBase>

          <View style={styles.footerRow}>
            <TextButton
              label={MY_PROFILE_LOGOUT_LABEL}
              hierarchy="tertiary"
              onPress={() => setLogoutDialogVisible(true)}
            />
            <TextButton
              label={MY_PROFILE_WITHDRAW_LABEL}
              hierarchy="tertiary"
              onPress={() => navigation.navigate('WithdrawGuide')}
            />
          </View>
        </View>
      )}

      <Dialog
        visible={logoutDialogVisible}
        title={MY_PROFILE_LOGOUT_CONFIRM_TITLE}
        cancelLabel={MY_PROFILE_LOGOUT_CANCEL_LABEL}
        confirmLabel={MY_PROFILE_LOGOUT_CONFIRM_LABEL}
        destructive
        confirmDisabled={isLoggingOut}
        onCancel={() => setLogoutDialogVisible(false)}
        onConfirm={handleLogout}
      />
    </ScreenContainer>
  );
}

function MenuRow({
  icon,
  label,
  onPress,
}: {
  icon: number;
  label: string;
  onPress: () => void;
}) {
  return (
    <CardBase onPress={onPress} style={styles.menuRow}>
      <Image source={icon} style={styles.menuIcon} />
      <Text style={styles.menuLabel}>{label}</Text>
      <Image source={CHEVRON_RIGHT_ICON} style={styles.menuChevron} />
    </CardBase>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 12,
  },
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  profileName: {
    ...TYPOGRAPHY.subtitle2,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 0,
  },
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
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
  accountCard: {
    gap: 4,
  },
  accountLabel: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  accountEmailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accountEmail: {
    ...TYPOGRAPHY.subtitle3,
  },
  joinedAt: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 8,
  },
  socialBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBadgeText: {
    ...TYPOGRAPHY.body3,
    fontWeight: 'bold',
    color: FOREGROUND_INVERSE,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 8,
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

export default MyProfileScreen;
