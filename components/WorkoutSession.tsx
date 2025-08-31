import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { WorkoutDay, SetLog, ExerciseLog, WorkoutLog, ExerciseGroup, ExerciseInstance } from '../types';
import { ExerciseType } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { useTimer } from '../hooks/useTimer';
import TimerDisplay from './common/TimerDisplay';
import { StopIcon } from './icons/StopIcon';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { CheckIcon } from './icons/CheckIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { initAudio } from '../assets/sounds';

interface WorkoutSessionProps {
  day: WorkoutDay;
  planName: string;
  onFinish: (log: WorkoutLog) => void;
  onCancel: () => void;
}

const WorkoutSession: React.FC<WorkoutSessionProps> = ({ day, planName, onFinish, onCancel }) => {
  const [sessionState, setSessionState] = useState<'overview' | 'active'>('overview');
  const [startTime, setStartTime] = useState<number | null>(null);

  const flatExercises = useMemo(() => {
    return day.exerciseGroups.flatMap((group, groupIndex) =>
        group.exercises.map((exercise, exerciseIndexInGroup) => ({
            ...exercise,
            groupRef: group,
            groupIndex,
            exerciseIndexInGroup,
            flatIndex: -1 // will be populated next
        }))
    ).map((ex, index) => ({ ...ex, flatIndex: index }));
  }, [day]);

  const [exerciseLogs, setExerciseLogs] = useState<ExerciseLog[]>(() => flatExercises.map(ex => ({
    exerciseInstanceId: ex.id,
    exerciseName: ex.name,
    sets: []
  })));

  const [currentFlatIndex, setCurrentFlatIndex] = useState(0);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  
  const [isResting, setIsResting] = useState(false);
  const [restInfo, setRestInfo] = useState({ duration: 0, nextUp: '' });
  
  const currentExercise = flatExercises[currentFlatIndex];
  const currentGroup = currentExercise?.groupRef;

  const finishWorkout = useCallback(() => {
    if (!startTime) return;
    const log: WorkoutLog = {
      id: `log-${crypto.randomUUID()}`,
      planName,
      dayName: day.name,
      date: new Date().toISOString(),
      duration: Math.round((Date.now() - startTime) / 1000),
      exercises: exerciseLogs.filter(log => log.sets.length > 0),
    };
    onFinish(log);
  }, [startTime, planName, day.name, exerciseLogs, onFinish]);

  const handlePreviousExercise = () => {
    if (currentFlatIndex > 0) {
        setCurrentFlatIndex(prev => prev - 1);
        setCurrentSetIndex(0);
        setIsResting(false);
    }
  };
  
  const onRestFinish = useCallback(() => {
    setIsResting(false);
  }, []);

  const advanceState = useCallback(() => {
    if (!currentGroup || !currentExercise) {
        finishWorkout();
        return;
    }

    let nextFlatIndex = currentFlatIndex;
    let nextSetIndex = currentSetIndex;
    let restDuration = 0;
    let nextUp = "Workout Complete!";
    let workoutFinished = false;

    const isLastExerciseInGroup = currentExercise.exerciseIndexInGroup === currentGroup.exercises.length - 1;

    if (currentGroup.type === 'circuit') {
      const isLastRound = currentSetIndex === (currentGroup.sets || 1) - 1;
      if (!isLastExerciseInGroup) { // More exercises in this round
        nextFlatIndex++;
        restDuration = currentExercise.rest;
        nextUp = `Next: ${flatExercises[nextFlatIndex].name}`;
      } else if (!isLastRound) { // End of round, more rounds to go
        nextFlatIndex = flatExercises.findIndex(ex => ex.groupIndex === currentExercise.groupIndex);
        nextSetIndex++;
        restDuration = currentGroup.rest || 60;
        nextUp = `Next Round: ${flatExercises[nextFlatIndex].name}`;
      } else { // End of circuit
        if (currentFlatIndex >= flatExercises.length - 1) {
            workoutFinished = true;
        } else {
            nextFlatIndex++;
            nextSetIndex = 0;
            restDuration = currentGroup.rest || 60; 
            nextUp = `Next: ${flatExercises[nextFlatIndex].name}`;
        }
      }
    } else { // 'single' or 'superset'
      const isLastSet = currentSetIndex === currentExercise.sets - 1;
      if (!isLastSet) {
        nextSetIndex++;
        restDuration = currentExercise.rest;
        nextUp = `Next set: ${currentExercise.name}`;
      } else { // Last set of exercise
        if (currentFlatIndex >= flatExercises.length - 1) {
            workoutFinished = true;
        } else {
            nextFlatIndex++;
            nextSetIndex = 0;
            restDuration = currentExercise.rest;
            nextUp = `Next: ${flatExercises[nextFlatIndex].name}`;
        }
      }
    }

    if (workoutFinished) {
      finishWorkout();
      return;
    }
    
    if (restDuration > 0) {
        setIsResting(true);
        setRestInfo({ duration: restDuration, nextUp });
    }
    
    setCurrentFlatIndex(nextFlatIndex);
    setCurrentSetIndex(nextSetIndex);
  }, [currentFlatIndex, currentSetIndex, day, flatExercises, currentGroup, currentExercise, finishWorkout]);

  const handleNextExercise = () => {
    if (isResting) {
      // If resting, the index is already at the next exercise.
      // This action should just skip the rest period.
      onRestFinish();
    } else {
      // If not resting, we are skipping the current active exercise.
      // advanceState correctly calculates the next step (exercise, set, or round).
      advanceState();
    }
  };

  const [restTimerState, restTimerActions] = useTimer(restInfo.duration, onRestFinish, { playBuzzerAtEnd: true });

  useEffect(() => {
    if(isResting) {
        restTimerActions.reset(restInfo.duration);
        restTimerActions.start();
    } else {
        restTimerActions.pause();
        restTimerActions.reset(0);
    }
  }, [isResting, restInfo.duration, restTimerActions]);

  const logSet = (log: Omit<SetLog, 'setIndex'>) => {
    setExerciseLogs(prev => {
        const newLogs = [...prev];
        const exLogIndex = newLogs.findIndex(l => l.exerciseInstanceId === currentExercise.id);
        if (exLogIndex > -1) {
            newLogs[exLogIndex].sets.push({ ...log, setIndex: currentSetIndex });
        }
        return newLogs;
    });
    advanceState();
  };

  const handleStartWorkout = async () => {
    try {
      // Await the audio initialization. This is the crucial fix.
      // It ensures the browser has given permission and the audio context
      // is ready *before* we proceed and change the app's state.
      await initAudio();
    } catch (error) {
      // Log the error but don't block the workout from starting.
      // The user gets a console message, and the app continues without sound.
      console.error("Audio initialization failed. The workout will start without sound.", error);
    }

    // This state logic now runs only after the async audio setup is complete.
    setStartTime(Date.now());
    setSessionState('active');
  };

  if (!currentGroup || !currentExercise) {
    return (
        <Card>
            <Card.Body className="text-center">
                <Card.Title>Workout Complete!</Card.Title>
                <Card.Description>Great job finishing your workout.</Card.Description>
                <Button onClick={() => onCancel()} className="mt-4">Back to Dashboard</Button>
            </Card.Body>
        </Card>
    );
  }

  const ActiveExercise = () => {
    const [weight, setWeight] = useState(currentExercise.targetWeight?.toString() || '');
    const [reps, setReps] = useState(currentExercise.reps?.toString() || '');
    const { duration } = currentExercise;
    const [exerciseTimerState, exerciseTimerActions] = useTimer(duration || 0, () => {
        logSet({ completed: true, duration });
    }, { playChimeAt5: true, playBuzzerAtEnd: true });

    useEffect(() => {
      setWeight(currentExercise.targetWeight?.toString() || '');
      setReps(currentExercise.reps?.toString() || '');
      exerciseTimerActions.reset(currentExercise.duration || 0);
    }, [currentExercise, exerciseTimerActions]);

    const handleCompleteSet = () => {
        logSet({
            completed: true,
            weight: Number(weight),
            reps: Number(reps)
        });
    }

    return (
        <div className="space-y-4">
            <h3 className="text-xl sm:text-2xl font-bold text-secondary">{currentExercise.name}</h3>
            <p className="text-text-secondary">
                {currentGroup.type === 'circuit' ? `Round ${currentSetIndex + 1} of ${currentGroup.sets}` : `Set ${currentSetIndex + 1} of ${currentExercise.sets}`}
            </p>
            {currentExercise.type === ExerciseType.REPS_WEIGHT ? (
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Weight (kg)</label>
                        <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder={`${currentExercise.targetWeight || 0}`} className="w-full p-2 bg-gray-700 rounded-md border border-border"/>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Reps</label>
                        <input type="number" value={reps} onChange={e => setReps(e.target.value)} placeholder={`${currentExercise.reps || 0}`} className="w-full p-2 bg-gray-700 rounded-md border border-border"/>
                    </div>
                    <Button onClick={handleCompleteSet} className="col-span-2 text-lg py-3">
                        <CheckIcon className="w-6 h-6 mr-2" /> Complete Set
                    </Button>
                </div>
            ) : (
                <div className="text-center space-y-4">
                    <TimerDisplay seconds={exerciseTimerState.time} className="text-7xl font-mono" />
                    <div className="flex justify-center gap-4">
                        {!exerciseTimerState.isRunning && !exerciseTimerState.isFinished ? (
                             <Button onClick={exerciseTimerActions.start}><PlayIcon className="w-6 h-6 mr-2"/>Start</Button>
                        ) : exerciseTimerState.isRunning ? (
                             <Button onClick={exerciseTimerActions.pause} variant="secondary"><PauseIcon className="w-6 h-6 mr-2"/>Pause</Button>
                        ) : null}
                        <Button onClick={() => exerciseTimerActions.reset()} variant="outline"><StopIcon className="w-6 h-6 mr-2"/>Reset</Button>
                    </div>
                </div>
            )}
        </div>
    )
  }

  const RestScreen = () => (
    <div className="text-center space-y-4">
        <h3 className="text-2xl font-bold text-secondary">REST</h3>
        <TimerDisplay seconds={restTimerState.time} className="text-8xl font-mono" />
        <p className="text-lg text-text-secondary"><span className="font-semibold text-text-primary">{restInfo.nextUp}</span></p>
        <Button onClick={() => onRestFinish()} variant="secondary">Skip Rest</Button>
    </div>
  )

  if (sessionState === 'overview') {
    return (
      <Card>
        <Card.Header>
          <Card.Title>{day.name}</Card.Title>
          <Card.Description>{planName}</Card.Description>
        </Card.Header>
        <Card.Body>
          <div className="space-y-4">
            {day.exerciseGroups.map(group => (
              <div key={group.id} className="p-3 rounded-lg border border-gray-700 bg-surface/50">
                <div className="flex justify-between items-center mb-2">
                    <strong className="text-sm text-secondary uppercase tracking-wider">{group.type}</strong>
                    {group.type === 'circuit' && group.sets && <span className="text-xs text-text-secondary">({group.sets} rounds)</span>}
                </div>
                <ul className="space-y-2">
                  {group.exercises.map(ex => {
                    let details = '';
                    if (ex.type === ExerciseType.REPS_WEIGHT) {
                        if (group.type === 'circuit') {
                            details = `${ex.reps || '?'} reps${ex.targetWeight ? ` @ ${ex.targetWeight}kg` : ''} / ${ex.rest}s rest`;
                        } else {
                            details = `${ex.sets}x${ex.reps || '?'} ${ex.targetWeight ? `@ ${ex.targetWeight}kg` : ''}`;
                        }
                    } else if (ex.type === ExerciseType.TIMED) {
                        if (group.type === 'circuit') {
                            details = `${ex.duration}s work / ${ex.rest}s rest`;
                        } else {
                            details = `${ex.sets}x${ex.duration}s`;
                        }
                    } else if (ex.type === ExerciseType.CARDIO) {
                        const parts = [];
                        if (ex.duration) parts.push(`${ex.duration} min`);
                        if (ex.distance) parts.push(`${ex.distance} km`);
                        details = parts.join(' / ');
                    }

                    return (
                        <li key={ex.id} className="text-sm p-2 rounded-md bg-gray-900/50">
                          <p className="font-semibold text-text-primary">{ex.name}</p>
                          {details && <p className="text-text-secondary">{details}</p>}
                        </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </Card.Body>
        <Card.Footer className="flex justify-between items-center">
            <Button variant="outline" onClick={onCancel}>Cancel</Button>
            <Button onClick={handleStartWorkout}>Start Workout</Button>
        </Card.Footer>
      </Card>
    );
  }
  
  const isLastExerciseInWorkout = currentFlatIndex === flatExercises.length - 1;
  
  const isLastSetOfCurrentExercise = useMemo(() => {
    if (!currentGroup || !currentExercise) return false;
    
    if (currentGroup.type === 'circuit') {
      return currentSetIndex === (currentGroup.sets || 1) - 1;
    } else {
      return currentSetIndex === currentExercise.sets - 1;
    }
  }, [currentGroup, currentExercise, currentSetIndex]);

  const isFinalAction = isLastExerciseInWorkout && isLastSetOfCurrentExercise;

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
             <h2 className="text-2xl sm:text-3xl font-bold">{isResting ? "Resting" : "Workout"}</h2>
             <Button variant="danger" onClick={onCancel}>End Workout</Button>
        </div>
        <Card className="flex flex-col">
            <Card.Body className="w-full flex-grow min-h-[20rem] flex items-center justify-center">
                {isResting ? <RestScreen /> : <ActiveExercise />}
            </Card.Body>
            <Card.Footer className="flex justify-between items-center">
                <Button variant="outline" onClick={handlePreviousExercise} disabled={currentFlatIndex === 0}>
                    <ChevronLeftIcon className="w-5 h-5 mr-1" />
                    Previous
                </Button>
                {isFinalAction ? (
                     <Button variant="primary" onClick={finishWorkout}>
                         Finish Workout
                     </Button>
                ) : (
                     <Button variant="secondary" onClick={handleNextExercise}>
                         Next Exercise
                         <ChevronRightIcon className="w-5 h-5 ml-1" />
                     </Button>
                )}
            </Card.Footer>
        </Card>
    </div>
  );
};

export default WorkoutSession;