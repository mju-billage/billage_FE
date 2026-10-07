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
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
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
    paddingHorizontal: 20,
  },
});

export default WithdrawGuideScreen;
