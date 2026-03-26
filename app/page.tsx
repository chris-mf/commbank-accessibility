'use client';

import { useState, useEffect, useRef } from 'react';
import { DEFAULT_CARDS, type PrototypeCard } from '@/lib/cards';

const STORAGE_KEY = 'prototype-hub-cards';

export default function Home() {
  const [cards, setCards] = useState<PrototypeCard[]>(DEFAULT_CARDS);
  const [editing, setEditing] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const titleRefs = useRef<Record<string, HTMLHeadingElement | null>>({});
  const hmwRefs = useRef<Record<string, HTMLParagraphElement | null>>({});

  // Load from API on mount, fallback to localStorage
  useEffect(() => {
    setMounted(true);

    async function loadCards() {
      try {
        const res = await fetch('/api/cards');
        if (res.ok) {
          const data = await res.json();
          setCards(data);
          return;
        }
      } catch {
        // API unavailable — fall through to localStorage
      }
      // Fallback: localStorage
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as PrototypeCard[];
          const merged = DEFAULT_CARDS.map((def) => {
            const saved_card = parsed.find((s) => s.id === def.id);
            return saved_card ? { ...def, title: saved_card.title, hmw: saved_card.hmw } : def;
          });
          setCards(merged);
        }
      } catch {
        // ignore
      }
    }

    loadCards();
  }, []);

  async function saveCards(updated: PrototypeCard[]) {
    setCards(updated);
    // Write-through to localStorage as cache
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Find which card changed and save to API
    const changed = updated.find(
      (u) => !cards.some((c) => c.id === u.id && c.title === u.title && c.hmw === u.hmw)
    );
    if (changed) {
      try {
        await fetch('/api/cards', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: changed.id, title: changed.title, hmw: changed.hmw }),
        });
      } catch {
        // KV save failed — localStorage already has it
      }
    }
  }

  function handleSave(cardId: string) {
    const titleEl = titleRefs.current[cardId];
    const hmwEl = hmwRefs.current[cardId];
    if (!titleEl || !hmwEl) return;

    const updated = cards.map((c) =>
      c.id === cardId
        ? { ...c, title: titleEl.innerText.trim() || c.title, hmw: hmwEl.innerText.trim() || c.hmw }
        : c
    );
    saveCards(updated);
    setEditing(null);
  }

  function handleCancel(cardId: string) {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;
    const titleEl = titleRefs.current[cardId];
    const hmwEl = hmwRefs.current[cardId];
    if (titleEl) titleEl.innerText = card.title;
    if (hmwEl) hmwEl.innerText = card.hmw;
    setEditing(null);
  }

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
                <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Co-design Hub</h1>
              <p className="text-sm text-gray-500">Design explorations & prototypes</p>
            </div>
          </div>
        </div>
      </header>

      {/* Cards grid */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cards.map((card) => {
            const isEditing = editing === card.id;
            const isLive = card.status === 'live';

            return (
              <div
                key={card.id}
                className={`
                  relative bg-white rounded-2xl border-2 overflow-hidden transition-all
                  ${isEditing
                    ? 'border-brand-yellow shadow-lg ring-2 ring-brand-yellow/30'
                    : isLive
                    ? 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                {/* Status badge */}
                <div className="absolute top-4 right-4 z-10">
                  {isLive ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ring-1 ring-green-200">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      Live
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 ring-1 ring-gray-200">
                      Coming soon
                    </span>
                  )}
                </div>

                {/* Card content */}
                <div className="p-6">
                  {/* HMW label */}
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-brand-yellow">HMW</span>
                  </div>

                  {/* HMW statement */}
                  <p
                    ref={(el) => { hmwRefs.current[card.id] = el; }}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    className={`
                      text-sm text-gray-600 italic leading-relaxed mb-4
                      ${isEditing ? 'outline-none bg-brand-yellow/5 rounded-lg px-3 py-2 border border-brand-yellow/30 focus:border-brand-yellow' : ''}
                    `}
                  >
                    {card.hmw}
                  </p>

                  {/* Divider */}
                  <div className="w-8 h-0.5 bg-brand-yellow rounded-full mb-4" />

                  {/* Title */}
                  <h2
                    ref={(el) => { titleRefs.current[card.id] = el; }}
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    className={`
                      text-lg font-bold text-gray-900 mb-6
                      ${isEditing ? 'outline-none bg-brand-yellow/5 rounded-lg px-3 py-2 border border-brand-yellow/30 focus:border-brand-yellow' : ''}
                    `}
                  >
                    {card.title}
                  </h2>

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => handleSave(card.id)}
                          className="px-4 py-2 bg-brand-yellow text-gray-900 rounded-lg text-sm font-semibold
                                     hover:brightness-95 transition-all cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => handleCancel(card.id)}
                          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium
                                     hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        {isLive && card.href && (
                          <a
                            href={card.href}
                            className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold
                                       hover:bg-gray-800 transition-colors inline-flex items-center gap-2"
                          >
                            Open prototype
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 12h14" />
                              <path d="m12 5 7 7-7 7" />
                            </svg>
                          </a>
                        )}
                        <button
                          onClick={() => setEditing(card.id)}
                          className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium
                                     hover:bg-gray-200 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                            <path d="m15 5 4 4" />
                          </svg>
                          Edit
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
