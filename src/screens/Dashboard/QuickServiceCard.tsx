import { Image, Pressable, StyleSheet, Text } from 'react-native';
import type { QuickServiceItem } from '../../types/dashboard';

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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    justifyContent: 'space-between',
    minHeight: 100,
  },
  label: {
    fontSize: 12,
    color: '#868E96',
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 2,
  },
  icon: {
    width: 20,
    height: 20,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
});

export default QuickServiceCard;
