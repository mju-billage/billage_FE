/** @screen ETC-4-PAGE-04-0 기간별 보고서 생성 */
/** @screen ETC-5-MODAL-01-0 보고서_이탈방지 (leaveDialogVisible) */
/** @screen ETC-5-SNACKBAR-08-0 보고서_생성완료 (SNACKBAR_REPORT_CREATED, ReportMainScreen에서 렌더) */
/**
 * "기간별 보고서 생성하기"에서 들어오는 생성 폼. 장부를 받지 않는다 — 지정한
 * 기간 안에 내역이 있는 모든 장부를 서버가 자동으로 담는다(Report.txt).
 *
 * 기간 선택 시트는 시안이 `DTB-3-SHEET-01-0`(재사용 대상)로 명시했고, 그
 * ID는 이미 `DuesCreateScreen`이 `DuesDateRangeSheet`로 구현해 둔 것과
 * 정확히 같다 — 그래서 새로 안 만들고 그대로 가져다 썼다.
 * `DuesDateRangeSheet`엔 원래 "취소" 버튼과 날짜 미리보기 텍스트가 없었는데,
 * 이 화면이 쓰는 시안과 내역 필터링 시안(같은 ID)이 둘 다 요구하고 있어
 * 그 컴포넌트 자체를 보강했다(Dues 호출부도 그대로 호환, 해당 파일 주석
 * 참고) — 그래서 지금은 시안과 시트 안쪽이 정확히 맞는다.
 *
 * 다만 이 화면 자체(시트 밖) 필드 표기는 시안 예시가 "YY.MM.DD ~ YY.MM.DD"
 * (2자리 연도)인데, 여기서는 `DuesCreateScreen`이 이미 쓰고 있는
 * "YYYY.MM.DD - YYYY.MM.DD"(4자리 연도) 표기를 그대로 따랐다 — 폼 필드
 * 자체는 4자리가 맞다고 확인됨(시트 안 미리보기만 2자리가 의도).
 */
