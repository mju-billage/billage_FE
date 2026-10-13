import { Image, Pressable, StyleSheet } from 'react-native';
import { FOREGROUND_PRIMARY } from '../../../constants/colors';

const CHEVRON_LEFT_ICON = require('../../../assets/icons/nav/Chevron Left.png');

const ICON_SIZE = 24;

type BackButtonProps = {
  onPress: () => void;
};

function BackButton({ onPress }: BackButtonProps) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.button}>
      <Image source={CHEVRON_LEFT_ICON} style={styles.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    tintColor: FOREGROUND_PRIMARY,
  },
});

export default BackButton;
