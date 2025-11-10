import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  splitLine: {
    position: 'absolute',
    backgroundColor: 'red',
    zIndex: 1000,
  },
  verticalLine: {
    width: 2,
    height: '100%',
  },
  horizontalLine: {
    height: 2,
    width: '100%',
  },
});

export default styles;
