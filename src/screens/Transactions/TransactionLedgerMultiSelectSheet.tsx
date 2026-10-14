import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import LedgerMultiSelectContent from './LedgerMultiSelectContent';

type LedgerOption = { id: string; name: string };

type TransactionLedgerMultiSelectSheetProps = {
  visible: boolean;
  options: LedgerOption[];
  selectedIds: string[];
  onClose: () => void;
  onApply: (ledgerIds: string[]) => void;
  onPressCreateNewLedger: () => void;
};

function TransactionLedgerMultiSelectSheet({
  visible,
  options,
  selectedIds,
  onClose,
  onApply,
  onPressCreateNewLedger,
}: TransactionLedgerMultiSelectSheetProps) {
  return (
    <BottomSheet visible={visible} onClose={onClose}>
      <LedgerMultiSelectContent
        options={options}
        initialSelectedIds={selectedIds}
        onPrevious={onClose}
        onConfirm={ledgerIds => {
          onApply(ledgerIds);
          onClose();
        }}
        onPressCreateNewLedger={() => {
          onClose();
          onPressCreateNewLedger();
        }}
      />
    </BottomSheet>
  );
}

export default TransactionLedgerMultiSelectSheet;
