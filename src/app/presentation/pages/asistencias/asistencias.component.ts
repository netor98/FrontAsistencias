import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);


@Component({
  selector: 'app-asistencias',
  imports: [],
  templateUrl: './asistencias.component.html',
  styleUrl: './asistencias.component.css'
})
export class AsistenciasComponent implements AfterViewInit {
  @ViewChild('teacherChart') teacherChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('chiefChart') chiefChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('checkerChart') checkerChartRef!: ElementRef<HTMLCanvasElement>;

  teacherChart!: Chart;
  chiefChart!: Chart;
  checkerChart!: Chart;

  // Fake data samples for each chart
  fakeLabels = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  teacherData = [90, 85, 100, 95, 80];       // Example percentages
  chiefData = [88, 82, 96, 90, 85];
  checkerData = [92, 88, 94, 89, 91];

  ngAfterViewInit(): void {
    this.initTeacherChart();
    this.initChiefChart();
    this.initCheckerChart();
  }

  initTeacherChart(): void {
    this.teacherChart = new Chart(this.teacherChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.fakeLabels,
        datasets: [{
          label: 'Registro Profesor (%)',
          data: this.teacherData,
          backgroundColor: 'rgba(34, 197, 94, 0.6)',  // green-500
          borderColor: 'rgba(34, 197, 94, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Registro Profesor'
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  initChiefChart(): void {
    this.chiefChart = new Chart(this.chiefChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.fakeLabels,
        datasets: [{
          label: 'Registro Jefe Grupo (%)',
          data: this.chiefData,
          backgroundColor: 'rgba(59, 130, 246, 0.3)',  // blue-500
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Registro Jefe de Grupo'
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }

  initCheckerChart(): void {
    this.checkerChart = new Chart(this.checkerChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.fakeLabels,
        datasets: [{
          label: 'Registro Checador (%)',
          data: this.checkerData,
          backgroundColor: [
            'rgba(234, 88, 12, 0.6)',   // orange-600
            'rgba(234, 88, 12, 0.6)',
            'rgba(234, 88, 12, 0.6)',
            'rgba(234, 88, 12, 0.6)',
            'rgba(234, 88, 12, 0.6)'
          ],
          borderColor: [
            'rgba(234, 88, 12, 1)',
            'rgba(234, 88, 12, 1)',
            'rgba(234, 88, 12, 1)',
            'rgba(234, 88, 12, 1)',
            'rgba(234, 88, 12, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Registro Checador'
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

}
