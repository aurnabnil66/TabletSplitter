import React from 'react';
import { View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { moveTabletPart } from '../../redux/slices/tabletSlice';
import { ITabletPartProps } from '../../interfaces/ITabletPartProps';
import styles from './Style';

const TabletPartComponent: React.FC<ITabletPartProps> = ({
  part,
  tabletId,
}) => {
  const dispatch = useDispatch();

  const AnimatedView = Animated.createAnimatedComponent(View);

  const translateX = useSharedValue(part.x);
  const translateY = useSharedValue(part.y);

  // Create pan gesture for moving tablet parts
  const panGesture = Gesture.Pan()
    .onStart(() => {})
    .onUpdate(event => {
      translateX.value = part.x + event.translationX;
      translateY.value = part.y + event.translationY;
    })
    .onEnd(() => {
      // Direct dispatch - no runOnJS needed
      dispatch(
        moveTabletPart({
          tabletId,
          partId: part.id,
          x: translateX.value,
          y: translateY.value,
        }),
      );
    })
    .onFinalize(() => {
      // Optional: handle gesture cancellation
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <GestureDetector gesture={panGesture}>
      <AnimatedView
        style={[
          styles.tabletPart,
          {
            width: part.width,
            height: part.height,
            backgroundColor: part.color,
            borderRadius:
              Math.min(part.originalWidth, part.originalHeight) * 0.1,
            left: part.x,
            top: part.y,
          },
          animatedStyle,
        ]}
      />
    </GestureDetector>
  );
};

export default TabletPartComponent;
