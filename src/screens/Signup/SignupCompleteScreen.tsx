/** @screen COM-5-PAGE-01-0 가입 완료 */
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/RootNavigator';
import BackButton from '../../components/Navigation/App bar/BackButton';
import Button from '../../components/Input/Button/Button';
import JoinGroupSheet from '../GroupManager/JoinGroupSheet';
import { FOREGROUND_NEUTRAL_NORMAL } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  SIGNUP_COMPLETE_TITLE,
  SIGNUP_COMPLETE_SUBTITLE,
  SIGNUP_COMPLETE_CREATE_GROUP_LABEL,
  SIGNUP_COMPLETE_JOIN_WITH_CODE_LABEL,
} from '../../constants/signupCompleteScreenText';

type SignupCompleteNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'SignupComplete'
>;

/** 가입 완료 환영 화면: 모임 생성/참여로 이어지는 다음 액션을 보여준다. */
function SignupCompleteScreen() {
  const navigation = useNavigation<SignupCompleteNavigationProp>();
  const [joinSheetVisible, setJoinSheetVisible] = useState(false);

  const handleCreateGroup = () => {
    navigation.navigate('GroupCreate');
  };

  const handleJoinWithCode = () => {
    setJoinSheetVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.backRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <Text style={styles.title}>{SIGNUP_COMPLETE_TITLE}</Text>
      <Text style={styles.subtitle}>{SIGNUP_COMPLETE_SUBTITLE}</Text>

      <View style={styles.footer}>
        <Button
          label={SIGNUP_COMPLETE_CREATE_GROUP_LABEL}
          onPress={handleCreateGroup}
          fullWidth
        />
        <View style={styles.buttonGap} />
        <Button
          label={SIGNUP_COMPLETE_JOIN_WITH_CODE_LABEL}
          onPress={handleJoinWithCode}
          hierarchy="secondary"
          fullWidth
        />
      </View>

      <JoinGroupSheet
        visible={joinSheetVisible}
        onClose={() => setJoinSheetVisible(false)}
        onJoined={() => {
          setJoinSheetVisible(false);
          navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  backRow: {
    marginBottom: 16,
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.body2,
    color: FOREGROUND_NEUTRAL_NORMAL,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 24,
  },
  buttonGap: {
    height: 12,
  },
});

export default SignupCompleteScreen;
