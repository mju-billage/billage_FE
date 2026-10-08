import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import SplashScreen from './SplashScreen';
import Button from '../components/Input/Button/Button';
import TextButton from '../components/Input/Button/TextButton';
import ScreenContainer from '../components/Layout/ScreenContainer';
import * as authService from '../services/authService';
import * as groupService from '../services/groupService';
import { getCurrentUser } from '../types/session';
import {
  SESSION_EXPIRED_MESSAGE,
  isSessionExpiredError,
  toUserErrorMessage,
} from '../constants/apiErrorMessages';
import {
  POST_LOGIN_LOAD_ERROR_TITLE,
  POST_LOGIN_LOGOUT_LABEL,
  POST_LOGIN_RETRY_LABEL,
} from '../constants/postLoginScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';

type PostLoginNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PostLogin'
>;

function PostLoginScreen() {
  const navigation = useNavigation<PostLoginNavigationProp>();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErrorMessage(null);
    try {
      if (!getCurrentUser()) {
        await authService.getCurrentUser();
      }
      const groups = await groupService.getMyGroups();
      navigation.reset({
        index: 0,
        routes: [{ name: groups.length > 0 ? 'Main' : 'GroupOnboarding' }],
      });
    } catch (error) {
      if (isSessionExpiredError(error)) {
        await authService.logout().catch(() => undefined);
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login', params: { snackbarMessage: SESSION_EXPIRED_MESSAGE } }],
        });
        return;
      }
      setErrorMessage(toUserErrorMessage(error));
    }
  }, [navigation]);

  useEffect(() => {
    load();
  }, [load]);

  const handleLogout = async () => {
    await authService.logout().catch(() => undefined);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  if (errorMessage === null) {
    return <SplashScreen />;
  }

  return (
    <ScreenContainer background="secondary" edges={['bottom']} style={styles.container}>
      <View style={styles.body}>
        <Text style={styles.title}>{POST_LOGIN_LOAD_ERROR_TITLE}</Text>
        <Text style={styles.message}>{errorMessage}</Text>
      </View>
      <View style={styles.footer}>
        <Button label={POST_LOGIN_RETRY_LABEL} onPress={load} fullWidth />
        <View style={styles.logoutRow}>
          <TextButton
            label={POST_LOGIN_LOGOUT_LABEL}
            hierarchy="tertiary"
            onPress={handleLogout}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.h3,
    textAlign: 'center',
  },
  message: {
    marginTop: 8,
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 24,
  },
  logoutRow: {
    marginTop: 12,
    alignItems: 'center',
  },
});

export default PostLoginScreen;
