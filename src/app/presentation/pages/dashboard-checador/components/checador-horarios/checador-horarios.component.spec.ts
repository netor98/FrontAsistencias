import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecadorHorariosComponent } from './checador-horarios.component';

describe('ChecadorHorariosComponent', () => {
  let component: ChecadorHorariosComponent;
  let fixture: ComponentFixture<ChecadorHorariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChecadorHorariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChecadorHorariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
