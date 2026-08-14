import type { Meta, StoryObj } from '@storybook/react';
import VerificationField from './VerificationField';

const meta: Meta<typeof VerificationField> = {
  title: 'Input/Verification Field/VerificationField',
  component: VerificationField,
};
export default meta;
type Story = StoryObj<typeof VerificationField>;

export const Empty: Story = {
  args: { value: '', onChangeText: () => {}, length: 6 },
};

export const Partial: Story = {
  args: { value: '28', onChangeText: () => {}, length: 6 },
};

export const Disabled: Story = {
  args: { value: '', onChangeText: () => {}, length: 6, disabled: true },
};
