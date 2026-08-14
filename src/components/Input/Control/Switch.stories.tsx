import type { Meta, StoryObj } from '@storybook/react';
import Switch from './Switch';

const meta: Meta<typeof Switch> = {
  title: 'Input/Control/Switch',
  component: Switch,
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Off: Story = {
  args: { value: false, onValueChange: () => {} },
};

export const On: Story = {
  args: { value: true, onValueChange: () => {} },
};

export const Disabled: Story = {
  args: { value: false, onValueChange: () => {}, disabled: true },
};
