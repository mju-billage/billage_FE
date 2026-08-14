import type { Meta, StoryObj } from '@storybook/react';
import AttachmentAddButton from './AttachmentAddButton';

const meta: Meta<typeof AttachmentAddButton> = {
  title: 'Input/Button/AttachmentAddButton',
  component: AttachmentAddButton,
};
export default meta;
type Story = StoryObj<typeof AttachmentAddButton>;

export const AttachmentAdd: Story = {
  args: { type: 'attachmentAdd', onPress: () => {} },
};

export const Gallery: Story = {
  args: { type: 'gallery', onPress: () => {} },
};

export const Disabled: Story = {
  args: { type: 'attachmentAdd', disabled: true, onPress: () => {} },
};
