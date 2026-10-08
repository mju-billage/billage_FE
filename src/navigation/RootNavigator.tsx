import { NavigationContainer } from '@react-navigation/native';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from '../screens/SplashScreen';
import PostLoginScreen from '../screens/PostLoginScreen';
import { useEffect, useState } from 'react';
import LoginScreen from '../screens/LoginScreen';
import TermsAgreementScreen from '../screens/Signup/TermsAgreementScreen';
import TermsOfServiceScreen from '../screens/Signup/TermsOfServiceScreen';
import PrivacyPolicyScreen from '../screens/Signup/PrivacyPolicyScreen';
import MarketingConsentScreen from '../screens/Signup/MarketingConsentScreen';
import SocialSignupInfoScreen from '../screens/Signup/SocialSignupInfoScreen';
import SignupInfoScreen from '../screens/Signup/SignupInfoScreen';
import EmailVerificationScreen from '../screens/Signup/EmailVerificationScreen';
import SignupCompleteScreen from '../screens/Signup/SignupCompleteScreen';
import PasswordResetScreen from '../screens/PasswordReset/PasswordResetScreen';
import PasswordResetSentScreen from '../screens/PasswordReset/PasswordResetSentScreen';
import MainTabNavigator from './MainTabNavigator';
import type { MainTabParamList } from './MainTabNavigator';
import NotificationScreen from '../screens/Notification/NotificationScreen';
import CalendarScreen from '../screens/Calendar/CalendarScreen';
import FolderSelectMoveScreen from '../screens/Folder/FolderSelectMoveScreen';
import FolderMoveDestinationScreen from '../screens/Folder/FolderMoveDestinationScreen';
import FolderBudgetListScreen from '../screens/Folder/FolderBudgetListScreen';
import LedgerCreateScreen from '../screens/Folder/LedgerCreateScreen';
import LedgerDetailScreen from '../screens/Folder/LedgerDetailScreen';
import LedgerSearchScreen from '../screens/Folder/LedgerSearchScreen';
import TransactionDetailScreen from '../screens/Folder/TransactionDetailScreen';
import TransactionReceiptDetailScreen from '../screens/Folder/TransactionReceiptDetailScreen';
import TransactionSearchScreen from '../screens/Transactions/TransactionSearchScreen';
import TransactionRegisterScreen from '../screens/Transactions/TransactionRegisterScreen';
import AllGroupsScreen from '../screens/GroupManager/AllGroupsScreen';
import GroupCreateScreen from '../screens/GroupManager/GroupCreateScreen';
import GroupManageScreen from '../screens/GroupManager/GroupManageScreen';
import GroupManagerScreen from '../screens/GroupManager/GroupManagerScreen';
import GroupProfileEditScreen from '../screens/GroupManager/GroupProfileEditScreen';
import DuesDetailScreen from '../screens/Dues/DuesDetailScreen';
import DuesCreateScreen from '../screens/Dues/DuesCreateScreen';
import DuesEditScreen from '../screens/Dues/DuesEditScreen';
import DuesRequestScreen from '../screens/Dues/DuesRequestScreen';
import DuesMemberEditScreen from '../screens/Dues/DuesMemberEditScreen';
import MemberManageScreen from '../screens/Member/MemberManageScreen';
import MemberAddIndividualScreen from '../screens/Member/MemberAddIndividualScreen';
import MemberAddBulkScreen from '../screens/Member/MemberAddBulkScreen';
import MemberDetailScreen from '../screens/Member/MemberDetailScreen';
import MemberEditScreen from '../screens/Member/MemberEditScreen';
import MemberPaymentHistoryScreen from '../screens/Member/MemberPaymentHistoryScreen';
import ReceiptAlbumScreen from '../screens/Receipt/ReceiptAlbumScreen';
import ReceiptSearchScreen from '../screens/Receipt/ReceiptSearchScreen';
import ReceiptDetailScreen from '../screens/Receipt/ReceiptDetailScreen';
import ReportMainScreen from '../screens/Report/ReportMainScreen';
import ReportCreateByLedgerScreen from '../screens/Report/ReportCreateByLedgerScreen';
import ReportLedgerSelectScreen from '../screens/Report/ReportLedgerSelectScreen';
import ReportCreateByPeriodScreen from '../screens/Report/ReportCreateByPeriodScreen';
import ReportByLedgerDetailScreen from '../screens/Report/ReportByLedgerDetailScreen';
import ReportByPeriodDetailScreen from '../screens/Report/ReportByPeriodDetailScreen';
import ReportLedgerEntriesScreen from '../screens/Report/ReportLedgerEntriesScreen';
import ReportPeriodEntriesScreen from '../screens/Report/ReportPeriodEntriesScreen';
import ReportEntryDetailScreen from '../screens/Report/ReportEntryDetailScreen';
import ArchiveListScreen from '../screens/Archive/ArchiveListScreen';
import ArchiveDetailScreen from '../screens/Archive/ArchiveDetailScreen';
import ArchiveLedgerEntriesScreen from '../screens/Archive/ArchiveLedgerEntriesScreen';
import ArchiveEntryDetailScreen from '../screens/Archive/ArchiveEntryDetailScreen';
import SettingsScreen from "../screens/More/SettingScreen"
import MyProfileScreen from '../screens/More/MyProfileScreen';
import ProfileEditScreen from '../screens/More/ProfileEditScreen';
import PasswordChangeScreen from '../screens/More/PasswordChangeScreen';
import NotificationSettingsScreen from '../screens/More/NotificationSettingsScreen';
import NoticeListScreen from '../screens/More/NoticeListScreen';
import NoticeDetailScreen from '../screens/More/NoticeDetailScreen';
import InquiryScreen from '../screens/More/InquiryScreen';
import TermsScreen from '../screens/More/TermsScreen';
import TermDetailScreen from '../screens/More/TermDetailScreen';
import WithdrawGuideScreen from '../screens/More/WithdrawGuideScreen';
import WithdrawOwnershipTransferScreen from '../screens/More/WithdrawOwnershipTransferScreen';
import WithdrawReasonScreen from '../screens/More/WithdrawReasonScreen';
import StatisticsScreen from '../screens/Statistics/StatisticsScreen';
import type { TermType } from '../services/supportService';
import type { ReportEntrySnapshot, ReportLedgerDetail, ReportSummary } from '../types/report';
import type { ArchivedEntry } from '../types/archive';
import { SocialProfile } from '../types/social';
import * as authService from '../services/authService';

