import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import AppBar from '../../components/Navigation/App bar/AppBar';
import SearchField from '../../components/Input/Search/SearchField';
import Button from '../../components/Input/Button/Button';
import MemberListItem from '../../components/Data Display/Lists/MemberListItem';
import CheckBox from '../../components/Input/Control/CheckBox';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import MemberMoreMenu from './MemberMoreMenu';
import MemberAddSheet from './MemberAddSheet';
import { getActiveGroup } from '../../types/group';
import type { Member } from '../../types/member';
import * as memberService from '../../services/memberService';
import * as groupService from '../../services/groupService';
import { ApiError } from '../../services/apiClient';
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
  MEMBER_MANAGE_ADD_MENU_LABEL,
  MEMBER_MANAGE_COUNT_SUFFIX,
  MEMBER_MANAGE_DELETE_MENU_LABEL,
  MEMBER_MANAGE_DELETE_SUBMIT_SUFFIX,
  MEMBER_MANAGE_EMPTY,
  MEMBER_MANAGE_LOADING,
  MEMBER_MANAGE_RETRY_LABEL,
  MEMBER_MANAGE_SEARCH_EMPTY,
  MEMBER_MANAGE_SEARCH_PLACEHOLDER,
  MEMBER_MANAGE_SELECT_ALL_LABEL,
  MEMBER_MANAGE_SELECT_COUNT_SUFFIX,
  MEMBER_MANAGE_TITLE,
  SNACKBAR_MEMBER_DELETED_SUFFIX,
} from '../../constants/memberScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const MENU_ICON = require('../../assets/icons/action/Menu Vertical.png');
const SEARCH_DEBOUNCE_MS = 300;
const DELETE_SNACKBAR_AUTO_HIDE_MS = 3000;

type MemberManageNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type MemberManageRouteProp = RouteProp<RootStackParamList, 'MemberManage'>;
type LoadState = 'loading' | 'error' | 'ready';
type Mode = 'view' | 'delete';

