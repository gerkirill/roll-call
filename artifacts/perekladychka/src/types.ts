export type Status = 'present' | 'same_as_last' | 'duty_company' | 'duty_canteen' | 'sick' | 'absent';

export const STATUS_LABELS: Record<Status, string> = {
  present: 'Присутній',
  same_as_last: 'Як минулого разу',
  duty_company: 'Черговий по роті',
  duty_canteen: 'Черговий по їдальні',
  sick: 'Хворий',
  absent: 'Відсутній',
};

export const STATUS_EMOJI: Record<Status, string> = {
  present: '✅',
  same_as_last: '🔁',
  duty_company: '🪖',
  duty_canteen: '🍽️',
  sick: '🤒',
  absent: '❓',
};

export type StoredStatus = Exclude<Status, 'same_as_last'>;

export type Soldier = {
  id: string;
  lastName: string;
  firstName?: string;
  updatedAt?: string;
};

export type RollCallEntry = {
  soldierId: string;
  status: StoredStatus;
  timestamp: string;
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
