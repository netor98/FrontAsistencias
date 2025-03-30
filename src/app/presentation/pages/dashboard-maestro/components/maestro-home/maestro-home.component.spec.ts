import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MaestroHomeComponent } from './maestro-home.component';

describe('MaestroHomeComponent', () => {
  let component: MaestroHomeComponent;
  let fixture: ComponentFixture<MaestroHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaestroHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MaestroHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
