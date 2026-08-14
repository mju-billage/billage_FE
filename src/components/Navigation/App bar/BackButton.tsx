import { Pressable, StyleSheet, View } from 'react-native';
import { FOREGROUND_PRIMARY } from '../../../constants/colors';

type BackButtonProps = {
  onPress: () => void;
  size?: number;
};

/** 화면 상단의 뒤로가기 화살표 버튼. */
function BackButton({ onPress, size = 28 }: BackButtonProps) {
  const chevronSize = size * 0.42;
  const strokeWidth = size * 0.1;

  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.button}>
      <View
        style={[
          styles.chevron,
          {
            width: chevronSize,
            height: chevronSize,
            borderLeftWidth: strokeWidth,
            borderBottomWidth: strokeWidth,
          },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    borderColor: FOREGROUND_PRIMARY,
    transform: [{ rotate: '45deg' }],
  },
});

export default BackButton;
