/** @screen DTB-3-SHEET-01-0 기간 선택 캘린더 (Dues 생성/수정 + Report 기간별 생성 공용) */
/**
 * 기간(시작일~마감일) 범위 선택 바텀시트. `TransactionFilterSheet`가 내역
 * 필터링용 커스텀 기간 캘린더로 같은 상호작용(첫 탭=시작일, 이후 탭=종료일,
 * 시작일보다 이른 날짜를 다시 찍으면 시작일 갱신)을 이미 구현하고 있지만,
 * 그 시트는 장부·구분·정렬까지 같이 묶인 내역 필터 전용 컴포넌트라 여기서
 * 그대로 가져다 쓸 수 없다(회비 생성 화면엔 그 섹션들이 필요 없고, 그 시트를
 * 억지로 재사용하면 내역 필터 동작에 회귀 위험이 생긴다) — 진짜 재사용 가능한
 * 조각은 `Calendar` 컴포넌트 자체뿐이라 그것만 그대로 쓰고, 범위 선택
 * 인터랙션(짧은 상태 로직)만 이 파일에 다시 옮겨 적었다. 단일 날짜용
 * `TransactionDateSheet`와 쌍을 이루는 범위용 시트로 보면 된다.
 *
 * 2026-09-05 시안 재대조(같은 DTB-3-SHEET-01-0 ID를 쓰는 두 시안 —
 * `내역_필터링_기간선택.png`(2026.05.10, 디자인 중)과
 * `더보기_보고서생성하기_기간별_기간선택.png`(2026.05.19, 디자인 완료=최신본)
 * — 둘 다 이 컴포넌트에 없던 요소 두 가지를 요구해서 보강했다:
 *  - 하단 시작/종료 날짜 미리보기 텍스트(2자리 연도, `YY.MM.DD`)
 *  - "선택하기" 옆 좌측 보조 버튼. 라벨이 시안마다 다르다(내역=`이전`,
 *    보고서=`취소`) — 진입 경로 차이(전자는 필터 시트로 복귀)일 뿐이라
 *    `cancelLabel` prop으로 받고, 지금 실제 호출부(Dues/Report)는 전부
 *    `취소`가 맞아 그걸 기본값으로 뒀다.
 *  - 두 시안이 "선택하기" 활성화 조건을 다르게 적어놨다(구버전은 시작일만,
 *    최신본은 시작+종료 모두) — 최신 확정본을 따라 기존 그대로 "둘 다
 *    선택돼야 활성화"를 유지했다(원래도 이렇게 구현돼 있었음).
 *  - 취소 버튼을 눌러 시트를 닫으면 draft가 초기화되지 않고 남아 있던
 *    기존 결함도 이 김에 고쳤다 — `visible`이 true로 바뀔 때마다 draft를
 *    부모가 들고 있는 `startDate`/`endDate` props로 다시 동기화한다(안 그러면
 *    "취소 후 재진입" 시 이전에 고르다 만 값이 그대로 남아 있었다).
 */
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Button from '../../components/Input/Button/Button';
import Calendar from '../../components/Data Display/Calendar/Calendar';
import { todayKey } from '../../utils/calendarGrid';
import {
  DATE_RANGE_SHEET_CANCEL_LABEL,
  DATE_RANGE_SHEET_DATE_PLACEHOLDER,
  DATE_RANGE_SHEET_END_LABEL,
  DATE_RANGE_SHEET_START_LABEL,
  DATE_RANGE_SHEET_TITLE,
} from '../../constants/commonText';
import { FOREGROUND_NEUTRAL_SUBTLE, FOREGROUND_SECONDARY } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

function parseDateKey(date: string): { year: number; month: number } {
  const [year, month] = date.split('.').map(Number);
  return { year, month };
}

/** 'YYYY.MM.DD' → 'YY.MM.DD'(시트 안 미리보기 전용, 2자리 연도 — 폼 필드 자체의
 * 표기(4자리)와는 다르다, 의도적인 차이). */
function toShortDate(dotDate: string): string {
  const [year, month, day] = dotDate.split('.');
  return `${year.slice(2)}.${month}.${day}`;
}

type DuesDateRangeSheetProps = {
  visible: boolean;
  confirmLabel: string;
  cancelLabel?: string;
  startDate?: string;
  endDate?: string;
  onClose: () => void;
  onSave: (startDate: string, endDate: string) => void;
};

function DuesDateRangeSheet({
  visible,
  confirmLabel,
  cancelLabel = DATE_RANGE_SHEET_CANCEL_LABEL,
  startDate,
  endDate,
  onClose,
  onSave,
}: DuesDateRangeSheetProps) {
  const [draftStart, setDraftStart] = useState(startDate);
  const [draftEnd, setDraftEnd] = useState(endDate);
  const [calendar, setCalendar] = useState(() =>
    parseDateKey(startDate || todayKey()),
  );

  useEffect(() => {
    if (visible) {
      setDraftStart(startDate);
      setDraftEnd(endDate);
      setCalendar(parseDateKey(startDate || todayKey()));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleSelectDate = (date: string) => {
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(date);
      setDraftEnd(undefined);
    } else if (date < draftStart) {
      setDraftEnd(draftStart);
      setDraftStart(date);
    } else {
      setDraftEnd(date);
    }
  };

  const handleChangeMonth = (delta: number) => {
    const next = new Date(calendar.year, calendar.month - 1 + delta, 1);
    setCalendar({ year: next.getFullYear(), month: next.getMonth() + 1 });
  };

  const handleSave = () => {
    if (!draftStart || !draftEnd) {
      return;
    }
    onSave(draftStart, draftEnd);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{DATE_RANGE_SHEET_TITLE}</Text>

      {/* 명세 No.4: 시작/종료 날짜 미리보기는 이 시트 자체의 previewRow 하나뿐이다
          (2자리 연도 YY.MM.DD, 포인트 컬러) — `Calendar`의 내장 `DateField`
          (4자리 연도, 기본색)는 다른 형식으로 중복 렌더되고 있었다, 꺼둔다. */}
      <Calendar
        year={calendar.year}
        month={calendar.month}
        selectedStartDate={draftStart}
        selectedEndDate={draftEnd}
        onSelectDate={handleSelectDate}
        onChangeMonth={handleChangeMonth}
        showDateFields={false}
      />

      <View style={styles.previewRow}>
        <View>
          <Text style={styles.previewLabel}>{DATE_RANGE_SHEET_START_LABEL}</Text>
          <Text style={styles.previewValue}>
            {draftStart ? toShortDate(draftStart) : DATE_RANGE_SHEET_DATE_PLACEHOLDER}
          </Text>
        </View>
        <View style={styles.previewEnd}>
          <Text style={styles.previewLabel}>{DATE_RANGE_SHEET_END_LABEL}</Text>
          <Text style={styles.previewValue}>
            {draftEnd ? toShortDate(draftEnd) : DATE_RANGE_SHEET_DATE_PLACEHOLDER}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          label={cancelLabel}
          hierarchy="tertiary"
          onPress={onClose}
          style={styles.cancelButton}
        />
        <View style={styles.confirmButton}>
          <Button
            label={confirmLabel}
            onPress={handleSave}
            disabled={!draftStart || !draftEnd}
            fullWidth
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.subtitle1,
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  previewEnd: {
    alignItems: 'flex-end',
  },
  previewLabel: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  previewValue: {
    ...TYPOGRAPHY.subtitle2,
    marginTop: 4,
    color: FOREGROUND_SECONDARY,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    height: 52,
  },
  confirmButton: {
    flex: 1,
  },
});

export default DuesDateRangeSheet;
