'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Message, UserSelections, Branch } from '@/lib/types';
import {
  getInitialMessages,
  getNextBotMessage,
  getStepSelectionKey,
  getCurrentStage,
  getAccessibilityAcknowledgement,
  FLOW_STEPS,
} from '@/lib/flow';
import { filterAndRankBranches } from '@/lib/branches';
import ProgressBar from './ProgressBar';
import ChatMessage from './ChatMessage';
import ChoiceChips from './ChoiceChips';
import BranchCard from './BranchCard';
import VisitPlan from './VisitPlan';
import TypingIndicator from './TypingIndicator';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [currentStepId, setCurrentStepId] = useState('welcome');
  const [currentStage, setCurrentStage] = useState<Stage>(Stage.TASK);
  const [selections, setSelections] = useState<UserSelections>({ accessibilityNeeds: [] });
  const [showBranches, setShowBranches] = useState(false);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
  const [showVisitPlan, setShowVisitPlan] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, showBranches, showVisitPlan, isTyping, scrollToBottom]);

  function addMessage(msg: Message) {
    setMessages((prev) => [...prev, msg]);
  }

  function showTypingThenMessage(msg: Message, delay = 800) {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, msg]);
    }, delay);
  }

  function showTypingThenCallback(callback: () => void, delay = 800) {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      callback();
    }, delay);
  }

  // Match free-text input to a choice option
  function matchTextToChoice(text: string, choices: { id: string; label: string }[]): string | null {
    const lower = text.toLowerCase().trim();
    // Direct match
    for (const c of choices) {
      if (c.label.toLowerCase() === lower) return c.id;
      if (c.id === lower) return c.id;
    }
    // Partial match
    for (const c of choices) {
      if (c.label.toLowerCase().includes(lower) || lower.includes(c.label.toLowerCase())) return c.id;
    }
    // Keyword matching
    if (lower.includes('new account') || lower.includes('open')) return choices.find(c => c.id === 'open-account')?.id || null;
    if (lower.includes('existing') || lower.includes('question')) return choices.find(c => c.id === 'existing-account')?.id || null;
    if (lower.includes('plan') || lower.includes('visit')) return choices.find(c => c.id === 'plan-visit')?.id || null;
    if (lower.includes('book') || lower.includes('appointment')) return choices.find(c => c.id === 'book-appointment')?.id || null;
    return null;
  }

  function handleTextSubmit(text: string) {
    if (!text.trim()) return;

    // Add user message immediately
    addMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      type: 'text',
    });
    setInputValue('');

    const lastMsg = messages[messages.length - 1];

    // If welcome stage, try to match text to the welcome choices
    if (currentStepId === 'welcome') {
      const welcomeStep = FLOW_STEPS.find(s => s.id === 'welcome');
      if (welcomeStep?.choices) {
        const matched = matchTextToChoice(text, welcomeStep.choices);
        if (matched) {
          const newSelections = { ...selections, primaryTask: matched };
          setSelections(newSelections);
          advanceAfterAnswer('welcome', newSelections);
          return;
        }
      }
      // No match — show a helpful nudge
      showTypingThenMessage({
        id: `bot-nudge-${Date.now()}`,
        role: 'bot',
        content: "I didn't quite catch that. You can pick one of the options above, or type something like 'open an account' or 'plan my visit'.",
        type: 'text',
        stage: currentStage,
      });
      return;
    }

    // If current step expects choices, try to match
    if (lastMsg?.choices) {
      const matched = matchTextToChoice(text, lastMsg.choices);
      if (matched) {
        processChoiceAnswer(matched, true);
        return;
      }
      // For visit-reason step, accept free-text as a custom reason
      if (currentStepId === 'visit-reason') {
        processChoiceAnswer(text, true);
        return;
      }
    }

    // If current step expects text input, just use the text
    if (lastMsg?.type === 'text-input') {
      processChoiceAnswer(text, true);
      return;
    }

    // Fallback — echo back a helpful message
    showTypingThenMessage({
      id: `bot-fallback-${Date.now()}`,
      role: 'bot',
      content: "I didn't quite catch that. You can use the options above, or type your answer and I'll do my best to understand.",
      type: 'text',
      stage: currentStage,
    });
  }

  function processChoiceAnswer(answer: string | string[], skipUserMessage = false) {
    handleAnswer(answer, skipUserMessage);
  }

  function handleAnswer(answer: string | string[], skipUserMessage = false) {
    const selectionKey = getStepSelectionKey(currentStepId);
    const newSelections = { ...selections };

    if (selectionKey) {
      (newSelections as Record<string, unknown>)[selectionKey] = answer;
    }
    setSelections(newSelections);

    // Show user message (only if not already added by text input)
    if (!skipUserMessage) {
      const displayText = Array.isArray(answer)
        ? answer
            .map((a) => {
              const botMsg = [...messages].reverse().find(m => m.role === 'bot');
              return botMsg?.choices?.find((c) => c.id === a)?.label || a;
            })
            .join(', ')
        : [...messages].reverse().find(m => m.role === 'bot')?.choices?.find((c) => c.id === answer)?.label || answer;

      addMessage({
        id: `user-${Date.now()}`,
        role: 'user',
        content: String(displayText),
        type: 'text',
      });
    }

    advanceAfterAnswer(currentStepId, newSelections, answer);
  }

  function advanceAfterAnswer(stepId: string, newSelections: UserSelections, answer?: string | string[]) {
    // Accessibility acknowledgement
    if (stepId === 'accessibility-needs') {
      const needs = Array.isArray(answer) ? answer : newSelections.accessibilityNeeds;
      const ack = getAccessibilityAcknowledgement(needs);
      if (ack) {
        showTypingThenMessage({
          id: `ack-${Date.now()}`,
          role: 'bot',
          content: ack,
          type: 'text',
          stage: Stage.ACCESSIBILITY,
        }, 600);
        // Then advance after ack
        setTimeout(() => {
          const next = getNextBotMessage(stepId, newSelections);
          if (next) {
            showTypingThenCallback(() => {
              setCurrentStepId(next.stepId);
              setCurrentStage(getCurrentStage(next.stepId));
              addMessage(next.message);
            });
          } else {
            triggerBranchFinder(newSelections);
          }
        }, 1400);
        return;
      }
    }

    // Normal advance
    showTypingThenCallback(() => {
      const next = getNextBotMessage(stepId, newSelections);
      if (next) {
        setCurrentStepId(next.stepId);
        setCurrentStage(getCurrentStage(next.stepId));
        addMessage(next.message);
      } else {
        triggerBranchFinder(newSelections);
      }
    });
  }

  function triggerBranchFinder(sel: UserSelections) {
    setCurrentStage(Stage.BRANCH_FINDER);

    const branches = filterAndRankBranches(
      sel.accessibilityNeeds,
      sel.needsAccessibleParking,
      sel.branchPreference
    );
    setFilteredBranches(branches);

    const hasQuietRoom = branches.some((b) => b.features.quietRoom);
    const needsQuietRoom = sel.accessibilityNeeds.includes('quiet-space');

    let intro = `I found ${branches.length} branches near ${sel.suburb || 'you'}. Here are the best matches based on your needs.`;
    if (needsQuietRoom && !hasQuietRoom) {
      intro += "\n\nNo branches in this area have a listed quiet room, but you can call ahead to request a private space. I've sorted by the next best options.";
    } else if (needsQuietRoom && hasQuietRoom) {
      intro += ' Branches with quiet rooms are shown first.';
    }

    addMessage({
      id: `branch-intro-${Date.now()}`,
      role: 'bot',
      content: intro,
      type: 'text',
      stage: Stage.BRANCH_FINDER,
    });

    setTimeout(() => setShowBranches(true), 400);
  }

  function handleBranchSelect(branch: Branch) {
    setSelectedBranch(branch);
  }

  function handleBranchConfirm() {
    if (!selectedBranch) return;

    const updatedSelections = { ...selections, selectedBranch };
    setSelections(updatedSelections);
    setShowBranches(false);

    addMessage({
      id: `user-branch-${Date.now()}`,
      role: 'user',
      content: `I'll go to ${selectedBranch.name}`,
      type: 'text',
    });

    showTypingThenMessage({
      id: `appt-${Date.now()}`,
      role: 'bot',
      content: `Great choice! ${selectedBranch.name} is a good match for your needs.\n\nWould you like to book an appointment, or would you prefer to walk in?`,
      type: 'choices',
      choices: [
        { id: 'book', label: 'Book an appointment (call branch)' },
        { id: 'walk-in', label: "No booking required" },
      ],
      stage: Stage.BRANCH_FINDER,
    });
    setCurrentStepId('appointment-type');
  }

  function handleAppointmentSelect(answer: string | string[]) {
    const apptType = Array.isArray(answer) ? answer[0] : answer;
    const finalSelections = { ...selections, appointmentType: apptType };
    setSelections(finalSelections);

    const label = apptType === 'book' ? 'Book an appointment' : "No booking required";
    addMessage({
      id: `user-appt-${Date.now()}`,
      role: 'user',
      content: label,
      type: 'text',
    });

    showTypingThenCallback(() => {
      setCurrentStage(Stage.VISIT_PLAN);
      addMessage({
        id: `plan-intro-${Date.now()}`,
        role: 'bot',
        content: "Here's your personalised branch visit plan. You can print it or save it for reference.",
        type: 'text',
        stage: Stage.VISIT_PLAN,
      });
      setTimeout(() => setShowVisitPlan(true), 400);
    });
  }

  const lastMessage = messages[messages.length - 1];
  const isAwaitingInput = lastMessage?.role === 'bot' && !showBranches && !showVisitPlan && !isTyping;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Back to hub */}
      <div className="bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 py-1.5 flex items-center">
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            Back to Co-design Hub
          </a>
        </div>
      </div>

      {/* Top header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-900">
                <path d="M12 2L2 12l10 10 10-10L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-900">CommBank Branch Assistant</span>
          </div>
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300
                       text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900
                       transition-colors cursor-pointer focus:outline-none focus:ring-2
                       focus:ring-brand-yellow focus:ring-offset-1"
            onClick={() => window.open('tel:13 2221')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
            Need help? Speak to a human
          </button>
        </div>
      </div>

      <ProgressBar currentStage={currentStage} />

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-24">
        <div className="max-w-2xl mx-auto px-4 py-6" role="log" aria-live="polite" aria-label="Chat messages">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Typing indicator */}
          {isTyping && <TypingIndicator />}

          {/* Choice cards for current question */}
          {isAwaitingInput && lastMessage.type === 'choices' && lastMessage.choices && (
            <ChoiceChips
              choices={lastMessage.choices}
              multiSelect={lastMessage.multiSelect}
              onSelect={currentStepId === 'appointment-type' ? handleAppointmentSelect : handleAnswer}
            />
          )}

          {/* Branch cards */}
          {showBranches && (
            <div className="mb-4 ml-12">
              {filteredBranches.slice(0, 5).map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  userNeeds={selections.accessibilityNeeds}
                  onSelect={handleBranchSelect}
                  selected={selectedBranch?.id === branch.id}
                />
              ))}
              {selectedBranch && (
                <button
                  onClick={handleBranchConfirm}
                  className="w-full mt-2 py-3.5 bg-brand-yellow text-gray-900 rounded-xl text-base
                             font-semibold hover:brightness-95 transition-all cursor-pointer
                             focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2"
                >
                  Confirm: {selectedBranch.name}
                </button>
              )}
            </div>
          )}

          {/* Visit plan */}
          {showVisitPlan && (
            <div className="mb-4 ml-12">
              <VisitPlan selections={selections} />
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>

      {/* Fixed bottom input bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTextSubmit(inputValue);
          }}
          className="max-w-2xl mx-auto px-4 py-3 flex gap-2 items-center"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            disabled={showVisitPlan}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-base
                       focus:outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/30
                       text-gray-800 placeholder-gray-400 bg-gray-50
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || showVisitPlan}
            className={`
              p-3 rounded-xl transition-all
              focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:ring-offset-2
              ${
                inputValue.trim()
                  ? 'bg-brand-yellow text-gray-900 hover:brightness-95 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
            aria-label="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
