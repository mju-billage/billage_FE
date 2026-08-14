import type { Meta, StoryObj } from '@storybook/react';
import AppBar from './AppBar';

const BELL_ICON = require('../../../assets/icons/communication/Bell.png');
const CLOSE_ICON = require('../../../assets/icons/action/Close.png');
const DOWNLOAD_ICON = require('../../../assets/icons/content/DocumentAdd.png');

const meta: Meta<typeof AppBar> = {
  title: 'Navigation/App bar/AppBar',
  component: AppBar,
};
export default meta;
type Story = StoryObj<typeof AppBar>;

export const TitleOnly: Story = {
  args: {
    type: 'titleOnly',
    title: '타이틀',
    showDropdown: true,
    onPressDropdown: () => {},
    rightIcons: [
      { icon: BELL_ICON, onPress: () => {} },
      { icon: CLOSE_ICON, onPress: () => {} },
    ],
  },
};

export const Sub: Story = {
  args: {
    type: 'sub',
    title: '장부 상세',
    onBackPress: () => {},
    rightIcons: [
      { icon: BELL_ICON, onPress: () => {} },
      { icon: CLOSE_ICON, onPress: () => {} },
    ],
  },
};

export const DetailDownload: Story = {
  args: {
    type: 'detailDownload',
    title: '내역 제목',
    subtitle: 'YY.MM.DD',
    onBackPress: () => {},
    rightIcons: [{ icon: DOWNLOAD_ICON, onPress: () => {} }],
  },
};

export const ImageSelect: Story = {
  args: {
    type: 'imageSelect',
    title: '타이틀',
    showDropdown: true,
    onPressDropdown: () => {},
    onBackPress: () => {},
    selectedCount: 1,
  },
};
