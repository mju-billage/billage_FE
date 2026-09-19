/** @screen ETC-3-PAGE-07-0 내 프로필 */
/** @screen ETC-4-MODAL-04-0 로그아웃 (logoutDialogVisible) */
/** @screen ETC-5-SNACKBAR-06-0 프로필 변경 완료 (route.params.snackbarMessage로 전달받아 렌더링 — ProfileEditScreen.tsx 참고) */
/** @screen ETC-5-SNACKBAR-07-0 비밀번호 변경 완료 (route.params.snackbarMessage로 전달받아 렌더링 — PasswordChangeScreen.tsx 참고) */
/**
 * "내 프로필": 계정 카드(읽기 전용) + 프로필 변경/비밀번호 변경 진입 +
 * 로그인 계정 정보 + 로그아웃/회원탈퇴.
 *
 * `loginProvider`가 `EMAIL`이 아니면(카카오/네이버/구글) "비밀번호 변경"
 * 메뉴 자체를 숨긴다 — 소셜 계정엔 앱 비밀번호가 없어서다(User.txt 정책
 * 메모, `PATCH /auth/password`도 서버가 `PASSWORD_CHANGE_NOT_ALLOWED`로
 * 같은 걸 막는다).
 *
 * ⚠️ 시안(글로벌설정_내프로필.png) UI 요소 4번은 "전화번호"도 계정 정보
 * 카드에 보여주지만, `GET /auth/me` 응답엔 전화번호 필드가 아예 없다
 * (User.txt 1번 성공 응답 스키마 확인) — 표시할 데이터가 없어 그 행은
 * 만들지 않았다(`docs/backend-requests.md`에 기록).
 *
 * "회원탈퇴"는 시안상 별도 "회원탈퇴 뎁스"(COM 도메인, `WithdrawGuideScreen`부터
 * 시작)로 이동한다 — 서버 API(`DELETE /auth/me`)는 아직 `미구현`이라 그 플로우
 * 끝(최종 확인 모달)에서 호출하면 에러 상태가 뜨는 게 정상이다.
 */
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

/** "내 프로필": 프로필 변경/비밀번호 변경 진입 + 로그인 계정 정보 + 로그아웃/회원탈퇴. */
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
    paddingHorizontal: 24,
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
