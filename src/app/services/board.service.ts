import { Injectable, signal } from '@angular/core';
import { Board, BoardStats, Task } from '../models/board.model';

function daysFromToday(offset: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  d.setHours(0, 0, 0, 0);
  return d;
}

const MOCK_BOARDS: Board[] = [
  {
    id: 'b1',
    name: 'Product Roadmap',
    accentColor: 'var(--accent-indigo)',
    lists: [
      {
        id: 'l1', name: 'Backlog',
        tasks: [
          { id: 't1', title: 'Define MVP scope',        dueDate: daysFromToday(-10) },
          { id: 't2', title: 'Stakeholder interviews',  dueDate: daysFromToday(-3) },
          { id: 't3', title: 'Competitor analysis',     dueDate: daysFromToday(2) },
        ]
      },
      {
        id: 'l2', name: 'In Progress',
        tasks: [
          { id: 't4', title: 'Design system setup',     dueDate: daysFromToday(0) },
          { id: 't5', title: 'API contracts',           dueDate: daysFromToday(4) },
        ]
      },
      {
        id: 'l3', name: 'Review',
        tasks: [
          { id: 't6', title: 'Security audit',          dueDate: null },
          { id: 't7', title: 'Load testing',            dueDate: daysFromToday(10) },
        ]
      },
      {
        id: 'l4', name: 'Done',
        tasks: [
          { id: 't8', title: 'Project kickoff',         dueDate: daysFromToday(-30) },
          { id: 't9', title: 'Team onboarding',         dueDate: null },
        ]
      }
    ]
  },
  {
    id: 'b2',
    name: 'Marketing Campaign',
    accentColor: 'var(--accent-cyan)',
    lists: [
      {
        id: 'l5', name: 'Ideas',
        tasks: [
          { id: 't10', title: 'Social media calendar',  dueDate: daysFromToday(1) },
          { id: 't11', title: 'Blog post drafts',       dueDate: daysFromToday(3) },
          { id: 't12', title: 'Email sequences',        dueDate: daysFromToday(-1) },
        ]
      },
      {
        id: 'l6', name: 'Executing',
        tasks: [
          { id: 't13', title: 'Ad creative review',     dueDate: daysFromToday(5) },
          { id: 't14', title: 'Landing page copy',      dueDate: daysFromToday(-5) },
          { id: 't15', title: 'A/B test setup',         dueDate: null },
        ]
      }
    ]
  },
  {
    id: 'b3',
    name: 'Engineering Sprint 12',
    accentColor: 'var(--accent-green)',
    lists: [
      {
        id: 'l7', name: 'To Do',
        tasks: [
          { id: 't16', title: 'Auth service refactor',       dueDate: daysFromToday(2) },
          { id: 't17', title: 'DB migrations',               dueDate: daysFromToday(-2) },
        ]
      },
      {
        id: 'l8', name: 'In Progress',
        tasks: [
          { id: 't18', title: 'CI pipeline fix',             dueDate: daysFromToday(0) },
          { id: 't19', title: 'Unit test coverage',          dueDate: daysFromToday(4) },
          { id: 't20', title: 'Docker image optimization',   dueDate: daysFromToday(6) },
        ]
      },
      {
        id: 'l9', name: 'Done',
        tasks: [
          { id: 't21', title: 'PR review automation',        dueDate: null },
          { id: 't22', title: 'Dependency updates',          dueDate: daysFromToday(-15) },
        ]
      }
    ]
  }
];

@Injectable({ providedIn: 'root' })
export class BoardService {

  private _boards = signal<Board[]>(MOCK_BOARDS);
  readonly boards = this._boards.asReadonly();

  getBoards(): Board[] {
    return this._boards();
  }

  createBoard(name: string, accentColor: string): Board {
    const newBoard: Board = {
      id: 'b' + Date.now(),
      name: name.trim(),
      accentColor,
      lists: [],
    };
    this._boards.update(list => [...list, newBoard]);
    return newBoard;
  }

  addList(boardId: string, listName: string): void {
    const newList = {
      id: 'l' + Date.now(),
      name: listName.trim(),
      tasks: [],
    };
    this._boards.update(boards =>
      boards.map(b => b.id === boardId
        ? { ...b, lists: [...b.lists, newList] }
        : b
      )
    );
  }

  addTask(boardId: string, listId: string, title: string): void {
    const newTask = {
      id: 't' + Date.now(),
      title: title.trim(),
      dueDate: null,
    };
    this._boards.update(boards =>
      boards.map(b => b.id === boardId
        ? {
            ...b,
            lists: b.lists.map(l => l.id === listId
              ? { ...l, tasks: [...l.tasks, newTask] }
              : l
            )
          }
        : b
      )
    );
  }

  moveTask(
    boardId: string,
    fromListId: string, toListId: string,
    fromIndex: number, toIndex: number
  ): void {
    this._boards.update(boards =>
      boards.map(b => {
        if (b.id !== boardId) return b;

        // Pull task from source list
        const fromList = b.lists.find(l => l.id === fromListId)!;
        const task: Task = fromList.tasks[fromIndex];

        return {
          ...b,
          lists: b.lists.map(l => {
            if (l.id === fromListId && l.id === toListId) {
              // Same list — reorder
              const tasks = [...l.tasks];
              tasks.splice(fromIndex, 1);
              tasks.splice(toIndex, 0, task);
              return { ...l, tasks };
            }
            if (l.id === fromListId) {
              return { ...l, tasks: l.tasks.filter((_, i) => i !== fromIndex) };
            }
            if (l.id === toListId) {
              const tasks = [...l.tasks];
              tasks.splice(toIndex, 0, task);
              return { ...l, tasks };
            }
            return l;
          }),
        };
      })
    );
  }

  getBoardStats(board: Board): BoardStats {
    const today = this.todayMidnight();
    const fiveDaysOut = new Date(today);
    fiveDaysOut.setDate(fiveDaysOut.getDate() + 5);

    let totalTasks = 0;
    let pastDue = 0;
    let dueSoon = 0;

    for (const list of board.lists) {
      totalTasks += list.tasks.length;
      for (const task of list.tasks) {
        if (task.dueDate === null) continue;
        const due = this.stripTime(task.dueDate);
        if (due < today) {
          pastDue++;
        } else if (due <= fiveDaysOut) {
          dueSoon++;
        }
      }
    }

    return { lists: board.lists.length, totalTasks, pastDue, dueSoon };
  }

  private todayMidnight(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private stripTime(date: Date): Date {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  }
}
