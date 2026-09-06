/** @screen ETC-3-MODAL-01-0 모임 나가기(일반) (confirmKind='leave') */
/** @screen ETC-3-MODAL-01-1 모임 나가기(총무) (confirmKind='leave-blocked', 마지막 총무가 나가려 할 때) */
/** @screen ETC-3-SHEET-03-0 총무 프로필 (member.role==='OWNER') */
/** @screen ETC-3-SHEET-04-0 일반 프로필 (member.role==='MEMBER') */
/** @screen ETC-4-MODAL-01-0 일반 전환하기 (confirmKind='demote') */
/** @screen ETC-4-MODAL-02-0 총무 전환하기 (confirmKind='promote') */
/** @screen ETC-4-MODAL-03-0 모임 내보내기 (confirmKind='kick') */
/** @screen ETC-5-SNACKBAR-02-0 모임 내보내기 완료 (스낵바 렌더링은 GroupManagerScreen.tsx) */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import BottomSheet from '../../components/Feedback/Dialogs/BottomSheet';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Avatar from '../../components/Data Display/Avatar/Avatar';
import Chip from '../../components/Data Display/Chips/Chip';
import Menu from '../../components/Navigation/Menu/Menu';
import { getGroupMemberships } from '../../types/groupMembership';
import type { GroupMembership } from '../../types/groupMembership';
import { getActiveGroup } from '../../types/group';
import * as groupMembershipService from '../../services/groupMembershipService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  ALL_GROUPS_ROLE_TREASURER,
  DEMOTE_CONFIRM_DESCRIPTION,
  DEMOTE_CONFIRM_LABEL,
  DEMOTE_CONFIRM_TITLE_PREFIX,
  DEMOTE_CONFIRM_TITLE_SUFFIX,
  DIALOG_CANCEL_LABEL,
  LEAVE_GROUP_BLOCKED_CONFIRM_LABEL,
  LEAVE_GROUP_BLOCKED_DESCRIPTION,
  LEAVE_GROUP_BLOCKED_TITLE,
  LEAVE_GROUP_CONFIRM_LABEL,
  LEAVE_GROUP_CONFIRM_TITLE,
  PROFILE_DEMOTE_TO_MEMBER,
  PROFILE_LEAVE_GROUP,
  PROFILE_PERMISSION_SECTION_TITLE,
  PROFILE_PROMOTE_TO_TREASURER,
  PROFILE_REMOVE_MEMBER,
  PROFILE_SHEET_TITLE,
  PROFILE_SHEET_TITLE_ME,
  PROMOTE_CONFIRM_DESCRIPTION,
  PROMOTE_CONFIRM_LABEL,
  PROMOTE_CONFIRM_TITLE_PREFIX,
  PROMOTE_CONFIRM_TITLE_SUFFIX,
  REMOVE_MEMBER_CONFIRM_LABEL,
  REMOVE_MEMBER_CONFIRM_TITLE_PREFIX,
  REMOVE_MEMBER_CONFIRM_TITLE_SUFFIX,
  SNACKBAR_MEMBER_REMOVED_PREFIX,
  SNACKBAR_MEMBER_REMOVED_SUFFIX,
  SNACKBAR_ROLE_CHANGED_PREFIX,
  SNACKBAR_ROLE_CHANGED_SUFFIX,
} from '../../constants/groupManagerScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

type ConfirmKind = 'none' | 'promote' | 'demote' | 'leave' | 'leave-blocked' | 'kick';

type MemberProfileSheetProps = {
  visible: boolean;
  member: GroupMembership | null;
  groupId: string;
  onClose: () => void;
  /** 권한 변경/나가기 후 목록 새로고침 + 스낵바 문구 전달용. */
  onChanged: (snackbarMessage: string) => void;
  /** 요청 실패 시 에러 문구 전달용(같은 화면의 Snackbar를 재사용 — 표준 패턴 §확장). */
  onError: (message: string) => void;
  /** 내가 모임을 나간 뒤 모임 관리자 화면 자체를 벗어나야 할 때 호출. */
  onLeftGroup: () => void;
};

