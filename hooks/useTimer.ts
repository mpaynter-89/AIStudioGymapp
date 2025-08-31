import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { playChime, playBuzzer } from '../assets/sounds';

interface TimerState {
  time: number;
  isRunning: boolean;
  isFinished: boolean;
}

interface TimerActions {
  start: () => void;
  pause: () => void;
  reset: (newTime?: number) => void;
}

export interface TimerOptions {
  playChimeAt5?: boolean;
  playBuzzerAtEnd?: boolean;
}

export const useTimer = (initialTime: number, onFinish?: () => void, options?: TimerOptions): [TimerState, TimerActions] => {
  const [time, setTime] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const intervalRef = useRef<number | null>(null);
  const onFinishRef = useRef(onFinish);
  
  const currentTimeRef = useRef(initialTime);

  useEffect(() => {
    onFinishRef.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = window.setInterval(() => {
        setTime(prevTime => {
          if (prevTime === 6 && options?.playChimeAt5) {
            playChime();
          }

          if (prevTime <= 1) {
            clearInterval(intervalRef.current!);
            if (options?.playBuzzerAtEnd) {
              playBuzzer();
            }
            setIsRunning(false);
            setIsFinished(true);
            if (onFinishRef.current) {
              onFinishRef.current();
            }
            currentTimeRef.current = 0;
            return 0;
          }
          const newTime = prevTime - 1;
          currentTimeRef.current = newTime;
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, options]);

  const start = useCallback(() => {
    if (currentTimeRef.current > 0) {
      setIsRunning(true);
      setIsFinished(false);
    }
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newTime?: number) => {
    const newTimeValue = newTime !== undefined ? newTime : initialTime;
    setIsRunning(false);
    setIsFinished(false);
    setTime(newTimeValue);
    currentTimeRef.current = newTimeValue;
  }, [initialTime]);
  
  const actions = useMemo(() => ({ start, pause, reset }), [start, pause, reset]);
  
  return [{ time, isRunning, isFinished }, actions];
};
