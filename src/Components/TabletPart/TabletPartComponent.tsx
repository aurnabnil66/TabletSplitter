import React, { useCallback } from 'react';
import { View } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { moveTabletPart } from '../../redux/slices/tabletSlice';
import { ITabletPartProps } from '../../interfaces/ITabletPartProps';
import styles from './Style';

// Move AnimatedView creation outside the component
const AnimatedView = Animated.createAnimatedComponent(View);

const TabletPartComponent: React.FC<ITabletPartProps> = ({
  part,
  tabletId,
}) => {
  const dispatch = useDispatch();

  const translateX = useSharedValue(part.x);
  const translateY = useSharedValue(part.y);

  // Create wrapper function
  const handleMoveTabletPart = useCallback(
    (x: number, y: number) => {
      dispatch(
        moveTabletPart({
          tabletId,
          partId: part.id,
          x,
          y,
        }),
      );
    },
    [dispatch, tabletId, part.id],
  );

  // Create pan gesture for moving tablet parts
  const panGesture = Gesture.Pan()
    .onUpdate(event => {
      'worklet';
      translateX.value = part.x + event.translationX;
      translateY.value = part.y + event.translationY;
    })
    .onEnd(() => {
      'worklet';
      runOnJS(handleMoveTabletPart)(translateX.value, translateY.value);
    });

  const animatedStyle = useAnimatedStyle(() => {
    'worklet';
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
