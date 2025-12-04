import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {map} from 'rxjs/operators';

interface SkillInput {
  id: string;
  level: number;
}

interface SkillsModel {
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
  private apiUrl = 'http://localhost:8081/api/skills';
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
}
