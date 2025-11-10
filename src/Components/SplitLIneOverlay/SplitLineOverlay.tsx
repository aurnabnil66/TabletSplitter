// src/components/SplitLineOverlay.tsx
import React from 'react';
import { View } from 'react-native';
import { SplitLine } from '../../types/tablet';
import styles from './Style';

interface SplitLineOverlayProps {
  splitLine: SplitLine;
}

const SplitLineOverlay: React.FC<SplitLineOverlayProps> = ({ splitLine }) => {
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
