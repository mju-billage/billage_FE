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
