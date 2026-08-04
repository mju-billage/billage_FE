import SegmentedControl from '../../components/Selection/SegmentedControl';
import {
  CALENDAR_VIEW_TOGGLE_CALENDAR_LABEL,
  CALENDAR_VIEW_TOGGLE_DAILY_LABEL,
} from '../../constants/calendarScreenText';

type CalendarViewMode = 'calendar' | 'daily';

type CalendarViewToggleProps = {
  onPressDaily: () => void;
};

/** "캘린더"/"일별" 보기 전환 세그먼트. "일별"은 아직 목적지가 없어 탭해도 동작하지 않는다. */
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
