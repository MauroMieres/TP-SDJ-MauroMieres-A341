import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardJuegoComponent } from './card-juego.component';

describe('CardJuegoComponent', () => {
  let component: CardJuegoComponent;
  let fixture: ComponentFixture<CardJuegoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardJuegoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardJuegoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
