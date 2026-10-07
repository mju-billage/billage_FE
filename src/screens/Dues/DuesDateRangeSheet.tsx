import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Button from '../../components/Input/Button/Button';
import Calendar from '../../components/Data Display/Calendar/Calendar';
import { todayKey } from '../../utils/calendarGrid';
import {
  DATE_RANGE_SHEET_CANCEL_LABEL,
  DATE_RANGE_SHEET_DATE_PLACEHOLDER,
  DATE_RANGE_SHEET_END_LABEL,
  DATE_RANGE_SHEET_START_LABEL,
  DATE_RANGE_SHEET_TITLE,
} from '../../constants/commonText';
import { FOREGROUND_NEUTRAL_SUBTLE, FOREGROUND_SECONDARY } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

function parseDateKey(date: string): { year: number; month: number } {
  const [year, month] = date.split('.').map(Number);
  return { year, month };
}

function toShortDate(dotDate: string): string {
  const [year, month, day] = dotDate.split('.');
  return `${year.slice(2)}.${month}.${day}`;
}

type DuesDateRangeSheetProps = {
  visible: boolean;
  confirmLabel: string;
  cancelLabel?: string;
  startDate?: string;
  endDate?: string;
  onClose: () => void;
  onSave: (startDate: string, endDate: string) => void;
};

function DuesDateRangeSheet({
  visible,
  confirmLabel,
  cancelLabel = DATE_RANGE_SHEET_CANCEL_LABEL,
  startDate,
  endDate,
  onClose,
  onSave,
}: DuesDateRangeSheetProps) {
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd, setDraftEnd] = useState(endDate);
  const [calendar, setCalendar] = useState(() =>
    parseDateKey(startDate || todayKey()),
  );

  useEffect(() => {
    if (visible) {
      setDraftStart(startDate);
      setDraftEnd(endDate);
      setCalendar(parseDateKey(startDate || todayKey()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleSelectDate = (date: string) => {
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(date);
      setDraftEnd(undefined);
    } else if (date < draftStart) {
      setDraftEnd(draftStart);
      setDraftStart(date);
    } else {
      setDraftEnd(date);
    }
  };

  const handleChangeMonth = (delta: number) => {
    const next = new Date(calendar.year, calendar.month - 1 + delta, 1);
    setCalendar({ year: next.getFullYear(), month: next.getMonth() + 1 });
  };

  const handleSave = () => {
    if (!draftStart || !draftEnd) {
      return;
    }
    onSave(draftStart, draftEnd);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{DATE_RANGE_SHEET_TITLE}</Text>

      <Calendar
        year={calendar.year}
        month={calendar.month}
        selectedStartDate={draftStart}
        selectedEndDate={draftEnd}
        onSelectDate={handleSelectDate}
        onChangeMonth={handleChangeMonth}
        showDateFields={false}
      />

      <View style={styles.previewRow}>
        <View>
          <Text style={styles.previewLabel}>{DATE_RANGE_SHEET_START_LABEL}</Text>
          <Text style={styles.previewValue}>
            {draftStart ? toShortDate(draftStart) : DATE_RANGE_SHEET_DATE_PLACEHOLDER}
          </Text>
        </View>
        <View style={styles.previewEnd}>
          <Text style={styles.previewLabel}>{DATE_RANGE_SHEET_END_LABEL}</Text>
          <Text style={styles.previewValue}>
            {draftEnd ? toShortDate(draftEnd) : DATE_RANGE_SHEET_DATE_PLACEHOLDER}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          label={cancelLabel}
          hierarchy="tertiary"
          onPress={onClose}
          style={styles.cancelButton}
        />
        <View style={styles.confirmButton}>
          <Button
            label={confirmLabel}
            onPress={handleSave}
            disabled={!draftStart || !draftEnd}
            fullWidth
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.subtitle1,
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  previewEnd: {
    alignItems: 'flex-end',
  },
  previewLabel: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  previewValue: {
    ...TYPOGRAPHY.subtitle2,
    marginTop: 4,
    color: FOREGROUND_SECONDARY,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    height: 52,
  },
  confirmButton: {
    flex: 1,
  },
});

export default DuesDateRangeSheet;
