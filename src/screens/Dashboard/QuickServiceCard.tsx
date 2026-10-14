import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import type { QuickServiceItem } from '../../types/dashboard';
import { FILL_NEUTRAL_SUBTLE, FOREGROUND_PRIMARY } from '../../constants/colors';
import { SHADOW_CARD } from '../../constants/shadows';
import { TYPOGRAPHY } from '../../constants/typography';

type QuickServiceCardProps = {
  item: QuickServiceItem;
  onPress: () => void;
};  

function QuickServiceCard({ item, onPress }: QuickServiceCardProps) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <Text style={styles.label}>{item.label}</Text>
      <Text style={styles.title}>{item.title}</Text>
      <View style={styles.graphic}>
        <SvgXml xml={item.graphic} width="100%" height="100%" />
      </View>
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
    boxShadow: SHADOW_CARD,
  },
  label: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_PRIMARY,
  },
  title: {
    ...TYPOGRAPHY.subtitle3,
    marginTop: 2,
    color: FOREGROUND_PRIMARY,
  },
  graphic: {
    width: 40,
    height: 36,
    alignSelf: 'flex-end',
    marginTop: 8,
  },
});

export default QuickServiceCard;
