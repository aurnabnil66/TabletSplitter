import React from 'react';
import { View } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../redux/store';
import {
  startDrawing,
  updateDrawing,
  finishDrawing,
  setSplitLine,
  splitTablets,
} from '../../redux/slices/tabletSlice';
import {
  GestureDetector,
  Gesture,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import TabletPartComponent from '../TabletPart/TabletPartComponent';
import SplitLineOverlay from '../SplitLIneOverlay/SplitLineOverlay';
import styles from './Style';
import { getRandomColor } from '../../utils/getRandomColor';

const TabletSplitter: React.FC = () => {
  const dispatch = useDispatch();

  const AnimatedView = Animated.createAnimatedComponent(View);

  const { tablets, isDrawing, currentTablet, splitLine } = useSelector(
    (state: RootState) => state.tablets,
  );

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const currentX = useSharedValue(0);
  const currentY = useSharedValue(0);

  // Create pan gesture for drawing tablets
  const panGesture = Gesture.Pan()
    .onStart(event => {
      startX.value = event.x;
      startY.value = event.y;
      currentX.value = event.x;
      currentY.value = event.y;

      // Direct dispatch since we're not in worklet
      dispatch(
        startDrawing({
          x: event.x,
          y: event.y,
          color: getRandomColor(),
        }),
      );
    })
    .onUpdate(event => {
      currentX.value = event.x;
      currentY.value = event.y;

      const width = Math.abs(event.x - startX.value);
      const height = Math.abs(event.y - startY.value);

      if (width >= 40 && height >= 20) {
        // Direct dispatch since we're not in worklet
        dispatch(
          updateDrawing({
            x: Math.min(startX.value, event.x),
            y: Math.min(startY.value, event.y),
            width,
            height,
          }),
        );
      }
    })
    .onEnd(() => {
      dispatch(finishDrawing());
    })
    .onFinalize(() => {
      dispatch(finishDrawing());
    });

  // Create tap gesture for splitting tablets
  const tapGesture = Gesture.Tap().onStart(event => {
    dispatch(
      setSplitLine({
        x: event.x,
        y: event.y,
        type: 'vertical',
      }),
    );

    // Split after showing the line briefly
    setTimeout(() => {
      if (splitLine) {
        dispatch(splitTablets(splitLine));
      }
    }, 100);
  });

  // Combine gestures - pan and tap work simultaneously
  const composedGestures = Gesture.Simultaneous(panGesture, tapGesture);

  const drawingStyle = useAnimatedStyle(() => {
    const left = Math.min(startX.value, currentX.value);
    const top = Math.min(startY.value, currentY.value);
    const width = Math.abs(currentX.value - startX.value);
    const height = Math.abs(currentY.value - startY.value);

    return {
      left,
      top,
      width,
      height,
      display: isDrawing && width >= 40 && height >= 20 ? 'flex' : 'none',
    };
  });

  return (
    <GestureHandlerRootView style={styles.container}>
      <GestureDetector gesture={composedGestures}>
        <View style={styles.container}>
          <View style={styles.canvas}>
            {tablets.map(tablet =>
              tablet.parts.map(part => (
                <TabletPartComponent
                  key={part.id}
                  part={part}
                  tabletId={tablet.id}
                />
              )),
            )}

            {currentTablet && (
              <AnimatedView
                style={[
                  styles.drawingTablet,
                  {
                    backgroundColor: currentTablet.color,
                    opacity: 0.7,
                  },
                  drawingStyle,
                ]}
              />
            )}

            {splitLine && <SplitLineOverlay splitLine={splitLine} />}
          </View>
        </View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
};

export default TabletSplitter;
