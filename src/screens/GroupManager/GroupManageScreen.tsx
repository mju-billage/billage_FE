/** @screen ETC-2-PAGE-02-0 모임 관리 */
/** @screen ETC-3-MODAL-02-0 모임 삭제하기 (deleteDialogVisible) */
/** @screen ETC-4-SNACKBAR-04-0 모임 삭제 완료 (같은 시안 파일에 포함된 스낵바 — 착지 화면인 AllGroupsScreen.tsx에서 렌더링) */
/**
 * "더보기 > 모임 관리" 진입점. 예전엔 이 중간 화면 없이 더보기가 바로
 * `GroupManagerScreen`("모임 관리자")으로 직행했었다 — 더보기 메뉴 라벨은
 * "모임 관리"인데 실제 도착 화면 타이틀은 "모임 관리자"라 어긋나 있었고
 * (`docs/design-verification.md` §5-4의 미해결 항목), `ETC-2-PAGE-02-0`이
 * IA상 별개 화면인지 시안 문서 오기인지 불확실했다. 시안(더보기_모임관리_
 * 모임삭제하기.png)의 배경 화면이 "< 모임 관리"라는 독립된 페이지 경로/제목으로
 * 등장하고, `design-index.json`에도 `ETC-2-PAGE-02-0.png`가 `ETC-2-PAGE-03-0.png`와
 * 별개 파일로 존재해 — 오기가 아니라 실제로 빠져 있던 화면이었다. 이 파일로 채운다.
 */
