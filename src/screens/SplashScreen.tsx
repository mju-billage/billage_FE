import { Image, View, StyleSheet } from 'react-native';

/** 스플래시 화면: 앱 초기 로딩 동안 로고만 보여준다. */
function SplashScreen() {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/Billage_logo_big.png')}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 152,
  },
});

export default SplashScreen;
