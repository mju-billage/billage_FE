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
import Divider from '../../Data Display/Divider/Divider';
import {
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_NORMAL,
  FOREGROUND_SECONDARY,
  FILL_NEUTRAL_NORMAL,
} from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

const CHEVRON_RIGHT_ICON = require('../../../assets/icons/nav/Chevron Right.png');
const CHECK_ICON = require('../../../assets/icons/action/Check.png');

export type ToolsMenuItemType = 'icon' | 'avatar';

export type ToolsMenuItem = {
  key: string;
  itemType?: ToolsMenuItemType;
  icon?: ImageSourcePropType;
  label: string;
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
  flush?: boolean;
};

function ToolsMenu({
  sections,
  showTitle = true,
  selectedKey,
  flush = false,
}: ToolsMenuProps) {
  return (
    <View>
      {sections.map((section, sectionIndex) => (
        <View
          key={sectionIndex}
          style={[
            styles.section,
            flush && sectionIndex === sections.length - 1 && styles.sectionFlush,
          ]}
        >
          {sectionIndex > 0 && (
            <View style={styles.dividerWrapper}>
              <Divider />
            </View>
          )}
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
  sectionFlush: {
    marginBottom: 0,
  },
  sectionTitle: {
    ...TYPOGRAPHY.body3,
    fontWeight: 'bold',
    color: FOREGROUND_DISABLED,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  dividerWrapper: {
    marginBottom: 12,
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
    ...TYPOGRAPHY.subtitle3,
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
