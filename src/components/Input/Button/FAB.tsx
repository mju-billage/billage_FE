import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FOREGROUND_INVERSE, NAVY_800 } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type FloatingActionButtonProps = {
  onPress: () => void;
  /** true면 아이콘+라벨이 있는 알약형(pill)으로, false면 원형 아이콘 버튼으로 렌더링한다. */
  extended?: boolean;
  label?: string;
};

const SIZE = 46;

/** 문서(가로줄 2개) + 우하단 plus 배지로 구성한 "내역 추가" 아이콘. */
function DocumentAddIcon() {
  return (
    <View style={styles.icon}>
      <View style={styles.doc}>
        <View style={styles.docLine} />
        <View style={[styles.docLine, styles.docLineShort]} />
      </View>
      <View style={styles.badge}>
        <View style={styles.badgeBarH} />
        <View style={styles.badgeBarV} />
      </View>
    </View>
  );
}

/** 화면 우하단에 고정되는 액션 버튼(FAB). extended=true면 아이콘+텍스트 알약형으로 확장된다. */
function FloatingActionButton({
  onPress,
  extended = false,
  label,
}: FloatingActionButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        extended ? styles.buttonExtended : styles.buttonCircle,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <DocumentAddIcon />
      {extended && label && <Text style={styles.label}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 24,
    bottom: 12,
    height: SIZE,
    backgroundColor: NAVY_800,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCircle: {
    width: SIZE,
    borderRadius: SIZE / 2,
  },
  buttonExtended: {
    gap: 8,
    paddingHorizontal: 20,
    borderRadius: SIZE / 2,
  },
  pressed: {
    opacity: 0.85,
  },
  icon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  doc: {
    width: 15,
    height: 19,
    borderWidth: 1.5,
    borderColor: FOREGROUND_INVERSE,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  docLine: {
    width: 8,
    height: 1.4,
    borderRadius: 1,
    backgroundColor: FOREGROUND_INVERSE,
  },
  docLineShort: {
    width: 5,
  },
  badge: {
    position: 'absolute',
    right: -3,
    bottom: -3,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: NAVY_800,
    borderWidth: 1.5,
    borderColor: FOREGROUND_INVERSE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeBarH: {
    position: 'absolute',
    width: 6,
    height: 1.4,
    borderRadius: 1,
    backgroundColor: FOREGROUND_INVERSE,
  },
  badgeBarV: {
    position: 'absolute',
    width: 1.4,
    height: 6,
    borderRadius: 1,
    backgroundColor: FOREGROUND_INVERSE,
  },
  label: {
    ...TYPOGRAPHY.button,
    color: FOREGROUND_INVERSE,
  },
});

export default FloatingActionButton;
