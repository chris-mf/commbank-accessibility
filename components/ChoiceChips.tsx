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
    <div className="mb-5 ml-10.5">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          {multiSelect ? 'Select all that apply' : 'Choose one'}
        </p>
        <div
          className="flex flex-col gap-2"
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
                  flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base
                  font-medium transition-all text-left cursor-pointer
                  border-2
                  focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1
                  ${
                    isSelected
                      ? 'bg-yellow-50 text-gray-900 border-yellow-400'
                      : 'bg-gray-50 text-gray-700 border-transparent hover:border-gray-300 hover:bg-white'
                  }
                `}
              >
                {/* Checkbox / Radio indicator */}
                {multiSelect ? (
                  <span
                    className={`
                      flex items-center justify-center w-5 h-5 rounded flex-shrink-0
                      border-2 transition-all
                      ${isSelected
                        ? 'bg-yellow-400 border-yellow-400'
                        : 'bg-white border-gray-400'
                      }
                    `}
                    aria-hidden
                  >
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                ) : (
                  <span
                    className={`
                      flex items-center justify-center w-5 h-5 rounded-full flex-shrink-0
                      border-2 transition-all
                      ${isSelected
                        ? 'border-yellow-400'
                        : 'border-gray-400'
                      }
                    `}
                    aria-hidden
                  >
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    )}
                  </span>
                )}
                <span className="leading-snug">{choice.label}</span>
              </button>
            );
          })}
        </div>
        {multiSelect && (
          <button
            onClick={handleContinue}
            disabled={selected.size === 0}
            className={`
              mt-4 w-full py-3 rounded-xl text-base font-semibold transition-all
              focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2
              ${
                selected.size > 0
                  ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500 cursor-pointer'
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
