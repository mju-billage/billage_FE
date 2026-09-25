/** @screen DUE-3-PAGE-02-0 회비 수정_모임원 선택 */
/** @screen DUE-4-MODAL-02-0 회비 수정_이탈 안내 (DuesEditScreen과 공유) */
/** @screen DUE-4-SNACKBAR-04-0 회비 수정 완료 (화면 자체에서 표시 후 1.6초 뒤 상세로 복귀, DuesEditScreen과 공유) */
/**
 * ⋮ 메뉴에서 바로 들어오는 독립 화면이다 —
 * `DuesEditScreen`(제목/장부/기간)과는 별개로 이 화면 혼자 `targetMemberIds`
 * 하나만 PATCH로 보낸다. 대상자 후보 목록은 `DuesCreateScreen`의 모임원
 * 선택 단계와 동일하게 `memberService.getMembers()`(모임 전체 명단)에서
 * 가져오고, 이미 이 회비에 배정된 대상자(체크 상태의 초기값)는
 * `duesService.getDuesMembers(duesId)`를 `status` 없이 불러 미납부+납부완료
 * 전체를 합친 목록으로 구한다(Dues.txt §6 — status 생략 시 전체 반환).
 *
 * 정책상 이미 `PAID`인 대상자를 체크 해제해도 막지 않는다(Dues.txt §4 정책
 * 메모: "이미 PAID인 대상자를 제거하는 것도 막지 않으며, 그 사람의 납부
 * 기록도 함께 삭제") — 그래서 이 화면은 대상자의 납부 상태를 구분해서
 * 보여주거나 경고하지 않는다, 명세에도 그런 경고 UI가 없다.
 */
import { useCallback, useEffect, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import SearchField from '../../components/Input/Search/SearchField';
import MemberListItem from '../../components/Data Display/Lists/MemberListItem';
import CheckBox from '../../components/Input/Control/CheckBox';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import type { Member } from '../../types/member';
import * as duesService from '../../services/duesService';
import * as memberService from '../../services/memberService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  DUES_CREATE_LEAVE_CANCEL_LABEL,
  DUES_CREATE_LEAVE_CONFIRM_LABEL,
  DUES_CREATE_LEAVE_DESCRIPTION,
  DUES_DETAIL_RETRY_LABEL,
  DUES_MEMBER_EDIT_LEAVE_TITLE,
  DUES_MEMBER_EDIT_SUBMIT_LABEL,
  DUES_MEMBER_SELECT_ALL_LABEL,
  DUES_MEMBER_SELECT_COUNT_SUFFIX,
  DUES_MEMBER_SELECT_EMPTY,
  DUES_MEMBER_SELECT_LOADING,
  DUES_MEMBER_SELECT_SEARCH_PLACEHOLDER,
  DUES_MEMBER_SELECT_TITLE,
  SNACKBAR_DUES_MEMBERS_UPDATED,
} from '../../constants/duesScreenText';
import { FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const SNACKBAR_AUTO_HIDE_MS = 1600;

type LoadState = 'loading' | 'error' | 'ready';

type DuesMemberEditNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type DuesMemberEditRouteProp = RouteProp<RootStackParamList, 'DuesMemberEdit'>;

function sameIdSet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((value, index) => value === sortedB[index]);
}

