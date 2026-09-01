/** @screen ADD-2-SHEET-07-0 일자 선택 캘린더 */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Button from '../../components/Input/Button/Button';
import Calendar from '../../components/Data Display/Calendar/Calendar';
import { todayKey } from '../../types/transaction';
import {
  DATE_SHEET_CANCEL_LABEL,
  DATE_SHEET_CONFIRM_LABEL,
} from '../../constants/transactionScreenText';
import { TYPOGRAPHY } from '../../constants/typography';

type TransactionDateSheetProps = {
  visible: boolean;
  title: string;
  value: string;
  onClose: () => void;
  onSave: (date: string) => void;
};

function parseDateKey(date: string): { year: number; month: number } {
  const [year, month] = date.split('.').map(Number);
  return { year, month };
}

/** 단일 날짜 선택 바텀시트. 기존 range-select `Calendar`를 같은 날짜를 start/end에 넣어 단일선택처럼 쓴다. */
function TransactionDateSheet({
  visible,
  title,
  value,
  onClose,
  onSave,
}: TransactionDateSheetProps) {
  const [selectedDate, setSelectedDate] = useState(value);
  const [calendar, setCalendar] = useState(() => parseDateKey(value));

  const handleChangeMonth = (delta: number) => {
    const next = new Date(calendar.year, calendar.month - 1 + delta, 1);
    setCalendar({ year: next.getFullYear(), month: next.getMonth() + 1 });
  };

  const handleSave = () => {
    onSave(selectedDate);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{title}</Text>

      <Calendar
        year={calendar.year}
        month={calendar.month}
        selectedStartDate={selectedDate}
        selectedEndDate={selectedDate}
        outlinedDates={[todayKey()]}
        onSelectDate={setSelectedDate}
        onChangeMonth={handleChangeMonth}
        showDateFields={false}
      />

      <View style={styles.footerRow}>
        <View style={styles.footerButton}>
          <Button
            label={DATE_SHEET_CANCEL_LABEL}
            hierarchy="secondary"
            onPress={onClose}
            fullWidth
          />
        </View>
        <View style={styles.footerButton}>
          <Button
            label={DATE_SHEET_CONFIRM_LABEL}
            onPress={handleSave}
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
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  footerButton: {
    flex: 1,
  },
});

export default TransactionDateSheet;
