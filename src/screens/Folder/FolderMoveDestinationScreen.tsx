/** @screen FDR-3-PAGE-01-0 이동 경로 선택 */
/** @screen FDR-4-SNACKBAR-01-0 이동 완료 / 폴더 해제_완료 (여기는 이동 완료 절반. 폴더 해제_완료는
 * FolderScreen.tsx) */
/**
 * 다건 이동: `folderService.moveFolderItems()`(`POST .../folder-items/move`)
 * 한 번 호출로 처리한다 — 서버가 한 트랜잭션으로 처리해 부분 성공이 없다(하나라도
 * 실패하면 전부 취소, 예: 목적지가 이동 대상 자신/하위면 `409
 * INVALID_PARENT_FOLDER`).
 *
 * 장부도 최상위(destinationFolderId: null)로 이동할 수 있다 — Folder.txt §7에
 * "`targetFolderId`가 `null`이면 최상위 영역으로 이동"이라고 장부·폴더 구분 없이
 * 명시돼 있고, 이동한 장부는 `GET .../folder-items`(폴더ID 생략=최상위) 응답에
 * `LEDGER` 항목으로 나타난다.
 *
 * 목적지 폴더 트리 탐색(아래 `subfolders`)은 `getFolderTree()`로 한다.
 */
import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
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
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  MOVE_DESTINATION_CONFIRM_LABEL,
  MOVE_DESTINATION_MOVING_LABEL,
  MOVE_DESTINATION_NO_SUBFOLDER,
  MOVE_DESTINATION_ROOT_TITLE,
  SNACKBAR_FOLDER_MOVED,
} from '../../constants/folderScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
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

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const handlePressFolder = (folderId: string) => {
    navigation.push('FolderMoveDestination', {
      items,
      sourceFolderId,
      destinationFolderId: folderId,
    });
  };

  const handleConfirm = async () => {
    if (isMoving || !group) {
      return;
    }
    setIsMoving(true);
    try {
      await folderService.moveFolderItems(group.id, {
        folderIds: items.filter(item => item.kind === 'folder').map(item => item.id),
        ledgerIds: items.filter(item => item.kind === 'ledger').map(item => item.id),
        targetFolderId: destinationFolderId,
      });
      setSnackbarMessage(SNACKBAR_FOLDER_MOVED);
      setTimeout(() => {
        navigation.popToTop();
      }, SNACKBAR_AUTO_HIDE_MS);
    } catch (error) {
      setSnackbarMessage(toErrorMessage(error));
    } finally {
      setIsMoving(false);
    }
  };

  return (
    <ScreenContainer
      background="secondary"
      snackbar={snackbarMessage ? <Snackbar visible title={snackbarMessage} /> : undefined}
      snackbarOffset={68}
    >
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

        <View style={styles.footer}>
          <Button
            label={isMoving ? MOVE_DESTINATION_MOVING_LABEL : MOVE_DESTINATION_CONFIRM_LABEL}
            onPress={handleConfirm}
            disabled={isMoving}
            fullWidth
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 20,
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
  footer: {
    paddingVertical: 16,
  },
});

export default FolderMoveDestinationScreen;
