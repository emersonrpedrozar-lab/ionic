import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpProvider } from '../shared/providers/http.provider';
import { NewsResponse } from '../models/news.model';

@Injectable({ providedIn: 'root' })
export class NewsService {
  private readonly base = environment.newsApiBase; // "https://newsapi.org/v2"

  constructor(private http: HttpProvider) {}

  topHeadlines(params: { country?: string; category?: string; page?: number; pageSize?: number } = {}): Observable<NewsResponse> {
    const { country = 'us', category = 'general', page = 1, pageSize = 20 } = params;
    const url = `${this.base}/top-headlines?country=${country}&category=${category}&page=${page}&pageSize=${pageSize}`;
    return this.http.get<NewsResponse>(url);
  }

  everything(params: { q: string; sortBy?: 'publishedAt'|'relevancy'|'popularity'; page?: number; pageSize?: number }): Observable<NewsResponse> {
    const { q, sortBy = 'publishedAt', page = 1, pageSize = 20 } = params;
    const url = `${this.base}/everything?q=${encodeURIComponent(q)}&sortBy=${sortBy}&page=${page}&pageSize=${pageSize}`;
    return this.http.get<NewsResponse>(url);
  }

  sources(category: string = 'general', language: string = 'en', country: string = 'us'): Observable<any> {
    const url = `${this.base}/sources?category=${category}&language=${language}&country=${country}`;
    return this.http.get<any>(url);
  }
}
