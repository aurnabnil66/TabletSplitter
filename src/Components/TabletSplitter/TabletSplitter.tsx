import React, { useCallback, useRef, useState } from 'react';
import { View, Text } from 'react-native';
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

const AnimatedView = Animated.createAnimatedComponent(View);

const TabletSplitter: React.FC = () => {
  const dispatch = useDispatch();
  const { tablets, isDrawing, currentTablet, splitLine } = useSelector(
    (state: RootState) => state.tablets,
  );

  // State to track if instructions should be shown
  const [showInstructions, setShowInstructions] = useState(true);

  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const currentX = useSharedValue(0);
  const currentY = useSharedValue(0);

  const isDrawingRef = useRef(false);

  // Hide instructions when first tablet is created
  React.useEffect(() => {
    if (tablets.length > 0 && showInstructions) {
      setShowInstructions(false);
    }
  }, [tablets.length, showInstructions]);

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

  const handleFinishDrawing = useCallback(
    (x: number, y: number) => {
      if (isDrawingRef.current) {
        isDrawingRef.current = false;
        dispatch(finishDrawing({ x, y }));
      }
    },
    [dispatch],
  );

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

      if (width >= 40 && height >= 20) {
        const x = Math.min(startX.value, event.x);
        const y = Math.min(startY.value, event.y);
        runOnJS(handleUpdateDrawing)(x, y, width, height);
      }
    })
    .onEnd(() => {
      'worklet';
      const x = Math.min(startX.value, currentX.value);
      const y = Math.min(startY.value, currentY.value);
      runOnJS(handleFinishDrawing)(x, y);
    })
    .onFinalize(() => {
      'worklet';
      const x = Math.min(startX.value, currentX.value);
      const y = Math.min(startY.value, currentY.value);
      runOnJS(handleFinishDrawing)(x, y);
    });

  const tapGesture = Gesture.Tap().onStart(event => {
    'worklet';
    runOnJS(handleSetSplitLine)(event.x, event.y);

    setTimeout(() => {
      runOnJS(handleSplitTablets)();
    }, 100);
  });

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
            {/* Instructions that disappear after first tablet */}
            {showInstructions && (
              <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Tablet Splitter</Text>
                <Text style={styles.instructionsText}>
                  • Press and drag to create a tablet
                </Text>
                <Text style={styles.instructionsText}>
                  • Tap to split tablets with a vertical line
                </Text>
                <Text style={styles.instructionsText}>
                  • Drag tablets to move them around
                </Text>
                <Text style={styles.instructionsSubtext}>
                  Create your first tablet to begin...
                </Text>
              </View>
            )}

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
