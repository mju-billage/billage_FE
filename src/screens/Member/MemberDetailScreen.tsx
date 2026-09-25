/** @screen DUE-3-PAGE-03-0 모임원 상세_조회 */
/** @screen DUE-4-MODAL-01-0 모임원 삭제 */
/** @screen DUE-5-SNACKBAR-02-0 모임원 삭제 완료 */
/**
 * 목록(`MemberManageScreen`)에서 행을 누르면
 * 들어오는 상세 화면 — 수정(연필)·삭제(휴지통) 아이콘은 총무(OWNER) 전용이라
 * 일반 관리자에겐 숨긴다(2단계 UI 우선 차단 패턴, `DuesDetailScreen`과 동일).
 * 조회 자체는 MEMBER 권한이라 둘 다 볼 수 있다(Member.txt §6).
 *
 * 삭제 확인 모달 문구("기존 납부 내역은 그대로 유지돼요.")는 시안
 * (`모임원삭제-1.png`) 그대로다 — 다만 이 문구는 "이미 마감된 회비로 생성된
 * 장부 수입 내역"에 한정된 이야기(Member.txt §8 정책 메모)이고, **진행 중인
 * 회비의 참여 데이터는 삭제 시 Hard Delete된다**(§5). 시안 문구만 보면 이
 * 차이가 드러나지 않는다.
 *
 * 삭제 성공 후엔 이 화면 자체가 다시 열릴 수 없으니(모임원이 없어짐)
 * `MemberManage`로 `navigate`해 스낵바 문구를 실어 보낸다(`DuesDetailScreen`의
 * 회비 삭제 패턴과 동일) — 이 화면은 스택에서 사라진다.
 */
import { useCallback, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import InfoCard from '../../components/Data Display/Card/InfoCard';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import { getActiveGroup } from '../../types/group';
import type { MemberDetail } from '../../types/member';
import * as memberService from '../../services/memberService';
import { ApiError } from '../../services/apiClient';
import { formatWon } from '../../utils/currency';
import { formatPhoneNumber } from '../../utils/phone';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  NO_ACTIVE_GROUP_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  MEMBER_DELETE_CONFIRM_DESCRIPTION,
  MEMBER_DELETE_CONFIRM_LABEL,
  MEMBER_DELETE_CONFIRM_TITLE,
  MEMBER_DETAIL_EMPTY_VALUE,
  MEMBER_DETAIL_LOADING,
  MEMBER_DETAIL_NAME_LABEL,
  MEMBER_DETAIL_PHONE_LABEL,
  MEMBER_DETAIL_TAG_LABEL,
  MEMBER_DETAIL_TOTAL_PAID_LABEL,
  MEMBER_DETAIL_TOTAL_PAID_SUFFIX,
  MEMBER_MANAGE_RETRY_LABEL,
  SNACKBAR_MEMBER_DELETED_SUFFIX,
} from '../../constants/memberScreenText';
import {
  BACKGROUND_PRIMARY,
  FOREGROUND_DISABLED,
  FOREGROUND_NEUTRAL_SUBTLE,
} from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const EDIT_ICON = require('../../assets/icons/action/Edit.png');
const DELETE_ICON = require('../../assets/icons/action/Delete.png');
const CHEVRON_RIGHT_ICON = require('../../assets/icons/nav/Chevron Right.png');

type LoadState = 'loading' | 'error' | 'ready';

type MemberDetailNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type MemberDetailRouteProp = RouteProp<RootStackParamList, 'MemberDetail'>;

