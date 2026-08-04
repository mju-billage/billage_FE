import { StyleSheet, Text, View } from 'react-native';
import { FOREGROUND_DISABLED } from '../constants/colors';

type PlaceholderNoticeProps = {
  title: string;
};

/** 아직 구현되지 않은 탭에 보여주는 공용 안내 화면. */
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
    fontSize: 15,
    color: FOREGROUND_DISABLED,
  },
});

export default PlaceholderNotice;
