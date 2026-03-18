'use client';

import { Stage, STAGE_LABELS } from '@/lib/types';

interface ProgressBarProps {
  currentStage: Stage;
}

export default function ProgressBar({ currentStage }: ProgressBarProps) {
  const stages = [Stage.TASK, Stage.ACCESSIBILITY, Stage.JOURNEY, Stage.BRANCH_FINDER, Stage.VISIT_PLAN];

  return (
    <nav aria-label="Progress" className="w-full px-4 py-3 bg-white border-b border-gray-200">
      <ol className="flex items-center justify-between max-w-2xl mx-auto gap-1">
        {stages.map((stage) => {
          const isActive = stage === currentStage;
          const isCompleted = stage < currentStage;

          return (
            <li key={stage} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full mb-1.5">
                <div
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    isCompleted ? 'bg-yellow-400' : isActive ? 'bg-yellow-400' : 'bg-gray-200'
                  }`}
                />
              </div>
              <span
                className={`text-xs font-medium text-center leading-tight hidden sm:block ${
                  isActive ? 'text-gray-900' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                }`}
              >
                {STAGE_LABELS[stage]}
              </span>
              <span
                className={`text-xs font-medium sm:hidden ${
                  isActive ? 'text-gray-900' : 'text-transparent'
                }`}
                aria-hidden={!isActive}
              >
                {isActive ? STAGE_LABELS[stage] : '.'}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
