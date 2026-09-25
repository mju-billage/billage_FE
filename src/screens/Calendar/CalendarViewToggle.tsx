import SegmentedControl from '../../components/Input/Control/SegmentedControl';
import {
  CALENDAR_VIEW_TOGGLE_CALENDAR_LABEL,
  CALENDAR_VIEW_TOGGLE_DAILY_LABEL,
} from '../../constants/calendarScreenText';

type CalendarViewMode = 'calendar' | 'daily';

type CalendarViewToggleProps = {
  onPressDaily: () => void;
};

function CalendarViewToggle({ onPressDaily }: CalendarViewToggleProps) {
  const handleChange = (value: CalendarViewMode) => {
    if (value === 'daily') {
      onPressDaily();
    }
  };

  return (
    <SegmentedControl<CalendarViewMode>
      options={[
        { label: CALENDAR_VIEW_TOGGLE_CALENDAR_LABEL, value: 'calendar' },
        { label: CALENDAR_VIEW_TOGGLE_DAILY_LABEL, value: 'daily' },
      ]}
      value="calendar"
      onChange={handleChange}
    />
  );
}

export default CalendarViewToggle;
