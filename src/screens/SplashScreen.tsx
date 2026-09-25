import { Image, View, StyleSheet } from 'react-native';
import { BASIC_0 } from '../constants/colors';

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
    backgroundColor: BASIC_0,
  },
  image: {
    width: 152,
  },
});

export default SplashScreen;
