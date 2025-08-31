
import React, { useState, useEffect, useMemo } from 'react';
import type { WorkoutPlan, WorkoutDay, ActivePlanConfig } from '../types';
import { Modal } from './common/Modal';
import { Button } from './common/Button';

interface SetActiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: WorkoutPlan | null;
  onActivate: (config: ActivePlanConfig) => void;
}

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
    {children}
  </div>
);

const SetActiveModal: React.FC<SetActiveModalProps> = ({ isOpen, onClose, plan, onActivate }) => {
  const [startDate, setStartDate] = useState('');
  const [dayMapping, setDayMapping] = useState<Record<string, number | ''>>({}); // workoutDayId -> dayIndex (0-6) or ''
  
  const workoutDays = useMemo(() => plan?.weeks.flatMap(w => w.days).filter((d): d is WorkoutDay => d !== null) || [], [plan]);

  useEffect(() => {
    if (plan) {
      // Set default start date to today
      const today = new Date();
      const offset = today.getTimezoneOffset();
      const todayLocal = new Date(today.getTime() - (offset*60*1000));
      setStartDate(todayLocal.toISOString().split('T')[0]);
      
      // Reset mapping when plan changes
      const initialMapping: Record<string, number | ''> = {};
      workoutDays.forEach(day => {
        initialMapping[day.id] = '';
      });
      setDayMapping(initialMapping);
    }
  }, [plan, workoutDays]);

  const handleMappingChange = (workoutDayId: string, weekDayIndex: string) => {
    const newIndex = weekDayIndex === '' ? '' : parseInt(weekDayIndex, 10);
    setDayMapping(prev => ({
      ...prev,
      [workoutDayId]: newIndex,
    }));
  };

  const handleActivate = () => {
    if (!plan || !startDate) return;

    const finalMapping: Record<number, string | null> = {};
    for (let i = 0; i < 7; i++) finalMapping[i] = null;

    Object.entries(dayMapping).forEach(([workoutDayId, weekDayIndex]) => {
      if (weekDayIndex !== '') {
        finalMapping[weekDayIndex] = workoutDayId;
      }
    });

    onActivate({
      planId: plan.id,
      startDate: startDate,
      dayMapping: finalMapping,
    });
    onClose();
  };
  
  const usedDays = useMemo(() => 
    Object.values(dayMapping).filter(d => d !== '')
  , [dayMapping]);

  if (!plan) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Activate Plan: ${plan.name}`}>
      <div className="space-y-4">
        <p className="text-text-secondary">Schedule your workout week and choose a start date.</p>
        <FormField label="Plan Start Date">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 bg-gray-700 rounded-md border border-border focus:ring-secondary focus:border-secondary"
          />
        </FormField>
        
        <div className="space-y-2 pt-2">
            <h4 className="text-text-primary font-semibold">Assign Workout Days</h4>
            {workoutDays.map(day => (
                <div key={day.id} className="grid grid-cols-2 gap-4 items-center">
                    <span className="text-text-secondary truncate" title={day.name}>{day.name}</span>
                    <select
                        value={dayMapping[day.id] ?? ''}
                        onChange={(e) => handleMappingChange(day.id, e.target.value)}
                        className="w-full p-2 bg-gray-700 rounded-md border border-border focus:ring-secondary focus:border-secondary"
                    >
                        <option value="">Unassigned</option>
                        {dayNames.map((name, index) => (
                            <option 
                                key={index} 
                                value={index}
                                disabled={usedDays.includes(index) && dayMapping[day.id] !== index}
                            >
                                {name}
                            </option>
                        ))}
                    </select>
                </div>
            ))}
        </div>
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleActivate}>Activate Plan</Button>
        </div>
      </div>
    </Modal>
  );
};

export default SetActiveModal;
