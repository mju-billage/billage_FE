import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
} from '../../../constants/colors';

type CardVariant = 'filled' | 'dashed' | 'bordered';

type CardBaseProps = {
  variant?: CardVariant;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
};

/** 카드 계열 컴포넌트가 공유하는 배경/모서리/여백 베이스. */
function CardBase({ variant = 'filled', onPress, style, children }: CardBaseProps) {
  const cardStyle = [styles.base, styles[variant], style];

  if (onPress) {
    return (
      <Pressable style={cardStyle} onPress={onPress}>
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    padding: 16,
  },
  filled: {
    backgroundColor: FILL_NEUTRAL_SUBTLE,
  },
  dashed: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: BORDER_NEUTRAL_NORMAL,
  },
  bordered: {
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
  },
});

export default CardBase;
