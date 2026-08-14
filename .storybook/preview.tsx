import type { Preview } from '@storybook/react-webpack5';
import React from 'react';
import { View } from 'react-native';

/**
 * 앱이 다크모드를 지원하지 않으므로 스토리는 항상 고정된 라이트 배경 위에서 렌더링한다.
 */
const preview: Preview = {
  decorators: [
    Story => (
      <View style={{ padding: 24, backgroundColor: '#FBFCFE', minHeight: '100vh' as unknown as number }}>
        <Story />
      </View>
    ),
  ],
};

export default preview;
