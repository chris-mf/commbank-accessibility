export interface PrototypeCard {
  id: string;
  title: string;
  hmw: string;
  href: string;
  status: 'live' | 'coming-soon';
}

export interface CardOverride {
  title: string;
  hmw: string;
}

export const DEFAULT_CARDS: PrototypeCard[] = [
  {
    id: 'proto-1',
    title: 'Branch Accessibility Assistant',
    hmw: 'How might we help customers with accessibility needs feel confident and prepared before visiting a branch?',
    href: '/branch-assistant',
    status: 'live',
  },
  {
    id: 'proto-2',
    title: 'Prototype 2',
    hmw: 'How might we...',
    href: '',
    status: 'coming-soon',
  },
  {
    id: 'proto-3',
    title: 'Prototype 3',
    hmw: 'How might we...',
    href: '',
    status: 'coming-soon',
  },
  {
    id: 'proto-4',
    title: 'Prototype 4',
    hmw: 'How might we...',
    href: '',
    status: 'coming-soon',
  },
];

export const KV_KEY = 'cards';
