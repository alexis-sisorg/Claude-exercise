import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Comment } from '../models/board.model';

const API_BASE = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private http = inject(HttpClient);

  getComments(cardId: string): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${API_BASE}/cards/${cardId}/comments`);
  }

  postComment(cardId: string, text: string, userId: string): Observable<Comment> {
    return this.http.post<Comment>(`${API_BASE}/cards/${cardId}/comments`, {
      text,
      userId,
    });
  }
}
