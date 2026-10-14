import { useCallback, useState } from 'react';
import { BackHandler, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import Button from '../../components/Input/Button/Button';
import TextButton from '../../components/Input/Button/TextButton';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import JoinGroupSheet from '../GroupManager/JoinGroupSheet';
import * as authService from '../../services/authService';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  SIGNUP_COMPLETE_TITLE,
  SIGNUP_COMPLETE_SUBTITLE,
  SIGNUP_COMPLETE_CREATE_GROUP_LABEL,
  SIGNUP_COMPLETE_JOIN_WITH_CODE_LABEL,
} from '../../constants/signupCompleteScreenText';
import {
  GROUP_ONBOARDING_SUBTITLE,
  GROUP_ONBOARDING_TITLE,
  POST_LOGIN_LOGOUT_LABEL,
} from '../../constants/postLoginScreenText';

type SignupCompleteNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SignupComplete' | 'GroupOnboarding'
>;
type SignupCompleteRouteProp = RouteProp<
  RootStackParamList,
  'SignupComplete' | 'GroupOnboarding'
>;

function SignupCompleteScreen() {
  const navigation = useNavigation<SignupCompleteNavigationProp>();
  const route = useRoute<SignupCompleteRouteProp>();
  const isOnboarding = route.name === 'GroupOnboarding';
  const [joinSheetVisible, setJoinSheetVisible] = useState(false);

  const handleLogout = useCallback(async () => {
    await authService.logout().catch(() => undefined);
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      if (isOnboarding) {
        return undefined;
      }
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        () => {
          handleLogout();
          return true;
        },
      );
      return () => subscription.remove();
    }, [isOnboarding, handleLogout]),
  );

  const handleCreateGroup = () => {
    navigation.navigate('GroupCreate');
  };

  const handleJoinWithCode = () => {
    setJoinSheetVisible(true);
  };

  return (
    <ScreenContainer background="secondary" edges={['bottom']} style={styles.container}>
      <View style={styles.backRow}>
        {!isOnboarding && <BackButton onPress={handleLogout} />}
      </View>
      <Text style={styles.title}>
        {isOnboarding ? GROUP_ONBOARDING_TITLE : SIGNUP_COMPLETE_TITLE}
      </Text>
      <Text style={styles.subtitle}>
        {isOnboarding ? GROUP_ONBOARDING_SUBTITLE : SIGNUP_COMPLETE_SUBTITLE}
      </Text>

      <View style={styles.footer}>
        <Button
          label={SIGNUP_COMPLETE_CREATE_GROUP_LABEL}
          onPress={handleCreateGroup}
          fullWidth
        />
        <View style={styles.buttonGap} />
        <Button
          label={SIGNUP_COMPLETE_JOIN_WITH_CODE_LABEL}
          onPress={handleJoinWithCode}
          hierarchy="tertiary"
          fullWidth
        />
        {isOnboarding && (
          <View style={styles.logoutRow}>
            <TextButton
              label={POST_LOGIN_LOGOUT_LABEL}
              hierarchy="tertiary"
              onPress={handleLogout}
            />
          </View>
        )}
      </View>

      <JoinGroupSheet
        visible={joinSheetVisible}
        onClose={() => setJoinSheetVisible(false)}
        onJoined={() => {
          setJoinSheetVisible(false);
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backRow: {
    marginBottom: 32,
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.subtitle4,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginBottom: 32,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
  buttonGap: {
    height: 12,
  },
  logoutRow: {
    marginTop: 12,
    alignItems: 'center',
  },
});

export default SignupCompleteScreen;
