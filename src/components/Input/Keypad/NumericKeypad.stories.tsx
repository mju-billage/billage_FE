import type { Meta, StoryObj } from '@storybook/react';
import NumericKeypad from './NumericKeypad';

const meta: Meta<typeof NumericKeypad> = {
  title: 'Input/Keypad/NumericKeypad',
  component: NumericKeypad,
};
export default meta;
type Story = StoryObj<typeof NumericKeypad>;

export const Default: Story = {
  args: {
    onPressDigit: () => {},
    onPressDecimal: () => {},
    onBackspace: () => {},
    onConfirm: () => {},
  },
};
