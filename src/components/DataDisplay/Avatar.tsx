import { Image, StyleSheet, Text, View } from 'react-native';
import { LINK_BLUE } from '../../constants/colors';

const MEMBER_ICON = require('../../assets/icons/user/Member.png');

type AvatarSize = 'sm' | 'md' | 'lg';
type AvatarStyleVariant = 'default' | 'neutral';

type AvatarProps =
  | { type: 'icon'; size?: AvatarSize; style?: AvatarStyleVariant }
  | {
      type: 'initial';
      initial: string;
      size?: AvatarSize;
      style?: AvatarStyleVariant;
    }
  | {
      type: 'image';
      imageUri: string;
      size?: AvatarSize;
      style?: AvatarStyleVariant;
    };

const SIZE_BY_KEY: Record<AvatarSize, number> = { sm: 28, md: 36, lg: 48 };

/** 원형 아바타. 아이콘/이니셜/이미지 세 종류를 지원한다. */
function Avatar(props: AvatarProps) {
  const size = props.size ?? 'md';
  const variant = props.style ?? 'default';
  const dimension = SIZE_BY_KEY[size];

  return (
    <View
      style={[
        styles.circle,
        { width: dimension, height: dimension, borderRadius: dimension / 2 },
        variant === 'neutral' ? styles.neutral : styles.default,
      ]}
    >
      {props.type === 'icon' && (
        <Image
          source={MEMBER_ICON}
          style={[
            styles.icon,
            { width: dimension * 0.5, height: dimension * 0.5 },
          ]}
        />
      )}
      {props.type === 'initial' && (
        <Text style={[styles.initial, { fontSize: dimension * 0.4 }]}>
          {props.initial}
        </Text>
      )}
      {props.type === 'image' && (
        <Image source={{ uri: props.imageUri }} style={styles.image} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  default: {
    backgroundColor: '#E7EBFA',
  },
  neutral: {
    backgroundColor: '#F1F3F5',
  },
  icon: {
    tintColor: LINK_BLUE,
  },
  initial: {
    fontWeight: 'bold',
    color: LINK_BLUE,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default Avatar;
