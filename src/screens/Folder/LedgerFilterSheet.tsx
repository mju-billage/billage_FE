/** @screen FDR-3-SHEET-03-0 장부상세_필터링 */
/**
 * 기간(period) 필터는 없다 — `GET /ledgers/{ledgerId}/entries`
 * 쿼리 파라미터가 `type`/`status`/`keyword`/`page`/`size`/`sort`뿐이라 서버에
 * 날짜 범위로 거를 방법이 없다(전체 페이지를 다 받아와 클라이언트에서 다시 거르는
 * 건 페이지네이션 목록에서 부정확하다 — 지금 로드된 페이지 안에서만 걸러진다).
 * 대신 서버가 지원하는 승인 상태(status)로 거른다.
 */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Button from '../../components/Input/Button/Button';
import TextButton from '../../components/Input/Button/TextButton';
import FilterPill from '../../components/Input/Filter/FilterPill';
import type { EntryListParams } from '../../services/entryService';
import {
  FILTER_APPLY_LABEL,
  FILTER_RESET_LABEL,
  FILTER_SHEET_TITLE,
  FILTER_SORT_LABEL,
  FILTER_SORT_LATEST,
  FILTER_SORT_OLDEST,
  FILTER_STATUS_ALL,
  FILTER_STATUS_APPROVED,
  FILTER_STATUS_LABEL,
  FILTER_STATUS_PENDING,
  FILTER_TYPE_ALL,
  FILTER_TYPE_EXPENSE,
  FILTER_TYPE_INCOME,
  FILTER_TYPE_LABEL,
} from '../../constants/ledgerScreenText';
import { FOREGROUND_NEUTRAL_NORMAL } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

export type LedgerFilterType = 'all' | 'income' | 'expense';
export type LedgerFilterStatus = 'all' | 'pending' | 'approved';
export type LedgerFilterSort = 'latest' | 'oldest';

export type LedgerFilterValue = {
  type: LedgerFilterType;
  status: LedgerFilterStatus;
  sort: LedgerFilterSort;
};

export const DEFAULT_LEDGER_FILTER: LedgerFilterValue = {
  type: 'all',
  status: 'all',
  sort: 'latest',
};

/** 필터 값을 `GET /ledgers/{ledgerId}/entries` 쿼리로 바꾼다 — 필터는 서버가 거르므로
 * 이 값을 `entryService.getEntries()`에 그대로 얹으면 된다(장부 상세·내역 검색 공용).
 * 최신순은 서버 기본 정렬(`occurredOn,desc` + `id,desc`)을 그대로 쓰려고 `sort`를 안 넘긴다. */
export function toEntryFilterQuery(
  value: LedgerFilterValue,
): Pick<EntryListParams, 'type' | 'status' | 'sort'> {
  return {
    type: value.type === 'income' ? 'INCOME' : value.type === 'expense' ? 'EXPENSE' : undefined,
    status:
      value.status === 'pending' ? 'PENDING' : value.status === 'approved' ? 'APPROVED' : undefined,
    sort: value.sort === 'oldest' ? 'occurredOn,asc' : undefined,
  };
}

type LedgerFilterSheetProps = {
  visible: boolean;
  value: LedgerFilterValue;
  onClose: () => void;
  onApply: (value: LedgerFilterValue) => void;
};

/** 장부 상세·내역 검색 화면이 함께 쓰는 필터 바텀시트: 구분/승인 상태/정렬. 필터 값은
 * 호출한 화면이 들고(`value`/`onApply`), 목록 반영은 그 화면이 `toEntryFilterQuery()`로
 * 서버에 다시 조회하는 방식이다. */
function LedgerFilterSheet({
  visible,
  value,
  onClose,
  onApply,
}: LedgerFilterSheetProps) {
  const [draft, setDraft] = useState<LedgerFilterValue>(value);

  const handleReset = () => {
    setDraft(DEFAULT_LEDGER_FILTER);
  };

  const handleApply = () => {
    onApply(draft);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{FILTER_SHEET_TITLE}</Text>
        <TextButton
          label={FILTER_RESET_LABEL}
          hierarchy="tertiary"
          onPress={handleReset}
        />
      </View>

      <Text style={styles.sectionLabel}>{FILTER_TYPE_LABEL}</Text>
      <View style={styles.chipRow}>
        <FilterPill
          label={FILTER_TYPE_ALL}
          active={draft.type === 'all'}
          onPress={() => setDraft({ ...draft, type: 'all' })}
        />
        <FilterPill
          label={FILTER_TYPE_INCOME}
          active={draft.type === 'income'}
          onPress={() => setDraft({ ...draft, type: 'income' })}
        />
        <FilterPill
          label={FILTER_TYPE_EXPENSE}
          active={draft.type === 'expense'}
          onPress={() => setDraft({ ...draft, type: 'expense' })}
        />
      </View>

      <Text style={styles.sectionLabel}>{FILTER_STATUS_LABEL}</Text>
      <View style={styles.chipRow}>
        <FilterPill
          label={FILTER_STATUS_ALL}
          active={draft.status === 'all'}
          onPress={() => setDraft({ ...draft, status: 'all' })}
        />
        <FilterPill
          label={FILTER_STATUS_PENDING}
          active={draft.status === 'pending'}
          onPress={() => setDraft({ ...draft, status: 'pending' })}
        />
        <FilterPill
          label={FILTER_STATUS_APPROVED}
          active={draft.status === 'approved'}
          onPress={() => setDraft({ ...draft, status: 'approved' })}
        />
      </View>

      <Text style={styles.sectionLabel}>{FILTER_SORT_LABEL}</Text>
      <View style={styles.chipRow}>
        <FilterPill
          label={FILTER_SORT_LATEST}
          active={draft.sort === 'latest'}
          onPress={() => setDraft({ ...draft, sort: 'latest' })}
        />
        <FilterPill
          label={FILTER_SORT_OLDEST}
          active={draft.sort === 'oldest'}
          onPress={() => setDraft({ ...draft, sort: 'oldest' })}
        />
      </View>

      <View style={styles.footer}>
        <Button label={FILTER_APPLY_LABEL} onPress={handleApply} fullWidth />
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  title: {
    ...TYPOGRAPHY.subtitle1,
  },
  sectionLabel: {
    ...TYPOGRAPHY.body3,
    fontWeight: 'bold',
    color: FOREGROUND_NEUTRAL_NORMAL,
    marginTop: 16,
    marginBottom: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  footer: {
    marginTop: 24,
  },
});

export default LedgerFilterSheet;
