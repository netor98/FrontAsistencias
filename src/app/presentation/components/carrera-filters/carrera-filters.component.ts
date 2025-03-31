import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlanService } from '../../../infrastructure/admin/planes.service';
import { Plan } from '../../../domain/models/planes.model';


@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'carreras-filters',
  templateUrl: './carrera-filters.component.html',
  styleUrl: './carrera-filters.component.css'
})
export default class CarrerasFiltersComponent {
  searchTerm: string = '';
  public plans: Plan[] = [];


  constructor(private planesService: PlanService) {
    this.loadPlans();
  }

  selectedPlanIds: string[] = [];

  isDropdownOpen = false;

  @Output() filterChanged = new EventEmitter<{ search: string, plans: string[] }>();

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  loadPlans(): void {
    this.planesService.getAll().subscribe(data => {
      this.plans = data;
    });
  }

  onCheckboxChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = String(input.value);
    if (input.checked) {
      if (!this.selectedPlanIds.includes(value)) {
        this.selectedPlanIds.push(value);
      }
    } else {
      this.selectedPlanIds = this.selectedPlanIds.filter(id => id !== value);
    }
    this.onFilterChange();
  }

  isSelected(planId: string): boolean {
    return this.selectedPlanIds.includes(planId);
  }

  selectedPlans(): string[] {
    return this.selectedPlanIds;
  }

  // Para mostrar un resumen de los planes seleccionados
  formatSelectedPlans(): string {
    return this.plans
      .filter(plan => this.selectedPlanIds.includes((plan.clave)))
      .map(plan => plan.clave)
      .join(', ');
  }

  onFilterChange(): void {
    this.filterChanged.emit({
      search: this.searchTerm,
      plans: this.selectedPlanIds
    });
  }
}
