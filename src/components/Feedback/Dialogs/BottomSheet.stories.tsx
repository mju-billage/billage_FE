import type { Meta, StoryObj } from '@storybook/react';
import { Image, Pressable, StyleSheet, Text } from 'react-native';
import BottomSheet from './BottomSheet';

const DOCADD_ICON = require('../../../assets/icons/content/DocumentAdd.png');
const FOLDER_ICON = require('../../../assets/icons/action/Folder.png');

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  icon: { width: 20, height: 20 },
  label: { fontSize: 15, fontWeight: 'bold' },
});

const meta: Meta<typeof BottomSheet> = {
  title: 'Feedback/Dialogs/BottomSheet',
  component: BottomSheet,
};
export default meta;
type Story = StoryObj<typeof BottomSheet>;

export const NewItemExample: Story = {
  args: {
    visible: true,
    onClose: () => {},
    children: (
      <>
        <Pressable style={styles.row}>
          <Image source={DOCADD_ICON} style={styles.icon} />
          <Text style={styles.label}>새 장부 생성하기</Text>
        </Pressable>
        <Pressable style={styles.row}>
          <Image source={FOLDER_ICON} style={styles.icon} />
          <Text style={styles.label}>새 폴더 생성하기</Text>
        </Pressable>
      </>
    ),
  },
};
