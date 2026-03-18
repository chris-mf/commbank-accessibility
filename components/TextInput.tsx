'use client';

import { useState } from 'react';

interface TextInputProps {
  placeholder?: string;
  onSubmit: (value: string) => void;
}

export default function TextInput({ placeholder, onSubmit }: TextInputProps) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (submitted) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setSubmitted(true);
    onSubmit(value.trim());
  }

  return (
    <div className="mb-5 ml-10.5">
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          Type your answer
        </p>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
            className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 text-base
                       focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/30
                       text-gray-800 placeholder-gray-400 bg-gray-50"
            autoFocus
          />
          <button
            type="submit"
            disabled={!value.trim()}
            className={`
              px-6 py-3 rounded-xl text-base font-semibold transition-all
              focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2
              ${
                value.trim()
                  ? 'bg-yellow-400 text-gray-900 hover:bg-yellow-500 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <span className="hidden sm:inline">Submit</span>
            <svg className="sm:hidden w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
