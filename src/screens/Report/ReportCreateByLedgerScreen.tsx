/** @screen ETC-4-PAGE-03-0 장부별 보고서 생성 */
/** @screen ETC-5-MODAL-01-0 보고서_이탈방지 (leaveDialogVisible) */
/** @screen ETC-5-SNACKBAR-08-0 보고서_생성완료 (SNACKBAR_REPORT_CREATED, ReportMainScreen에서 렌더) */
/**
 * "장부별 보고서 생성하기"에서 들어오는 생성 폼. 기간을 받지 않는다 —
 * 선택한 장부의 전체 기간을 서버가 알아서 담는다(Report.txt).
 *
 * "장부" 선택은 `ReportLedgerSelectScreen`(ETC-5-PAGE-01-0, 폴더 트리
 * 뎁스인 + 장부 다중 선택)을 라우트로 열고, 그 화면이 확정한 선택 목록을
 * `navigation.navigate('ReportCreateByLedger', {selectedLedgers})`로 돌려준다
 * (`MemberManageScreen`의 snackbarMessage 왕복과 같은 패턴 — 콜백 함수를
 * route params로 넘기지 않는다).
 *
 * "구분"은 `FILTER_TYPE_ALL/INCOME/EXPENSE` 라벨을 그대로 재사용하되, 버튼은
 * `OutlinePill`(신규)을 쓴다 — 시안(Case A)이 선택 시 파란 테두리+파란
 * 글자(흰 배경 유지)로 그려서, 선택 시 배경이 채워지는 `FilterPill`
 * (`TransactionFilterSheet`가 씀, 방향이 반대)을 그대로 쓸 수 없었다.
 * `FilterPill` 자체는 안 건드렸다 — 그 컴포넌트를 쓰는 화면은 여전히 시안이
 * 맞다.
 *
 * ⚠️ `entryType: "ALL"`을 보내면 안 된다(서버가 `400`).
 * "전체" 선택은 `reportService.createReportByLedger()`에 `entryType`을 아예
 * 안 넘기는 것으로 표현한다 — 이 화면은 그래서 `entryType` state를
 * `ReportEntryType | undefined`로 두고, "전체"일 때만 `undefined`를 유지한다.
 */
import { useCallback, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import TextField from '../../components/Input/Text Field/TextField';
import OutlinePill from '../../components/Input/Filter/OutlinePill';
import Chip from '../../components/Data Display/Chips/Chip';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import { getActiveGroup } from '../../types/group';
import type { ReportEntryType } from '../../types/report';
import * as reportService from '../../services/reportService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  FILTER_TYPE_ALL,
  FILTER_TYPE_EXPENSE,
  FILTER_TYPE_INCOME,
} from '../../constants/ledgerScreenText';
import {
  REPORT_BY_LEDGER_TITLE,
  REPORT_LEAVE_CANCEL_LABEL,
  REPORT_LEAVE_CONFIRM_LABEL,
  REPORT_LEAVE_DESCRIPTION,
  REPORT_LEAVE_TITLE,
  REPORT_LEDGER_FIELD_COUNT_SUFFIX,
  REPORT_LEDGER_FIELD_LABEL,
  REPORT_LEDGER_SELECT_LABEL,
  REPORT_SUBMIT_LABEL,
  REPORT_TITLE_FIELD_LABEL,
  REPORT_TITLE_MAX_LENGTH,
  REPORT_TITLE_PLACEHOLDER,
  REPORT_TYPE_FIELD_LABEL,
  SNACKBAR_REPORT_CREATED,
} from '../../constants/reportScreenText';
import { FEEDBACK_NEGATIVE_BOLD } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const PLUS_ICON = require('../../assets/icons/action/Plus.png');

type ReportCreateByLedgerNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type ReportCreateByLedgerRouteProp = RouteProp<RootStackParamList, 'ReportCreateByLedger'>;
type LedgerOption = { id: string; name: string };

