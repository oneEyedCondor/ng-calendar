import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarEventControlComponent } from './calendar-event-control.component';

describe('CalendarEventControlComponent', () => {
  let component: CalendarEventControlComponent;
  let fixture: ComponentFixture<CalendarEventControlComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CalendarEventControlComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarEventControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
