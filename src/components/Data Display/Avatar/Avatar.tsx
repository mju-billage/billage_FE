import { Image, StyleSheet, Text, View } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  BORDER_SECONDARY_SUBTLE,
  FILL_NEUTRAL_NORMAL,
  FILL_SECONDARY_SUBTLER,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';

const MEMBER_ICON = require('../../../assets/icons/user/Member.png');

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

export function getSquircleRadius(dimension: number): number {
  return dimension * (7 / 24);
}

function Avatar(props: AvatarProps) {
  const size = props.size ?? 'md';
  const variant = props.style ?? 'default';
  const dimension = SIZE_BY_KEY[size];
  const cornerRadius = getSquircleRadius(dimension);

  return (
    <View
      style={[
        styles.circle,
        { width: dimension, height: dimension, borderRadius: cornerRadius },
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
    backgroundColor: FILL_SECONDARY_SUBTLER,
    borderWidth: 1,
    borderColor: BORDER_SECONDARY_SUBTLE,
  },
  neutral: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
  },
  icon: {
    tintColor: FOREGROUND_SECONDARY,
  },
  initial: {
    fontWeight: 'bold',
    color: FOREGROUND_SECONDARY,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default Avatar;
