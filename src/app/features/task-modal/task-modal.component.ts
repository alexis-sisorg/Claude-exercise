import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Task, Comment } from '../../models/board.model';
import { CommentService } from '../../services/comment.service';
import { relativeTime } from '../../utils/relative-time';

@Component({
  selector: 'app-task-modal',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './task-modal.component.html',
  styleUrl: './task-modal.component.css',
})
export class TaskModalComponent implements OnInit {
  @Input({ required: true }) task!: Task;
  @Output() closeModal = new EventEmitter<void>();

  private commentService = inject(CommentService);

  // Hardcoded to Alex Rivera (first seeded user)
  private readonly currentUserId = 'cmo1eun1q0002u8xiaxgzh0f0';

  comments: Comment[] = [];
  newText = '';
  loading = true;
  submitting = false;

  ngOnInit() {
    this.commentService.getComments(this.task.id).subscribe({
      next: (data) => {
        this.comments = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  relativeTime = relativeTime;

  getInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  submit() {
    const text = this.newText.trim();
    if (!text || this.submitting) return;

    this.submitting = true;
    this.commentService.postComment(this.task.id, text, this.currentUserId).subscribe({
      next: (comment) => {
        this.comments = [comment, ...this.comments];
        this.newText = '';
        this.submitting = false;
      },
      error: () => {
        this.submitting = false;
      },
    });
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
      this.submit();
    }
  }

  onInput(event: Event) {
    this.newText = (event.target as HTMLTextAreaElement).value;
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal.emit();
    }
  }
}
