/** @screen DTB-3-SHEET-02-0 장부 복수 선택 */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Button from '../../components/Input/Button/Button';
import TextButton from '../../components/Input/Button/TextButton';
import CheckListItem from '../../components/Data Display/Lists/CheckListItem';
import Chip from '../../components/Data Display/Chips/Chip';
import {
  FILTER_LEDGER_ADD_LABEL,
  LEDGER_SELECT_CREATE_NEW_LABEL,
  LEDGER_SELECT_EMPTY_GUIDE,
  LEDGER_SELECT_PREVIOUS_LABEL,
  LEDGER_SELECT_SHEET_TITLE,
} from '../../constants/transactionScreenText';
import { FOREGROUND_SECONDARY } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type LedgerOption = { id: string; name: string };

type TransactionLedgerMultiSelectSheetProps = {
  visible: boolean;
  /** 실 API에서 부모(`TransactionFilterSheet`)가 가져와 내려준다. */
  options: LedgerOption[];
  selectedIds: string[];
  onClose: () => void;
  onApply: (ledgerIds: string[]) => void;
  onPressCreateNewLedger: () => void;
};

/** 필터 시트의 "장부" 다중선택 바텀시트. 장부가 없으면 안내문+생성 링크를 보여준다. */
function TransactionLedgerMultiSelectSheet({
  visible,
  options,
  selectedIds,
  onClose,
  onApply,
  onPressCreateNewLedger,
}: TransactionLedgerMultiSelectSheetProps) {
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);

  const toggleLedger = (id: string) => {
    setDraftIds(current =>
      current.includes(id)
        ? current.filter(existing => existing !== id)
        : [...current, id],
    );
  };

  const handleApply = () => {
    onApply(draftIds);
    onClose();
  };

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <Text style={styles.title}>{LEDGER_SELECT_SHEET_TITLE}</Text>

      {options.length === 0 ? (
        <>
          <Text style={styles.emptyGuide}>{LEDGER_SELECT_EMPTY_GUIDE}</Text>
          <TextButton
            label={LEDGER_SELECT_CREATE_NEW_LABEL}
            onPress={() => {
              onClose();
              onPressCreateNewLedger();
            }}
          />
          <View style={styles.footerRow}>
            <View style={styles.footerButton}>
              <Button
                label={LEDGER_SELECT_PREVIOUS_LABEL}
                hierarchy="secondary"
                onPress={onClose}
                fullWidth
              />
            </View>
            <View style={styles.footerButton}>
              <Button
                label={FILTER_LEDGER_ADD_LABEL}
                onPress={handleApply}
                fullWidth
              />
            </View>
          </View>
        </>
      ) : (
        <>
          {draftIds.length > 0 && (
            <View style={styles.chipRow}>
              {draftIds.map(id => {
                const option = options.find(item => item.id === id);
                return option ? (
                  <Chip
                    key={id}
                    label={option.name}
                    onRemove={() => toggleLedger(id)}
                  />
                ) : null;
              })}
            </View>
          )}

          <View style={styles.list}>
            {options.map(option => (
              <CheckListItem
                key={option.id}
                label={option.name}
                selected={draftIds.includes(option.id)}
                onPress={() => toggleLedger(option.id)}
              />
            ))}
          </View>

          <View style={styles.footer}>
            <Button
              label={FILTER_LEDGER_ADD_LABEL}
              onPress={handleApply}
              fullWidth
            />
          </View>
        </>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.subtitle1,
    marginBottom: 16,
  },
  emptyGuide: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_SECONDARY,
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  list: {
    gap: 4,
  },
  footer: {
    marginTop: 24,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  footerButton: {
    flex: 1,
  },
});

export default TransactionLedgerMultiSelectSheet;
