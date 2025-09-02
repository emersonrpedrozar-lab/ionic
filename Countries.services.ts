import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { HttpProvider } from '../shared/providers/http.provider';
import { Country } from '../models/user.model';

interface CountriesNowResponse {
  error: boolean;
  msg: string;
  data: Array<{ name: string; unicodeFlag: string }>;
}

@Injectable({ providedIn: 'root' })
export class CountriesService {
  constructor(private http: HttpProvider) {}

  list(): Observable<Country[]> {
    return this.http.get<CountriesNowResponse>(environment.countriesApi).pipe(
      map(res => (res?.data || []).map(item => ({
        id: item.name,
        value: `${item.unicodeFlag} ${item.name}`
      })))
    );
  }
}
