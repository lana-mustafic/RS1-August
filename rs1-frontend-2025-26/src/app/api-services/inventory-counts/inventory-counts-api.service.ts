import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { buildHttpParams } from '../../core/models/build-http-params';
import {
  ListInventoryCountsRequest,
  ListInventoryCountsResponse,
} from './inventory-counts-api.models';

@Injectable({ providedIn: 'root' })
export class InventoryCountsApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/InventoryCounts`;

  list(request: ListInventoryCountsRequest): Observable<ListInventoryCountsResponse> {
    return this.http.get<ListInventoryCountsResponse>(this.baseUrl, {
      params: buildHttpParams(request as any),
    });
  }
}