function DuesMemberEditScreen() {
  const navigation = useNavigation<DuesMemberEditNavigationProp>();
  const route = useRoute<DuesMemberEditRouteProp>();
  const duesId = route.params.duesId;

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [initialMemberIds, setInitialMemberIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [leaveDialogVisible, setLeaveDialogVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

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
      const detail = await duesService.getDuesDetail(duesId);
      const [allMembers, targetedMembers] = await Promise.all([
        memberService.getMembers(detail.groupId),
        duesService.getDuesMembers(duesId),
      ]);
      setMembers([...allMembers].sort((a, b) => a.name.localeCompare(b.name, 'ko')));
      const targetedIds = targetedMembers.map(m => m.memberId);
      setInitialMemberIds(targetedIds);
      setSelectedMemberIds(targetedIds);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [duesId]);

  useEffect(() => {
    load();
  }, [load]);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const hasChanges = !sameIdSet(selectedMemberIds, initialMemberIds);

  const handleBack = () => {
    if (hasChanges) {
      setLeaveDialogVisible(true);
    } else {
      navigation.goBack();
    }
  };

  // 안드로이드 하드웨어 back도 같은 이탈 확인을 거치게 한다(ReportCreateByLedgerScreen 패턴).
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        if (hasChanges) {
          setLeaveDialogVisible(true);
          return true;
        }
        return false;
      });
      return () => subscription.remove();
    }, [hasChanges]),
  );

  const filteredMembers = searchQuery.trim()
    ? members.filter(member =>
        member.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      )
    : members;

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds(current =>
      current.includes(memberId)
        ? current.filter(id => id !== memberId)
        : [...current, memberId],
    );
  };

  const allSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every(member => selectedMemberIds.includes(member.memberId));

  const toggleSelectAll = () => {
    if (allSelected) {
      const filteredIds = new Set(filteredMembers.map(m => m.memberId));
      setSelectedMemberIds(current => current.filter(id => !filteredIds.has(id)));
    } else {
      setSelectedMemberIds(current => [
        ...current,
        ...filteredMembers.filter(m => !current.includes(m.memberId)).map(m => m.memberId),
      ]);
    }
  };

  const handleSubmit = async () => {
    if (selectedMemberIds.length === 0 || isSubmitting) {
      return;
    }
    if (!hasChanges) {
      navigation.goBack();
      return;
    }
    setIsSubmitting(true);
    try {
      await duesService.updateDues(duesId, {
        targetMemberIds: selectedMemberIds.map(Number),
      });
      showSnackbar(SNACKBAR_DUES_MEMBERS_UPDATED);
      setTimeout(() => navigation.goBack(), SNACKBAR_AUTO_HIDE_MS);
    } catch (error) {
      showSnackbar(toErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadState === 'loading' || loadState === 'error') {
    return (
      <ScreenContainer background="secondary">
        <AppBar
          type="sub"
          title={DUES_MEMBER_SELECT_TITLE}
          onBackPress={() => navigation.goBack()}
        />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {loadState === 'loading' ? DUES_MEMBER_SELECT_LOADING : loadErrorMessage}
          </Text>
          {loadState === 'error' && (
            <Button
              label={DUES_DETAIL_RETRY_LABEL}
              onPress={load}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          )}
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      background="secondary"
      snackbar={
        snackbarMessage ? <Snackbar visible title={snackbarMessage} /> : undefined
      }
    >
      <AppBar type="sub" title={DUES_MEMBER_SELECT_TITLE} onBackPress={handleBack} />

      <View style={styles.body}>
        <SearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={DUES_MEMBER_SELECT_SEARCH_PLACEHOLDER}
          variant="outline"
        />

        {members.length === 0 ? (
          <View style={styles.stateContainer}>
            <Text style={styles.emptyText}>{DUES_MEMBER_SELECT_EMPTY}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.memberListContent}>
            <View style={styles.selectAllRow}>
              <CheckBox checked={allSelected} onToggle={toggleSelectAll} />
              <Text style={styles.selectAllLabel}>{DUES_MEMBER_SELECT_ALL_LABEL}</Text>
              <Text style={styles.selectAllCount}>
                {selectedMemberIds.length}{DUES_MEMBER_SELECT_COUNT_SUFFIX}
              </Text>
            </View>
            {filteredMembers.map(member => (
              <MemberListItem
                key={member.memberId}
                name={member.name}
                showAmount={false}
                selected={selectedMemberIds.includes(member.memberId)}
                onPress={() => toggleMember(member.memberId)}
              />
            ))}
          </ScrollView>
        )}

        <View style={styles.footer}>
          <Button
            label={DUES_MEMBER_EDIT_SUBMIT_LABEL}
            onPress={handleSubmit}
            disabled={selectedMemberIds.length === 0 || isSubmitting}
            fullWidth
          />
        </View>
      </View>

      <Dialog
        visible={leaveDialogVisible}
        title={DUES_MEMBER_EDIT_LEAVE_TITLE}
        description={DUES_CREATE_LEAVE_DESCRIPTION}
        cancelLabel={DUES_CREATE_LEAVE_CANCEL_LABEL}
        confirmLabel={DUES_CREATE_LEAVE_CONFIRM_LABEL}
        onCancel={() => setLeaveDialogVisible(false)}
        onConfirm={() => {
          setLeaveDialogVisible(false);
          navigation.goBack();
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 40,
  },
  stateText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  emptyText: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  memberListContent: {
    paddingTop: 8,
    paddingBottom: 8,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  selectAllLabel: {
    ...TYPOGRAPHY.body2,
    flex: 1,
  },
  selectAllCount: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  footer: {
    paddingBottom: 16,
    paddingTop: 8,
  },
});

export default DuesMemberEditScreen;
