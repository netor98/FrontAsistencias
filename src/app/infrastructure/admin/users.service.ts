import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment.development";
import { Observable } from "rxjs";
import { UserRepository } from "@domain/repositories/user/user.repository";
import { User } from "@domain/models/user.model";

@Injectable({ providedIn: 'root' })
export class UserService implements UserRepository {
  private API_URL = environment.API_URL;

  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${this.API_URL}/users`);
  }

  getById(id: string): Observable<User> {
    return this.http.get<User>(`${this.API_URL}/users/${id}`);
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(`${this.API_URL}/users/register`, user);
  }

  update(id: string, user: User): Observable<User> {
    return this.http.patch<User>(`${this.API_URL}/users/${id}`, user);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/users/${id}`);
  }

  login(username: string, password: string): Observable<{user: User, token: string}> {
    return this.http.post<{user: User, token: string}>(`${this.API_URL}/users/login`, {
      user: username,
      password: password
    });
  }
} 