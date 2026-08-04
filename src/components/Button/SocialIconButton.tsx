import { Pressable, StyleSheet, Text } from 'react-native';
import { SocialType } from '../../types/social';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_INVERSE,
  FOREGROUND_NEUTRAL_NORMAL,
  SOCIAL_KAKAO_TEXT,
  SOCIAL_KAKAO_YELLOW,
  SOCIAL_NAVER_GREEN,
} from '../../constants/colors';

type SocialIconButtonProps = {
  type: SocialType;
  onPress: () => void;
};

/** 소셜 로그인 아이콘 버튼: 제공자별 색상의 원형 배지를 보여준다. */
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
    backgroundColor: SOCIAL_NAVER_GREEN,
  },
  kakao: {
    backgroundColor: SOCIAL_KAKAO_YELLOW,
  },
  google: {
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
  },
  naverLabel: {
    color: FOREGROUND_INVERSE,
  },
  kakaoLabel: {
    color: SOCIAL_KAKAO_TEXT,
  },
  googleLabel: {
    color: FOREGROUND_NEUTRAL_NORMAL,
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