function MemberDetailScreen() {
  const navigation = useNavigation<MemberDetailNavigationProp>();
  const route = useRoute<MemberDetailRouteProp>();
  const memberId = route.params.memberId;

  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const viewerIsOwner = getActiveGroup()?.myRole === 'OWNER';

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
      const group = getActiveGroup();
      if (!group) {
        setLoadErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setLoadState('error');
        return;
      }
      const detail = await memberService.getMemberDetail(group.id, memberId);
      setMember(detail);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, [memberId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleConfirmDelete = async () => {
    const group = getActiveGroup();
    if (!group || isDeleting) {
      return;
    }
    setIsDeleting(true);
    try {
      await memberService.deleteMember(group.id, memberId);
      navigation.navigate('MemberManage', {
        snackbarMessage: `1${SNACKBAR_MEMBER_DELETED_SUFFIX}`,
      });
    } catch (error) {
      setDeleteDialogVisible(false);
      setSnackbarMessage(toErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  if (loadState === 'loading' || loadState === 'error' || !member) {
    return (
      <ScreenContainer background="primary">
        <AppBar type="sub" title="" onBackPress={() => navigation.goBack()} />
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>
            {loadState === 'error' ? loadErrorMessage : MEMBER_DETAIL_LOADING}
          </Text>
          {loadState === 'error' && (
            <Button
              label={MEMBER_MANAGE_RETRY_LABEL}
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
      background="primary"
      snackbar={
        snackbarMessage ? (
          <Snackbar
            visible
            title={snackbarMessage}
            onClose={() => setSnackbarMessage(null)}
          />
        ) : undefined
      }
    >
      <AppBar
        type="sub"
        title={member.name}
        onBackPress={() => navigation.goBack()}
        rightIcons={
          viewerIsOwner
            ? [
                {
                  icon: EDIT_ICON,
                  onPress: () => navigation.navigate('MemberEdit', { memberId }),
                  accessibilityLabel: '수정',
                },
                {
                  icon: DELETE_ICON,
                  onPress: () => setDeleteDialogVisible(true),
                  accessibilityLabel: '삭제',
                },
              ]
            : []
        }
      />

      <ScrollView contentContainerStyle={styles.body}>
        <Pressable
          style={styles.summaryCard}
          onPress={() => navigation.navigate('MemberPaymentHistory', { memberId })}
        >
          <View>
            <Text style={styles.summaryLabel}>{MEMBER_DETAIL_TOTAL_PAID_LABEL}</Text>
            <Text style={styles.summaryValue}>
              {formatWon(member.totalPaidAmount)}
              {MEMBER_DETAIL_TOTAL_PAID_SUFFIX}
            </Text>
          </View>
          <Image source={CHEVRON_RIGHT_ICON} style={styles.chevron} />
        </Pressable>

        <InfoCard
          fields={[
            { label: MEMBER_DETAIL_NAME_LABEL, value: member.name },
            {
              label: MEMBER_DETAIL_PHONE_LABEL,
              value: member.phoneNumber
                ? formatPhoneNumber(member.phoneNumber)
                : MEMBER_DETAIL_EMPTY_VALUE,
            },
            {
              label: MEMBER_DETAIL_TAG_LABEL,
              value:
                member.tags.length > 0
                  ? member.tags.map(tag => `#${tag}`).join(' ')
                  : MEMBER_DETAIL_EMPTY_VALUE,
            },
          ]}
          memo={member.memo || MEMBER_DETAIL_EMPTY_VALUE}
        />
      </ScrollView>

      <Dialog
        visible={deleteDialogVisible}
        title={MEMBER_DELETE_CONFIRM_TITLE}
        description={MEMBER_DELETE_CONFIRM_DESCRIPTION}
        confirmLabel={MEMBER_DELETE_CONFIRM_LABEL}
        destructive
        confirmDisabled={isDeleting}
        onCancel={() => setDeleteDialogVisible(false)}
        onConfirm={handleConfirmDelete}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    gap: 16,
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
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 16,
    backgroundColor: BACKGROUND_PRIMARY,
  },
  summaryLabel: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  summaryValue: {
    ...TYPOGRAPHY.subtitle1,
    marginTop: 4,
  },
  chevron: {
    width: 20,
    height: 20,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
});

export default MemberDetailScreen;
