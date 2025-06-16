import React from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface SkeletonPlaceholderProps {
  children: React.ReactNode;
  backgroundColor?: string;
  highlightColor?: string;
  speed?: number;
}

const SkeletonPlaceholder: React.FC<SkeletonPlaceholderProps> = ({
  children,
  backgroundColor = '#E1E9EE',
  highlightColor = '#F2F8FC',
  speed = 1000,
}) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const startAnimation = () => {
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: speed,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: speed,
          useNativeDriver: true,
        }),
      ]).start(() => startAnimation());
    };

    startAnimation();
  }, [animatedValue, speed]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Animated.View style={[styles.highlight, { opacity, backgroundColor: highlightColor }]}>
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default SkeletonPlaceholder; 