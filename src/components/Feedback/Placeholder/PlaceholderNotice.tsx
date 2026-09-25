import { StyleSheet, Text, View } from 'react-native';
import { FOREGROUND_DISABLED } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

type PlaceholderNoticeProps = {
  title: string;
};

function PlaceholderNotice({ title }: PlaceholderNoticeProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{title} 화면은 준비 중이에요.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
  },
});

export default PlaceholderNotice;
