'use client';

import { UserSelections, Branch } from '@/lib/types';
import { getDocumentChecklist, getWhatToExpect } from '@/lib/documents';
import { getFeatureLabel } from '@/lib/branches';
import type { BranchFeatures } from '@/lib/types';

interface VisitPlanProps {
  selections: UserSelections;
}

const NEED_LABELS: Record<string, string> = {
  'quiet-space': 'Quiet or private space',
  'wheelchair': 'Wheelchair or mobility aid access',
  'support-person': 'Bringing a support person or carer',
  'hearing': 'Hearing support',
  'vision': 'Vision support',
  'simple-language': 'Clear, simple language',
  'overwhelming': 'Support for sensory sensitivities',
  'sunflower': 'Hidden Disabilities Sunflower',
};

export default function VisitPlan({ selections }: VisitPlanProps) {
  const branch = selections.selectedBranch;
  const checklist = getDocumentChecklist(selections.customerType, selections.accountType);
  const expectations = getWhatToExpect(selections.customerType, selections.startedOnline);

  return (
    <div className="space-y-4 print:space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 rounded-xl p-5 text-gray-900 print:border print:border-gray-300">
        <h2 className="text-lg font-bold mb-1">Your Branch Visit Plan</h2>
        <p className="text-sm opacity-80">Everything you need for your CommBank visit</p>
      </div>

      {/* What you're doing */}
      <Section title="What you're doing">
        <p className="text-sm text-gray-700 mb-3">
          {selections.primaryTask === 'open-account'
            ? `Opening a new ${selections.accountType === 'smart-access' ? 'Smart Access (everyday)' : selections.accountType === 'saver' ? 'savings' : 'bank'} account`
            : selections.primaryTask === 'existing-account'
            ? 'Visiting about an existing account'
            : 'Branch visit'}
          {selections.customerType === 'new' ? ' as a new CommBank customer' : ''}
        </p>
        <div className="space-y-2">
          {expectations.map((point, i) => (
            <div key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-yellow-500 mt-0.5 flex-shrink-0">▸</span>
              <span>{point}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Document checklist */}
      <Section title="What to bring">
        <div className="space-y-2">
          {checklist.map((item, i) => (
            <div key={i} className="flex gap-2">
              <span className={`mt-0.5 flex-shrink-0 text-sm ${item.required ? 'text-red-500' : 'text-gray-400'}`}>
                {item.required ? '☐' : '☐'}
              </span>
              <div>
                <span className={`text-sm ${item.required ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>
                  {item.text}
                  {item.required && <span className="text-red-500 ml-1 text-xs">Required</span>}
                </span>
                {item.note && <p className="text-xs text-gray-500 mt-0.5">{item.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Your branch */}
      {branch && (
        <Section title="Your branch">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 text-sm">{branch.name}</h4>
            <p className="text-xs text-gray-600 mt-1">{branch.address}, {branch.suburb} {branch.postcode}</p>
            <p className="text-xs text-gray-600 mt-1">{branch.hours}</p>
            <p className="text-xs text-gray-600 mt-0.5">Phone: {branch.phone}</p>

            <div className="flex flex-wrap gap-1.5 mt-3">
              {(Object.entries(branch.features) as [keyof BranchFeatures, boolean][])
                .filter(([, v]) => v)
                .map(([key]) => (
                  <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                    {getFeatureLabel(key)}
                  </span>
                ))}
            </div>

            <div className="mt-3 flex gap-2 text-xs">
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{branch.distanceKm} km away</span>
              <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full">{branch.driveMinutes} min drive</span>
            </div>
          </div>

          {selections.appointmentType && (
            <p className="text-sm text-gray-700 mt-3">
              {selections.appointmentType === 'book'
                ? '📅 You chose to book an appointment — call the branch to confirm a time.'
                : '🚶 You chose to walk in — no appointment needed.'}
            </p>
          )}
        </Section>
      )}

      {/* Accessibility support */}
      {selections.accessibilityNeeds.length > 0 && !selections.accessibilityNeeds.includes('none') && (
        <Section title="Your Customer Preference Card">
          <p className="text-xs text-gray-500 mb-3">
            This summary is based on your answers. You can print it and bring it to the branch,
            or show it on your phone. Staff will use it to support you without you having to explain.
          </p>
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-xs font-bold text-gray-900">
                CBA
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-900">Customer Preference Card</p>
                <p className="text-xs text-gray-500">Pre-filled summary</p>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-gray-700">My preferences for this visit:</p>
              {selections.accessibilityNeeds
                .filter((n) => n !== 'none' && n !== 'other')
                .map((need) => (
                  <div key={need} className="flex gap-2 text-sm text-gray-700">
                    <span className="text-yellow-500">•</span>
                    <span>{NEED_LABELS[need] || need}</span>
                  </div>
                ))}
              {selections.accessibilityOther && (
                <div className="flex gap-2 text-sm text-gray-700">
                  <span className="text-yellow-500">•</span>
                  <span>{selections.accessibilityOther}</span>
                </div>
              )}
            </div>
          </div>
        </Section>
      )}

      {/* Programs */}
      <Section title="CommBank accessibility programs">
        <div className="space-y-3">
          <ProgramCard
            name="Equal Access Toolkit"
            description="Available at all branches. Includes tools like magnifiers, pen grips, and communication boards. Ask any staff member."
          />
          <ProgramCard
            name="Customer Preference Card"
            description="Tell staff about your needs without having to explain in person. Available at any branch or online."
          />
          <ProgramCard
            name="Hidden Disabilities Sunflower"
            description="CommBank staff are trained to recognise the Sunflower lanyard and offer discreet extra support."
          />
        </div>
      </Section>

      {/* Print button */}
      <div className="flex gap-3" data-print-hide>
        <button
          onClick={() => window.print()}
          className="flex-1 py-3 bg-gray-900 text-white rounded-xl text-sm font-semibold
                     hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2
                     focus:ring-yellow-400 focus:ring-offset-2 cursor-pointer"
        >
          Print or save this plan
        </button>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-3 border-2 border-gray-300 text-gray-700 rounded-xl text-sm font-medium
                     hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2
                     focus:ring-yellow-400 focus:ring-offset-2 cursor-pointer"
        >
          Start over
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
        <span className="w-1 h-4 bg-yellow-400 rounded-full inline-block" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function ProgramCard({ name, description }: { name: string; description: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <p className="text-sm font-medium text-gray-900">{name}</p>
      <p className="text-xs text-gray-600 mt-0.5">{description}</p>
    </div>
  );
}
