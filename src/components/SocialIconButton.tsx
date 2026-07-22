import { Pressable, StyleSheet, Text } from 'react-native';
import { SocialType } from '../types/social';

type SocialIconButtonProps = {
  type: SocialType;
  onPress: () => void;
};

function SocialIconButton({ type, onPress }: SocialIconButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.circle,
        styleByType[type],
        pressed && { opacity: 0.5 },
      ]}
      onPress={onPress}
    >
      <Text style={[styles.label, labelStyleByType[type]]}>
        {initialByType[type]}
      </Text>
    </Pressable>
  );
}

const CIRCLE_SIZE = 48;

const styles = StyleSheet.create({
  circle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  naver: {
    backgroundColor: '#03C75A',
  },
  kakao: {
    backgroundColor: '#FEE500',
  },
  google: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  naverLabel: {
    color: '#FFFFFF',
  },
  kakaoLabel: {
    color: '#3C1E1E',
  },
  googleLabel: {
    color: '#4A4A4A',
  },
});

const styleByType = {
  Naver: styles.naver,
  Kakao: styles.kakao,
  Google: styles.google,
};

const labelStyleByType = {
  Naver: styles.naverLabel,
  Kakao: styles.kakaoLabel,
  Google: styles.googleLabel,
};

const initialByType: Record<SocialType, string> = {
  Naver: 'N',
  Kakao: 'K',
  Google: 'G',
};

export default SocialIconButton;
