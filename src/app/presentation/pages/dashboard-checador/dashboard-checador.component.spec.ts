import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashboardChecadorComponent } from './dashboard-checador.component';

describe('DashboardChecadorComponent', () => {
  let component: DashboardChecadorComponent;
  let fixture: ComponentFixture<DashboardChecadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardChecadorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardChecadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
