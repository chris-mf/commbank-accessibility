'use client';

import { Branch, BranchFeatures } from '@/lib/types';
import { getFeatureLabel } from '@/lib/branches';

interface BranchCardProps {
  branch: Branch;
  userNeeds: string[];
  onSelect: (branch: Branch) => void;
  selected?: boolean;
}

const FEATURE_ICONS: Record<keyof BranchFeatures, string> = {
  quietRoom: '🤫',
  hearingLoop: '🦻',
  wheelchairAccess: '♿',
  accessibleParking: '🅿️',
  privateMeetingRoom: '🚪',
  automaticDoors: '🚶',
};

export default function BranchCard({ branch, userNeeds, onSelect, selected }: BranchCardProps) {
  const needsMap: Partial<Record<string, keyof BranchFeatures>> = {
    'quiet-space': 'quietRoom',
    'hearing': 'hearingLoop',
    'wheelchair': 'wheelchairAccess',
  };

  const matchedFeatures = Object.entries(branch.features)
    .filter(([, available]) => available)
    .map(([key]) => key as keyof BranchFeatures);

  const highlightedFeatures = userNeeds
    .map((need) => needsMap[need])
    .filter((f): f is keyof BranchFeatures => !!f && branch.features[f]);

  return (
    <button
      onClick={() => onSelect(branch)}
      className={`
        w-full text-left p-4 rounded-xl border-2 transition-all mb-3
        focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2
        cursor-pointer
        ${selected
          ? 'border-brand-yellow bg-brand-yellow/10 shadow-md'
          : 'border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm'
        }
      `}
      aria-pressed={selected}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">{branch.name}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{branch.address}, {branch.suburb} {branch.postcode}</p>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap ml-2">
          {branch.distanceKm} km
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-2">
        {matchedFeatures.map((featureKey) => {
          const isHighlighted = highlightedFeatures.includes(featureKey);
          return (
            <span
              key={featureKey}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                isHighlighted
                  ? 'bg-green-100 text-green-800 font-medium'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <span aria-hidden>{FEATURE_ICONS[featureKey]}</span>
              {getFeatureLabel(featureKey)}
            </span>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{branch.hours}</span>
        <span>{branch.driveMinutes} min drive</span>
      </div>
    </button>
  );
}
