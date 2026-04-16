import { Component, inject, signal, effect, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CdkDragDrop, CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';
import { BoardService } from '../../services/board.service';
import { Board, Task } from '../../models/board.model';
import { TaskModalComponent } from '../task-modal/task-modal.component';

@Component({
  selector: 'app-board-detail',
  standalone: true,
  imports: [RouterLink, TaskModalComponent, CdkDrag, CdkDropList, CdkDropListGroup],
  templateUrl: './board-detail.component.html',
  styleUrl: './board-detail.component.css',
})
export class BoardDetailComponent implements OnInit {
  private route         = inject(ActivatedRoute);
  private boardService  = inject(BoardService);

  boardId   = '';
  board: Board | undefined;
  activeTask = signal<Task | null>(null);

  // Add-list state
  addingList   = false;
  newListName  = '';

  // Add-task state (stores which list is being edited)
  addingTaskInListId: string | null = null;
  newTaskTitle = '';

  readonly today = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();
  readonly fiveDaysOut = (() => {
    const d = new Date(this.today); d.setDate(d.getDate() + 5); return d;
  })();

  constructor() {
    // Keep board in sync whenever service signal changes (new lists / tasks)
    effect(() => {
      const boards = this.boardService.boards();
      if (this.boardId) {
        this.board = boards.find(b => b.id === this.boardId);
      }
    });
  }

  ngOnInit() {
    this.boardId = this.route.snapshot.paramMap.get('id') ?? '';
    this.board   = this.boardService.boards().find(b => b.id === this.boardId);
  }

  // ── Task modal ──────────────────────────────────────────────
  openTask(task: Task)  { this.activeTask.set(task); }
  closeTask()           { this.activeTask.set(null); }

  formatDue(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // ── Add list ────────────────────────────────────────────────
  startAddList()  { this.addingList = true;  this.newListName = ''; }
  cancelAddList() { this.addingList = false; this.newListName = ''; }

  onListNameInput(e: Event) {
    this.newListName = (e.target as HTMLInputElement).value;
  }

  onListNameKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter')  this.confirmAddList();
    if (e.key === 'Escape') this.cancelAddList();
  }

  confirmAddList() {
    if (!this.newListName.trim() || !this.board) return;
    this.boardService.addList(this.board.id, this.newListName);
    this.addingList  = false;
    this.newListName = '';
  }

  // ── Add task ────────────────────────────────────────────────
  startAddTask(listId: string) {
    this.addingTaskInListId = listId;
    this.newTaskTitle = '';
  }

  cancelAddTask() {
    this.addingTaskInListId = null;
    this.newTaskTitle = '';
  }

  onTaskTitleInput(e: Event) {
    this.newTaskTitle = (e.target as HTMLInputElement).value;
  }

  onTaskTitleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter')  this.confirmAddTask();
    if (e.key === 'Escape') this.cancelAddTask();
  }

  confirmAddTask() {
    if (!this.newTaskTitle.trim() || !this.board || !this.addingTaskInListId) return;
    this.boardService.addTask(this.board.id, this.addingTaskInListId, this.newTaskTitle);
    this.newTaskTitle       = '';
    this.addingTaskInListId = null;
  }

  // ── Drag & drop ─────────────────────────────────────────────
  drop(event: CdkDragDrop<Task[]>, toListId: string) {
    if (!this.board) return;
    const fromListId =
      (event.previousContainer.element.nativeElement as HTMLElement).dataset['listId'] ?? toListId;

    this.boardService.moveTask(
      this.board.id,
      fromListId,
      toListId,
      event.previousIndex,
      event.currentIndex,
    );
  }
}
