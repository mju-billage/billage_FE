import { Image, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import {
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

export type TabItem<T extends string> = {
  label: string;
  value: T;
  icon?: ImageSourcePropType;
};

type TabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  showIcon?: boolean;
  fullWidth?: boolean;
};

function Tabs<T extends string>({
  items,
  value,
  onChange,
  showIcon = true,
  fullWidth = false,
}: TabsProps<T>) {
  return (
    <View style={styles.row}>
      {items.map(item => {
        const selected = item.value === value;
        return (
          <Pressable
            key={item.value}
            style={({ pressed }) => [
              styles.tab,
              fullWidth && styles.tabFullWidth,
              pressed && styles.tabPressed,
            ]}
            onPress={() => onChange(item.value)}
          >
            <View style={styles.tabContent}>
              {showIcon && item.icon && (
                <Image
                  source={item.icon}
                  style={[styles.icon, selected && styles.iconSelected]}
                />
              )}
              <Text style={[styles.label, selected && styles.labelSelected]}>
                {item.label}
              </Text>
            </View>
            {selected && <View style={styles.underline} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  tabFullWidth: {
    paddingHorizontal: 0,
    borderRadius: 0,
  },
  tabPressed: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  icon: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_DISABLED,
  },
  iconSelected: {
    tintColor: FOREGROUND_SECONDARY,
  },
  label: {
    ...TYPOGRAPHY.body2,
    paddingVertical: 4,
    color: FOREGROUND_DISABLED,
  },
  labelSelected: {
    color: FOREGROUND_SECONDARY,
    fontWeight: 'bold',
  },
  underline: {
    marginTop: 8,
    height: 2,
    width: '100%',
    backgroundColor: FOREGROUND_SECONDARY,
  },
});

export default Tabs;