import { useCallback, useState } from 'react';
import { BackHandler, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import TextField from '../../components/Input/Text Field/TextField';
import OutlinePill from '../../components/Input/Filter/OutlinePill';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import DuesDateRangeSheet from '../Dues/DuesDateRangeSheet';
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
import { DATE_SHEET_CONFIRM_LABEL } from '../../constants/transactionScreenText';
import {
  REPORT_BY_PERIOD_TITLE,
  REPORT_LEAVE_CANCEL_LABEL,
  REPORT_LEAVE_CONFIRM_LABEL,
  REPORT_LEAVE_DESCRIPTION,
  REPORT_LEAVE_TITLE,
  REPORT_PERIOD_FIELD_LABEL,
  REPORT_PERIOD_PLACEHOLDER,
  REPORT_SUBMIT_LABEL,
  REPORT_TITLE_FIELD_LABEL,
  REPORT_TITLE_MAX_LENGTH,
  REPORT_TITLE_PLACEHOLDER,
  REPORT_TYPE_FIELD_LABEL,
  SNACKBAR_REPORT_CREATED,
} from '../../constants/reportScreenText';
import {
  BORDER_NEUTRAL_NORMAL,
  FEEDBACK_NEGATIVE_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_PRIMARY,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CALENDAR_ICON = require('../../assets/icons/system/Calendar.png');

type ReportCreateByPeriodNavigationProp = NativeStackNavigationProp<RootStackParamList>;

/** 'YYYY.MM.DD' → 'YYYY-MM-DD'(Report API 형식, Dues와 동일 관례). */
function toIsoDate(dotDate: string): string {
  return dotDate.replace(/\./g, '-');
}

/** 'YYYY.MM.DD' → 'YY.MM.DD'(시안 ETC-4-PAGE-04-0 No.3 표기, 2자리 연도) — 실제
 * API 전송용 `startDate`/`endDate` 상태값(4자리)은 그대로 두고 화면 표시에만 쓴다. */
function toShortDate(dotDate: string): string {
  const [year, month, day] = dotDate.split('.');
  return `${year.slice(2)}.${month}.${day}`;
}

function ReportCreateByPeriodScreen() {
  const navigation = useNavigation<ReportCreateByPeriodNavigationProp>();

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [entryType, setEntryType] = useState<ReportEntryType | undefined>(undefined);
  const [titleError, setTitleError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | undefined>();
  const [periodSheetVisible, setPeriodSheetVisible] = useState(false);
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

  const hasInput =
    title.trim().length > 0 || startDate.length > 0 || endDate.length > 0 || entryType !== undefined;

  const handleBack = () => {
    if (hasInput) {
      setLeaveDialogVisible(true);
    } else {
      navigation.goBack();
    }
  };

  // 안드로이드 하드웨어 back도 AppBar 백버튼과 같은 이탈 확인을 거치게 한다
  // — 등록을 안 하면 시스템 back은 `handleBack`을 거치지 않고 화면을 그냥
  // 나가버린다(ADD-2-MODAL-01-0가 이 등록을 빠뜨려 실제로 겪은 버그,
  // design-verification.md ADD 섹션 참고 — 같은 실수를 반복하지 않는다).
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

  const canSubmit = title.trim().length > 0 && startDate.length > 0 && endDate.length > 0;

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
      const created = await reportService.createReportByPeriod(group.id, {
        title: title.trim(),
        startDate: toIsoDate(startDate),
        endDate: toIsoDate(endDate),
        entryType,
      });
      // ETC-4-PAGE-04-0: 성공 시 생성 완료된 보고서 상세로 이동한다(ReportCreateByLedgerScreen과
      // 같은 근거 — design-verification.md §5-11). navigate가 아니라 reset으로 생성 폼을
      // 스택에서 걷어내 뒤로가기가 폼이 아니라 보고서 목록으로 가게 한다.
      navigation.reset({
        index: 2,
        routes: [
          { name: 'Main', params: { screen: 'More' } },
          { name: 'ReportMain' },
          {
            name: 'ReportByPeriodDetail',
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
      <AppBar type="sub" title={REPORT_BY_PERIOD_TITLE} onBackPress={handleBack} />

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
          <Text style={styles.fieldLabel}>{REPORT_PERIOD_FIELD_LABEL}</Text>
          <Pressable style={styles.periodBox} onPress={() => setPeriodSheetVisible(true)}>
            <Text
              style={startDate && endDate ? styles.periodValue : styles.periodPlaceholder}
            >
              {startDate && endDate
                ? `${toShortDate(startDate)} ~ ${toShortDate(endDate)}`
                : REPORT_PERIOD_PLACEHOLDER}
            </Text>
            <Image source={CALENDAR_ICON} style={styles.periodIcon} />
          </Pressable>
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

      <DuesDateRangeSheet
        visible={periodSheetVisible}
        confirmLabel={DATE_SHEET_CONFIRM_LABEL}
        startDate={startDate || undefined}
        endDate={endDate || undefined}
        onClose={() => setPeriodSheetVisible(false)}
        onSave={(nextStart, nextEnd) => {
          setStartDate(nextStart);
          setEndDate(nextEnd);
        }}
      />

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
    gap: 4,
  },
  fieldGroup: {
    gap: 8,
    marginTop: 16,
  },
  fieldLabel: {
    ...TYPOGRAPHY.subtitle3,
  },
  periodBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: BORDER_NEUTRAL_NORMAL,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  periodPlaceholder: {
    ...TYPOGRAPHY.body1,
    color: FOREGROUND_DISABLED,
  },
  periodValue: {
    ...TYPOGRAPHY.body1,
    color: FOREGROUND_PRIMARY,
  },
  periodIcon: {
    width: 20,
    height: 20,
    tintColor: FOREGROUND_DISABLED,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  formError: {
    ...TYPOGRAPHY.body3,
    color: FEEDBACK_NEGATIVE_BOLD,
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
});

export default ReportCreateByPeriodScreen;
