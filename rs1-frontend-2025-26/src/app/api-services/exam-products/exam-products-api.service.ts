import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ExamProductLookupItem } from './exam-products-api.models';

@Injectable({ providedIn: 'root' })
export class ExamProductsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/ExamProducts`;

  lookup(): Observable<ExamProductLookupItem[]> {
    return this.http.get<ExamProductLookupItem[]>(`${this.baseUrl}/lookup`);
  }
}
