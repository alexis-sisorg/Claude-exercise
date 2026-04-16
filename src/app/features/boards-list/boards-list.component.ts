import { Component, inject, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BoardService } from '../../services/board.service';
import { Board, BoardStats } from '../../models/board.model';

@Component({
  selector: 'app-boards-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './boards-list.component.html',
  styleUrl: './boards-list.component.css'
})
export class BoardsListComponent {
  private boardService = inject(BoardService);

  boards: Board[] = this.boardService.boards();
  searchTerm = '';

  constructor() {
    // Sync with service signal so new boards appear reactively
    effect(() => {
      this.boards = this.boardService.boards();
    });
  }

  get filteredBoards(): Board[] {
    const q = this.searchTerm.trim().toLowerCase();
    return q
      ? this.boards.filter(b => b.name.toLowerCase().includes(q))
      : this.boards;
  }

  get totalTasks(): number {
    return this.boards.reduce((sum, b) => sum + this.getStats(b).totalTasks, 0);
  }

  get totalOverdue(): number {
    return this.boards.reduce((sum, b) => sum + this.getStats(b).pastDue, 0);
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  getStats(board: Board): BoardStats {
    return this.boardService.getBoardStats(board);
  }
}
