export interface User {
  id: string;
  name: string;
  role: string;
  avatar: string;
  isMuted: boolean;
  isSpeaking: boolean;
}

export interface Meeting {
  id: string;
  title: string;
  time: string;
  participants: User[];
  status: string;
}

export interface AICommand {
  command: string;
  response: string;
}

export const USERS: User[] = [
  {
    id: 'u1',
    name: 'Alex Morgan',
    role: 'Product Lead',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwwfHx8fDE3NjQyMjAwNTB8MA&ixlib=rb-4.1.0&q=85',
    isMuted: false,
    isSpeaking: true,
  },
  {
    id: 'u2',
    name: 'Sarah Chen',
    role: 'Engineering Manager',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwzfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwwfHx8fDE3NjQyMjAwNTB8MA&ixlib=rb-4.1.0&q=85',
    isMuted: true,
    isSpeaking: false,
  },
  {
    id: 'u3',
    name: 'Marcus Johnson',
    role: 'UX Designer',
    avatar: 'https://images.unsplash.com/photo-1629425733761-caae3b5f2e50?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHwyfHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwwfHx8fDE3NjQyMjAwNTB8MA&ixlib=rb-4.1.0&q=85',
    isMuted: false,
    isSpeaking: false,
  },
  {
    id: 'u4',
    name: 'Emily Davis',
    role: 'Marketing',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDQ2NDN8MHwxfHNlYXJjaHw0fHxwcm9mZXNzaW9uYWwlMjBoZWFkc2hvdHxlbnwwfHx8fDE3NjQyMjAwNTB8MA&ixlib=rb-4.1.0&q=85',
    isMuted: false,
    isSpeaking: false,
  }
];

export const MEETINGS: Meeting[] = [
  {
    id: 'm1',
    title: 'Q3 Product Roadmap Review',
    time: '10:00 AM - 11:00 AM',
    participants: [USERS[0], USERS[1], USERS[2]],
    status: 'Live Now'
  },
  {
    id: 'm2',
    title: 'Design Sync: Mobile App',
    time: '1:00 PM - 2:00 PM',
    participants: [USERS[2], USERS[3]],
    status: 'Upcoming'
  },
  {
    id: 'm3',
    title: 'Weekly All-Hands',
    time: '4:00 PM - 5:00 PM',
    participants: USERS,
    status: 'Upcoming'
  }
];

export const AI_COMMANDS: AICommand[] = [
  { command: "Summarize discussion", response: "Here's a summary of the last 15 minutes:\n• Alex proposed the new Q3 timeline.\n• Sarah raised concerns about backend latency.\n• Marcus suggested a phased rollout for the UI update." },
  { command: "Action items", response: "Action Items Detected:\n1. Sarah to benchmark API performance by Friday.\n2. Marcus to update Figma prototypes." },
  { command: "Record meeting", response: "Recording started. I will notify all participants." }
];