export type RootStackParamList = {
  Login: { snackbarMessage?: string } | undefined;
  TermsAgreement: { socialProfile?: SocialProfile } | undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  MarketingConsent: undefined;
  SocialSignupInfo: { profile: SocialProfile; agreements: authService.SignupAgreements };
  SignupInfo: { agreements: authService.SignupAgreements };
  EmailVerification: {
    email: string;
    name: string;
    password: string;
    agreements: authService.SignupAgreements;
  };
  SignupComplete: undefined;
  PostLogin: undefined;
  GroupOnboarding: undefined;
  PasswordReset: undefined;
  PasswordResetSent: { email: string };
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Notification: undefined;
  Calendar: undefined;
  FolderSelectMove: { folderId: string | null };
  FolderMoveDestination: {
    items: { id: string; kind: 'folder' | 'ledger' }[];
    sourceFolderId: string | null;
    destinationFolderId: string | null;
  };
  FolderBudgetList: undefined;
  Statistics: undefined;
  LedgerCreate: { parentId: string | null };
  LedgerDetail: { ledgerId: string };
  LedgerSearch: { ledgerId: string; ledgerName: string };
  TransactionDetail: { transactionId: string };
  TransactionReceiptDetail: { fileUrl: string };
  TransactionSearch: undefined;
  TransactionRegister: { transactionId?: string };
  AllGroups: { snackbarMessage?: string } | undefined;
  GroupCreate: undefined;
  GroupManage: undefined;
  GroupManager: undefined;
  GroupProfileEdit: undefined;
  DuesDetail: { duesId: string };
  DuesCreate: undefined;
  DuesEdit: { duesId: string };
  DuesMemberEdit: { duesId: string };
  DuesRequest: undefined;
  MemberManage: { snackbarMessage?: string } | undefined;
  MemberAddIndividual: undefined;
  MemberAddBulk: undefined;
  MemberDetail: { memberId: string };
  MemberEdit: { memberId: string };
  MemberPaymentHistory: { memberId: string };
  ReceiptAlbum: undefined;
  ReceiptSearch: undefined;
  ReceiptDetail: {
    fileId: string;
    fileUrl: string;
    entryId: string;
    entryTitle: string;
    occurredOn: string;
  };
  ReportMain: { snackbarMessage?: string } | undefined;
  ReportCreateByLedger: { selectedLedgers?: { id: string; name: string }[] } | undefined;
  ReportLedgerSelect: { selectedLedgers: { id: string; name: string }[] };
  ReportCreateByPeriod: undefined;
  ReportByLedgerDetail: { reportId: string; snackbarMessage?: string };
  ReportByPeriodDetail: { reportId: string; snackbarMessage?: string };
  ReportLedgerEntries: {
    reportTitle: string;
    ledgerName: string;
    startDate: string;
    endDate: string;
    totalIncome: number;
    totalExpense: number;
    entries: ReportEntrySnapshot[];
  };
  ReportPeriodEntries: {
    reportTitle: string;
    startDate: string;
    endDate: string;
    summary: ReportSummary;
    ledgers: ReportLedgerDetail[];
  };
  ReportEntryDetail: {
    ledgerName: string;
    entry: ReportEntrySnapshot;
  };
  Archive: undefined;
  ArchiveDetail: { archiveId: string };
  ArchiveLedgerEntries: {
    ledgerName: string;
    startDate: string;
    endDate: string;
    totalIncome: number;
    totalExpense: number;
    entries: ArchivedEntry[];
  };
  ArchiveEntryDetail: {
    ledgerName: string;
    entry: ArchivedEntry;
  };
  Settings: undefined;
  MyProfile: { snackbarMessage?: string } | undefined;
  ProfileEdit: undefined;
  PasswordChange: undefined;
  NotificationSettings: undefined;
  NoticeList: undefined;
  NoticeDetail: { noticeId: string };
  Inquiry: undefined;
  Terms: undefined;
  TermDetail: { termType: TermType; title: string };
  WithdrawGuide: undefined;
  WithdrawOwnershipTransfer: {
    groups: { groupId: string; name: string }[];
  };
  WithdrawReason: {
    ownershipTransfers: { groupId: number; newOwnerUserId: number }[];
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RootNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRouteName, setInitialRouteName] = useState<
    'Login' | 'PostLogin'
  >('Login');

  useEffect(() => {
    authService.restoreSession().then(session => {
      setInitialRouteName(session === 'signedOut' ? 'Login' : 'PostLogin');
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRouteName}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen
            name="TermsAgreement"
            component={TermsAgreementScreen}
          />
          <Stack.Screen
            name="TermsOfService"
            component={TermsOfServiceScreen}
          />
          <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          <Stack.Screen
            name="MarketingConsent"
            component={MarketingConsentScreen}
          />
          <Stack.Screen
            name="SocialSignupInfo"
            component={SocialSignupInfoScreen}
          />
          <Stack.Screen name="SignupInfo" component={SignupInfoScreen} />
          <Stack.Screen
            name="EmailVerification"
            component={EmailVerificationScreen}
          />
          <Stack.Screen
            name="SignupComplete"
            component={SignupCompleteScreen}
          />
          <Stack.Screen name="PostLogin" component={PostLoginScreen} />
          <Stack.Screen
            name="GroupOnboarding"
            component={SignupCompleteScreen}
          />
          <Stack.Screen name="PasswordReset" component={PasswordResetScreen} />
          <Stack.Screen
            name="PasswordResetSent"
            component={PasswordResetSentScreen}
          />
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="Notification" component={NotificationScreen} />
          <Stack.Screen name="Calendar" component={CalendarScreen} />
          <Stack.Screen
            name="FolderSelectMove"
            component={FolderSelectMoveScreen}
          />
          <Stack.Screen
            name="FolderMoveDestination"
            component={FolderMoveDestinationScreen}
          />
          <Stack.Screen
            name="FolderBudgetList"
            component={FolderBudgetListScreen}
          />
          <Stack.Screen name="Statistics" component={StatisticsScreen} />
          <Stack.Screen name="LedgerCreate" component={LedgerCreateScreen} />
          <Stack.Screen name="LedgerDetail" component={LedgerDetailScreen} />
          <Stack.Screen name="LedgerSearch" component={LedgerSearchScreen} />
          <Stack.Screen
            name="TransactionDetail"
            component={TransactionDetailScreen}
          />
          <Stack.Screen
            name="TransactionReceiptDetail"
            component={TransactionReceiptDetailScreen}
          />
          <Stack.Screen
            name="TransactionSearch"
            component={TransactionSearchScreen}
          />
          <Stack.Screen
            name="TransactionRegister"
            component={TransactionRegisterScreen}
          />
          <Stack.Screen name="AllGroups" component={AllGroupsScreen} />
          <Stack.Screen name="GroupCreate" component={GroupCreateScreen} />
          <Stack.Screen name="GroupManage" component={GroupManageScreen} />
          <Stack.Screen name="GroupManager" component={GroupManagerScreen} />
          <Stack.Screen
            name="GroupProfileEdit"
            component={GroupProfileEditScreen}
          />
          <Stack.Screen name="DuesDetail" component={DuesDetailScreen} />
          <Stack.Screen name="DuesCreate" component={DuesCreateScreen} />
          <Stack.Screen name="DuesEdit" component={DuesEditScreen} />
          <Stack.Screen
            name="DuesMemberEdit"
            component={DuesMemberEditScreen}
          />
          <Stack.Screen name="DuesRequest" component={DuesRequestScreen} />
          <Stack.Screen name="MemberManage" component={MemberManageScreen} />
          <Stack.Screen
            name="MemberAddIndividual"
            component={MemberAddIndividualScreen}
          />
          <Stack.Screen name="MemberAddBulk" component={MemberAddBulkScreen} />
          <Stack.Screen name="MemberDetail" component={MemberDetailScreen} />
          <Stack.Screen name="MemberEdit" component={MemberEditScreen} />
          <Stack.Screen
            name="MemberPaymentHistory"
            component={MemberPaymentHistoryScreen}
          />
          <Stack.Screen name="ReceiptAlbum" component={ReceiptAlbumScreen} />
          <Stack.Screen name="ReceiptSearch" component={ReceiptSearchScreen} />
          <Stack.Screen name="ReceiptDetail" component={ReceiptDetailScreen} />
          <Stack.Screen name="ReportMain" component={ReportMainScreen} />
          <Stack.Screen
            name="ReportCreateByLedger"
            component={ReportCreateByLedgerScreen}
          />
          <Stack.Screen
            name="ReportLedgerSelect"
            component={ReportLedgerSelectScreen}
          />
          <Stack.Screen
            name="ReportCreateByPeriod"
            component={ReportCreateByPeriodScreen}
          />
          <Stack.Screen
            name="ReportByLedgerDetail"
            component={ReportByLedgerDetailScreen}
          />
          <Stack.Screen
            name="ReportByPeriodDetail"
            component={ReportByPeriodDetailScreen}
          />
          <Stack.Screen
            name="ReportLedgerEntries"
            component={ReportLedgerEntriesScreen}
          />
          <Stack.Screen
            name="ReportPeriodEntries"
            component={ReportPeriodEntriesScreen}
          />
          <Stack.Screen
            name="ReportEntryDetail"
            component={ReportEntryDetailScreen}
          />
          <Stack.Screen name="Archive" component={ArchiveListScreen} />
          <Stack.Screen name="ArchiveDetail" component={ArchiveDetailScreen} />
          <Stack.Screen
            name="ArchiveLedgerEntries"
            component={ArchiveLedgerEntriesScreen}
          />
          <Stack.Screen name="ArchiveEntryDetail" component={ArchiveEntryDetailScreen} />
          <Stack.Screen
            name="Settings"
            component={SettingsScreen}
          />
          <Stack.Screen name="MyProfile" component={MyProfileScreen} />
          <Stack.Screen name="ProfileEdit" component={ProfileEditScreen} />
          <Stack.Screen
            name="PasswordChange"
            component={PasswordChangeScreen}
          />
          <Stack.Screen
            name="NotificationSettings"
            component={NotificationSettingsScreen}
          />
          <Stack.Screen name="NoticeList" component={NoticeListScreen} />
          <Stack.Screen name="NoticeDetail" component={NoticeDetailScreen} />
          <Stack.Screen name="Inquiry" component={InquiryScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
          <Stack.Screen name="TermDetail" component={TermDetailScreen} />
          <Stack.Screen name="WithdrawGuide" component={WithdrawGuideScreen} />
          <Stack.Screen
            name="WithdrawOwnershipTransfer"
            component={WithdrawOwnershipTransferScreen}
          />
          <Stack.Screen name="WithdrawReason" component={WithdrawReasonScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default RootNavigator;
