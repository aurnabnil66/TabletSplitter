import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

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
  // Instructions styles
  instructionsContainer: {
    position: 'absolute',
    top: '30%',
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  instructionsText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  instructionsSubtext: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
    color: '#888',
  },
});

export default styles;
