import type { Meta, StoryObj } from '@storybook/react';
import LegalDocumentView from './LegalDocumentView';

const meta: Meta<typeof LegalDocumentView> = {
  title: 'Data Display/Legal Document/LegalDocumentView',
  component: LegalDocumentView,
};
export default meta;
type Story = StoryObj<typeof LegalDocumentView>;

export const Default: Story = {
  args: {
    title: '서비스 이용약관',
    bodyText:
      '제1조 (목적) 이 약관은 Billage(이하 "회사")가 제공하는 모임 회비 관리 서비스의 이용과 관련하여 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.\n\n제2조 (정의) 이 약관에서 사용하는 용어의 정의는 다음과 같습니다.',
    onPressBack: () => {},
  },
};
