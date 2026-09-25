import { ImageSourcePropType, StyleSheet, View } from 'react-native';
import {
  createBottomTabNavigator,
  BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { CommonActions } from '@react-navigation/native';
import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import TransactionsScreen from '../screens/Transactions/TransactionsScreen';
import FolderTabNavigator from '../screens/Folder/FolderTabNavigator';
import DuesScreen from '../screens/Dues/DuesScreen';
import MoreScreen from '../screens/More/MoreScreen';
import BottomNavigation from '../components/Navigation/Bottom Navigation/BottomNavigation';
import {
  TAB_DUES_LABEL,
  TAB_FOLDER_LABEL,
  TAB_HOME_LABEL,
  TAB_MORE_LABEL,
  TAB_TRANSACTIONS_LABEL,
} from '../constants/mainTabScreenText';

export type MainTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Folder: undefined;
  Dues: { snackbarMessage?: string } | undefined;
  More: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const HOME_ICON = require('../assets/icons/action/Home.png');
const TRANSACTIONS_ICON = require('../assets/icons/action/DataBase.png');
const FOLDER_ICON = require('../assets/icons/action/Folder.png');
const DUES_ICON = require('../assets/icons/action/Dues.png');
const MORE_ICON = require('../assets/icons/action/MenuHorizontal.png');

const TAB_ICON_BY_ROUTE: Record<keyof MainTabParamList, ImageSourcePropType> = {
  Home: HOME_ICON,
  Transactions: TRANSACTIONS_ICON,
  Folder: FOLDER_ICON,
  Dues: DUES_ICON,
  More: MORE_ICON,
};

const TAB_LABEL_BY_ROUTE: Record<keyof MainTabParamList, string> = {
  Home: TAB_HOME_LABEL,
  Transactions: TAB_TRANSACTIONS_LABEL,
  Folder: TAB_FOLDER_LABEL,
  Dues: TAB_DUES_LABEL,
  More: TAB_MORE_LABEL,
};

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const routeName = state.routes[state.index].name as keyof MainTabParamList;

  return (
    <View style={styles.tabBarOverlay}>
      <BottomNavigation
        activeKey={routeName}
        items={state.routes.map(route => ({
          key: route.name,
          icon: TAB_ICON_BY_ROUTE[route.name as keyof MainTabParamList],
          label: TAB_LABEL_BY_ROUTE[route.name as keyof MainTabParamList],
        }))}
        onChange={key => {
          const event = navigation.emit({
            type: 'tabPress',
            target: state.routes.find(route => route.name === key)?.key,
            canPreventDefault: true,
          });
          if (!event.defaultPrevented) {
            navigation.navigate(key);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBarOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
});

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={CustomTabBar}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen
        name="Folder"
        component={FolderTabNavigator}
        listeners={({ navigation }) => ({
          tabPress: () => {
            navigation.dispatch(state =>
              CommonActions.reset({
                ...state,
                routes: state.routes.map(route =>
                  route.name === 'Folder' ? { ...route, state: undefined } : route,
                ),
              }),
            );
          },
        })}
      />
      <Tab.Screen name="Dues" component={DuesScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

export default MainTabNavigator;
