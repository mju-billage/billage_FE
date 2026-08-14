import type { Meta, StoryObj } from '@storybook/react';
import AgreementCheckboxRow from './AgreementCheckboxRow';
import {
  AGREEMENT_TAG_REQUIRED,
  AGREEMENT_TAG_OPTIONAL,
} from '../../../constants/commonText';

const meta: Meta<typeof AgreementCheckboxRow> = {
  title: 'Input/Control/AgreementCheckboxRow',
  component: AgreementCheckboxRow,
};
export default meta;
type Story = StoryObj<typeof AgreementCheckboxRow>;

export const Required: Story = {
  args: {
    label: '이용약관 동의',
    checked: true,
    tag: AGREEMENT_TAG_REQUIRED,
    onToggle: () => {},
    onPressDetail: () => {},
  },
};

export const Optional: Story = {
  args: {
    label: '마케팅 정보 수신 동의',
    checked: false,
    tag: AGREEMENT_TAG_OPTIONAL,
    onToggle: () => {},
  },
};

export const Emphasized: Story = {
  args: {
    label: '전체 동의',
    checked: true,
    emphasized: true,
    onToggle: () => {},
  },
};
