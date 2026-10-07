import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { FOREGROUND_INVERSE, NAVY_800 } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';
import { BOTTOM_NAVIGATION_HEIGHT } from '../../Navigation/Bottom Navigation/BottomNavigation';

type FloatingActionButtonProps = {
  onPress: () => void;
  extended?: boolean;
  label?: string;
};

const SIZE = 46;
const DocumentAddIconImage = require('../../../assets/icons/content/DocumentAdd.png');

function DocumentAddIcon() {
  return (
    <View style={styles.icon}>
      <Image 
        source={DocumentAddIconImage}
        style={styles.documentadd}
      />
    </View>
  );
}

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
    bottom: BOTTOM_NAVIGATION_HEIGHT + 12,
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
  documentadd: {
    width: 24,
    height: 24,
    tintColor: FOREGROUND_INVERSE,
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
