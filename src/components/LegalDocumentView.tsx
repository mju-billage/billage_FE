import { ScrollView, StyleSheet, Text, View } from 'react-native';
import BackButton from './BackButton';

type LegalDocumentViewProps = {
  title: string;
  bodyText: string;
  onPressBack: () => void;
};

/** 약관/정책 전문을 제목 + 스크롤 가능한 본문으로 보여주는 공용 레이아웃. */
function LegalDocumentView({
  title,
  bodyText,
  onPressBack,
}: LegalDocumentViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton onPress={onPressBack} />
        <Text style={styles.title}>{title}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.body}>{bodyText}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  body: {
    fontSize: 13,
    lineHeight: 20,
    color: '#495057',
  },
});

export default LegalDocumentView;
