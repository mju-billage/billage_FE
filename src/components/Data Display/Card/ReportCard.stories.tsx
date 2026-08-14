import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import ReportCard from './ReportCard';

const meta: Meta<typeof ReportCard> = {
  title: 'Data Display/Card/ReportCard',
  component: ReportCard,
  decorators: [
    Story => (
      <View style={{ backgroundColor: '#E4E9F2', padding: 24 }}>
        <Story />
      </View>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof ReportCard>;

export const FolderVariant: Story = {
  args: {
    title: '1학기 보고서',
    dateRangeLabel: '25.03.02 ~ 25.08.30',
    income: 510000,
    expense: 602000,
    variant: 'folder',
    onPress: () => {},
  },
};

export const CardVariant: Story = {
  args: {
    title: 'MT 정산',
    income: 0,
    expense: 397000,
    onPress: () => {},
  },
};
