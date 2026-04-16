export interface Task {
  id: string;
  title: string;
  dueDate: Date | null;
}

export interface CommentUser {
  id: string;
  name: string;
}

export interface Comment {
  id: string;
  text: string;
  createdAt: string;
  cardId: string;
  userId: string;
  user: CommentUser;
}

export interface List {
  id: string;
  name: string;
  tasks: Task[];
}

export interface Board {
  id: string;
  name: string;
  accentColor: string;
  lists: List[];
}

export interface BoardStats {
  lists: number;
  totalTasks: number;
  pastDue: number;
  dueSoon: number;
}
