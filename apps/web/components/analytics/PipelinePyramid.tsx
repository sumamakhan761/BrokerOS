"use client";

import React from "react";
import { motion } from "framer-motion";

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
  const heightPerSlice = 52;
  const gap = 6;

  const width = 560;
  const height = data.length * (heightPerSlice + gap) + 20;
  const centerX = width / 2;

  return (
    <div className="w-full flex justify-center py-6 relative animate-enter">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[560px] h-auto overflow-visible"
      >
        <defs>
          <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="4"
              floodOpacity="0.1"
              floodColor="#000000"
            />
          </filter>
        </defs>

        {data.map((item, index) => {
          const topWidthRatio = maxCount > 0 ? item.count / maxCount : 0;
          const calculatedTopWidth = topWidthRatio * width;
          const topWidth = Math.max(calculatedTopWidth, 120);

          let bottomWidthRatio = topWidthRatio;
          if (index < data.length - 1) {
            bottomWidthRatio =
              maxCount > 0 ? data[index + 1].count / maxCount : 0;
          } else {
            bottomWidthRatio = topWidthRatio * 0.7;
          }
          const calculatedBottomWidth = bottomWidthRatio * width;
          const bottomWidth = Math.max(calculatedBottomWidth, 80);

          const yTop = index * (heightPerSlice + gap);
          const yBottom = yTop + heightPerSlice;

          const xTopLeft = centerX - topWidth / 2;
          const xTopRight = centerX + topWidth / 2;
          const xBottomLeft = centerX - bottomWidth / 2;
          const xBottomRight = centerX + bottomWidth / 2;

          const points = `${xTopLeft},${yTop} ${xTopRight},${yTop} ${xBottomRight},${yBottom} ${xBottomLeft},${yBottom}`;

          return (
            <motion.g
              key={item.stage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1, ease: "easeOut" }}
            >
              {/* The slice shape */}
              <polygon
                points={points}
                fill={item.color}
                opacity={0.95}
                className="hover:opacity-100 transition-opacity cursor-pointer stroke-white stroke-[1.5px]"
                filter="url(#soft-shadow)"
              />

              {/* Metric count */}
              <text
                x={centerX}
                y={yTop + heightPerSlice / 2 - 3}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                className="font-extrabold text-base tracking-tight pointer-events-none drop-shadow-sm tabular-nums"
              >
                {item.count}
              </text>

              {/* Stage label */}
              <text
                x={centerX}
                y={yTop + heightPerSlice / 2 + 13}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                className="font-extrabold text-[9px] uppercase tracking-widest pointer-events-none drop-shadow-sm opacity-95"
              >
                {item.stage}
              </text>
            </motion.g>
          );
        })}
      </svg>
    </div>
  );
}
