import React, { useCallback, useRef } from 'react';
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
  runOnJS,
} from 'react-native-reanimated';
import TabletPartComponent from '../TabletPart/TabletPartComponent';
import SplitLineOverlay from '../SplitLIneOverlay/SplitLineOverlay';
import styles from './Style';
import { getRandomColor } from '../../utils/getRandomColor';

// Move AnimatedView creation outside the component
const AnimatedView = Animated.createAnimatedComponent(View);

const TabletSplitter: React.FC = () => {
  const dispatch = useDispatch();

  const { tablets, isDrawing, currentTablet, splitLine } = useSelector(
    (state: RootState) => state.tablets,
  );

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const currentX = useSharedValue(0);
  const currentY = useSharedValue(0);

  // Use ref to track if we're currently drawing to prevent multiple dispatches
  const isDrawingRef = useRef(false);

  // Create wrapper functions that can be called with runOnJS
  const handleStartDrawing = useCallback(
    (x: number, y: number) => {
      if (!isDrawingRef.current) {
        isDrawingRef.current = true;
        dispatch(
          startDrawing({
            x,
            y,
            color: getRandomColor(),
          }),
        );
      }
    },
    [dispatch],
  );

  const handleUpdateDrawing = useCallback(
    (x: number, y: number, width: number, height: number) => {
      if (isDrawingRef.current) {
        dispatch(
          updateDrawing({
            x,
            y,
            width,
            height,
          }),
        );
      }
    },
    [dispatch],
  );

  const handleFinishDrawing = useCallback(() => {
    if (isDrawingRef.current) {
      isDrawingRef.current = false;
      dispatch(finishDrawing());
    }
  }, [dispatch]);

  const handleSetSplitLine = useCallback(
    (x: number, y: number) => {
      dispatch(
        setSplitLine({
          x,
          y,
          type: 'vertical',
        }),
      );
    },
    [dispatch],
  );

  const handleSplitTablets = useCallback(() => {
    if (splitLine) {
      dispatch(splitTablets(splitLine));
    }
  }, [dispatch, splitLine]);

  // Create pan gesture for drawing tablets
  const panGesture = Gesture.Pan()
    .onStart(event => {
      'worklet';
      startX.value = event.x;
      startY.value = event.y;
      currentX.value = event.x;
      currentY.value = event.y;

      runOnJS(handleStartDrawing)(event.x, event.y);
    })
    .onUpdate(event => {
      'worklet';
      currentX.value = event.x;
      currentY.value = event.y;

      const width = Math.abs(event.x - startX.value);
      const height = Math.abs(event.y - startY.value);

      // Only update if minimum size is met
      if (width >= 40 && height >= 20) {
        const x = Math.min(startX.value, event.x);
        const y = Math.min(startY.value, event.y);
        runOnJS(handleUpdateDrawing)(x, y, width, height);
      }
    })
    .onEnd(() => {
      'worklet';
      runOnJS(handleFinishDrawing)();
    })
    .onFinalize(() => {
      'worklet';
      runOnJS(handleFinishDrawing)();
    });

  // Create tap gesture for splitting tablets
  const tapGesture = Gesture.Tap().onStart(event => {
    'worklet';
    runOnJS(handleSetSplitLine)(event.x, event.y);

    // Split after showing the line briefly
    setTimeout(() => {
      runOnJS(handleSplitTablets)();
    }, 100);
  });

  // Combine gestures - use Exclusive instead of Simultaneous to prevent conflicts
  const composedGestures = Gesture.Exclusive(panGesture, tapGesture);

  const drawingStyle = useAnimatedStyle(() => {
    'worklet';
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
