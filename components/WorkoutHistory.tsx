
import React from 'react';
import type { WorkoutLog } from '../types';
import { Card } from './common/Card';
import { DumbbellIcon } from './icons/DumbbellIcon';
import { ClockIcon } from './icons/ClockIcon';

interface WorkoutHistoryProps {
  logs: WorkoutLog[];
}

const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
}

const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ logs }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Workout History</h2>
      
      {logs.length === 0 ? (
        <Card>
            <Card.Body className="text-center">
                <p className="text-text-secondary">No workouts logged yet. Go crush a session!</p>
            </Card.Body>
        </Card>
      ) : (
        <div className="space-y-4">
            {logs.map(log => (
                <Card key={log.id}>
                    <Card.Header>
                        <div className="flex justify-between items-center">
                            <div>
                                <Card.Title>{log.dayName}</Card.Title>
                                <Card.Description>{log.planName}</Card.Description>
                            </div>
                            <div className="text-right">
                                <p className="font-semibold">{new Date(log.date).toLocaleDateString()}</p>
                                <p className="text-sm text-text-secondary flex items-center justify-end">
                                    <ClockIcon className="w-4 h-4 mr-1"/>
                                    {formatDuration(log.duration)}
                                </p>
                            </div>
                        </div>
                    </Card.Header>
                    <Card.Body>
                        <h4 className="font-semibold mb-2">Exercises</h4>
                        <ul className="space-y-2">
                            {log.exercises.map(exLog => (
                                <li key={exLog.exerciseInstanceId} className="text-sm text-text-secondary flex items-center">
                                    <DumbbellIcon className="w-4 h-4 mr-2 text-accent flex-shrink-0"/>
                                    <span>{exLog.exerciseName} - {exLog.sets.filter(s => s.completed).length} sets completed</span>
                                </li>
                            ))}
                        </ul>
                    </Card.Body>
                </Card>
            ))}
        </div>
      )}
    </div>
  );
};

export default WorkoutHistory;
