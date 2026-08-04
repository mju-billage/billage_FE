import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BORDER_NEUTRAL, TEXT_MUTED } from '../../constants/colors';

const CHEVRON_RIGHT_ICON = require('../../assets/icons/nav/ChevronRight.png');

export type ToolsMenuItem = {
  key: string;
  icon: ImageSourcePropType;
  label: string;
  subLabel?: string;
  onPress: () => void;
};

export type ToolsMenuSection = {
  title?: string;
  items: ToolsMenuItem[];
};

type ToolsMenuProps = {
  sections: ToolsMenuSection[];
  showTitle?: boolean;
};

/** 아이콘/아바타 + 타이틀+서브텍스트 목록으로 구성된 도구·설정 메뉴. 섹션 타이틀로 그룹을 나눌 수 있다. */
function ToolsMenu({ sections, showTitle = true }: ToolsMenuProps) {
  return (
    <View>
      {sections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          {showTitle && section.title && (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          )}
          {section.items.map(item => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.item,
                pressed && styles.itemPressed,
              ]}
              onPress={item.onPress}
            >
              <Image source={item.icon} style={styles.itemIcon} />
              <View style={styles.itemTextColumn}>
                <Text style={styles.itemLabel}>{item.label}</Text>
                {item.subLabel && (
                  <Text style={styles.itemSubLabel}>{item.subLabel}</Text>
                )}
              </View>
              <Image source={CHEVRON_RIGHT_ICON} style={styles.chevron} />
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: TEXT_MUTED,
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_NEUTRAL,
  },
  itemPressed: {
    opacity: 0.6,
  },
  itemIcon: {
    width: 24,
    height: 24,
    tintColor: '#495057',
  },
  itemTextColumn: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemSubLabel: {
    marginTop: 2,
    fontSize: 12,
    color: TEXT_MUTED,
  },
  chevron: {
    width: 16,
    height: 16,
    tintColor: '#ADB5BD',
  },
});

export default ToolsMenu;
