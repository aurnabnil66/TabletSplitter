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
  PanGestureHandler,
  TapGestureHandler,
  State,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  runOnJS,
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

  const onPanStart = (event: any) => {
    startX.value = event.nativeEvent.x;
    startY.value = event.nativeEvent.y;
    currentX.value = event.nativeEvent.x;
    currentY.value = event.nativeEvent.y;

    runOnJS(dispatch)(
      startDrawing({
        x: event.nativeEvent.x,
        y: event.nativeEvent.y,
        color: getRandomColor(),
      }),
    );
  };

  const onPanUpdate = (event: any) => {
    currentX.value = event.nativeEvent.x;
    currentY.value = event.nativeEvent.y;

    const width = Math.abs(event.nativeEvent.x - startX.value);
    const height = Math.abs(event.nativeEvent.y - startY.value);

    if (width >= 40 && height >= 20) {
      runOnJS(dispatch)(
        updateDrawing({
          x: Math.min(startX.value, event.nativeEvent.x),
          y: Math.min(startY.value, event.nativeEvent.y),
          width,
          height,
        }),
      );
    }
  };

  const onPanEnd = () => {
    runOnJS(dispatch)(finishDrawing());
  };

  const onTap = (event: any) => {
    runOnJS(dispatch)(
      setSplitLine({
        x: event.nativeEvent.x,
        y: event.nativeEvent.y,
        type: 'vertical',
      }),
    );

    // Split after showing the line briefly
    setTimeout(() => {
      if (splitLine) {
        runOnJS(dispatch)(splitTablets(splitLine));
      }
    }, 100);
  };

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
    <TapGestureHandler
      onHandlerStateChange={event => {
        if (event.nativeEvent.state === State.ACTIVE) {
          onTap(event);
        }
      }}
    >
      <View style={styles.container}>
        <PanGestureHandler
          onHandlerStateChange={event => {
            const state = event.nativeEvent.state;
            if (state === State.BEGAN) {
              onPanStart(event);
            } else if (state === State.ACTIVE) {
              onPanUpdate(event);
            } else if (state === State.END || state === State.CANCELLED) {
              onPanEnd();
            }
          }}
        >
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
        </PanGestureHandler>
      </View>
    </TapGestureHandler>
  );
};

export default TabletSplitter;
