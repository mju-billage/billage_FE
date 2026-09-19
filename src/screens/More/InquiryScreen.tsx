/** @screen ETC-3-PAGE-10-0 문의하기 */
/**
 * 디자인 '진행' 중(2026.05.27 기준, 화면명세서 표 확인). 시안엔 문의 작성 폼이
 * 없고 FAQ 아코디언 + 읽기 전용 문의 메일 표시만 있어 그대로 따랐다 — 명세의
 * `POST /api/v1/inquiries`(문의 접수)는 이 화면에서 호출하지 않는다(폼이
 * 생기면 `supportService.submitInquiry`를 그대로 쓰면 된다).
 */
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Accordion from '../../components/Data Display/Accordion/Accordion';
import Button from '../../components/Input/Button/Button';
import * as supportService from '../../services/supportService';
import type { Faq } from '../../services/supportService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  INQUIRY_CONTACT_EMAIL,
  INQUIRY_CONTACT_LABEL,
  INQUIRY_EMPTY,
  INQUIRY_FAQ_SECTION_TITLE,
  INQUIRY_LOADING,
  INQUIRY_RETRY_LABEL,
  INQUIRY_TITLE,
} from '../../constants/settingsScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_NORMAL } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type InquiryNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Inquiry'>;
type LoadState = 'loading' | 'error' | 'ready';

/** 문의하기: FAQ 아코디언 목록 + 읽기 전용 문의 메일 안내. */
function InquiryScreen() {
  const navigation = useNavigation<InquiryNavigationProp>();
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const result = await supportService.getFaqs();
      setFaqs(result);
      setLoadState('ready');
    } catch (error) {
      setErrorMessage(
        isNetworkError(error)
          ? API_NETWORK_ERROR_MESSAGE
          : error instanceof ApiError
          ? getApiErrorMessage(error.code)
          : API_ERROR_DEFAULT_MESSAGE,
      );
      setLoadState('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <ScreenContainer background="primary">
      <AppBar type="sub" title={INQUIRY_TITLE} onBackPress={() => navigation.goBack()} />

      {loadState === 'loading' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{INQUIRY_LOADING}</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <Button
            label={INQUIRY_RETRY_LABEL}
            onPress={load}
            hierarchy="secondary"
            style={{ alignSelf: 'center' }}
          />
        </View>
      )}

      {loadState === 'ready' && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>{INQUIRY_FAQ_SECTION_TITLE}</Text>
          {faqs.length === 0 ? (
            <Text style={styles.emptyText}>{INQUIRY_EMPTY}</Text>
          ) : (
            faqs.map(faq => (
              <Accordion key={faq.id} title={faq.question} items={[faq.answer]} />
            ))
          )}

          <View style={styles.contactRow}>
            <Text style={styles.contactLabel}>{INQUIRY_CONTACT_LABEL}</Text>
            <Text style={styles.contactEmail}>{INQUIRY_CONTACT_EMAIL}</Text>
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subtitle2,
    marginBottom: 8,
  },
  emptyText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
    paddingVertical: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 24,
  },
  contactLabel: {
    ...TYPOGRAPHY.subtitle3,
  },
  contactEmail: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  stateText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
  },
});

export default InquiryScreen;
