
import React from 'react';

interface TimerDisplayProps extends React.HTMLAttributes<HTMLSpanElement> {
  seconds: number;
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const TimerDisplay: React.FC<TimerDisplayProps> = ({ seconds, className, ...props }) => {
  return (
    <span className={className} {...props}>
      {formatTime(seconds)}
    </span>
  );
};

export default TimerDisplay;
