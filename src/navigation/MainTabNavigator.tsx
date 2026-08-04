import { Image, ImageSourcePropType, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import FolderScreen from '../screens/FolderScreen';
import DuesScreen from '../screens/DuesScreen';
import MoreScreen from '../screens/MoreScreen';
import {
  TAB_DUES_LABEL,
  TAB_FOLDER_LABEL,
  TAB_HOME_LABEL,
  TAB_MORE_LABEL,
  TAB_TRANSACTIONS_LABEL,
} from '../constants/mainTabScreenText';
import { FOREGROUND_INACTIVE, NAVY_800 } from '../constants/colors';

export type MainTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Folder: undefined;
  Dues: undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const HOME_ICON = require('../assets/icons/action/Home.png');
const TRANSACTIONS_ICON = require('../assets/icons/action/DataBase.png');
const FOLDER_ICON = require('../assets/icons/action/Folder.png');
const DUES_ICON = require('../assets/icons/action/Dues.png');
const MORE_ICON = require('../assets/icons/action/MenuHorizontal.png');

type TabIconProps = {
  color: string;
};

function TabIcon({
  source,
  color,
}: TabIconProps & { source: ImageSourcePropType }) {
  return (
    <Image source={source} style={[styles.tabIcon, { tintColor: color }]} />
  );
}

function HomeTabIcon({ color }: TabIconProps) {
  return <TabIcon source={HOME_ICON} color={color} />;
}

function TransactionsTabIcon({ color }: TabIconProps) {
  return <TabIcon source={TRANSACTIONS_ICON} color={color} />;
}

function FolderTabIcon({ color }: TabIconProps) {
  return <TabIcon source={FOLDER_ICON} color={color} />;
}

function DuesTabIcon({ color }: TabIconProps) {
  return <TabIcon source={DUES_ICON} color={color} />;
}

function MoreTabIcon({ color }: TabIconProps) {
  return <TabIcon source={MORE_ICON} color={color} />;
}

/** 로그인 이후 진입하는 바텀탭 네비게이터: 홈만 실구현이고 나머지는 준비 중 안내 화면이다. */
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: NAVY_800,
        tabBarInactiveTintColor: FOREGROUND_INACTIVE,
      }}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarLabel: TAB_HOME_LABEL, tabBarIcon: HomeTabIcon }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsScreen}
        options={{
          tabBarLabel: TAB_TRANSACTIONS_LABEL,
          tabBarIcon: TransactionsTabIcon,
        }}
      />
      <Tab.Screen
        name="Folder"
        component={FolderScreen}
        options={{ tabBarLabel: TAB_FOLDER_LABEL, tabBarIcon: FolderTabIcon }}
      />
      <Tab.Screen
        name="Dues"
        component={DuesScreen}
        options={{ tabBarLabel: TAB_DUES_LABEL, tabBarIcon: DuesTabIcon }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ tabBarLabel: TAB_MORE_LABEL, tabBarIcon: MoreTabIcon }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 22,
    height: 22,
  },
});

export default MainTabNavigator;
