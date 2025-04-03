import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaestroHorariosComponent } from './maestro-horarios.component';

describe('MaestroHorariosComponent', () => {
  let component: MaestroHorariosComponent;
  let fixture: ComponentFixture<MaestroHorariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaestroHorariosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaestroHorariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
