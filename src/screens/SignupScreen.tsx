import { Image, StyleSheet, View } from 'react-native';
import SignupButton from '../components/SignupButton';
import { SocialType } from '../types/social';

/** 회원가입 화면: 로고와 소셜 회원가입 버튼 목록을 보여준다. */
function SignupScreen() {
  const handleSocialSignup = (_type: SocialType) => {
    // TODO: 소셜 회원가입 API 연동 필요
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/Billage_logo_big.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View />
      <View />
      <View>
        <SignupButton
          type="Naver"
          onPress={() => handleSocialSignup('Naver')}
        />
        <SignupButton
          type="Kakao"
          onPress={() => handleSocialSignup('Kakao')}
        />
        <SignupButton
          type="Google"
          onPress={() => handleSocialSignup('Google')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 152,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});

export default SignupScreen;
