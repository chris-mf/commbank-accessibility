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
      <div className="bg-gradient-to-r from-brand-yellow to-brand-yellow/80 rounded-xl p-5 text-gray-900 print:border print:border-gray-300">
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
              <span className="text-brand-yellow mt-0.5 flex-shrink-0">▸</span>
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
              <div className="w-8 h-8 rounded-full bg-brand-yellow flex items-center justify-center text-xs font-bold text-gray-900">
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
                    <span className="text-brand-yellow">•</span>
                    <span>{NEED_LABELS[need] || need}</span>
                  </div>
                ))}
              {selections.accessibilityOther && (
                <div className="flex gap-2 text-sm text-gray-700">
                  <span className="text-brand-yellow">•</span>
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

      {/* Actions */}
      <div className="flex flex-col gap-3" data-print-hide>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="flex-1 py-3.5 bg-gray-900 text-white rounded-xl text-sm font-semibold
                       hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2
                       focus:ring-brand-yellow focus:ring-offset-2 cursor-pointer
                       flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print or save this plan
          </button>
          <button
            onClick={() => {
              const subject = encodeURIComponent('My CommBank Branch Visit Plan');
              const bodyParts: string[] = [];
              bodyParts.push('MY COMMBANK BRANCH VISIT PLAN');
              bodyParts.push('================================\n');
              if (selections.primaryTask === 'open-account') {
                bodyParts.push(`Task: Opening a new ${selections.accountType === 'smart-access' ? 'Smart Access' : selections.accountType === 'saver' ? 'savings' : 'bank'} account${selections.customerType === 'new' ? ' (new customer)' : ''}`);
              } else {
                bodyParts.push('Task: Branch visit');
              }
              bodyParts.push('');
              if (branch) {
                bodyParts.push(`Branch: ${branch.name}`);
                bodyParts.push(`Address: ${branch.address}, ${branch.suburb} ${branch.postcode}`);
                bodyParts.push(`Hours: ${branch.hours}`);
                bodyParts.push(`Phone: ${branch.phone}`);
                bodyParts.push('');
              }
              bodyParts.push('WHAT TO BRING:');
              checklist.forEach((item) => {
                bodyParts.push(`${item.required ? '[REQUIRED]' : '[ ]'} ${item.text}${item.note ? ` - ${item.note}` : ''}`);
              });
              bodyParts.push('');
              if (selections.accessibilityNeeds.length > 0 && !selections.accessibilityNeeds.includes('none')) {
                bodyParts.push('MY PREFERENCES:');
                selections.accessibilityNeeds
                  .filter((n) => n !== 'none' && n !== 'other')
                  .forEach((need) => {
                    bodyParts.push(`- ${NEED_LABELS[need] || need}`);
                  });
                if (selections.accessibilityOther) {
                  bodyParts.push(`- ${selections.accessibilityOther}`);
                }
                bodyParts.push('');
              }
              bodyParts.push('ACCESSIBILITY PROGRAMS:');
              bodyParts.push('- Equal Access Toolkit: Available at all branches');
              bodyParts.push('- Customer Preference Card: Tell staff about your needs');
              bodyParts.push('- Hidden Disabilities Sunflower: Staff are trained to offer support');
              const body = encodeURIComponent(bodyParts.join('\n'));
              window.location.href = `mailto:?subject=${subject}&body=${body}`;
            }}
            className="flex-1 py-3.5 bg-brand-yellow text-gray-900 rounded-xl text-sm font-semibold
                       hover:brightness-95 transition-all focus:outline-none focus:ring-2
                       focus:ring-brand-yellow focus:ring-offset-2 cursor-pointer
                       flex items-center justify-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            Email me this plan
          </button>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl text-sm font-medium
                     hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2
                     focus:ring-brand-yellow focus:ring-offset-2 cursor-pointer"
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
        <span className="w-1 h-4 bg-brand-yellow rounded-full inline-block" />
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
