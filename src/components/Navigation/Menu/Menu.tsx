import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Divider from '../../Data Display/Divider/Divider';
import {
  FEEDBACK_NEGATIVE_BOLD,
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

export type MenuItem = {
  key: string;
  label: string;
  icon?: ImageSourcePropType;
  destructive?: boolean;
};

type MenuProps = {
  sections: MenuItem[][];
  selectedKey?: string;
  onSelect: (key: string) => void;
  showIcon?: boolean;
};

function Menu({ sections, selectedKey, onSelect, showIcon = true }: MenuProps) {
  return (
    <View >
      {sections.map((section, sectionIndex) => (
        <View key={sectionIndex}>
          {sectionIndex > 0 && (
            <View style={styles.dividerWrapper}>
              <Divider />
            </View>
          )}
          {section.map(item => {
            const selected = item.key === selectedKey;
            return (
              <Pressable
                key={item.key}
                style={({ pressed }) => [
                  styles.item,
                  pressed && styles.itemPressed,
                ]}
                onPress={() => onSelect(item.key)}
              >
                {showIcon && item.icon && (
                  <Image
                    source={item.icon}
                    style={[styles.icon, selected && styles.iconSelected]}
                  />
                )}
                <Text
                  style={[
                    styles.label,
                    selected && styles.labelSelected,
                    item.destructive && styles.labelDestructive,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
  },
  itemPressed: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  dividerWrapper: {
    marginHorizontal: 16,
  },
  icon: {
    width: 18,
    height: 18,
    tintColor: FOREGROUND_NEUTRAL_NORMAL,
  },
  iconSelected: {
    tintColor: FOREGROUND_SECONDARY,
  },
  label: {
    ...TYPOGRAPHY.body2,
  },
  labelSelected: {
    color: FOREGROUND_SECONDARY,
    fontWeight: 'bold',
  },
  labelDestructive: {
    color: FEEDBACK_NEGATIVE_BOLD,
  },
});

export default Menu;
