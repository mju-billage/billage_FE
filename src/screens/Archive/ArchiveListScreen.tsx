import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import ScreenContainer from '../../components/Layout/ScreenContainer';
import AppBar from '../../components/Navigation/App bar/AppBar';
import Button from '../../components/Input/Button/Button';
import CardBase from '../../components/Data Display/Card/CardBase';
import Dialog from '../../components/Feedback/Dialogs/Dialog';
import Snackbar from '../../components/Feedback/Snackbar/Snackbar';
import { getActiveGroup } from '../../types/group';
import type { ArchiveSummary } from '../../types/archive';
import * as archiveService from '../../services/archiveService';
import { ApiError } from '../../services/apiClient';
import {
  API_ERROR_DEFAULT_MESSAGE,
  API_NETWORK_ERROR_MESSAGE,
  NO_ACTIVE_GROUP_MESSAGE,
  getApiErrorMessage,
  isNetworkError,
} from '../../constants/apiErrorMessages';
import {
  ARCHIVE_CARD_LEDGER_COUNT_SUFFIX,
  ARCHIVE_CARD_VIEW_LABEL,
  ARCHIVE_DELETE_CONFIRM_LABEL,
  ARCHIVE_DELETE_DIALOG_DESCRIPTION,
  ARCHIVE_DELETE_DIALOG_TITLE,
  ARCHIVE_EMPTY_TITLE,
  ARCHIVE_LOADING,
  ARCHIVE_RENAME_CONFIRM_LABEL,
  ARCHIVE_RENAME_DIALOG_TITLE,
  ARCHIVE_RENAME_PLACEHOLDER,
  ARCHIVE_RETRY_LABEL,
  ARCHIVE_SCREEN_TITLE,
  ARCHIVE_TITLE_MAX_LENGTH,
  SNACKBAR_ARCHIVE_DELETED,
  SNACKBAR_ARCHIVE_RENAMED,
} from '../../constants/archiveScreenText';
import { FOREGROUND_DISABLED, FOREGROUND_NEUTRAL_SUBTLE } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const EDIT_ICON = require('../../assets/icons/action/Edit.png');
const CLOSE_ICON = require('../../assets/icons/action/Close.png');

const SNACKBAR_AUTO_HIDE_MS = 3000;

type ArchiveListNavigationProp = NativeStackNavigationProp<RootStackParamList>;
type LoadState = 'loading' | 'error' | 'ready';
type ActiveDialog = 'rename' | 'delete' | null;

