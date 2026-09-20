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
  /** snackbarMessage: 회비 삭제·마감(7-B-1) 완료 후 이 화면으로 라우팅하며
   * 스낵바를 띄우는 용도(DuesDetailScreen 참고) — 삭제된 회비는 상세 화면이
   * 더는 존재하지 않고, 마감은 명세가 상세가 아니라 이 목록으로 돌아가도록
   * 명시한다. */
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

/** react-navigation의 상태를 BottomNavigation(둥근 카드형 탭바) props로 매핑하는 커스텀 tabBar. */
function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const routeName = state.routes[state.index].name as keyof MainTabParamList;

  // 탭바를 화면 위에 겹쳐 띄운다 — 화면이 탭바 뒤까지 이어져서 상단 라운딩 모서리 뒤로
  // 각 화면 배경이 비친다(안 그러면 네비게이터 기본 회색 배경이 보인다). 그래서 탭 화면은
  // 하단 여백을 `BOTTOM_NAVIGATION_HEIGHT`만큼 직접 잡아야 한다.
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
          // 폴더 탭은 자체 스택(FolderTabNavigator)을 가진 유일한 탭이다 —
          // 서브폴더로 들어간 뒤 탭을 떠났다 돌아오거나 같은 탭을 재탭해도
          // 화면 위치(폴더 깊이)만 루트로 되돌린다. unmountOnBlur는 안 쓴다
          // — 화면 전체가 언마운트되면 폴더 목록을 매번 재요청하게 된다.
          // 목록의 스크롤 위치·그리드/리스트 보기 방식은 FolderScreen 내부
          // state라 이 초기화와 무관하게 유지된다(design-verification.md §5-11).
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
