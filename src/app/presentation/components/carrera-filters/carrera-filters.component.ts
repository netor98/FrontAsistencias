import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Plan {
  id: number;
  name: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'carreras-filters',
  templateUrl: './carrera-filters.component.html',
  styleUrl: './carrera-filters.component.css'
})
export default class CarrerasFiltersComponent {
  searchTerm: string = '';

  plans: Plan[] = [
    { id: 2019, name: 'Plan 2019' },
    { id: 2020, name: 'Plan 2020' },
    { id: 2021, name: 'Plan 2021' }
  ];

  // Array que contiene los IDs seleccionados
  selectedPlanIds: number[] = [];

  // Control para abrir/cerrar el dropdown
  isDropdownOpen = false;

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  onCheckboxChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);
    if (input.checked) {
      if (!this.selectedPlanIds.includes(value)) {
        this.selectedPlanIds.push(value);
      }
    } else {
      this.selectedPlanIds = this.selectedPlanIds.filter(id => id !== value);
    }
  }

  isSelected(planId: number): boolean {
    return this.selectedPlanIds.includes(planId);
  }

  selectedPlans(): number[] {
    return this.selectedPlanIds;
  }

  // Para mostrar un resumen de los planes seleccionados
  formatSelectedPlans(): string {
    return this.plans
      .filter(plan => this.selectedPlanIds.includes(plan.id))
      .map(plan => plan.name)
      .join(', ');
  }
}
