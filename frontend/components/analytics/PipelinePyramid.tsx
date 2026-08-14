'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface PipelineStageData {
  stage: string;
  count: number;
  color: string;
}

interface PipelinePyramidProps {
  data: PipelineStageData[];
}

export function PipelinePyramid({ data }: PipelinePyramidProps) {
  // We want an inverted pyramid (funnel) where top is wide and bottom is narrow.
  // The max width is the count of the first stage.
  const maxCount = data.length > 0 ? data[0].count : 1;
  const heightPerSlice = 60;
  const gap = 6;

  // Total SVG width and height
  const width = 600;
  const height = data.length * (heightPerSlice + gap) + 40; // Extra padding
  const centerX = width / 2;

  return (
    <div className="w-full flex justify-center py-10 relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full max-w-[600px] h-auto overflow-visible"
      >
        <defs>
          <filter id="soft-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.15" floodColor="#000000" />
          </filter>
        </defs>

        {data.map((item, index) => {
          // Top width is based on current count, min width 60px to hold text safely
          const topWidthRatio = maxCount > 0 ? item.count / maxCount : 0;
          const calculatedTopWidth = topWidthRatio * width;
          const topWidth = Math.max(calculatedTopWidth, 100); // Enforce minimum width for readability

          // Bottom width is based on next count
          let bottomWidthRatio = topWidthRatio;
          if (index < data.length - 1) {
            bottomWidthRatio = maxCount > 0 ? data[index + 1].count / maxCount : 0;
          } else {
            bottomWidthRatio = topWidthRatio * 0.6; // final taper
          }
          const calculatedBottomWidth = bottomWidthRatio * width;
          const bottomWidth = Math.max(calculatedBottomWidth, 60);

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
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
            >
              {/* The slice shape */}
              <polygon
                points={points}
                fill={item.color}
                opacity={0.95}
                className="hover:opacity-100 transition-opacity cursor-pointer stroke-white stroke-[2px]"
                filter="url(#soft-shadow)"
              />

              {/* Text inside slice */}
              <text
                x={centerX}
                y={yTop + heightPerSlice / 2 - 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                className="font-extrabold text-xl tracking-wide pointer-events-none drop-shadow-md"
              >
                {item.count}
              </text>
              <text
                x={centerX}
                y={yTop + heightPerSlice / 2 + 16}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#ffffff"
                className="font-semibold text-[10px] uppercase tracking-[0.2em] pointer-events-none drop-shadow-md opacity-90"
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
