import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RompecabezasComponent } from './rompecabezas.component';

describe('RompecabezasComponent', () => {
  let component: RompecabezasComponent;
  let fixture: ComponentFixture<RompecabezasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RompecabezasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RompecabezasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
