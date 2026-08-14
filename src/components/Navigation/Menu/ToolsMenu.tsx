import {
  Image,
  ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Avatar from '../../Data Display/Avatar/Avatar';
import Chip from '../../Data Display/Chips/Chip';
import {
  BORDER_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_SECONDARY,
  FILL_NEUTRAL_NORMAL,
} from '../../../constants/colors';

const CHEVRON_RIGHT_ICON = require('../../../assets/icons/nav/Chevron Right.png');
const CHECK_ICON = require('../../../assets/icons/action/Check.png');

export type ToolsMenuItemType = 'icon' | 'avatar';

export type ToolsMenuItem = {
  key: string;
  /** icon(사각 아이콘)/avatar(Avatar 컴포넌트) 두 스타일을 지원한다. avatar면 icon은 쓰이지 않는다. */
  itemType?: ToolsMenuItemType;
  icon?: ImageSourcePropType;
  label: string;
  /** 라벨 옆에 나란히 붙는 보조 텍스트 배지. */
  tag?: string;
  onPress: () => void;
};

export type ToolsMenuSection = {
  title?: string;
  items: ToolsMenuItem[];
};

type ToolsMenuProps = {
  sections: ToolsMenuSection[];
  showTitle?: boolean;
  selectedKey?: string;
};

/** 아이콘/아바타 + 타이틀(+보조 태그) 목록으로 구성된 도구·설정 메뉴. 섹션 타이틀로 그룹을 나눌 수 있다. */
function ToolsMenu({ sections, showTitle = true, selectedKey }: ToolsMenuProps) {
  return (
    <View>
      {sections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          {showTitle && section.title && (
            <Text style={styles.sectionTitle}>{section.title}</Text>
          )}
          {section.items.map(item => {
            const isAvatar = item.itemType === 'avatar';
            const selected = item.key === selectedKey;
            return (
              <Pressable
                key={item.key}
                style={({ pressed }) => [
                  styles.item,
                  pressed && styles.itemPressed,
                ]}
                onPress={item.onPress}
              >
                {isAvatar ? (
                  <Avatar type="icon" size="sm" />
                ) : (
                  <Image source={item.icon} style={styles.itemIcon} />
                )}
                <View style={styles.itemTextRow}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  {item.tag && <Chip label={item.tag} removable={false} />}
                </View>
                <View style={styles.rightIcons}>
                  <Image source={CHEVRON_RIGHT_ICON} style={styles.chevron} />
                  {selected && (
                    <Image source={CHECK_ICON} style={styles.check} />
                  )}
                </View>
              </Pressable>
            );
          })}
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
    color: FOREGROUND_DISABLED,
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_NEUTRAL_NORMAL,
  },
  itemPressed: {
    backgroundColor: FILL_NEUTRAL_NORMAL,
  },
  itemIcon: {
    width: 24,
    height: 24,
    tintColor: FOREGROUND_NEUTRAL_NORMAL,
  },
  itemTextRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  chevron: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_DISABLED,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  check: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_SECONDARY,
  },
});

export default ToolsMenu;
