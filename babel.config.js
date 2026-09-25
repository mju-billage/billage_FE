module.exports = {
  presets: ['module:@react-native/babel-preset'],
  // Reanimated 4부터 babel 플러그인이 react-native-worklets로 옮겨갔다
  // ('react-native-reanimated/plugin'은 여전히 존재하지만 내부적으로
  // 'react-native-worklets/plugin'을 그대로 require해 넘기는 얇은 위임).
  // 반드시 마지막 플러그인이어야 한다
  // (react-native-keyboard-controller가 내부적으로 reanimated/worklets를 쓴다).
  plugins: ['./babel-plugin-default-font.js', 'react-native-worklets/plugin'],
};
