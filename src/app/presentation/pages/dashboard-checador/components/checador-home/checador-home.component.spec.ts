import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChecadorHomeComponent } from './checador-home.component';

describe('ChecadorHomeComponent', () => {
  let component: ChecadorHomeComponent;
  let fixture: ComponentFixture<ChecadorHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChecadorHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChecadorHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
