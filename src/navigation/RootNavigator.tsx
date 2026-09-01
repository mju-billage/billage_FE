import { NavigationContainer } from '@react-navigation/native';
import type { NavigatorScreenParams } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from '../screens/SplashScreen';
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
import TransactionSearchScreen from '../screens/Transactions/TransactionSearchScreen';
import TransactionRegisterScreen from '../screens/Transactions/TransactionRegisterScreen';
import AllGroupsScreen from '../screens/GroupManager/AllGroupsScreen';
import GroupCreateScreen from '../screens/GroupManager/GroupCreateScreen';
import GroupManagerScreen from '../screens/GroupManager/GroupManagerScreen';
import DuesDetailScreen from '../screens/Dues/DuesDetailScreen';
import DuesCreateScreen from '../screens/Dues/DuesCreateScreen';
import { SocialProfile } from '../types/social';
import * as authService from '../services/authService';

export type RootStackParamList = {
  Login: undefined;
  TermsAgreement: undefined;
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  MarketingConsent: undefined;
  SocialSignupInfo: { profile: SocialProfile };
  SignupInfo: undefined;
  EmailVerification: { email: string };
  SignupComplete: undefined;
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
  LedgerCreate: { parentId: string | null };
  LedgerDetail: { ledgerId: string };
  LedgerSearch: { ledgerId: string };
  TransactionDetail: { transactionId: string };
  TransactionSearch: undefined;
  TransactionRegister: { transactionId?: string };
  AllGroups: undefined;
  GroupCreate: undefined;
  GroupManager: undefined;
  DuesDetail: { duesId: string };
  DuesCreate: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * 앱 진입점 내비게이터: 로딩 중엔 스플래시를 보여주며 저장된 Refresh Token으로
 * 세션 복원을 시도하고, 이후 로그인 여부에 따라 로그인 화면 또는 메인 화면으로 진입한다.
 */
function RootNavigator() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRouteName, setInitialRouteName] = useState<'Login' | 'Main'>(
    'Login',
  );

  useEffect(() => {
    authService.restoreSession().then(user => {
      setInitialRouteName(user ? 'Main' : 'Login');
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
          <Stack.Screen name="LedgerCreate" component={LedgerCreateScreen} />
          <Stack.Screen name="LedgerDetail" component={LedgerDetailScreen} />
          <Stack.Screen name="LedgerSearch" component={LedgerSearchScreen} />
          <Stack.Screen
            name="TransactionDetail"
            component={TransactionDetailScreen}
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
          <Stack.Screen name="GroupManager" component={GroupManagerScreen} />
          <Stack.Screen name="DuesDetail" component={DuesDetailScreen} />
          <Stack.Screen name="DuesCreate" component={DuesCreateScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

export default RootNavigator;
