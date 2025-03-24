import { Injectable } from "@angular/core";
import { DashboardRepository } from "../../domain/repositories/dashboard/dashboard.repository";
import { BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: 'root'
})

export class DashboardService implements DashboardRepository {
  constructor() { }

  private _currentTitle = new BehaviorSubject<string>('Dashboard');
  currentTitle$ = this._currentTitle.asObservable();

  setTitle(title: string): void {
    console.log('Setting title to: ', title);
    this._currentTitle.next(title);
  }

  getTitle(): string {
    return this._currentTitle.getValue();
  }
}
