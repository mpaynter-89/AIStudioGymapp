
import React, { useState } from 'react';
import type { WorkoutPlan, ActivePlanConfig } from '../types';
import { Card } from './common/Card';
import { Button } from './common/Button';
import { PlusIcon } from './icons/PlusIcon';
import SetActiveModal from './SetActiveModal';

interface PlanListProps {
  plans: WorkoutPlan[];
  activePlanConfig: ActivePlanConfig | null;
  onEdit: (plan: WorkoutPlan) => void;
  onDelete: (planId: string) => void;
  onCreate: () => void;
  onActivate: (config: ActivePlanConfig) => void;
}

const PlanList: React.FC<PlanListProps> = ({ plans, activePlanConfig, onEdit, onDelete, onCreate, onActivate }) => {
    const [activatingPlan, setActivatingPlan] = useState<WorkoutPlan | null>(null);
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Your Workout Plans</h2>
                <Button onClick={onCreate}>
                    <PlusIcon className="w-5 h-5 mr-1" />
                    Create New Plan
                </Button>
            </div>
            
            <SetActiveModal 
                isOpen={!!activatingPlan}
                onClose={() => setActivatingPlan(null)}
                plan={activatingPlan}
                onActivate={onActivate}
            />

            {plans.length === 0 ? (
                <Card>
                    <Card.Body className="text-center">
                        <p className="text-text-secondary">You haven't created any workout plans yet.</p>
                        <Button onClick={onCreate} className="mt-4">Create Your First Plan</Button>
                    </Card.Body>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map(plan => {
                        const isActive = plan.id === activePlanConfig?.planId;
                        return (
                            <Card key={plan.id} className={`flex flex-col ${isActive ? 'border-secondary' : ''}`}>
                                <Card.Header>
                                    <div className="flex justify-between items-start">
                                        <Card.Title>{plan.name}</Card.Title>
                                        {isActive && (
                                            <span className="bg-secondary text-white text-xs font-bold px-2 py-1 rounded-full">
                                                ACTIVE
                                            </span>
                                        )}
                                    </div>
                                    <Card.Description>
                                        {plan.weeks.length} week(s), {plan.weeks[0]?.days.filter(d=>d).length} workouts/week
                                    </Card.Description>
                                </Card.Header>
                                <Card.Body className="flex-grow">
                                    {/* Can add a summary here in the future */}
                                </Card.Body>
                                <Card.Footer className="grid grid-cols-2 gap-2">
                                    <Button variant="secondary" onClick={() => onEdit(plan)}>Edit</Button>
                                    <Button variant="outline" onClick={() => setActivatingPlan(plan)}>Set Active</Button>
                                    <Button variant="danger" className="col-span-2" onClick={() => onDelete(plan.id)}>Delete</Button>
                                </Card.Footer>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    );
};

export default PlanList;
