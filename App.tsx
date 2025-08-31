
import React, { useState, useCallback } from 'react';
import type { WorkoutPlan, WorkoutDay, WorkoutLog, ActivePlanConfig } from './types';
import Dashboard from './components/Dashboard';
import WorkoutPlanner from './components/WorkoutPlanner';
import WorkoutSession from './components/WorkoutSession';
import WorkoutHistory from './components/WorkoutHistory';
import PlanList from './components/PlanList';
import useLocalStorage from './hooks/useLocalStorage';
import { samplePlan } from './data/sampleData';
import { DumbbellIcon } from './components/icons/DumbbellIcon';

export type View = 'DASHBOARD' | 'PLAN_LIST' | 'PLANNER' | 'SESSION' | 'HISTORY';

const App: React.FC = () => {
  const [view, setView] = useState<View>('DASHBOARD');
  const [plans, setPlans] = useLocalStorage<WorkoutPlan[]>('workout-plans', [samplePlan]);
  const [activePlanConfig, setActivePlanConfig] = useLocalStorage<ActivePlanConfig | null>('active-plan-config', null);
  const [logs, setLogs] = useLocalStorage<WorkoutLog[]>('workout-logs', []);
  
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [activeWorkoutDay, setActiveWorkoutDay] = useState<WorkoutDay | null>(null);

  const activePlan = plans.find(p => p.id === activePlanConfig?.planId) || null;

  const navigate = (newView: View) => setView(newView);

  const startWorkout = useCallback((day: WorkoutDay) => {
    setActiveWorkoutDay(day);
    setView('SESSION');
  }, []);

  const saveWorkoutPlan = (updatedPlan: WorkoutPlan) => {
    const planIndex = plans.findIndex(p => p.id === updatedPlan.id);
    if (planIndex > -1) {
      const newPlans = [...plans];
      newPlans[planIndex] = updatedPlan;
      setPlans(newPlans);
    } else {
      setPlans([...plans, updatedPlan]);
    }
    setEditingPlan(null);
    setView('PLAN_LIST');
  };
  
  const finishWorkout = useCallback((log: WorkoutLog) => {
    setLogs(prevLogs => [log, ...prevLogs]);
    setActiveWorkoutDay(null);
    setView('DASHBOARD');
  }, [setLogs]);

  const cancelWorkout = useCallback(() => {
    setActiveWorkoutDay(null);
    setView('DASHBOARD');
  }, []);
  
  const handleEditPlan = (plan: WorkoutPlan) => {
    setEditingPlan(plan);
    setView('PLANNER');
  };

  const handleCreatePlan = () => {
    const newPlan: WorkoutPlan = {
      id: `plan-${crypto.randomUUID()}`,
      name: "New Workout Plan",
      weeks: [{
        id: `week-${crypto.randomUUID()}`,
        name: "Week 1",
        days: Array(7).fill(null).map((_, i) => ({
            id: `day-${crypto.randomUUID()}`,
            name: `Workout Day ${i + 1}`,
            exerciseGroups: []
        })).slice(0, 3) // Start with 3 workout days, rest are null
      }]
    };
    setEditingPlan(newPlan);
    setView('PLANNER');
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Are you sure you want to delete this plan? This action cannot be undone.')) {
        setPlans(plans.filter(p => p.id !== planId));
        if (activePlanConfig?.planId === planId) {
            setActivePlanConfig(null);
        }
    }
  };

  const handleActivatePlan = (config: ActivePlanConfig) => {
    setActivePlanConfig(config);
    setView('DASHBOARD');
  };

  const renderView = () => {
    switch (view) {
      case 'PLAN_LIST':
        return <PlanList 
          plans={plans} 
          activePlanConfig={activePlanConfig}
          onEdit={handleEditPlan}
          onDelete={handleDeletePlan}
          onCreate={handleCreatePlan}
          onActivate={handleActivatePlan}
        />
      case 'PLANNER':
        if (editingPlan) {
          return <WorkoutPlanner plan={editingPlan} onSave={saveWorkoutPlan} onCancel={() => setView('PLAN_LIST')} />;
        }
        return <PlanList plans={plans} activePlanConfig={activePlanConfig} onEdit={handleEditPlan} onDelete={handleDeletePlan} onCreate={handleCreatePlan} onActivate={handleActivatePlan} />;
      case 'SESSION':
        if (activeWorkoutDay && activePlan) {
          return <WorkoutSession day={activeWorkoutDay} planName={activePlan.name} onFinish={finishWorkout} onCancel={cancelWorkout} />;
        }
        return <Dashboard plan={activePlan} config={activePlanConfig} onStartWorkout={startWorkout} onNavigate={navigate} />;
      case 'HISTORY':
        return <WorkoutHistory logs={logs} />;
      case 'DASHBOARD':
      default:
        return <Dashboard plan={activePlan} config={activePlanConfig} onStartWorkout={startWorkout} onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-primary font-sans">
      <header className="bg-surface shadow-md sticky top-0 z-10">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setView('DASHBOARD')}>
              <DumbbellIcon className="h-8 w-8 text-secondary" />
              <h1 className="ml-2 text-2xl font-bold text-text-primary tracking-tight">ZenithFit</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={() => setView('DASHBOARD')} className={`px-3 py-2 rounded-md text-sm font-medium ${view === 'DASHBOARD' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-700'}`}>Dashboard</button>
              <button onClick={() => setView('PLAN_LIST')} className={`px-3 py-2 rounded-md text-sm font-medium ${view === 'PLAN_LIST' || view === 'PLANNER' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-700'}`}>Planner</button>
              <button onClick={() => setView('HISTORY')} className={`px-3 py-2 rounded-md text-sm font-medium ${view === 'HISTORY' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-gray-700'}`}>History</button>
            </div>
          </div>
        </nav>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>
      <footer className="text-center py-4 text-text-secondary text-sm border-t border-border mt-8">
        <p>&copy; {new Date().getFullYear()} ZenithFit. Stay Strong.</p>
      </footer>
    </div>
  );
};

export default App;
