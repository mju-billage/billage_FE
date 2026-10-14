import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import ScreenContainer from '../../components/Layout/ScreenContainer';
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
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <ScreenContainer background="secondary">
      <AppBar
        type="sub"
        title={PASSWORD_RESET_TITLE}
        onBackPress={() => navigation.goBack()}
      />
      <View style={styles.body}>
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  message: {
    ...TYPOGRAPHY.subtitle1,
    marginBottom: 32,
  },
});

export default PasswordResetSentScreen;
