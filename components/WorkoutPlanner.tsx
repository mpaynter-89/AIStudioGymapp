import React, { useState, useEffect } from 'react';
import type { WorkoutPlan, ExerciseGroup, ExerciseInstance } from '../types';
import { ExerciseType } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { PencilIcon } from './icons/PencilIcon';
import { Modal } from './common/Modal';

// Helper component for form fields
const FormField = ({ label, children }: { label: string, children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-medium text-text-secondary mb-1">{label}</label>
    {children}
  </div>
);

// The Modal for editing circuit/superset group properties
const GroupEditModal = ({
  isOpen,
  onClose,
  onSave,
  group,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (group: ExerciseGroup) => void;
  group: ExerciseGroup | null;
}) => {
  const [formData, setFormData] = useState<ExerciseGroup | null>(null);

  useEffect(() => {
    setFormData(group ? JSON.parse(JSON.stringify(group)) : null);
  }, [group]);

  const handleChange = (field: 'sets' | 'rest', value: string) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: Number(value) });
  };

  const handleSave = () => { if (formData) onSave(formData); };
  
  if (!isOpen || !formData) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit ${formData.type} Group`}>
      <div className="space-y-4">
        <p className="text-text-secondary">Define the total rounds and the rest period between each round for this circuit.</p>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Rounds (Sets)">
            <input type="number" value={formData.sets || 3} min="1" onChange={(e) => handleChange('sets', e.target.value)} className="w-full p-2 bg-gray-700 rounded-md border border-border"/>
          </FormField>
          <FormField label="Rest Between Rounds (s)">
            <input type="number" value={formData.rest || 60} min="0" step="5" onChange={(e) => handleChange('rest', e.target.value)} className="w-full p-2 bg-gray-700 rounded-md border border-border"/>
          </FormField>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Group</Button>
        </div>
      </div>
    </Modal>
  );
};


// The Modal for adding/editing exercises
const ExerciseEditModal = ({
  isOpen,
  onClose,
  onSave,
  exercise,
  groupType
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exercise: ExerciseInstance) => void;
  exercise: ExerciseInstance | null;
  groupType?: 'single' | 'superset' | 'circuit';
}) => {
  const [formData, setFormData] = useState<ExerciseInstance | null>(null);

  useEffect(() => {
    setFormData(exercise ? JSON.parse(JSON.stringify(exercise)) : null);
  }, [exercise]);

  const handleChange = (field: keyof ExerciseInstance, value: string | number) => {
    if (!formData) return;
    const numericFields = ['sets', 'reps', 'targetWeight', 'duration', 'rest'];
    const processedValue = numericFields.includes(field as string) ? Number(value) : value;
    setFormData({ ...formData, [field]: processedValue });
  };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (!formData) return;
    const newType = e.target.value as ExerciseType;
    const newFormData = { ...formData, type: newType };
    if (newType === ExerciseType.TIMED) {
      delete newFormData.reps;
      delete newFormData.targetWeight;
      if(!newFormData.duration) newFormData.duration = 60;
    } else if (newType === ExerciseType.REPS_WEIGHT) {
      delete newFormData.duration;
      if(!newFormData.reps) newFormData.reps = 10;
    }
    setFormData(newFormData);
  };
  
  const handleSave = () => { if (formData) onSave(formData); };

  if (!isOpen || !formData) return null;

  const isCircuit = groupType === 'circuit';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={exercise?.id.startsWith('new-') ? 'Add Exercise' : 'Edit Exercise'}>
      <div className="space-y-4">
        <FormField label="Exercise Name">
          <input type="text" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="w-full p-2 bg-gray-700 rounded-md border border-border focus:ring-secondary focus:border-secondary" />
        </FormField>
        <FormField label="Exercise Type">
          <select value={formData.type} onChange={handleTypeChange} className="w-full p-2 bg-gray-700 rounded-md border border-border focus:ring-secondary focus:border-secondary">
            <option value={ExerciseType.REPS_WEIGHT}>Reps & Weight</option>
            <option value={ExerciseType.TIMED}>Timed</option>
            <option value={ExerciseType.CARDIO}>Cardio</option>
          </select>
        </FormField>
        
        <div className="grid grid-cols-2 gap-4">
          {!isCircuit && (
            <FormField label="Sets">
                <input type="number" value={formData.sets} min="1" onChange={(e) => handleChange('sets', e.target.value)} className="w-full p-2 bg-gray-700 rounded-md border border-border"/>
            </FormField>
          )}
          <FormField label={`Rest ${isCircuit ? '(after exercise)' : '(seconds)'}`}>
              <input type="number" value={formData.rest} min="0" step="5" onChange={(e) => handleChange('rest', e.target.value)} className="w-full p-2 bg-gray-700 rounded-md border border-border"/>
          </FormField>
        </div>

        {formData.type === ExerciseType.REPS_WEIGHT && (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Reps">
              <input type="number" value={formData.reps || ''} min="1" onChange={(e) => handleChange('reps', e.target.value)} className="w-full p-2 bg-gray-700 rounded-md border border-border"/>
            </FormField>
            <FormField label="Weight (kg, optional)">
              <input type="number" value={formData.targetWeight || ''} min="0" step="0.5" onChange={(e) => handleChange('targetWeight', e.target.value)} className="w-full p-2 bg-gray-700 rounded-md border border-border"/>
            </FormField>
          </div>
        )}

        {formData.type === ExerciseType.TIMED && (
           <FormField label="Duration (seconds)">
             <input type="number" value={formData.duration || ''} min="1" onChange={(e) => handleChange('duration', e.target.value)} className="w-full p-2 bg-gray-700 rounded-md border border-border"/>
           </FormField>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Exercise</Button>
        </div>
      </div>
    </Modal>
  );
};


interface WorkoutPlannerProps {
  plan: WorkoutPlan;
  onSave: (plan: WorkoutPlan) => void;
  onCancel: () => void;
}

const WorkoutPlanner: React.FC<WorkoutPlannerProps> = ({ plan, onSave, onCancel }) => {
  const [editablePlan, setEditablePlan] = useState<WorkoutPlan>(() => JSON.parse(JSON.stringify(plan)));
  
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [editingExerciseContext, setEditingExerciseContext] = useState<{ weekIndex: number; dayIndex: number; groupIndex?: number; exerciseIndex?: number; isNew: boolean; groupType?: 'single' | 'superset' | 'circuit'; } | null>(null);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroupContext, setEditingGroupContext] = useState<{ weekIndex: number; dayIndex: number; groupIndex: number; } | null>(null);

  const handlePlanChange = (updater: (draft: WorkoutPlan) => void) => {
    setEditablePlan(currentPlan => {
      const newPlan = JSON.parse(JSON.stringify(currentPlan));
      updater(newPlan);
      return newPlan;
    });
  };
  
  // --- Group Handlers ---
  const handleAddGroup = (weekIndex: number, dayIndex: number, groupType: 'single' | 'superset' | 'circuit') => {
    // For circuits, we need to create the group first, then add exercises.
    if (groupType === 'circuit') {
      handlePlanChange(draft => {
        const day = draft.weeks[weekIndex].days[dayIndex];
        if (day) {
          const newGroup: ExerciseGroup = {
            id: `group-${crypto.randomUUID()}`, type: groupType, exercises: [], sets: 3, rest: 60
          };
          day.exerciseGroups.push(newGroup);
        }
      });
    } else {
      // For single/superset, we can open the exercise modal right away
      setEditingExerciseContext({ weekIndex, dayIndex, isNew: true, groupType });
      setIsExerciseModalOpen(true);
    }
  };
  
  const handleOpenGroupModal = (context: typeof editingGroupContext) => {
    setEditingGroupContext(context);
    setIsGroupModalOpen(true);
  };
  
  const handleSaveGroup = (updatedGroup: ExerciseGroup) => {
    if (!editingGroupContext) return;
    const { weekIndex, dayIndex, groupIndex } = editingGroupContext;
    handlePlanChange(draft => {
      const day = draft.weeks[weekIndex].days[dayIndex];
      if (day) day.exerciseGroups[groupIndex] = updatedGroup;
    });
    setIsGroupModalOpen(false);
    setEditingGroupContext(null);
  };
  
  const handleDeleteGroup = (weekIndex: number, dayIndex: number, groupIndex: number) => {
    if(confirm('Are you sure you want to delete this entire group?')) {
       handlePlanChange(draft => {
        draft.weeks[weekIndex].days[dayIndex]?.exerciseGroups.splice(groupIndex, 1);
      });
    }
  };

  // --- Exercise Handlers ---
  const handleOpenExerciseModal = (context: typeof editingExerciseContext) => {
    setEditingExerciseContext(context);
    setIsExerciseModalOpen(true);
  };
  
  const handleSaveExercise = (exerciseData: ExerciseInstance) => {
    if (!editingExerciseContext) return;
    const { weekIndex, dayIndex, groupIndex, exerciseIndex, isNew, groupType } = editingExerciseContext;
    handlePlanChange(draft => {
      const day = draft.weeks[weekIndex].days[dayIndex];
      if (!day) return;
      if (isNew) {
        if (groupType && groupType !== 'circuit') {
          const newGroup: ExerciseGroup = { id: `group-${crypto.randomUUID()}`, type: groupType, exercises: [exerciseData] };
          day.exerciseGroups.push(newGroup);
        } else if (groupIndex !== undefined) {
          day.exerciseGroups[groupIndex].exercises.push(exerciseData);
        }
      } else {
        if (groupIndex !== undefined && exerciseIndex !== undefined) {
          day.exerciseGroups[groupIndex].exercises[exerciseIndex] = exerciseData;
        }
      }
    });
    setIsExerciseModalOpen(false);
    setEditingExerciseContext(null);
  };
  
  const handleDeleteExercise = (weekIndex: number, dayIndex: number, groupIndex: number, exerciseIndex: number) => {
     handlePlanChange(draft => {
        const group = draft.weeks[weekIndex].days[dayIndex]?.exerciseGroups[groupIndex];
        if (group) {
          group.exercises.splice(exerciseIndex, 1);
          if (group.exercises.length === 0) {
            draft.weeks[weekIndex].days[dayIndex]?.exerciseGroups.splice(groupIndex, 1);
          }
        }
      });
  };
  
  const getExerciseToEdit = (): ExerciseInstance | null => {
    if (!editingExerciseContext) return null;
    const { weekIndex, dayIndex, groupIndex, exerciseIndex, isNew, groupType } = editingExerciseContext;
    if (isNew) {
      return {
        id: `new-${crypto.randomUUID()}`, name: 'New Exercise',
        type: groupType === 'circuit' ? ExerciseType.TIMED : ExerciseType.REPS_WEIGHT,
        sets: groupType === 'circuit' ? 1 : 3, // Sets are per-group in circuits
        reps: 10, rest: 60, duration: 45
      };
    }
    if (groupIndex !== undefined && exerciseIndex !== undefined) {
      return editablePlan.weeks[weekIndex].days[dayIndex]?.exerciseGroups[groupIndex].exercises[exerciseIndex] || null;
    }
    return null;
  };
  
  const getGroupToEdit = (): ExerciseGroup | null => {
    if (!editingGroupContext) return null;
    const { weekIndex, dayIndex, groupIndex } = editingGroupContext;
    return editablePlan.weeks[weekIndex].days[dayIndex]?.exerciseGroups[groupIndex] || null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Workout Planner</h2>
        <div className="space-x-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={() => onSave(editablePlan)}>Save Plan</Button>
        </div>
      </div>
      
      <ExerciseEditModal isOpen={isExerciseModalOpen} onClose={() => setIsExerciseModalOpen(false)} onSave={handleSaveExercise} exercise={getExerciseToEdit()} groupType={editingExerciseContext?.groupType || editablePlan.weeks[editingExerciseContext?.weekIndex || 0]?.days[editingExerciseContext?.dayIndex || 0]?.exerciseGroups[editingExerciseContext?.groupIndex || 0]?.type} />
      <GroupEditModal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} onSave={handleSaveGroup} group={getGroupToEdit()} />
      
      <Card>
        <Card.Header>
          <input type="text" value={editablePlan.name} onChange={(e) => handlePlanChange(draft => { draft.name = e.target.value; })} className="text-xl font-semibold bg-transparent border-none p-0 focus:ring-0 w-full" />
        </Card.Header>
        <Card.Body>
          {editablePlan.weeks.map((week, weekIndex) => (
            <div key={week.id} className="mb-8">
              <h3 className="text-xl font-semibold mb-4 border-b border-border pb-2">{week.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {week.days.map((day, dayIndex) => (
                  <Card key={day?.id || dayIndex} className="bg-gray-800 flex flex-col">
                    <Card.Header>
                      <Card.Title>{day ? day.name : 'Rest Day'}</Card.Title>
                    </Card.Header>
                    {day && (
                      <>
                        <Card.Body className="flex-grow space-y-4">
                          {day.exerciseGroups.map((group, groupIndex) => (
                            <div key={group.id} className="p-3 rounded-lg border border-gray-700 bg-surface/50">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <strong className="text-sm text-secondary uppercase tracking-wider">{group.type}</strong>
                                  {group.type === 'circuit' && <span className="text-xs text-text-secondary">({group.sets} rounds)</span>}
                                  {group.type === 'circuit' && (
                                    <Button size="sm" variant="outline" onClick={() => handleOpenGroupModal({ weekIndex, dayIndex, groupIndex })}>
                                      <PencilIcon className="w-3 h-3" />
                                    </Button>
                                  )}
                                </div>
                                <Button size="sm" variant="outline" onClick={() => handleDeleteGroup(weekIndex, dayIndex, groupIndex)}>
                                  <TrashIcon className="w-4 h-4 text-red-500" />
                                </Button>
                              </div>
                              <ul className="space-y-2">
                                {group.exercises.map((ex, exIndex) => (
                                  <li key={ex.id} className="text-sm p-2 rounded-md bg-gray-900/50 flex justify-between items-center">
                                    <div>
                                      <p className="font-semibold text-text-primary">{ex.name}</p>
                                      <p className="text-text-secondary">
                                        {group.type === 'circuit' && ex.type === ExerciseType.TIMED && `${ex.duration}s work / ${ex.rest}s rest`}
                                        {group.type !== 'circuit' && ex.type === ExerciseType.REPS_WEIGHT && `${ex.sets}x${ex.reps || '?'} ${ex.targetWeight ? `@ ${ex.targetWeight}kg` : ''}`}
                                        {group.type !== 'circuit' && ex.type === ExerciseType.TIMED && `${ex.sets}x${ex.duration}s`}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                      <Button size="sm" variant="outline" onClick={() => handleOpenExerciseModal({ weekIndex, dayIndex, groupIndex, exerciseIndex: exIndex, isNew: false })}> <PencilIcon className="w-4 h-4" /> </Button>
                                      <Button size="sm" variant="danger" onClick={() => handleDeleteExercise(weekIndex, dayIndex, groupIndex, exIndex)}> <TrashIcon className="w-4 h-4" /> </Button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                               <Button size="sm" variant="secondary" className="w-full mt-3" onClick={() => handleOpenExerciseModal({ weekIndex, dayIndex, groupIndex, isNew: true, groupType: group.type })} >
                                  <PlusIcon className="w-4 h-4 mr-1"/> Add Exercise to {group.type}
                                </Button>
                            </div>
                          ))}
                        </Card.Body>
                        <Card.Footer className="flex flex-col sm:flex-row gap-2">
                          <Button size="sm" variant="secondary" onClick={() => handleAddGroup(weekIndex, dayIndex, 'single')}><PlusIcon className="w-4 h-4 mr-1"/>Single</Button>
                          <Button size="sm" variant="secondary" onClick={() => handleAddGroup(weekIndex, dayIndex, 'superset')}><PlusIcon className="w-4 h-4 mr-1"/>Superset</Button>
                          <Button size="sm" variant="secondary" onClick={() => handleAddGroup(weekIndex, dayIndex, 'circuit')}><PlusIcon className="w-4 h-4 mr-1"/>Circuit</Button>
                        </Card.Footer>
                      </>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </Card.Body>
      </Card>
    </div>
  );
};

export default WorkoutPlanner;