import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JefeHomeComponent } from './jefe-home.component';

describe('JefeHomeComponent', () => {
  let component: JefeHomeComponent;
  let fixture: ComponentFixture<JefeHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JefeHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JefeHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
