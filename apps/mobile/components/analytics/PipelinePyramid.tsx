import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export interface PipelineStageData {
  stage: string;
  count: number;
  color: string;
}

interface PipelinePyramidProps {
  data: PipelineStageData[];
}

export function PipelinePyramid({ data }: PipelinePyramidProps) {
  const maxCount = data.length > 0 ? data[0].count : 1;

  return (
    <View className="w-full items-center py-4">
      {data.map((item, index) => {
        const widthPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
        // Ensure a minimum width so text is always legible even for small counts
        const finalWidth = Math.max(widthPercent, 40); 
        
        return (
          <Animated.View
            key={item.stage}
            entering={FadeInDown.delay(index * 150).springify()}
            className="items-center justify-center mb-1 rounded-md overflow-hidden"
            style={{
              width: `${finalWidth}%`,
              height: 48,
              backgroundColor: item.color,
            }}
          >
            <View className="flex-row items-center px-4 justify-between w-full h-full">
              <Text className="text-white font-semibold text-xs tracking-wider uppercase flex-1" numberOfLines={1}>
                {item.stage}
              </Text>
              <Text className="text-white font-bold text-base ml-2">
                {item.count}
              </Text>
            </View>
          </Animated.View>
        );
      })}
    </View>
  );
}
