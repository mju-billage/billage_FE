import type { Meta, StoryObj } from '@storybook/react';
import BottomNavigation from './BottomNavigation';

const HOME_ICON = require('../../../assets/icons/action/Home.png');
const DB_ICON = require('../../../assets/icons/action/DataBase.png');
const FOLDER_ICON = require('../../../assets/icons/action/Folder.png');
const DUES_ICON = require('../../../assets/icons/action/Dues.png');
const MORE_ICON = require('../../../assets/icons/action/MenuHorizontal.png');

const ITEMS = [
  { key: 'home', icon: HOME_ICON, label: '홈' },
  { key: 'transactions', icon: DB_ICON, label: '내역' },
  { key: 'folder', icon: FOLDER_ICON, label: '폴더' },
  { key: 'dues', icon: DUES_ICON, label: '납부관리' },
  { key: 'more', icon: MORE_ICON, label: '더보기' },
];

const meta: Meta<typeof BottomNavigation> = {
  title: 'Navigation/Bottom Navigation/BottomNavigation',
  component: BottomNavigation,
};
export default meta;
type Story = StoryObj<typeof BottomNavigation>;

export const Default: Story = {
  args: { items: ITEMS, activeKey: 'home', onChange: () => {} },
};
