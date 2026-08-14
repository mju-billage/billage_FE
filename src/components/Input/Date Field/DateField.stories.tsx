import type { Meta, StoryObj } from '@storybook/react';
import DateField from './DateField';

const meta: Meta<typeof DateField> = {
  title: 'Input/Date Field/DateField',
  component: DateField,
};
export default meta;
type Story = StoryObj<typeof DateField>;

export const Placeholder: Story = {
  args: { onPress: () => {} },
};

export const Filled: Story = {
  args: { startDate: '25.03.02', endDate: '25.08.30', onPress: () => {} },
};
