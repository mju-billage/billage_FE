import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import TextField from '../../components/Input/Text Field/TextField';
import Button from '../../components/Input/Button/Button';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { isValidEmail } from '../../utils/validators';
import * as authService from '../../services/authService';
import { toUserErrorMessage } from '../../constants/apiErrorMessages';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  PASSWORD_RESET_TITLE,
  PASSWORD_RESET_SUBTITLE,
  PASSWORD_RESET_EMAIL_PLACEHOLDER,
  PASSWORD_RESET_SUBMIT_LABEL,
} from '../../constants/passwordResetText';

type PasswordResetNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PasswordReset'
>;

function PasswordResetScreen() {
  const navigation = useNavigation<PasswordResetNavigationProp>();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async () => {
    if (!isValidEmail(email) || isSubmitting) {
      return;
    }
    setError(undefined);
    setIsSubmitting(true);
    try {
      await authService.requestPasswordReset(email);
      navigation.navigate('PasswordResetSent', { email });
    } catch (err) {
      setError(toUserErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer background="secondary">
      <AppBar
        type="sub"
        title={PASSWORD_RESET_TITLE}
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.body}>
        <Text style={styles.subtitle}>{PASSWORD_RESET_SUBTITLE}</Text>

        <TextField
          value={email}
          onChangeText={text => {
            setEmail(text);
            setError(undefined);
          }}
          placeholder={PASSWORD_RESET_EMAIL_PLACEHOLDER}
          error={error}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Button
          label={PASSWORD_RESET_SUBMIT_LABEL}
          onPress={handleSend}
          fullWidth
          disabled={!isValidEmail(email) || isSubmitting}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  subtitle: {
    ...TYPOGRAPHY.subtitle1,
    marginBottom: 32,
  },
});

export default PasswordResetScreen;
