import type { Meta, StoryObj } from '@storybook/react';
import TagField from './TagField';

const meta: Meta<typeof TagField> = {
  title: 'Input/Tag Field/TagField',
  component: TagField,
};
export default meta;
type Story = StoryObj<typeof TagField>;

export const WithTags: Story = {
  args: { tags: ['MT', '정산'], onChangeTags: () => {}, maxTags: 3 },
};

export const Empty: Story = {
  args: { tags: [], onChangeTags: () => {}, maxTags: 3 },
};

export const MaxReached: Story = {
  args: { tags: ['MT', '정산', '회비'], onChangeTags: () => {}, maxTags: 3 },
};
