/** @screen DUE-3-PAGE-04-0 회비 상세_납부 요청 */
/**
 * 서버 API가 없는 화면(Dues.txt "회비 요청 — 서버 기능이 아닙니다", 2026-08-30
 * 확정) — 총무가 작성한 텍스트를 OS 기본 공유 시트(`Share.share`)로 그대로
 * 넘기기만 한다. 수신자 목록은 이 화면에서 다루지 않는다(DuesDetailScreen이
 * 이미 들고 있는 미납부 탭 데이터를 그대로 쓰고, 이 화면은 추가·삭제 UI가 없다).
 *
 * 이탈 방지는 `ReportCreateByLedgerScreen` 패턴(뒤로가기+하드웨어 back 모두
 * `handleBack` 경유)을 그대로 따랐다 — 텍스트 1자 이상 입력 시에만 확인 모달을 띄운다.
 */
import { useCallback, useState } from 'react';
import { BackHandler, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import TextArea from '../../components/Input/Text Field/TextArea';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import {
  DUES_CREATE_LEAVE_CONFIRM_LABEL,
  DUES_REQUEST_LEAVE_DESCRIPTION,
  DUES_REQUEST_LEAVE_TITLE,
  DUES_REQUEST_PLACEHOLDER,
  DUES_REQUEST_SUBMIT_LABEL,
  DUES_REQUEST_TITLE,
} from '../../constants/duesScreenText';

type DuesRequestNavigationProp = NativeStackNavigationProp<RootStackParamList>;

function DuesRequestScreen() {
  const navigation = useNavigation<DuesRequestNavigationProp>();
  const [message, setMessage] = useState('');
  const [leaveDialogVisible, setLeaveDialogVisible] = useState(false);

  const hasInput = message.length > 0;

  const handleBack = () => {
    if (hasInput) {
      setLeaveDialogVisible(true);
    } else {
      navigation.goBack();
    }
  };

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (hasInput) {
          setLeaveDialogVisible(true);
          return true;
        }
        return false;
      });
      return () => subscription.remove();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasInput]),
  );

  const handleSubmit = () => {
    if (!hasInput) {
      return;
    }
    Share.share({ message });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar type="sub" title={DUES_REQUEST_TITLE} onBackPress={handleBack} />

      <View style={styles.body}>
        <TextArea
          value={message}
          onChangeText={setMessage}
          placeholder={DUES_REQUEST_PLACEHOLDER}
          rows={10}
        />
      </View>

      <View style={styles.footer}>
        <Button
          label={DUES_REQUEST_SUBMIT_LABEL}
          onPress={handleSubmit}
          disabled={!hasInput}
          fullWidth
        />
      </View>

      <Dialog
        visible={leaveDialogVisible}
        title={DUES_REQUEST_LEAVE_TITLE}
        description={DUES_REQUEST_LEAVE_DESCRIPTION}
        confirmLabel={DUES_CREATE_LEAVE_CONFIRM_LABEL}
        destructive
        onCancel={() => setLeaveDialogVisible(false)}
        onConfirm={() => {
          setLeaveDialogVisible(false);
          navigation.goBack();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    paddingTop: 8,
  },
});

export default DuesRequestScreen;
