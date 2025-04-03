import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JefeHorariosComponent } from './jefe-horarios.component';

describe('JefeHorariosComponent', () => {
  let component: JefeHorariosComponent;
  let fixture: ComponentFixture<JefeHorariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JefeHorariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JefeHorariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
