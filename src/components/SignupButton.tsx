import { Pressable, StyleSheet, Text } from 'react-native';
import { SocialType } from '../types/social';

type SignupButtonProps = {
  type: SocialType;
  onPress: () => void;
};

/** 소셜 회원가입 버튼: 제공자별 배경색을 입힌 전체 너비 버튼을 보여준다. */
function SignupButton({ type, onPress }: SignupButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        styleByType[type],
        pressed && { opacity: 0.5 },
      ]}
      onPress={onPress}
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
