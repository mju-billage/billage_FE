import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_NORMAL,
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_SECONDARY,
} from '../../constants/colors';

export type MenuItem = {
  key: string;
  label: string;
  icon?: ImageSourcePropType;
};

type MenuProps = {
  items: MenuItem[];
  selectedKey?: string;
  onSelect: (key: string) => void;
  showIcon?: boolean;
};

/** 세로 목록형 메뉴. 항목 사이 구분선으로 그룹을 나눌 수 있다. */
function Menu({ items, selectedKey, onSelect, showIcon = true }: MenuProps) {
  return (
    <View style={styles.container}>
      {items.map(item => {
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
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_NEUTRAL_NORMAL,
  },
  itemPressed: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
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
    fontSize: 14,
  },
  labelSelected: {
    color: FOREGROUND_SECONDARY,
    fontWeight: 'bold',
  },
});

export default Menu;
