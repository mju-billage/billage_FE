/** @screen FDR-3-PAGE-01-0 이동 경로 선택 */
/** @screen FDR-4-SNACKBAR-01-0 이동 완료 / 폴더 해제_완료 (여기는 이동 완료 절반. 폴더 해제_완료는
 * FolderScreen.tsx) */
/**
 * 0-2 다건 이동 판단: 서버는 `PATCH /folders/{id}` / `PATCH /ledgers/{id}` 단건뿐이라
 * 선택된 개수만큼 순차 호출한다(병렬 아님 — 서버 부하를 줄이고, 실패 시 "몇 번째까지
 * 성공했는지"를 순서대로 명확히 알 수 있어서다). 중간에 실패해도 이미 이동된 항목은
 * 롤백하지 않는다(서버에 다건 트랜잭션 API가 없어 애초에 불가능) — 대신 성공/실패
 * 개수를 그대로 스낵바에 보여준다("N개 이동 완료, M개 실패했어요"), 조용히 전부
 * 성공한 척하지 않는다.
 *
 * 장부를 최상위(destinationFolderId: null)로 이동하는 것은 서버 문서에 없는 동작이라
 * (Ledger.txt는 Folder.txt와 달리 `folderId: null`의 의미를 명시하지 않음,
 * docs/api-gaps.md 참고) 그 조합만 UI에서 막는다 — 폴더 이동은 최상위 포함 전부 허용.
 */
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import FolderItem from '../../components/Data Display/Folder/FolderItem';
import { getActiveGroup } from '../../types/group';
import { getCachedFolderTree } from '../../types/folderTree';
import { findFolderNode, getChildFolders } from '../../utils/folderTree';
import * as folderService from '../../services/folderService';
import * as ledgerService from '../../services/ledgerService';
import {
  MOVE_DESTINATION_CONFIRM_LABEL,
  MOVE_DESTINATION_LEDGER_TO_ROOT_BLOCKED,
  MOVE_DESTINATION_MOVING_LABEL,
  MOVE_DESTINATION_NO_SUBFOLDER,
  MOVE_DESTINATION_ROOT_TITLE,
  SNACKBAR_FOLDER_MOVE_PARTIAL_MIDDLE,
  SNACKBAR_FOLDER_MOVE_PARTIAL_SUFFIX,
  SNACKBAR_FOLDER_MOVED,
} from '../../constants/folderScreenText';
import { FEEDBACK_NEGATIVE_BOLD, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SNACKBAR_AUTO_HIDE_MS = 1600;

type FolderMoveDestinationNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'FolderMoveDestination'
>;
type FolderMoveDestinationRouteProp = RouteProp<
  RootStackParamList,
  'FolderMoveDestination'
>;

/** 이동 경로 선택: 폴더 트리를 재귀적으로 탐색하며 현재 위치를 이동 대상으로 확정한다. */
function FolderMoveDestinationScreen() {
  const navigation = useNavigation<FolderMoveDestinationNavigationProp>();
  const route = useRoute<FolderMoveDestinationRouteProp>();
  const { items, sourceFolderId, destinationFolderId } = route.params;

  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  const group = getActiveGroup();
  // FolderSelectMoveScreen이 이 플로우 진입 직전에 이미 트리를 조회해뒀다(캐시 존재
  // 보장) — 화면을 드릴다운할 때마다 같은 트리를 다시 부르지 않고 캐시를 그대로 쓴다.
  const tree = group ? getCachedFolderTree(group.id) : [];

  const currentNode = destinationFolderId
    ? findFolderNode(tree, destinationFolderId)
    : null;
  const title = currentNode ? currentNode.name : MOVE_DESTINATION_ROOT_TITLE;

  const selectedFolderIds = new Set(
    items.filter(item => item.kind === 'folder').map(item => item.id),
  );
  const subfolders = getChildFolders(tree, destinationFolderId).filter(
    folder => !selectedFolderIds.has(folder.id),
  );

  const hasLedgerSelected = items.some(item => item.kind === 'ledger');
  const isLedgerToRootBlocked = destinationFolderId === null && hasLedgerSelected;

  const handlePressFolder = (folderId: string) => {
    navigation.push('FolderMoveDestination', {
      items,
      sourceFolderId,
      destinationFolderId: folderId,
    });
  };

  const handleConfirm = async () => {
    if (isMoving || isLedgerToRootBlocked) {
      return;
    }
    setIsMoving(true);
    let succeeded = 0;
    let failed = 0;
    // 순차 호출: 서버가 다건 이동 API를 안 줘서 하나씩 부른다(위 주석 참고).
    for (const item of items) {
      try {
        if (item.kind === 'folder') {
          await folderService.updateFolder(item.id, {
            parentFolderId: destinationFolderId,
          });
        } else {
          await ledgerService.updateLedger(item.id, {
            folderId: destinationFolderId,
          });
        }
        succeeded += 1;
      } catch {
        failed += 1;
      }
    }
    setIsMoving(false);

    if (failed === 0) {
      setSnackbarMessage(SNACKBAR_FOLDER_MOVED);
    } else {
      setSnackbarMessage(
        `${succeeded}${SNACKBAR_FOLDER_MOVE_PARTIAL_MIDDLE}${failed}${SNACKBAR_FOLDER_MOVE_PARTIAL_SUFFIX}`,
      );
    }
    setTimeout(() => {
      navigation.popToTop();
    }, SNACKBAR_AUTO_HIDE_MS);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <AppBar title={title} onBackPress={() => navigation.goBack()} />

      <View style={styles.body}>
        {subfolders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>
              {MOVE_DESTINATION_NO_SUBFOLDER}
            </Text>
          </View>
        ) : (
          <FlatList
            data={subfolders}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <FolderItem
                kind="folder"
                name={item.name}
                subtitle={`${item.children.length + item.ledgerCount}개의 항목`}
                layout="list"
                hasItems={item.children.length + item.ledgerCount > 0}
                onPress={() => handlePressFolder(item.id)}
              />
            )}
          />
        )}

        {isLedgerToRootBlocked && (
          <Text style={styles.blockedHint}>
            {MOVE_DESTINATION_LEDGER_TO_ROOT_BLOCKED}
          </Text>
        )}

        <View style={styles.footer}>
          <Button
            label={isMoving ? MOVE_DESTINATION_MOVING_LABEL : MOVE_DESTINATION_CONFIRM_LABEL}
            onPress={handleConfirm}
            disabled={isMoving || isLedgerToRootBlocked}
            fullWidth
          />
        </View>
      </View>

      {snackbarMessage && (
        <View style={styles.snackbarWrapper}>
          <Snackbar visible title={snackbarMessage} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  blockedHint: {
    ...TYPOGRAPHY.body3,
    color: FEEDBACK_NEGATIVE_BOLD,
    marginBottom: 8,
  },
  snackbarWrapper: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 88,
  },
  footer: {
    paddingVertical: 16,
  },
});

export default FolderMoveDestinationScreen;
