
import React from 'react';
import type { View } from '../App';
import type { WorkoutPlan, WorkoutDay, ActivePlanConfig } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';

interface DashboardProps {
  plan: WorkoutPlan | null;
  config: ActivePlanConfig | null;
  onStartWorkout: (day: WorkoutDay) => void;
  onNavigate: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ plan, config, onStartWorkout, onNavigate }) => {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();

  if (!plan || !config) {
    return (
      <Card className="text-center">
        <Card.Body>
          <Card.Title>No Active Workout Plan</Card.Title>
          <Card.Description className="mt-2 mb-4">
            Go to the planner to create a new plan or set an existing one as active.
          </Card.Description>
          <Button onClick={() => onNavigate('PLAN_LIST')}>Go to Planner</Button>
        </Card.Body>
      </Card>
    );
  }

  const startDate = new Date(config.startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  const currentWeekIndex = Math.floor(diffDays / 7) % plan.weeks.length; // Loop back if plan is shorter than duration
  const currentPlanWeek = plan.weeks[currentWeekIndex];

  const workoutDaysById = new Map<string, WorkoutDay>();
  plan.weeks.forEach(week => {
    week.days.forEach(day => {
        if(day) workoutDaysById.set(day.id, day);
    });
  });

  const displayDays = Array(7).fill(null).map((_, index) => {
    const workoutDayId = config.dayMapping[index];
    return workoutDayId ? workoutDaysById.get(workoutDayId) : null;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Welcome Back!</h1>
        <p className="mt-2 text-lg text-text-secondary">Your active plan: <span className="font-semibold text-text-primary">{plan.name}</span></p>
      </div>

      <Card>
        <Card.Header>
          <Card.Title>This Week's Plan</Card.Title>
          <Card.Description>You are on Week {currentWeekIndex + 1} of your plan. Select any workout to begin.</Card.Description>
        </Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            {displayDays.map((day, index) => {
              const isToday = index === todayIndex;
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg flex flex-col justify-between transition-all ${
                    isToday ? 'border-2 border-secondary bg-surface shadow-lg' : 'bg-gray-800'
                  }`}
                >
                  <h4 className="font-bold text-center text-sm uppercase tracking-wider text-text-secondary mb-2">
                    {dayNames[index]}
                  </h4>
                  <div className="text-center flex-grow flex flex-col items-center justify-center">
                    {day ? (
                      <div className="flex flex-col justify-between items-center h-full">
                        <p className="font-semibold text-text-primary text-base leading-tight">
                          {day.name}
                        </p>
                        <Button 
                          onClick={() => onStartWorkout(day)} 
                          className="w-full mt-4" 
                          variant="secondary"
                        >
                          Start
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full min-h-[6rem]">
                        <p className="text-text-secondary italic">Rest Day</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:border-secondary transition-colors">
          <Card.Header>
            <Card.Title>Workout Plans</Card.Title>
          </Card.Header>
          <Card.Body>
            <p className="text-text-secondary mb-4">View, create, or change your active workout plan.</p>
            <Button variant="secondary" onClick={() => onNavigate('PLAN_LIST')}>Manage Plans</Button>
          </Card.Body>
        </Card>

        <Card className="hover:border-secondary transition-colors">
          <Card.Header>
            <Card.Title>Workout History</Card.Title>
          </Card.Header>
          <Card.Body>
            <p className="text-text-secondary mb-4">Review your past performance and track progress.</p>
            <Button variant="secondary" onClick={() => onNavigate('HISTORY')}>View History</Button>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
