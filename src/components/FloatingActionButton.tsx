import { Image, Pressable, StyleSheet } from 'react-native';
import { NAVY } from '../constants/colors';

type FloatingActionButtonProps = {
  onPress: () => void;
};

const ICON = require('../assets/icons/content/DocumentAdd.png');
const SIZE = 56;

/** 화면 우하단에 고정되는 원형 추가 버튼(FAB). */
function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Image source={ICON} style={styles.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    backgroundColor: NAVY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
  },
});

export default FloatingActionButton;
