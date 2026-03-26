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

  // Features available at this branch
  const availableFeatures = Object.entries(branch.features)
    .filter(([, available]) => available)
    .map(([key]) => key as keyof BranchFeatures);

  // Features the user asked for that this branch has
  const yourNeeds = userNeeds
    .map((need) => needsMap[need])
    .filter((f): f is keyof BranchFeatures => !!f && branch.features[f]);

  // Other features available but not requested
  const alsoAvailable = availableFeatures.filter(f => !yourNeeds.includes(f));

  const renderPill = (featureKey: keyof BranchFeatures, variant: 'match' | 'extra') => (
    <span
      key={featureKey}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
        variant === 'match'
          ? 'bg-green-100 text-green-900 ring-1 ring-green-300'
          : 'bg-gray-100 text-gray-800 ring-1 ring-gray-200'
      }`}
    >
      <span aria-hidden>{FEATURE_ICONS[featureKey]}</span>
      {getFeatureLabel(featureKey)}
    </span>
  );

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

      {yourNeeds.length > 0 && (
        <div className="mb-2">
          <p className="text-xs font-semibold text-green-800 uppercase tracking-wide mb-1.5">What you asked for</p>
          <div className="flex flex-wrap gap-2">
            {yourNeeds.map(f => renderPill(f, 'match'))}
          </div>
        </div>
      )}

      {alsoAvailable.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 mt-2">Also available</p>
          <div className="flex flex-wrap gap-2">
            {alsoAvailable.map(f => renderPill(f, 'extra'))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
        <span>{branch.hours}</span>
        <span>{branch.driveMinutes} min drive</span>
      </div>
    </button>
  );
}
