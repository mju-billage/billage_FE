import { Image, Pressable, StyleSheet } from 'react-native';
import { FOREGROUND_PRIMARY } from '../../../constants/colors';

const CHEVRON_LEFT_ICON = require('../../../assets/icons/nav/Chevron Left.png');

type BackButtonProps = {
  onPress: () => void;
  size?: number;
};

/** 화면 상단의 뒤로가기 화살표 버튼. */
function BackButton({ onPress, size = 28 }: BackButtonProps) {
  const iconSize = size * 0.6;

  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.button}>
      <Image
        source={CHEVRON_LEFT_ICON}
        style={[styles.icon, { width: iconSize, height: iconSize }]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    tintColor: FOREGROUND_PRIMARY,
  },
});

export default BackButton;
