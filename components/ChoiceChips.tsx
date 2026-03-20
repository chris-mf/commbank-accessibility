'use client';

import { useState } from 'react';
import { Choice } from '@/lib/types';

interface ChoiceChipsProps {
  choices: Choice[];
  multiSelect?: boolean;
  onSelect: (selected: string | string[]) => void;
}

export default function ChoiceChips({ choices, multiSelect, onSelect }: ChoiceChipsProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  if (submitted) return null;

  const hasDescriptions = choices.some((c) => c.description);

  function handleClick(choiceId: string) {
    if (!multiSelect) {
      setSubmitted(true);
      onSelect(choiceId);
      return;
    }

    setSelected((prev) => {
      const next = new Set(prev);
      if (choiceId === 'none') {
        return new Set(['none']);
      }
      next.delete('none');
      if (next.has(choiceId)) {
        next.delete(choiceId);
      } else {
        next.add(choiceId);
      }
      return next;
    });
  }

  function handleContinue() {
    if (selected.size === 0) return;
    setSubmitted(true);
    onSelect(Array.from(selected));
  }

  return (
    <div className="mb-5 ml-12">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
          {multiSelect ? 'Select all that apply' : 'Choose one'}
        </p>
        <div
          className={`flex flex-col ${hasDescriptions ? 'gap-3' : 'gap-2'}`}
          role={multiSelect ? 'group' : 'radiogroup'}
          aria-label="Select an option"
        >
          {choices.map((choice) => {
            const isSelected = selected.has(choice.id);
            return (
              <button
                key={choice.id}
                onClick={() => handleClick(choice.id)}
                aria-pressed={multiSelect ? isSelected : undefined}
                className={`
                  flex items-start gap-3.5 w-full rounded-xl text-left cursor-pointer
                  transition-all border-2
                  focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-1
                  ${hasDescriptions ? 'px-4 py-4' : 'px-4 py-3.5'}
                  ${
                    isSelected
                      ? 'bg-brand-yellow/10 text-gray-900 border-brand-yellow shadow-sm'
                      : 'bg-gray-50/80 text-gray-700 border-transparent hover:border-gray-300 hover:bg-white hover:shadow-sm'
                  }
                `}
              >
                {/* Checkbox / Radio indicator */}
                <div className="mt-0.5 flex-shrink-0">
                  {multiSelect ? (
                    <span
                      className={`
                        flex items-center justify-center w-[20px] h-[20px] rounded
                        border-2 transition-all
                        ${isSelected
                          ? 'bg-brand-yellow border-brand-yellow'
                          : 'bg-white border-gray-400'
                        }
                      `}
                      aria-hidden
                    >
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                  ) : (
                    <span
                      className={`
                        flex items-center justify-center w-[20px] h-[20px] rounded-full
                        border-2 transition-all
                        ${isSelected
                          ? 'border-brand-yellow'
                          : 'border-gray-400'
                        }
                      `}
                      aria-hidden
                    >
                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow" />
                      )}
                    </span>
                  )}
                </div>

                {/* Label + description */}
                <div className="flex-1 min-w-0">
                  <span className="text-base font-medium leading-snug block">{choice.label}</span>
                  {choice.description && (
                    <span className="text-sm text-gray-500 leading-snug mt-0.5 block">
                      {choice.description}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {multiSelect && (
          <button
            onClick={handleContinue}
            disabled={selected.size === 0}
            className={`
              mt-5 w-full py-3.5 rounded-xl text-base font-semibold transition-all
              focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2
              ${
                selected.size > 0
                  ? 'bg-brand-yellow text-gray-900 hover:brightness-95 cursor-pointer shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Continue {selected.size > 0 && `(${selected.size} selected)`}
          </button>
        )}
      </div>
    </div>
  );
}
