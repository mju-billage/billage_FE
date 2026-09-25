import { ScrollView, StyleSheet, Text } from 'react-native';
import ScreenContainer from '../../Layout/ScreenContainer';
import AppBar from '../../Navigation/App bar/AppBar';
import { FOREGROUND_NEUTRAL_NORMAL } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typography';

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
    <ScreenContainer background="primary">
      <AppBar type="sub" title={title} onBackPress={onPressBack} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.body}>{bodyText}</Text>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  body: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
});

export default LegalDocumentView;
