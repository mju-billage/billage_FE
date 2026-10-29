import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Button from '../../components/Input/Button/Button';
import Calendar from '../../components/Data Display/Calendar/Calendar';
import { nextRangeSelection, todayKey } from '../../utils/calendarGrid';
import { DATE_RANGE_SHEET_CANCEL_LABEL, DATE_RANGE_SHEET_TITLE } from '../../constants/commonText';
import { TYPOGRAPHY } from '../../constants/typography';

function parseDateKey(date: string): { year: number; month: number } {
  const [year, month] = date.split('.').map(Number);
  return { year, month };
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
    const next = nextRangeSelection({ start: draftStart, end: draftEnd }, date);
    setDraftStart(next.start);
    setDraftEnd(next.end);
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
        outlinedDates={[todayKey()]}
        showDateFields={!!draftStart}
      />

      <View style={styles.footer}>
        <View style={styles.cancelButton}>
          <Button
            label={cancelLabel}
            hierarchy="tertiary"
            onPress={onClose}
            fullWidth
          />
        </View>
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
    ...TYPOGRAPHY.h3,
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
  },
  cancelButton: {
    width: 74,
  },
  confirmButton: {
    flex: 1,
  },
});

export default DuesDateRangeSheet;
