import { Image, Pressable, StyleSheet, Text } from 'react-native';
import type { QuickServiceItem } from '../../types/dashboard';
import {
  FILL_NEUTRAL_SUBTLE,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type QuickServiceCardProps = {
  item: QuickServiceItem;
  onPress: () => void;
};  

/** 대시보드 하단의 보고서/통계/증빙자료 바로가기 카드. */
function QuickServiceCard({ item, onPress }: QuickServiceCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.label}>{item.label}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <Image source={item.icon} style={styles.icon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: FILL_NEUTRAL_SUBTLE,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
    minHeight: 100,
  },
  label: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  title: {
    ...TYPOGRAPHY.subtitle3,
    marginTop: 2,
  },
  icon: {
    width: 40,
    height: 40,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
});

export default QuickServiceCard;
