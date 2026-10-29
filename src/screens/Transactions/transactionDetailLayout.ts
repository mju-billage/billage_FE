import { StyleSheet } from 'react-native';
import {
  FOREGROUND_NEUTRAL_SUBTLE,
  FOREGROUND_PRIMARY,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

/**
 * TransactionDetailScreen 과 TransactionRegisterScreen(editReal) 이 "상세 화면과
 * 같아야 하는" 부분에 공유하는 스타일(QA-044). 값이 복붙으로 갈라지지 않게 여기
 * 하나만 고치면 둘 다 바뀐다.
 */
export const transactionDetailLayoutStyles = StyleSheet.create({
  content: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 0,
  },
  amountText: {
    ...TYPOGRAPHY.h1,
    color: FOREGROUND_PRIMARY,
  },
  amountSpacing: {
    marginTop: 8,
    marginBottom: 24,
  },
  ledgerLockedHint: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: -8,
    marginBottom: 4,
  },
  dividerWrapper: {
    marginTop: 12,
  },
  section: {
    marginTop: 24,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  receiptSectionLabel: {
    ...TYPOGRAPHY.subtitle1,
  },
  receiptCount: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  receiptCountCurrent: {
    color: FOREGROUND_PRIMARY,
  },
  thumbnailRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
});
