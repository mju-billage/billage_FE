import type { Meta, StoryObj } from '@storybook/react';
import FolderItem from './FolderItem';

const meta: Meta<typeof FolderItem> = {
  title: 'Data Display/Folder/FolderItem',
  component: FolderItem,
};
export default meta;
type Story = StoryObj<typeof FolderItem>;

export const FolderGrid: Story = {
  args: { kind: 'folder', name: 'MT', subtitle: '2개의 항목', onPress: () => {} },
};

export const FolderEmptyGrid: Story = {
  args: {
    kind: 'folder',
    name: 'MT',
    subtitle: '0개의 항목',
    hasItems: false,
    onPress: () => {},
  },
};

export const LedgerGrid: Story = {
  args: {
    kind: 'ledger',
    name: '1학기',
    subtitle: '25.03.02',
    onPress: () => {},
  },
};

export const ListSelected: Story = {
  args: {
    kind: 'folder',
    name: '축제',
    subtitle: '2개의 항목',
    layout: 'list',
    selected: true,
    onPress: () => {},
  },
};

export const ListUnselected: Story = {
  args: {
    kind: 'folder',
    name: '축제',
    subtitle: '2개의 항목',
    layout: 'list',
    selected: false,
    onPress: () => {},
  },
};

export const ListLedger: Story = {
  args: {
    kind: 'ledger',
    name: '1학기',
    subtitle: '25.03.02',
    layout: 'list',
    onPress: () => {},
  },
};
