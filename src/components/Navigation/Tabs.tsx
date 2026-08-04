import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LINK_BLUE, TEXT_MUTED } from '../../constants/colors';

export type TabItem<T extends string> = {
  label: string;
  value: T;
};

type TabsProps<T extends string> = {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** 콘텐츠 섹션을 전환하는 밑줄 스타일 탭 바. */
function Tabs<T extends string>({ items, value, onChange }: TabsProps<T>) {
  return (
    <View style={styles.row}>
      {items.map(item => {
        const selected = item.value === value;
        return (
          <Pressable
            key={item.value}
            style={styles.tab}
            onPress={() => onChange(item.value)}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {item.label}
            </Text>
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
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  label: {
    fontSize: 14,
    color: TEXT_MUTED,
  },
  labelSelected: {
    color: LINK_BLUE,
    fontWeight: 'bold',
  },
  underline: {
    marginTop: 8,
    height: 2,
    width: '100%',
    backgroundColor: LINK_BLUE,
  },
});

export default Tabs;
