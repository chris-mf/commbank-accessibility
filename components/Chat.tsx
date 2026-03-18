'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Stage, Message, UserSelections, Branch } from '@/lib/types';
import {
  getInitialMessages,
  getNextBotMessage,
  getStepSelectionKey,
  getCurrentStage,
  getAccessibilityAcknowledgement,
} from '@/lib/flow';
import { filterAndRankBranches } from '@/lib/branches';
import ProgressBar from './ProgressBar';
import ChatMessage from './ChatMessage';
import ChoiceChips from './ChoiceChips';
import TextInput from './TextInput';
import BranchCard from './BranchCard';
import VisitPlan from './VisitPlan';

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>(getInitialMessages);
  const [currentStepId, setCurrentStepId] = useState('welcome');
  const [currentStage, setCurrentStage] = useState<Stage>(Stage.TASK);
  const [selections, setSelections] = useState<UserSelections>({ accessibilityNeeds: [] });
  const [showBranches, setShowBranches] = useState(false);
  const [filteredBranches, setFilteredBranches] = useState<Branch[]>([]);
  const [showVisitPlan, setShowVisitPlan] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, showBranches, showVisitPlan, scrollToBottom]);

  function addMessage(msg: Message) {
    setMessages((prev) => [...prev, msg]);
  }

  function addBotMessageDelayed(msg: Message, delay = 600) {
    setTimeout(() => {
      setMessages((prev) => [...prev, msg]);
    }, delay);
  }

  function handleAnswer(answer: string | string[]) {
    // Record the user's answer
    const selectionKey = getStepSelectionKey(currentStepId);
    const newSelections = { ...selections };

    if (selectionKey) {
      if (Array.isArray(answer)) {
        (newSelections as Record<string, unknown>)[selectionKey] = answer;
      } else {
        (newSelections as Record<string, unknown>)[selectionKey] = answer;
      }
    }
    setSelections(newSelections);

    // Show user message
    const displayText = Array.isArray(answer)
      ? answer
          .map((a) => {
            const lastMsg = messages[messages.length - 1];
            return lastMsg?.choices?.find((c) => c.id === a)?.label || a;
          })
          .join(', ')
      : messages[messages.length - 1]?.choices?.find((c) => c.id === answer)?.label || answer;

    addMessage({
      id: `user-${Date.now()}`,
      role: 'user',
      content: displayText,
      type: 'text',
    });

    // Check for accessibility acknowledgement after stage 2
    if (currentStepId === 'accessibility-needs') {
      const needs = Array.isArray(answer) ? answer : [answer];
      const ack = getAccessibilityAcknowledgement(needs);
      if (ack) {
        addBotMessageDelayed({
          id: `ack-${Date.now()}`,
          role: 'bot',
          content: ack,
          type: 'text',
          stage: Stage.ACCESSIBILITY,
        }, 400);
      }
    }

    // Get next step
    const baseDelay = currentStepId === 'accessibility-needs' && getAccessibilityAcknowledgement(
      Array.isArray(answer) ? answer : [answer]
    ) ? 1200 : 600;

    setTimeout(() => {
      const next = getNextBotMessage(currentStepId, newSelections);
      if (next) {
        setCurrentStepId(next.stepId);
        setCurrentStage(getCurrentStage(next.stepId));
        addMessage(next.message);
      } else {
        // Flow complete — show branch finder
        triggerBranchFinder(newSelections);
      }
    }, baseDelay);
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

    // Ask about appointment
    setTimeout(() => {
      addMessage({
        id: `appt-${Date.now()}`,
        role: 'bot',
        content: `Great choice! ${selectedBranch.name} is a good match for your needs.\n\nWould you like to book an appointment, or would you prefer to walk in?`,
        type: 'choices',
        choices: [
          { id: 'book', label: 'Book an appointment (call branch)' },
          { id: 'walk-in', label: "I'll walk in" },
        ],
        stage: Stage.BRANCH_FINDER,
      });
      setCurrentStepId('appointment-type');
    }, 600);
  }

  function handleAppointmentSelect(answer: string | string[]) {
    const apptType = Array.isArray(answer) ? answer[0] : answer;
    const finalSelections = { ...selections, appointmentType: apptType };
    setSelections(finalSelections);

    const label = apptType === 'book' ? 'Book an appointment' : "I'll walk in";
    addMessage({
      id: `user-appt-${Date.now()}`,
      role: 'user',
      content: label,
      type: 'text',
    });

    // Show visit plan
    setTimeout(() => {
      setCurrentStage(Stage.VISIT_PLAN);
      addMessage({
        id: `plan-intro-${Date.now()}`,
        role: 'bot',
        content: "Here's your personalised branch visit plan. You can print it or save it for reference.",
        type: 'text',
        stage: Stage.VISIT_PLAN,
      });
      setTimeout(() => setShowVisitPlan(true), 400);
    }, 600);
  }

  // Determine the current interactive element
  const lastMessage = messages[messages.length - 1];
  const isAwaitingInput = lastMessage?.role === 'bot' && !showBranches && !showVisitPlan;

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <ProgressBar currentStage={currentStage} />

      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6" role="log" aria-live="polite" aria-label="Chat messages">
          {messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {/* Choice chips for current question */}
          {isAwaitingInput && lastMessage.type === 'choices' && lastMessage.choices && (
            <ChoiceChips
              choices={lastMessage.choices}
              multiSelect={lastMessage.multiSelect}
              onSelect={currentStepId === 'appointment-type' ? handleAppointmentSelect : handleAnswer}
            />
          )}

          {/* Text input */}
          {isAwaitingInput && lastMessage.type === 'text-input' && (
            <TextInput
              placeholder={lastMessage.inputPlaceholder}
              onSubmit={(val) => handleAnswer(val)}
            />
          )}

          {/* Branch cards */}
          {showBranches && (
            <div className="mb-4 ml-10.5">
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
                  className="w-full mt-2 py-3.5 bg-yellow-400 text-gray-900 rounded-xl text-base
                             font-semibold hover:bg-yellow-500 transition-colors cursor-pointer
                             focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2"
                >
                  Confirm: {selectedBranch.name}
                </button>
              )}
            </div>
          )}

          {/* Visit plan */}
          {showVisitPlan && (
            <div className="mb-4 ml-10.5">
              <VisitPlan selections={selections} />
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>
    </div>
  );
}
