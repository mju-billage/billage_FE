/** @screen COM-1-PAGE-02-0 탈퇴하기_안내사항 */
/**
 * 회원 탈퇴 플로우 1단계: 유의사항 안내 + 분기 판단.
 *
 * 시안 UI 요소 2번 액션 그대로: CTA("확인했어요")를 누르면 유저의 총무 상태에
 * 따라 분기한다 — [Case A] 유일한 총무로 있는 모임이 1개 이상이면 "권한 이전"
 * (`WithdrawOwnershipTransfer`)으로, [Case B] 없으면 곧장 "사유 선택"
 * (`WithdrawReason`)으로 이동한다. 이 판단에 필요한 조회(내 모임 목록 +
 * 모임별 ownerCount)를 화면 진입 시 미리 해 둔다 — CTA를 누른 다음에야
 * 로딩하면 버튼 두 번 탭 사이 지연이 어색해서다.
 *
 * `DELETE /auth/me` 자체(권한 이전 데이터 포함)는 마지막 확인 모달에서 한
 * 번에 처리된다(Auth.txt 11번 정책 메모) — 이 화면은 오직 분기 판단만 한다.
 */
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import CardBase from '../../components/Data Display/Card/CardBase';
import * as groupService from '../../services/groupService';
import * as groupMembershipService from '../../services/groupMembershipService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  WITHDRAW_GUIDE_BULLETS,
  WITHDRAW_GUIDE_CONFIRM_LABEL,
  WITHDRAW_GUIDE_HEADING,
  WITHDRAW_GUIDE_LOADING,
  WITHDRAW_GUIDE_RETRY_LABEL,
  WITHDRAW_GUIDE_TITLE,
} from '../../constants/settingsScreenText';
import { FOREGROUND_DISABLED } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const CLOSE_ICON = require('../../assets/icons/action/Close.png');

type WithdrawGuideNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'WithdrawGuide'
>;

type LoadState = 'loading' | 'error' | 'ready';

/**
 * 유일한 총무로 있는 모임 목록을 가려낸다([Case A] 분기 판단용).
 * Auth.txt 11번 정책 메모: "본인 외에 관리자가 아무도 없는 모임은 위임 대상이
 * 아니며, 화면에도 나오지 않습니다. 이런 모임은 탈퇴와 함께 모임째 삭제됩니다"
 * — 그래서 위임할 다른 멤버가 아예 없는 모임은 이 목록에서 제외한다(그런
 * 모임은 [Case B]와 동일하게 취급되어 서버가 계정 삭제와 함께 처리한다).
 */
async function findSoleOwnerGroups(): Promise<
  { groupId: string; name: string }[]
> {
  const groups = await groupService.getMyGroups();
  const ownerGroups = groups.filter(group => group.myRole === 'OWNER');
  const soleOwnerGroups: { groupId: string; name: string }[] = [];
  for (const group of ownerGroups) {
    const memberships = await groupMembershipService.getMemberships(group.id);
    const ownerCount = memberships.filter(
      membership => membership.role === 'OWNER',
    ).length;
    const hasTransferCandidate = memberships.some(
      membership => !membership.isMe,
    );
    if (ownerCount === 1 && hasTransferCandidate) {
      soleOwnerGroups.push({ groupId: group.id, name: group.name });
    }
  }
  return soleOwnerGroups;
}

/** "탈퇴하기" 1단계: 유의사항 안내. */
function WithdrawGuideScreen() {
  const navigation = useNavigation<WithdrawGuideNavigationProp>();
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [soleOwnerGroups, setSoleOwnerGroups] = useState<
    { groupId: string; name: string }[]
  >([]);

  const load = useCallback(async () => {
    setLoadState('loading');
    try {
      const groups = await findSoleOwnerGroups();
      setSoleOwnerGroups(groups);
      setLoadState('ready');
    } catch (error) {
      setErrorMessage(
        isNetworkError(error)
          ? API_NETWORK_ERROR_MESSAGE
          : error instanceof ApiError
          ? getApiErrorMessage(error.code)
          : API_ERROR_DEFAULT_MESSAGE,
      );
      setLoadState('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleClose = () => navigation.navigate('MyProfile');

  const handleConfirm = () => {
    if (soleOwnerGroups.length > 0) {
      navigation.navigate('WithdrawOwnershipTransfer', {
        groups: soleOwnerGroups,
      });
    } else {
      navigation.navigate('WithdrawReason', { ownershipTransfers: [] });
    }
  };

  return (
    <ScreenContainer background="primary">
      <AppBar
        type="sub"
        title={WITHDRAW_GUIDE_TITLE}
        onBackPress={() => navigation.goBack()}
        rightIcons={[{ icon: CLOSE_ICON, onPress: handleClose }]}
      />

      {loadState === 'loading' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{WITHDRAW_GUIDE_LOADING}</Text>
        </View>
      )}

      {loadState === 'error' && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>{errorMessage}</Text>
          <Button
            label={WITHDRAW_GUIDE_RETRY_LABEL}
            onPress={load}
            hierarchy="secondary"
            style={{ alignSelf: 'center' }}
          />
        </View>
      )}

      {loadState === 'ready' && (
        <>
          <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.heading}>{WITHDRAW_GUIDE_HEADING}</Text>
            <CardBase>
              {WITHDRAW_GUIDE_BULLETS.map(bullet => (
                <View key={bullet} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>{'•'}</Text>
                  <Text style={styles.bulletText}>{bullet}</Text>
                </View>
              ))}
            </CardBase>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              label={WITHDRAW_GUIDE_CONFIRM_LABEL}
              onPress={handleConfirm}
              fullWidth
            />
          </View>
        </>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  heading: {
    ...TYPOGRAPHY.subtitle2,
    marginBottom: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  bulletDot: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
  },
  bulletText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_DISABLED,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
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
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default WithdrawGuideScreen;
