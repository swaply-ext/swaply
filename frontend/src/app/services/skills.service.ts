import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import {map} from 'rxjs/operators';
import { SKIP_LOADING } from '../interceptors/loading.interceptor';

export interface SkillInput {
  id: string;
  level: number;
}

export interface SkillsModel {
  id: string;
  name: string;
  icon: string;
  category: string;
}

export interface SkillDisplay extends SkillsModel {
  level: number;
}

@Injectable({
  providedIn: 'root'
})
export class SkillsService {
  private apiUrl = '/skills';
  constructor(private http: HttpClient) { }



  getSkillDisplay(input: SkillInput): Observable<SkillDisplay> {
    return this.http.get<SkillsModel>(`${this.apiUrl}/${input.id}`).pipe(
      map((skill: SkillsModel) => {
        return {
          ...skill,
          level: input.level
        } as SkillDisplay;
      })
    );
  }

  getAllSkills(): Observable<SkillsModel[]> {
    return this.http.get<SkillsModel[]>(this.apiUrl);
  }

  searchSkills(query: string): Observable<SkillsModel[]> {
    if (!query || !query.trim()) {
      return of([]);
    }

    const params = new HttpParams().set('query', query);

    return this.http.get<SkillsModel[]>(
      this.apiUrl,
      {
        params,
        context: new HttpContext().set(SKIP_LOADING, true)
      }
    );
  }
}
