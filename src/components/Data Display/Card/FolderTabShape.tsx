import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

type FolderTabShapeProps = {
  fill: string;
};

function FolderTabShape({ fill }: FolderTabShapeProps) {
  return (
    <View style={styles.wrapper}>
      <Svg
        width="100%"
        height="100%"
        viewBox="0 0 100 36"
        preserveAspectRatio="none"
      >
        <Path
          d="M0,36 L0,10 C0,4.5 4.5,0 10,0 L45,0 L100,36 Z"
          fill={fill}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: -20,
    left: 0,
    width: '56.25%',
    height: 40,
  },
});

export default FolderTabShape;
