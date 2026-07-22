import { useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import SocialIconButton from '../components/SocialIconButton';
import { SocialType } from '../types/social';

type LoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Login'
>;

function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // TODO: 로그인 API 연동 필요
  };

  const handleSocialLogin = (_type: SocialType) => {
    // TODO: 소셜 로그인 API 연동 필요
  };

  const handleFindPassword = () => {
    // TODO: 비밀번호 찾기 화면 연동 필요
  };

  const handleGoToSignup = () => {
    navigation.navigate('Signup');
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/Billage_logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="비밀번호"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <Pressable
        style={({ pressed }) => [
          styles.loginButton,
          pressed && { opacity: 0.8 },
        ]}
        onPress={handleLogin}
      >
        <Text style={styles.loginButtonText}>로그인하기</Text>
      </Pressable>

      <View style={styles.linkRow}>
        <Pressable onPress={handleFindPassword}>
          <Text style={styles.linkText}>비밀번호를 잊으셨나요?</Text>
        </Pressable>
        <Pressable onPress={handleGoToSignup}>
          <Text style={styles.linkText}>회원가입하기</Text>
        </Pressable>
      </View>

      <View style={styles.socialRow}>
        <SocialIconButton
          type="Kakao"
          onPress={() => handleSocialLogin('Kakao')}
        />
        <SocialIconButton
          type="Naver"
          onPress={() => handleSocialLogin('Naver')}
        />
        <SocialIconButton
          type="Google"
          onPress={() => handleSocialLogin('Google')}
        />
      </View>
    </View>
  );
}

const NAVY = '#12184C';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  logo: {
    width: 140,
    marginBottom: 48,
  },
  form: {
    width: '100%',
  },
  input: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#D9D9D9',
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    height: 52,
    borderRadius: 8,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 20,
  },
  linkText: {
    fontSize: 13,
    color: '#4A4A4A',
    textDecorationLine: 'underline',
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 40,
  },
});

export default LoginScreen;
