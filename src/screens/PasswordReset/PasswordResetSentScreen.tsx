import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import Button from '../../components/Input/Button/Button';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  PASSWORD_RESET_TITLE,
  PASSWORD_RESET_SENT_MESSAGE_SUFFIX,
  PASSWORD_RESET_BACK_TO_LOGIN_LABEL,
} from '../../constants/passwordResetText';

type PasswordResetSentNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PasswordResetSent'
>;
type PasswordResetSentRouteProp = RouteProp<
  RootStackParamList,
  'PasswordResetSent'
>;

function PasswordResetSentScreen() {
  const navigation = useNavigation<PasswordResetSentNavigationProp>();
  const { params } = useRoute<PasswordResetSentRouteProp>();

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.backRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <Text style={styles.title}>{PASSWORD_RESET_TITLE}</Text>
      <Text style={styles.message}>
        {params.email}
        {PASSWORD_RESET_SENT_MESSAGE_SUFFIX}
      </Text>

      <Button
        label={PASSWORD_RESET_BACK_TO_LOGIN_LABEL}
        onPress={handleBackToLogin}
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backRow: {
    marginBottom: 16,
  },
  title: {
    ...TYPOGRAPHY.h3,
    marginBottom: 24,
  },
  message: {
    ...TYPOGRAPHY.body1,
    marginBottom: 24,
  },
});

export default PasswordResetSentScreen;
