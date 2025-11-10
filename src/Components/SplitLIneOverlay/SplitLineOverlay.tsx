// src/components/SplitLineOverlay.tsx
import React from 'react';
import { View } from 'react-native';
import styles from './Style';
import { ISplitLineOverlayProps } from '../../interfaces/ISplitLineOverlayProps';

const SplitLineOverlay: React.FC<ISplitLineOverlayProps> = ({ splitLine }) => {
  if (splitLine.type === 'vertical' && splitLine.x !== undefined) {
    return (
      <View
        style={[styles.splitLine, styles.verticalLine, { left: splitLine.x }]}
      />
    );
  } else if (splitLine.type === 'horizontal' && splitLine.y !== undefined) {
    return (
      <View
        style={[styles.splitLine, styles.horizontalLine, { top: splitLine.y }]}
      />
    );
  }

  return null;
};

export default SplitLineOverlay;
