// src/components/TabletPart.tsx
import React from 'react';
import { View } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';
import { useDispatch } from 'react-redux';
import { moveTabletPart } from '../../redux/slices/tabletSlice';
import { TabletPart as TabletPartType } from '../../types/tablet';
import styles from './Style';

interface TabletPartProps {
  part: TabletPartType;
  tabletId: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

const TabletPartComponent: React.FC<TabletPartProps> = ({ part, tabletId }) => {
  const dispatch = useDispatch();

  const translateX = useSharedValue(part.x);
  const translateY = useSharedValue(part.y);

  const onPanStart = (event: any, ctx: any) => {
    ctx.startX = translateX.value;
    ctx.startY = translateY.value;
  };

  const onPanUpdate = (event: any, ctx: any) => {
    translateX.value = ctx.startX + event.nativeEvent.translationX;
    translateY.value = ctx.startY + event.nativeEvent.translationY;
  };

  const onPanEnd = (event: any, ctx: any) => {
    runOnJS(dispatch)(
      moveTabletPart({
        tabletId,
        partId: part.id,
        x: translateX.value,
        y: translateY.value,
      }),
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
    };
  });

  return (
    <PanGestureHandler
      onHandlerStateChange={event => {
        const state = event.nativeEvent.state;
        const ctx = { startX: translateX.value, startY: translateY.value };

        if (state === State.BEGAN) {
          onPanStart(event, ctx);
        } else if (state === State.ACTIVE) {
          onPanUpdate(event, ctx);
        } else if (state === State.END || state === State.CANCELLED) {
          onPanEnd(event, ctx);
        }
      }}
    >
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
    </PanGestureHandler>
  );
};

export default TabletPartComponent;
