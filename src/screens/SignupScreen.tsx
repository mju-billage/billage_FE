import { Image, StyleSheet, View } from 'react-native';
import SignupButton from '../components/SignupButton';

function SignupScreen() {
  const handleSocialSignup = () => {
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
        <SignupButton type="Naver" onClick={handleSocialSignup} />
        <SignupButton type="Kakao" onClick={handleSocialSignup} />
        <SignupButton type="Google" onClick={handleSocialSignup} />
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
