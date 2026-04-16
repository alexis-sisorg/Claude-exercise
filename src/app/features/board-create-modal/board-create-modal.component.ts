import { Component, Output, EventEmitter, inject } from '@angular/core';
import { BoardService } from '../../services/board.service';
import { Board } from '../../models/board.model';

const ACCENT_OPTIONS = [
  { label: 'Indigo',  value: '#6366F1' },
  { label: 'Cyan',    value: '#22D3EE' },
  { label: 'Green',   value: '#22C55E' },
  { label: 'Purple',  value: '#A855F7' },
  { label: 'Orange',  value: '#F97316' },
  { label: 'Blue',    value: '#3B82F6' },
];

@Component({
  selector: 'app-board-create-modal',
  standalone: true,
  templateUrl: './board-create-modal.component.html',
  styleUrl: './board-create-modal.component.css',
})
export class BoardCreateModalComponent {
  private boardService = inject(BoardService);

  @Output() closeModal    = new EventEmitter<void>();
  @Output() boardCreated  = new EventEmitter<Board>();

  name          = '';
  selectedColor = ACCENT_OPTIONS[0].value;
  readonly accentOptions = ACCENT_OPTIONS;

  get canCreate(): boolean {
    return this.name.trim().length > 0;
  }

  onInput(event: Event) {
    this.name = (event.target as HTMLInputElement).value;
  }

  selectColor(value: string) {
    this.selectedColor = value;
  }

  create() {
    if (!this.canCreate) return;
    const board = this.boardService.createBoard(this.name, this.selectedColor);
    this.boardCreated.emit(board);
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal.emit();
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') this.closeModal.emit();
    if (event.key === 'Enter' && this.canCreate) this.create();
  }
}
