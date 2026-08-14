import { createNativeStackNavigator } from '@react-navigation/native-stack';
import FolderScreen from './FolderScreen';

export type FolderTabParamList = {
  FolderList: { folderId?: string; folderName?: string } | undefined;
};

const Stack = createNativeStackNavigator<FolderTabParamList>();

/** 폴더 탭 전용 네스티드 스택. 하위 폴더 진입 시에도 하단 탭바가 유지되도록 FolderScreen을 재귀로 push한다. */
function FolderTabNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FolderList" component={FolderScreen} />
    </Stack.Navigator>
  );
}

export default FolderTabNavigator;