function MemberManageScreen() {
  const navigation = useNavigation<MemberManageNavigationProp>();
  const route = useRoute<MemberManageRouteProp>();
  const [keyword, setKeyword] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [moreMenuVisible, setMoreMenuVisible] = useState(false);
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [mode, setMode] = useState<Mode>('view');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setTimeout(() => setSnackbarMessage(null), DELETE_SNACKBAR_AUTO_HIDE_MS);
  };

  const load = useCallback(async (searchKeyword: string) => {
    setLoadState('loading');
    try {
      let group = getActiveGroup();
      if (!group) {
        await groupService.getMyGroups();
        group = getActiveGroup();
      }
      if (!group) {
        setLoadErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setLoadState('error');
        return;
      }
      const result = await memberService.getMembers(
        group.id,
        searchKeyword || undefined,
      );
      setMembers(result);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(keyword);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [load]),
  );

  useEffect(() => {
    if (route.params?.snackbarMessage) {
      showSnackbar(route.params.snackbarMessage);
      navigation.setParams({ snackbarMessage: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.snackbarMessage]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      load(keyword);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyword]);

  const handleSelectMoreMenu = (key: string) => {
    setMoreMenuVisible(false);
    if (key === 'add') {
      setAddSheetVisible(true);
    } else if (key === 'delete') {
      setMode('delete');
      setSelectedMemberIds([]);
    }
  };

  const handleBack = () => {
    if (mode === 'delete') {
      setMode('view');
      setSelectedMemberIds([]);
    } else {
      navigation.goBack();
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMemberIds(current =>
      current.includes(memberId)
        ? current.filter(id => id !== memberId)
        : [...current, memberId],
    );
  };

  const allSelected =
    members.length > 0 && members.every(member => selectedMemberIds.includes(member.memberId));

  const toggleSelectAll = () => {
    setSelectedMemberIds(allSelected ? [] : members.map(member => member.memberId));
  };

  const handleConfirmDelete = async () => {
    const group = getActiveGroup();
    if (!group || isDeleting) {
      return;
    }
    setIsDeleting(true);
    try {
      await memberService.deleteMembersBulk(group.id, selectedMemberIds);
      const count = selectedMemberIds.length;
      setDeleteDialogVisible(false);
      setMode('view');
      setSelectedMemberIds([]);
      showSnackbar(`${count}${SNACKBAR_MEMBER_DELETED_SUFFIX}`);
      load(keyword);
    } catch (error) {
      setDeleteDialogVisible(false);
      showSnackbar(toErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ScreenContainer
      background="secondary"
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
        title={MEMBER_MANAGE_TITLE}
        onBackPress={handleBack}
        rightIcons={
          viewerIsOwner && mode === 'view'
            ? [{ icon: MENU_ICON, onPress: () => setMoreMenuVisible(true) }]
            : []
        }
      />

      <View style={styles.content}>
        <SearchField
          value={keyword}
          onChangeText={setKeyword}
          placeholder={MEMBER_MANAGE_SEARCH_PLACEHOLDER}
          variant="outline"
        />

        {loadState === 'loading' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{MEMBER_MANAGE_LOADING}</Text>
          </View>
        )}

        {loadState === 'error' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{loadErrorMessage}</Text>
            <Button
              label={MEMBER_MANAGE_RETRY_LABEL}
              onPress={() => load(keyword)}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          </View>
        )}

        {loadState === 'ready' && (
          <>
            {mode === 'view' && (
              <Text style={styles.countText}>
                {members.length}
                {MEMBER_MANAGE_COUNT_SUFFIX}
              </Text>
            )}

            {members.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {keyword.trim() ? MEMBER_MANAGE_SEARCH_EMPTY : MEMBER_MANAGE_EMPTY}
                </Text>
              </View>
            ) : mode === 'delete' ? (
              <FlatList
                data={members}
                keyExtractor={item => item.memberId}
                contentContainerStyle={styles.listContent}
                ListHeaderComponent={
                  <View style={styles.selectAllRow}>
                    <CheckBox checked={allSelected} onToggle={toggleSelectAll} />
                    <Text style={styles.selectAllLabel}>
                      {MEMBER_MANAGE_SELECT_ALL_LABEL}
                    </Text>
                    <Text style={styles.selectAllCount}>
                      {members.length}
                      {MEMBER_MANAGE_SELECT_COUNT_SUFFIX}
                    </Text>
                  </View>
                }
                renderItem={({ item }) => (
                  <MemberListItem
                    name={item.name}
                    showAmount={false}
                    selected={selectedMemberIds.includes(item.memberId)}
                    onPress={() => toggleMember(item.memberId)}
                  />
                )}
              />
            ) : (
              <FlatList
                data={members}
                keyExtractor={item => item.memberId}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.row}
                    onPress={() =>
                      navigation.navigate('MemberDetail', { memberId: item.memberId })
                    }
                  >
                    <Text style={styles.rowText}>{item.name}</Text>
                  </Pressable>
                )}
              />
            )}
          </>
        )}
      </View>

      {mode === 'delete' && (
        <View style={styles.footer}>
          <Button
            label={`${selectedMemberIds.length}${MEMBER_MANAGE_DELETE_SUBMIT_SUFFIX}`}
            disabled={selectedMemberIds.length === 0}
            fullWidth
            onPress={() => setDeleteDialogVisible(true)}
          />
        </View>
      )}

      <MemberMoreMenu
        visible={moreMenuVisible}
        onClose={() => setMoreMenuVisible(false)}
        items={[
          { key: 'add', label: MEMBER_MANAGE_ADD_MENU_LABEL },
          { key: 'delete', label: MEMBER_MANAGE_DELETE_MENU_LABEL, destructive: true },
        ]}
        onSelect={handleSelectMoreMenu}
      />

      <MemberAddSheet
        visible={addSheetVisible}
        onClose={() => setAddSheetVisible(false)}
        onPressIndividual={() => {
          setAddSheetVisible(false);
          navigation.navigate('MemberAddIndividual');
        }}
        onPressBulk={() => {
          setAddSheetVisible(false);
          navigation.navigate('MemberAddBulk');
        }}
      />

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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 8,
  },
  countText: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_SUBTLE,
    marginTop: 8,
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyText: {
    ...TYPOGRAPHY.subtitle3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    paddingVertical: 14,
    borderRadius: 8,
  },
  rowText: {
    ...TYPOGRAPHY.body1,
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
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
  },
});

export default MemberManageScreen;
