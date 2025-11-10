import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  canvas: {
    flex: 1,
    position: 'relative',
  },
  drawingTablet: {
    position: 'absolute',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
  },
});

export default styles;
