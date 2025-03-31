
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { PlanesRepository } from '../../domain/repositories/planes/planes.repository';
import { Plan } from '../../domain/models/planes.model';

@Injectable({ providedIn: 'root' })
export class PlanService implements PlanesRepository {
  private API_URL = `${environment.API_URL}/plan`; // Adjust the endpoint as needed

  constructor(private http: HttpClient) { }

  // Get all plans
  getAll(): Observable<Plan[]> {
    return this.http.get<Plan[]>(`${this.API_URL}/getAll`);
  }

  // Create a new plan
  create(plan: Plan): Observable<Plan> {
    return this.http.post<Plan>(this.API_URL, plan);
  }

  // Update an existing plan
  update(plan: Plan): Observable<Plan> {
    const url = `${this.API_URL}/${plan.id}`; // Assuming the API uses the ID in the URL
    return this.http.put<Plan>(url, plan);
  }

  // Delete a plan
  delete(id: number): Observable<void> {
    const url = `${this.API_URL}/${id}`;
    return this.http.delete<void>(url);
  }
}