function ArchiveListScreen() {
  const navigation = useNavigation<ArchiveListNavigationProp>();
  const snackbarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [archives, setArchives] = useState<ArchiveSummary[]>([]);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [loadErrorMessage, setLoadErrorMessage] = useState('');
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);
  const [targetArchive, setTargetArchive] = useState<ArchiveSummary | null>(null);
  const [dialogInputValue, setDialogInputValue] = useState('');
  const [dialogError, setDialogError] = useState<string | undefined>();
  const [isSubmittingDialog, setIsSubmittingDialog] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState<string | null>(null);

  const toErrorMessage = (error: unknown): string => {
    if (isNetworkError(error)) {
      return API_NETWORK_ERROR_MESSAGE;
    }
    if (error instanceof ApiError) {
      return getApiErrorMessage(error.code, error.message);
    }
    return API_ERROR_DEFAULT_MESSAGE;
  };

  const loadArchives = useCallback(async () => {
    setLoadState('loading');
    try {
      const group = getActiveGroup();
      if (!group) {
        setLoadErrorMessage(NO_ACTIVE_GROUP_MESSAGE);
        setLoadState('error');
        return;
      }
      const list = await archiveService.getArchives(group.id);
      setArchives(list);
      setLoadState('ready');
    } catch (error) {
      setLoadErrorMessage(toErrorMessage(error));
      setLoadState('error');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadArchives();
    }, [loadArchives]),
  );

  useEffect(() => {
    return () => {
      if (snackbarTimeoutRef.current) {
        clearTimeout(snackbarTimeoutRef.current);
      }
    };
  }, []);

  const closeDialog = () => {
    setActiveDialog(null);
    setTargetArchive(null);
    setDialogInputValue('');
    setDialogError(undefined);
  };

  const showSnackbar = (message: string) => {
    if (snackbarTimeoutRef.current) {
      clearTimeout(snackbarTimeoutRef.current);
    }
    setSnackbarMessage(message);
    snackbarTimeoutRef.current = setTimeout(() => setSnackbarMessage(null), SNACKBAR_AUTO_HIDE_MS);
  };

  const closeSnackbar = () => {
    if (snackbarTimeoutRef.current) {
      clearTimeout(snackbarTimeoutRef.current);
      snackbarTimeoutRef.current = null;
    }
    setSnackbarMessage(null);
  };

  const handleConfirmDialog = async () => {
    if (isSubmittingDialog || !targetArchive) {
      return;
    }
    if (activeDialog === 'rename') {
      const trimmed = dialogInputValue.trim();
      if (!trimmed) {
        return;
      }
      setIsSubmittingDialog(true);
      try {
        await archiveService.updateArchiveTitle(targetArchive.archiveId, trimmed);
        closeDialog();
        showSnackbar(SNACKBAR_ARCHIVE_RENAMED);
        loadArchives();
      } catch (error) {
        if (error instanceof ApiError) {
          const fieldError = error.fieldErrors.find(fe => fe.field === 'title');
          setDialogError(fieldError?.reason ?? getApiErrorMessage(error.code, error.message));
        } else {
          setDialogError(toErrorMessage(error));
        }
      } finally {
        setIsSubmittingDialog(false);
      }
    } else if (activeDialog === 'delete') {
      setIsSubmittingDialog(true);
      try {
        await archiveService.deleteArchive(targetArchive.archiveId);
        closeDialog();
        showSnackbar(SNACKBAR_ARCHIVE_DELETED);
        loadArchives();
      } catch (error) {
        closeDialog();
        showSnackbar(toErrorMessage(error));
      } finally {
        setIsSubmittingDialog(false);
      }
    }
  };

  return (
    <ScreenContainer
      background="primary"
      snackbar={
        snackbarMessage ? (
          <Snackbar visible title={snackbarMessage} onClose={closeSnackbar} />
        ) : undefined
      }
    >
      <AppBar type="sub" title={ARCHIVE_SCREEN_TITLE} onBackPress={() => navigation.goBack()} />

      <View style={styles.body}>
        {loadState === 'loading' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{ARCHIVE_LOADING}</Text>
          </View>
        )}

        {loadState === 'error' && (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>{loadErrorMessage}</Text>
            <Button
              label={ARCHIVE_RETRY_LABEL}
              onPress={loadArchives}
              hierarchy="secondary"
              style={{ alignSelf: 'center' }}
            />
          </View>
        )}

        {loadState === 'ready' &&
          (archives.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{ARCHIVE_EMPTY_TITLE}</Text>
            </View>
          ) : (
            <FlatList
              data={archives}
              keyExtractor={item => item.archiveId}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <CardBase style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.cardTitleGroup}>
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {truncateArchiveTitle(item.title)}
                      </Text>
                      <Pressable
                        hitSlop={8}
                        onPress={() => {
                          setTargetArchive(item);
                          setDialogInputValue(item.title);
                          setActiveDialog('rename');
                        }}
                      >
                        <Image source={EDIT_ICON} style={styles.headerIcon} />
                      </Pressable>
                    </View>
                    <Pressable
                      hitSlop={8}
                      onPress={() => {
                        setTargetArchive(item);
                        setActiveDialog('delete');
                      }}
                    >
                      <Image source={CLOSE_ICON} style={styles.headerIcon} />
                    </Pressable>
                  </View>
                  <Text style={styles.cardMeta}>{formatArchivedAt(item.createdAt)}</Text>
                  <Text style={styles.cardLedgerCount}>
                    {item.ledgerCount}
                    {ARCHIVE_CARD_LEDGER_COUNT_SUFFIX}
                  </Text>
                  <Button
                    label={ARCHIVE_CARD_VIEW_LABEL}
                    hierarchy="secondary"
                    fullWidth
                    onPress={() =>
                      navigation.navigate('ArchiveDetail', {
                        archiveId: item.archiveId,
                      })
                    }
                  />
                </CardBase>
              )}
            />
          ))}
      </View>

      <Dialog
        visible={activeDialog === 'rename'}
        title={ARCHIVE_RENAME_DIALOG_TITLE}
        showTextField
        textFieldValue={dialogInputValue}
        onChangeTextField={text => {
          setDialogInputValue(text);
          setDialogError(undefined);
        }}
        textFieldPlaceholder={ARCHIVE_RENAME_PLACEHOLDER}
        textFieldMaxLength={ARCHIVE_TITLE_MAX_LENGTH}
        textFieldError={dialogError}
        autoFocusTextField
        confirmLabel={ARCHIVE_RENAME_CONFIRM_LABEL}
        confirmDisabled={
          isSubmittingDialog ||
          !dialogInputValue.trim() ||
          dialogInputValue.trim() === targetArchive?.title
        }
        onCancel={closeDialog}
        onConfirm={handleConfirmDialog}
      />

      <Dialog
        visible={activeDialog === 'delete'}
        title={ARCHIVE_DELETE_DIALOG_TITLE}
        description={ARCHIVE_DELETE_DIALOG_DESCRIPTION}
        confirmLabel={ARCHIVE_DELETE_CONFIRM_LABEL}
        destructive
        confirmDisabled={isSubmittingDialog}
        onCancel={closeDialog}
        onConfirm={handleConfirmDialog}
      />
    </ScreenContainer>
  );
}

function formatArchivedAt(isoDateTime: string | null | undefined): string {
  if (!isoDateTime) {
    return '';
  }
  const date = isoDateTime.slice(0, 10).replace(/-/g, '.');
  const time = isoDateTime.slice(11, 16);
  return time ? `${date} · ${time}` : date;
}

const ARCHIVE_TITLE_TRUNCATE_LENGTH = 10;

function truncateArchiveTitle(title: string): string {
  if (title.length <= ARCHIVE_TITLE_TRUNCATE_LENGTH) {
    return title;
  }
  return `${title.slice(0, ARCHIVE_TITLE_TRUNCATE_LENGTH)}…`;
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
    gap: 16,
    paddingBottom: 24,
  },
  card: {
    gap: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitleGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    ...TYPOGRAPHY.subtitle1,
    flexShrink: 1,
  },
  headerIcon: {
    width: 20,
    height: 20,
    tintColor: FOREGROUND_NEUTRAL_SUBTLE,
  },
  cardMeta: {
    ...TYPOGRAPHY.body3,
    color: FOREGROUND_NEUTRAL_SUBTLE,
  },
  cardLedgerCount: {
    ...TYPOGRAPHY.body2,
  },
});

export default ArchiveListScreen;
