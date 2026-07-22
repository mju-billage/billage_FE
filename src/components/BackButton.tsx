import { Pressable, StyleSheet, Text } from 'react-native';

type BackButtonProps = {
  onPress: () => void;
};

/** 화면 상단의 뒤로가기 화살표 버튼. */
function BackButton({ onPress }: BackButtonProps) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={styles.button}>
      <Text style={styles.arrow}>‹</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
  },
  arrow: {
    fontSize: 28,
  },
});

export default BackButton;
