import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NotificationItem } from '../../services/supportService';
import { formatRelativeTime } from '../../utils/relativeTime';
import {
  BORDER_NEUTRAL_NORMAL,
  FILL_NEUTRAL_NORMAL,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_NORMAL,
  NAVY_800,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const GRID_ICON = require('../../assets/icons/system/Grid.png');
const BRACKET_PATTERN = /(\[[^\]]+\])/g;

type NotificationListItemProps = {
  item: NotificationItem;
  onPress: () => void;
};

function NotificationListItem({ item, onPress }: NotificationListItemProps) {
  const lines = item.body.split('\n');

  return (
    <Pressable style={styles.container} onPress={onPress}>
      <View style={styles.iconBadge}>
        <Image source={GRID_ICON} style={styles.icon} />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, !item.readAt && styles.titleUnread]}>
            {item.title}
          </Text>
          <Text style={styles.time}>{formatRelativeTime(item.createdAt)}</Text>
        </View>
        {lines.map((line, index) => (
          <Text key={index} style={styles.description}>
            {renderHighlightedLine(line)}
          </Text>
        ))}
      </View>
    </Pressable>
  );
}

function renderHighlightedLine(line: string) {
  return line.split(BRACKET_PATTERN).map((part, index) => {
    const isHighlighted = part.startsWith('[') && part.endsWith(']');
    return (
      <Text key={index} style={[isHighlighted && styles.highlightedText]}>
        {part}
      </Text>
    );
  });
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_NEUTRAL_NORMAL,
    gap: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: FILL_NEUTRAL_NORMAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 18,
    height: 18,
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    ...TYPOGRAPHY.subtitle3,
    flexShrink: 1,
  },
  titleUnread: {
    fontWeight: 'bold',
  },
  time: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_DISABLED,
  },
  description: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  highlightedText: {
    fontWeight: 'bold',
    color: NAVY_800,
  },
});

export default NotificationListItem;
