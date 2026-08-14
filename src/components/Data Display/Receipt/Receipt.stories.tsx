import type { Meta, StoryObj } from '@storybook/react';
import { View } from 'react-native';
import Receipt from './Receipt';

const meta: Meta<typeof Receipt> = {
  title: 'Data Display/Receipt/Receipt',
  component: Receipt,
  decorators: [
    Story => (
      <View style={{ backgroundColor: '#E4E9F2', padding: 24 }}>
        <Story />
      </View>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Receipt>;

export const Default: Story = {
  args: {
    items: [
      { name: '소주', quantity: 20, amount: 200000 },
      { name: '플라스틱 접시', quantity: 10, amount: 20000 },
      { name: '소주컵', quantity: 10, amount: 15000 },
    ],
    total: 235000,
  },
};
