import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import BackButton from './BackButton';

type AppBarProps = {
  title: string;
  onBackPress: () => void;
  rightIcon?: ImageSourcePropType;
  onRightPress?: () => void;
  rightAccessibilityLabel?: string;
};

/** 뒤로가기 + 타이틀 + 선택적 우측 아이콘으로 구성된 상단 앱바. */
function AppBar({
  title,
  onBackPress,
  rightIcon,
  onRightPress,
  rightAccessibilityLabel,
}: AppBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.leftRow}>
        <BackButton onPress={onBackPress} />
        <Text style={styles.title}>{title}</Text>
      </View>
      {rightIcon && (
        <Pressable
          onPress={onRightPress}
          hitSlop={8}
          accessibilityLabel={rightAccessibilityLabel}
        >
          <Image source={rightIcon} style={styles.rightIcon} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  rightIcon: {
    width: 24,
    height: 24,
  },
});

export default AppBar;
