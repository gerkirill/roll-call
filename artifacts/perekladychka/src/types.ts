export type Status = 'present' | 'duty_company' | 'duty_canteen' | 'sick' | 'absent';

export const STATUS_LABELS: Record<Status, string> = {
  present: 'Присутній',
  duty_company: 'Черговий по роті',
  duty_canteen: 'Черговий по їдальні',
  sick: 'Хворий',
  absent: 'Відсутній',
};

export const STATUS_EMOJI: Record<Status, string> = {
  present: '✅',
  duty_company: '🪖',
  duty_canteen: '🍽️',
  sick: '🤒',
  absent: '❓',
};

export type StoredStatus = Status;

export type Soldier = {
  id: string;
  lastName: string;
  firstName?: string;
  updatedAt?: string;
};

export type RollCallEntry = {
  soldierId: string;
  status: StoredStatus;
  timestamp: number;
};

export type RollCallSession = {
  id: string;
  startedAt: string;
  completedAt?: string;
  entries: RollCallEntry[];
};

export type AppData = {
  soldiers: Soldier[];
  sessions: RollCallSession[];
};