/** 모임원 프로필 바텀시트. 본인이면 "모임 나가기"만, 타인이면(내가 총무일 때만) 권한 전환을 보여준다. */
function MemberProfileSheet({
  visible,
  member,
  groupId,
  onClose,
  onChanged,
  onError,
  onLeftGroup,
}: MemberProfileSheetProps) {
  const [confirmKind, setConfirmKind] = useState<ConfirmKind>('none');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!member) {
    return null;
  }

  // 내가 총무일 때만 남의 권한을 바꿀 수 있다(PATCH memberships 권한: OWNER) — 서버가
  // 403으로도 막지만, 애초에 일반 계정에겐 버튼 자체를 안 보여주는 쪽으로 먼저 막는다.
  const viewerIsOwner = getActiveGroup()?.myRole === 'OWNER';

  const closeAll = () => {
    setConfirmKind('none');
    onClose();
  };

  const handleApiError = (error: unknown) => {
    if (isNetworkError(error)) {
      onError(API_NETWORK_ERROR_MESSAGE);
    } else if (error instanceof ApiError) {
      onError(getApiErrorMessage(error.code));
    } else {
      onError(API_ERROR_DEFAULT_MESSAGE);
    }
  };

  const changeRole = async (role: 'OWNER' | 'MEMBER') => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      await groupMembershipService.updateMembershipRole(
        groupId,
        member.membershipId,
        role,
      );
      closeAll();
      onChanged(
        `${SNACKBAR_ROLE_CHANGED_PREFIX}${member.name}${SNACKBAR_ROLE_CHANGED_SUFFIX}`,
      );
    } catch (error) {
      setConfirmKind('none');
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromote = () => changeRole('OWNER');
  const handleDemote = () => changeRole('MEMBER');

  const handleLeave = async () => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      await groupMembershipService.leaveGroup(groupId);
      setConfirmKind('none');
      onClose();
      onLeftGroup();
    } catch (error) {
      setConfirmKind('none');
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKick = async () => {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      await groupMembershipService.removeMembership(groupId, member.membershipId);
      closeAll();
      onChanged(
        `${SNACKBAR_MEMBER_REMOVED_PREFIX}${member.name}${SNACKBAR_MEMBER_REMOVED_SUFFIX}`,
      );
    } catch (error) {
      setConfirmKind('none');
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePressLeave = () => {
    const treasurerCount = getGroupMemberships(groupId).filter(
      item => item.role === 'OWNER',
    ).length;
    const isOnlyTreasurer = member.role === 'OWNER' && treasurerCount <= 1;
    setConfirmKind(isOnlyTreasurer ? 'leave-blocked' : 'leave');
  };

  return (
    <>
      <BottomSheet visible={visible} onClose={onClose}>
        <Text style={styles.sheetTitle}>
          {member.isMe ? PROFILE_SHEET_TITLE_ME : PROFILE_SHEET_TITLE}
        </Text>

        <View style={styles.profileRow}>
          <Avatar type="initial" initial={member.name.slice(0, 1)} />
          <View style={styles.profileTextColumn}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{member.name}</Text>
              {member.role === 'OWNER' && (
                <Chip label={ALL_GROUPS_ROLE_TREASURER} removable={false} />
              )}
            </View>
            {/* GroupMembership 응답에 email이 없다(docs/api-gaps.md (A)) — 이름+역할만 표시. */}
          </View>
        </View>

        {!member.isMe && viewerIsOwner && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {PROFILE_PERMISSION_SECTION_TITLE}
            </Text>
            <Menu
              showIcon={false}
              sections={[
                [
                  member.role === 'OWNER'
                    ? {
                        key: 'demote',
                        label: PROFILE_DEMOTE_TO_MEMBER,
                      }
                    : {
                        key: 'promote',
                        label: PROFILE_PROMOTE_TO_TREASURER,
                      },
                  {
                    key: 'kick',
                    label: PROFILE_REMOVE_MEMBER,
                    destructive: true,
                  },
                ],
              ]}
              onSelect={key => setConfirmKind(key as ConfirmKind)}
            />
          </View>
        )}

        {member.isMe && (
          <View style={styles.section}>
            <Menu
              showIcon={false}
              sections={[
                [
                  {
                    key: 'leave',
                    label: PROFILE_LEAVE_GROUP,
                    destructive: true,
                  },
                ],
              ]}
              onSelect={handlePressLeave}
            />
          </View>
        )}
      </BottomSheet>

      <Dialog
        visible={confirmKind === 'promote'}
        title={`${PROMOTE_CONFIRM_TITLE_PREFIX}${member.name}${PROMOTE_CONFIRM_TITLE_SUFFIX}`}
        description={PROMOTE_CONFIRM_DESCRIPTION}
        cancelLabel={DIALOG_CANCEL_LABEL}
        confirmLabel={PROMOTE_CONFIRM_LABEL}
        onCancel={() => setConfirmKind('none')}
        onConfirm={handlePromote}
      />
      <Dialog
        visible={confirmKind === 'demote'}
        title={`${DEMOTE_CONFIRM_TITLE_PREFIX}${member.name}${DEMOTE_CONFIRM_TITLE_SUFFIX}`}
        description={DEMOTE_CONFIRM_DESCRIPTION}
        cancelLabel={DIALOG_CANCEL_LABEL}
        confirmLabel={DEMOTE_CONFIRM_LABEL}
        onCancel={() => setConfirmKind('none')}
        onConfirm={handleDemote}
      />
      <Dialog
        visible={confirmKind === 'kick'}
        title={`${REMOVE_MEMBER_CONFIRM_TITLE_PREFIX}${member.name}${REMOVE_MEMBER_CONFIRM_TITLE_SUFFIX}`}
        cancelLabel={DIALOG_CANCEL_LABEL}
        confirmLabel={REMOVE_MEMBER_CONFIRM_LABEL}
        destructive
        confirmDisabled={isSubmitting}
        onCancel={() => setConfirmKind('none')}
        onConfirm={handleKick}
      />
      <Dialog
        visible={confirmKind === 'leave'}
        title={LEAVE_GROUP_CONFIRM_TITLE}
        cancelLabel={DIALOG_CANCEL_LABEL}
        confirmLabel={LEAVE_GROUP_CONFIRM_LABEL}
        destructive
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
    </>
  );
}

const styles = StyleSheet.create({
  sheetTitle: {
    ...TYPOGRAPHY.subtitle1,
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileTextColumn: {
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    ...TYPOGRAPHY.subtitle3,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    ...TYPOGRAPHY.body3,
    fontWeight: 'bold',
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginBottom: 4,
  },
});

export default MemberProfileSheet;
