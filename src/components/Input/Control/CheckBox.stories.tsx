import type { Meta, StoryObj } from '@storybook/react';
import CheckBox from './CheckBox';

const meta: Meta<typeof CheckBox> = {
  title: 'Input/Control/CheckBox',
  component: CheckBox,
};
export default meta;
type Story = StoryObj<typeof CheckBox>;

export const SquareUnchecked: Story = {
  args: { checked: false, onToggle: () => {} },
};

export const SquareChecked: Story = {
  args: { checked: true, onToggle: () => {} },
};

export const CircleChecked: Story = {
  args: { checked: true, shape: 'circle', onToggle: () => {} },
};

export const Disabled: Story = {
  args: { checked: false, onToggle: () => {}, disabled: true },
};
