import type { Meta, StoryObj } from '@storybook/react';
import EntityCard from './EntityCard';

const meta: Meta<typeof EntityCard> = {
  title: 'Data Display/Card/EntityCard',
  component: EntityCard,
};
export default meta;
type Story = StoryObj<typeof EntityCard>;

export const Profile: Story = {
  args: {
    type: 'profile',
    name: '김둘봉이',
    roleLabel: '총무',
    email: 'billage@example.com',
  },
};

export const ProfileEdit: Story = {
  args: { type: 'profileEdit', name: '김둘봉이', roleLabel: '총무' },
};

export const Group: Story = {
  args: {
    type: 'group',
    groupName: '디지털서울문화예술대학교',
    label: '활성',
    memberCount: 24,
    onPress: () => {},
  },
};

export const NewGroup: Story = {
  args: { type: 'newGroup', onPress: () => {} },
};