import { useCallback, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import CardBase from '../../components/Data Display/Card/CardBase';
import Avatar from '../../components/Data Display/Avatar/Avatar';
import Divider from '../../components/Data Display/Divider/Divider';
import Button from '../../components/Input/Button/Button';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import { getActiveGroup } from '../../types/group';
import type { GroupSummary } from '../../types/group';
import * as groupService from '../../services/groupService';
import * as groupMembershipService from '../../services/groupMembershipService';
import { getGroupMemberships } from '../../types/groupMembership';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  NO_ACTIVE_GROUP_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  DIALOG_CANCEL_LABEL,
  GROUP_DELETE_CANCEL_LABEL,
  GROUP_DELETE_CONFIRM_DESCRIPTION,
  GROUP_DELETE_CONFIRM_LABEL,
  GROUP_DELETE_CONFIRM_TITLE,
  GROUP_DELETE_NAME_MISMATCH_ERROR,
  GROUP_DELETE_NAME_PLACEHOLDER,
  GROUP_MANAGE_DELETE_LABEL,
  GROUP_MANAGE_LEAVE_LABEL,
  GROUP_MANAGE_LOADING,
  GROUP_MANAGE_MEMBER_MANAGE_LABEL,
  GROUP_MANAGE_PROFILE_EDIT_LABEL,
  GROUP_MANAGE_RETRY_LABEL,
  GROUP_MANAGE_TITLE,
  LEAVE_GROUP_BLOCKED_CONFIRM_LABEL,
  LEAVE_GROUP_BLOCKED_DESCRIPTION,
  LEAVE_GROUP_BLOCKED_TITLE,
  LEAVE_GROUP_CONFIRM_LABEL,
  LEAVE_GROUP_CONFIRM_TITLE,
  SNACKBAR_GROUP_DELETED_PREFIX,
  SNACKBAR_GROUP_DELETED_SUFFIX,
} from '../../constants/groupManagerScreenText';
import {
  FEEDBACK_NEGATIVE_BOLD,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_NORMAL,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CHEVRON_RIGHT_ICON = require('../../assets/icons/nav/Chevron Right.png');
const PROFILE_EDIT_ICON = require('../../assets/icons/user/User.png');
const MEMBER_MANAGE_ICON = require('../../assets/icons/user/Group.png');
const LEAVE_ICON = require('../../assets/icons/action/Out.png');
const DELETE_ICON = require('../../assets/icons/action/Delete.png');

type GroupManageNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'GroupManage'
>;

type LoadState = 'loading' | 'error' | 'ready';
type ConfirmKind = 'none' | 'leave' | 'leave-blocked' | 'delete';

const SNACKBAR_AUTO_HIDE_MS = 1600;

/** "모임 관리": 모임 프로필 변경/모임원 관리 진입 + 모임 나가기/삭제하기(파괴적 액션). */
function GroupManageScreen() {
  const navigation = useNavigation<GroupManageNavigationProp>();
  const [group, setGroup] = useState<GroupSummary | undefined>(getActiveGroup());
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>('none');
  const [deleteInput, setDeleteInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const viewerIsOwner = group?.myRole === 'OWNER';

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      let activeGroup = getActiveGroup();
      if (!activeGroup) {
        await groupService.getMyGroups();
        activeGroup = getActiveGroup();
      }
      setGroup(activeGroup);
      if (!activeGroup) {
        setLoadErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setLoadState('error');
        return;
      }
      // "모임 나가기"가 마지막 총무 여부를 즉시 판단할 수 있도록 관리자 목록도 같이
      // 받아둔다(멤버 목록 화면 자체는 여기서 보여주지 않는다 — MemberProfileSheet와
      // 같은 이유로 캐시가 필요).
      await groupMembershipService.getMemberships(activeGroup.id);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleApiError = (error: unknown) => {
    setConfirmKind('none');
    showSnackbar(toErrorMessage(error));
  };

  const handlePressLeave = () => {
    if (!group) {
      return;
    }
    const treasurerCount = getGroupMemberships(group.id).filter(
      item => item.role === 'OWNER',
    ).length;
    const isOnlyTreasurer = viewerIsOwner && treasurerCount <= 1;
    setConfirmKind(isOnlyTreasurer ? 'leave-blocked' : 'leave');
  };

  const handleLeave = async () => {
    if (!group || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      await groupMembershipService.leaveGroup(group.id);
      setConfirmKind('none');
      navigation.goBack();
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDeleteNameMatched = deleteInput === group?.name;

  const handleOpenDelete = () => {
    setDeleteInput('');
    setConfirmKind('delete');
  };

  const handleDelete = async () => {
    if (!group || !isDeleteNameMatched || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      await groupService.deleteGroup(group.id);
      setConfirmKind('none');
      // AllGroups 하나만 남기고 리셋하면 그 화면의 뒤로가기/모임 선택이 기댈 이전
      // 화면이 없어져 깨진다 — Main(더보기 탭)을 밑에 남겨 정상적인 goBack 대상을
      // 만들어준다.
      navigation.reset({
        index: 1,
        routes: [
          { name: 'Main', params: { screen: 'More' } },
          {
            name: 'AllGroups',
            params: {
              snackbarMessage: `${SNACKBAR_GROUP_DELETED_PREFIX}${group.name}${SNACKBAR_GROUP_DELETED_SUFFIX}`,
            },
          },
        ],
      });
    } catch (error) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScreenContainer
      background="primary"
      snackbar={
        snackbarMessage ? <Snackbar visible title={snackbarMessage} /> : undefined
      }
    >
      <AppBar
        type="sub"
        title={GROUP_MANAGE_TITLE}
        onBackPress={() => navigation.goBack()}
      />

      {loadState === 'loading' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{GROUP_MANAGE_LOADING}</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{loadErrorMessage}</Text>
          <Button
            label={GROUP_MANAGE_RETRY_LABEL}
            onPress={load}
            hierarchy="secondary"
            style={{ alignSelf: 'center' }}
          />
        </View>
      )}

      {loadState === 'ready' && group && (
        <View style={styles.content}>
          <CardBase style={styles.profileCard}>
            <View style={styles.profileRow}>
              <Avatar
                type={group.groupImageUrl ? 'image' : 'icon'}
                imageUri={group.groupImageUrl ?? ''}
              />
              <Text style={styles.profileName}>{group.name}</Text>
            </View>
            {viewerIsOwner && (
              <>
                <Divider />
                <MenuRowContent
                  icon={PROFILE_EDIT_ICON}
                  label={GROUP_MANAGE_PROFILE_EDIT_LABEL}
                  onPress={() => navigation.navigate('GroupProfileEdit')}
                  style={styles.profileEditRow}
                />
              </>
            )}
          </CardBase>

          <CardBase onPress={() => navigation.navigate('MemberManage')}>
            <MenuRowContent
              icon={MEMBER_MANAGE_ICON}
              label={GROUP_MANAGE_MEMBER_MANAGE_LABEL}
            />
          </CardBase>

          <CardBase onPress={handlePressLeave}>
            <MenuRowContent icon={LEAVE_ICON} label={GROUP_MANAGE_LEAVE_LABEL} />
          </CardBase>

          {viewerIsOwner && (
            <CardBase onPress={handleOpenDelete}>
              <MenuRowContent
                icon={DELETE_ICON}
                label={GROUP_MANAGE_DELETE_LABEL}
                destructive
              />
            </CardBase>
          )}
        </View>
      )}

      <Dialog
        visible={confirmKind === 'leave'}
        title={LEAVE_GROUP_CONFIRM_TITLE}
        cancelLabel={DIALOG_CANCEL_LABEL}
        confirmLabel={LEAVE_GROUP_CONFIRM_LABEL}
        destructive
        confirmDisabled={isSubmitting}
        onCancel={() => setConfirmKind('none')}
        onConfirm={handleLeave}
      />
      <Dialog
        visible={confirmKind === 'leave-blocked'}
        title={LEAVE_GROUP_BLOCKED_TITLE}
        description={LEAVE_GROUP_BLOCKED_DESCRIPTION}
        confirmLabel={LEAVE_GROUP_BLOCKED_CONFIRM_LABEL}
        singleButton
        onConfirm={() => setConfirmKind('none')}
      />
      <Dialog
        visible={confirmKind === 'delete'}
        title={GROUP_DELETE_CONFIRM_TITLE}
        description={GROUP_DELETE_CONFIRM_DESCRIPTION}
        showTextField
        textFieldValue={deleteInput}
        onChangeTextField={setDeleteInput}
        textFieldPlaceholder={GROUP_DELETE_NAME_PLACEHOLDER}
        textFieldError={
          deleteInput.length > 0 && !isDeleteNameMatched
            ? GROUP_DELETE_NAME_MISMATCH_ERROR
            : undefined
        }
        cancelLabel={GROUP_DELETE_CANCEL_LABEL}
        confirmLabel={GROUP_DELETE_CONFIRM_LABEL}
        destructive
        confirmDisabled={!isDeleteNameMatched || isSubmitting}
        onCancel={() => setConfirmKind('none')}
        onConfirm={handleDelete}
      />
    </ScreenContainer>
  );
}

function MenuRowContent({
  icon,
  label,
  onPress,
  destructive = false,
  style,
}: {
  icon: number;
  label: string;
  onPress?: () => void;
  destructive?: boolean;
  style?: object;
}) {
  const Wrapper = onPress ? Pressable : View;
  return (
    <Wrapper style={[styles.menuRow, style]} onPress={onPress}>
      <Image
        source={icon}
        style={[styles.menuIcon, destructive && styles.menuIconDestructive]}
      />
      <Text style={[styles.menuLabel, destructive && styles.menuLabelDestructive]}>
        {label}
      </Text>
      <Image source={CHEVRON_RIGHT_ICON} style={styles.menuChevron} />
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 12,
  },
  profileCard: {
    padding: 0,
    overflow: 'hidden',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
  },
  profileName: {
    ...TYPOGRAPHY.subtitle2,
  },
  profileEditRow: {
    padding: 16,
    borderRadius: 0,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 24,
    height: 24,
    tintColor: FOREGROUND_NEUTRAL_NORMAL,
  },
  menuIconDestructive: {
    tintColor: FEEDBACK_NEGATIVE_BOLD,
  },
  menuLabel: {
    ...TYPOGRAPHY.subtitle3,
    flex: 1,
  },
  menuLabelDestructive: {
    color: FEEDBACK_NEGATIVE_BOLD,
  },
  menuChevron: {
    width: 16,
    height: 16,
    tintColor: FOREGROUND_DISABLED,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  stateText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
  },
});

export default GroupManageScreen;
