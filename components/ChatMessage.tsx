'use client';

import { Message } from '@/lib/types';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isBot = message.role === 'bot';

  // Parse basic markdown bold **text**
  function renderContent(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
      }
      // Handle bullet points
      if (part.includes('\n')) {
        return part.split('\n').map((line, j) => {
          if (line.startsWith('• ')) {
            return (
              <span key={`${i}-${j}`} className="block ml-2 my-1">
                <span className="text-yellow-500 mr-2">•</span>
                {line.slice(2)}
              </span>
            );
          }
          return (
            <span key={`${i}-${j}`}>
              {j > 0 && <br />}
              {line}
            </span>
          );
        });
      }
      return <span key={i}>{part}</span>;
    });
  }

  if (!isBot) {
    return (
      <div className="flex justify-end mb-5" role="log">
        <div className="bg-gray-900 text-white rounded-2xl rounded-br-md px-5 py-3 max-w-[80%] text-base leading-relaxed">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-5" role="log">
      <div className="flex gap-3 max-w-[85%]">
        <div className="w-9 h-9 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-900">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-md px-5 py-4 text-base leading-relaxed text-gray-800 shadow-sm">
          {renderContent(message.content)}
        </div>
      </div>
    </div>
  );
}