function ReportCreateByLedgerScreen() {
  const navigation = useNavigation<ReportCreateByLedgerNavigationProp>();
  const route = useRoute<ReportCreateByLedgerRouteProp>();

  const [title, setTitle] = useState('');
  const [ledgers, setLedgers] = useState<LedgerOption[]>([]);
  const [entryType, setEntryType] = useState<ReportEntryType | undefined>(undefined);
  const [titleError, setTitleError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [leaveDialogVisible, setLeaveDialogVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  // 장부 선택 화면이 돌려준 결과를 반영한다(`MemberManageScreen`의
  // snackbarMessage 왕복과 같은 route params 패턴).
  useFocusEffect(
    useCallback(() => {
      if (route.params?.selectedLedgers) {
        setLedgers(route.params.selectedLedgers);
        navigation.setParams({ selectedLedgers: undefined });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route.params?.selectedLedgers]),
  );

  const hasInput = title.trim().length > 0 || ledgers.length > 0 || entryType !== undefined;

  const handleBack = () => {
    if (hasInput) {
      setLeaveDialogVisible(true);
    } else {
      navigation.goBack();
    }
  };

  // 안드로이드 하드웨어 back도 AppBar 백버튼과 같은 이탈 확인을 거치게 한다
  // — 등록을 안 하면 시스템 back은 `handleBack`을 거치지 않고 화면을 그냥
  // 나가버린다.
  // 포커스 중일 때만 리스너를 걸어야(`useFocusEffect`) 이 화면이 스택
  // 아래로 내려가 있을 때(장부 선택 화면 위에 있을 때 등) back을 가로채지 않는다.
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
    }, [hasInput]),
  );

  const canSubmit = title.trim().length > 0 && ledgers.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
      return;
    }
    const group = getActiveGroup();
    if (!group) {
      return;
    }
    setTitleError(undefined);
    setFormError(undefined);
    setIsSubmitting(true);
    try {
      const created = await reportService.createReportByLedger(group.id, {
        title: title.trim(),
        ledgerIds: ledgers.map(l => l.id),
        entryType,
      });
      // ETC-4-PAGE-03-0 명세 No.5: 성공 시 생성 완료된 보고서 상세로 이동한다.
      // navigate가 아니라 reset — 생성 폼과 그 위에 쌓였을 수 있는 장부 선택
      // 화면을 스택에서 걷어내, 상세에서 뒤로가기를 누르면 폼이 아니라 보고서
      // 목록(ReportMain)으로 가게 한다.
      navigation.reset({
        index: 2,
        routes: [
          { name: 'Main', params: { screen: 'More' } },
          { name: 'ReportMain' },
          {
            name: 'ReportByLedgerDetail',
            params: { reportId: created.reportId, snackbarMessage: SNACKBAR_REPORT_CREATED },
          },
        ],
      });
    } catch (error) {
      if (error instanceof ApiError) {
        const titleFieldError = error.fieldErrors.find(fe => fe.field === 'title');
        if (titleFieldError) {
          setTitleError(titleFieldError.reason);
        } else {
          setFormError(getApiErrorMessage(error.code));
        }
      } else {
        setFormError(toErrorMessage(error));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer background="secondary">
      <AppBar type="sub" title={REPORT_BY_LEDGER_TITLE} onBackPress={handleBack} />

      <ScrollView contentContainerStyle={styles.body}>
        <TextField
          label={REPORT_TITLE_FIELD_LABEL}
          required
          value={title}
          onChangeText={text => {
            setTitle(text.slice(0, REPORT_TITLE_MAX_LENGTH));
            setTitleError(undefined);
          }}
          placeholder={REPORT_TITLE_PLACEHOLDER}
          maxLength={REPORT_TITLE_MAX_LENGTH}
          error={titleError}
        />

        <View style={styles.fieldGroup}>
          <View style={styles.fieldLabelRow}>
            <Text style={styles.fieldLabel}>{REPORT_LEDGER_FIELD_LABEL}</Text>
            {ledgers.length > 0 && (
              <Text style={styles.fieldCount}>
                {ledgers.length}
                {REPORT_LEDGER_FIELD_COUNT_SUFFIX}
              </Text>
            )}
          </View>
          {ledgers.length > 0 && (
            <View style={styles.chipRow}>
              {ledgers.map(ledger => (
                <Chip
                  key={ledger.id}
                  label={ledger.name}
                  onRemove={() =>
                    setLedgers(current => current.filter(l => l.id !== ledger.id))
                  }
                />
              ))}
            </View>
          )}
          <Button
            label={REPORT_LEDGER_SELECT_LABEL}
            icon={PLUS_ICON}
            hierarchy="outlined"
            fullWidth
            onPress={() => navigation.navigate('ReportLedgerSelect', { selectedLedgers: ledgers })}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>{REPORT_TYPE_FIELD_LABEL}</Text>
          <View style={styles.pillRow}>
            <OutlinePill
              label={FILTER_TYPE_ALL}
              active={entryType === undefined}
              onPress={() => setEntryType(undefined)}
            />
            <OutlinePill
              label={FILTER_TYPE_INCOME}
              active={entryType === 'INCOME'}
              onPress={() => setEntryType('INCOME')}
            />
            <OutlinePill
              label={FILTER_TYPE_EXPENSE}
              active={entryType === 'EXPENSE'}
              onPress={() => setEntryType('EXPENSE')}
            />
          </View>
        </View>

        {formError && <Text style={styles.formError}>{formError}</Text>}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label={REPORT_SUBMIT_LABEL}
          onPress={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          fullWidth
        />
      </View>

      <Dialog
        visible={leaveDialogVisible}
        title={REPORT_LEAVE_TITLE}
        description={REPORT_LEAVE_DESCRIPTION}
        cancelLabel={REPORT_LEAVE_CANCEL_LABEL}
        confirmLabel={REPORT_LEAVE_CONFIRM_LABEL}
        destructive
        onCancel={() => setLeaveDialogVisible(false)}
        onConfirm={() => {
          setLeaveDialogVisible(false);
          navigation.goBack();
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fieldLabel: {
    ...TYPOGRAPHY.subtitle3,
  },
  fieldCount: {
    ...TYPOGRAPHY.body3,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  formError: {
    ...TYPOGRAPHY.body3,
    color: FEEDBACK_NEGATIVE_BOLD,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
});

export default ReportCreateByLedgerScreen;
