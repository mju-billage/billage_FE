import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_INACTIVE,
  NAVY_800,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

export type BottomNavigationItem = {
  key: string;
  icon: ImageSourcePropType;
  label: string;
};

export const BOTTOM_NAVIGATION_HEIGHT = 78;

type BottomNavigationProps = {
  items: BottomNavigationItem[];
  activeKey: string;
  onChange: (key: string) => void;
};

function BottomNavigation({ items, activeKey, onChange }: BottomNavigationProps) {
  return (
    <View style={styles.container}>
      {items.map(item => {
        const selected = item.key === activeKey;
        return (
          <Pressable
            key={item.key}
            style={styles.item}
            onPress={() => onChange(item.key)}
          >
            <Image
              source={item.icon}
              style={[styles.icon, selected && styles.iconSelected]}
            />
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 8,
    paddingBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    width: 22,
    height: 22,
    tintColor: FOREGROUND_INACTIVE,
  },
  iconSelected: {
    tintColor: NAVY_800,
  },
  label: {
    ...TYPOGRAPHY.caption,
    color: FOREGROUND_INACTIVE,
  },
  labelSelected: {
    color: NAVY_800,
    fontWeight: 'bold',
  },
});

export default BottomNavigation;
