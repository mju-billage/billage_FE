import { Pressable, StyleSheet, Text } from 'react-native';
import { SocialType } from '../types/social';

type SignupButtonProps = {
  type: SocialType;
  onClick: () => void;
};

function SignupButton({ type, onClick }: SignupButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styleByType[type],
        pressed && { opacity: 0.5 },
      ]}
      onPress={onClick}
    >
      <Text>{type}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 300,
    height: 40,
  },
  naver: {
    backgroundColor: 'green',
  },
  kakao: {
    backgroundColor: 'yellow',
  },
  google: {
    backgroundColor: 'gray',
  },
});

const styleByType = {
  Naver: styles.naver,
  Kakao: styles.kakao,
  Google: styles.google,
};

export default SignupButton;
