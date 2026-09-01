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
  /** 아이콘 노출 여부. 기본 true — item에 icon이 없으면 어차피 표시되지 않는다. */
  showIcon?: boolean;
};

/** 콘텐츠 섹션을 전환하는 밑줄 스타일 탭 바. 아이콘을 함께 표시할 수 있다. */
function Tabs<T extends string>({
  items,
  value,
  onChange,
  showIcon = true,
}: TabsProps<T>) {
  return (
    <View style={styles.row}>
      {items.map(item => {
        const selected = item.value === value;
        return (
          <Pressable
            key={item.value}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
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
