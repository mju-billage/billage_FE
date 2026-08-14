import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import MiniCalendarCard from './MiniCalendarCard';
import { MOCK_DASHBOARD_SUMMARY } from '../../../types/dashboard';

const meta: Meta<typeof MiniCalendarCard> = {
  title: 'Data Display/Card/MiniCalendarCard',
  component: MiniCalendarCard,
  decorators: [
    Story => (
      <View style={{ backgroundColor: '#E4E9F2', padding: 24 }}>
        <Story />
      </View>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof MiniCalendarCard>;

export const Default: Story = {
  args: {
    data: MOCK_DASHBOARD_SUMMARY.miniCalendar,
    onPress: () => {},
  },
};
