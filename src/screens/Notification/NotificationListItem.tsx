import { Image, StyleSheet, Text, View } from 'react-native';
import type { NotificationItem } from '../../types/notification';
import {
  BORDER_NEUTRAL,
  FILL_NEUTRAL,
  NAVY,
  TEXT_MUTED,
} from '../../constants/colors';

const GRID_ICON = require('../../assets/icons/system/Grid.png');
const BRACKET_PATTERN = /(\[[^\]]+\])/g;

type NotificationListItemProps = {
  item: NotificationItem;
};

/** 알림 목록의 항목 하나. 설명 중 [이름] 부분은 강조 표시한다. */
function NotificationListItem({ item }: NotificationListItemProps) {
  const lines = item.description.split('\n');

  return (
    <View style={styles.container}>
      <View style={styles.iconBadge}>
        <Image source={GRID_ICON} style={styles.icon} />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.time}>{item.relativeTimeLabel}</Text>
        </View>
        {lines.map((line, index) => (
          <Text key={index} style={styles.description}>
            {renderHighlightedLine(line)}
          </Text>
        ))}
      </View>
    </View>
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
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: BORDER_NEUTRAL,
    gap: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: FILL_NEUTRAL,
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
    fontSize: 15,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  time: {
    fontSize: 12,
    color: TEXT_MUTED,
  },
  description: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 18,
  },
  highlightedText: {
    fontWeight: 'bold',
    color: NAVY,
  },
});

export default NotificationListItem;
