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
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_SECONDARY,
} from '../../../constants/colors';

export type MenuItem = {
  key: string;
  label: string;
  icon?: ImageSourcePropType;
};

type MenuProps = {
  /** 그룹 단위 배열. 그룹 사이에만 구분선이 들어가고, 그룹 안 항목 사이엔 구분선이 없다. */
  sections: MenuItem[][];
  selectedKey?: string;
  onSelect: (key: string) => void;
  showIcon?: boolean;
};

/** 세로 목록형 메뉴. 섹션 사이에만 구분선을 그려 그룹을 나눈다. */
function Menu({ sections, selectedKey, onSelect, showIcon = true }: MenuProps) {
  return (
    <View>
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
                  style={[styles.label, selected && styles.labelSelected]}
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
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    fontSize: 14,
  },
  labelSelected: {
    color: FOREGROUND_SECONDARY,
    fontWeight: 'bold',
  },
});

export default Menu;
