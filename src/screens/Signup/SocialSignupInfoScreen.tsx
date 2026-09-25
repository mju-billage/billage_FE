import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import TextField from '../../components/Input/Text Field/TextField';
import Button from '../../components/Input/Button/Button';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { ApiError } from '../../services/apiClient';
import * as authService from '../../services/authService';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  SIGNUP_INFO_TITLE,
  SIGNUP_NAME_LABEL,
  SIGNUP_NAME_PLACEHOLDER,
  SIGNUP_EMAIL_LABEL,
  SIGNUP_EMAIL_PLACEHOLDER,
  SIGNUP_EMAIL_ALREADY_EXISTS_ERROR,
  SOCIAL_SIGNUP_GENERIC_ERROR,
  SOCIAL_SIGNUP_NAME_MAX_LENGTH,
  SOCIAL_SIGNUP_NAME_TOO_LONG_ERROR,
  SOCIAL_SIGNUP_SUBMIT_LABEL,
} from '../../constants/signupInfoText';

type SocialSignupInfoNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SocialSignupInfo'
>;

type SocialSignupInfoRouteProp = RouteProp<
  RootStackParamList,
  'SocialSignupInfo'
>;

function SocialSignupInfoScreen() {
  const navigation = useNavigation<SocialSignupInfoNavigationProp>();
  const { profile, agreements } = useRoute<SocialSignupInfoRouteProp>().params;
  const [name, setName] = useState(profile.name.slice(0, SOCIAL_SIGNUP_NAME_MAX_LENGTH));
  const email = profile.email;
  const [signupError, setSignupError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isNameTooLong = name.length > SOCIAL_SIGNUP_NAME_MAX_LENGTH;
  const canProceed = name.trim().length > 0 && !isNameTooLong;

  const handleNext = async () => {
    setSignupError(undefined);
    setIsSubmitting(true);
    try {
      await authService.socialSignup({
        provider: profile.provider,
        providerToken: profile.providerToken,
        name,
        termsAgreed:
          agreements.termsOfService && agreements.privacyPolicy && agreements.ageOver14,
      });
      navigation.navigate('SignupComplete');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'EMAIL_ALREADY_EXISTS') {
        setSignupError(SIGNUP_EMAIL_ALREADY_EXISTS_ERROR);
      } else {
        setSignupError(SOCIAL_SIGNUP_GENERIC_ERROR);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer background="secondary" edges={['bottom']} style={styles.container}>
      <View style={styles.backRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <ScrollView
        style={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{SIGNUP_INFO_TITLE}</Text>
        <View style={styles.header}>
          <TextField
            label={SIGNUP_NAME_LABEL}
            required
            value={name}
            onChangeText={setName}
            placeholder={SIGNUP_NAME_PLACEHOLDER}
            error={isNameTooLong ? SOCIAL_SIGNUP_NAME_TOO_LONG_ERROR : undefined}
          />
          <TextField
            label={SIGNUP_EMAIL_LABEL}
            required
            value={email}
            onChangeText={() => {}}
            placeholder={SIGNUP_EMAIL_PLACEHOLDER}
            error={signupError}
            disabled
          />
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button
          label={SOCIAL_SIGNUP_SUBMIT_LABEL}
          onPress={handleNext}
          fullWidth
          disabled={!canProceed || isSubmitting}
        />
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
  scroll: {
    flex: 1,
  },
  backRow: {
    marginBottom: 16,
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginBottom: 8,
  },
  header: {
    marginTop: 24,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
});

export default SocialSignupInfoScreen;
