import { StyleSheet, Text, View } from 'react-native';
import { FOREGROUND_NEUTRAL_NORMAL } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type CountRowProps = {
  text: string;
};

function CountRow({ text }: CountRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 39,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  text: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
});

export default CountRow;
