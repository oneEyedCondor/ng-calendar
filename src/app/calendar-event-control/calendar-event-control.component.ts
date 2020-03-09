import { Component, OnInit } from '@angular/core';
import { CalendarService, IEventsOfCalendar } from '../calendar.service';
import { EventBusService, EventData } from '../event-bus.service';
import { Day } from '../calendar/calendar.component';

@Component({
    selector: 'app-calendar-event-control',
    templateUrl: './calendar-event-control.component.html',
    styleUrls: ['./calendar-event-control.component.scss']
})
export class CalendarEventControlComponent implements OnInit {
    day: Day;
    chooseEvent: IEventsOfCalendar;
    display: boolean = false;
    displayEventCreator: boolean = false;

    constructor(
        private calendarService: CalendarService,
        private eventBusService: EventBusService) { }

    ngOnInit(): void {
        this.eventBusService.on('SelectDay', (day: Day) => {
            this.day = day;
            this.display = true;
        });

        this.eventBusService.on('CreateEvent', (newEvent: IEventsOfCalendar) => {
            this.day.events.push(newEvent);
        });
        
        this.eventBusService.on('UpdateEvent', (updatedEvent: IEventsOfCalendar) => {
            const match = this.datesIsMatch(new Date(updatedEvent.date), new Date(this.day.date));
            if(match) {
                this.day.events = this.day.events.map(
                    event => (event.id !== updatedEvent.id)? event: updatedEvent
                );
            } else {
                this.day.events = this.day.events.filter(event => event.id !== updatedEvent.id);
            }
        });
    }

    toggleDisplay(event) {
        if(event.target.className === 'event-control') {
            this.display = false;
            this.displayEventCreator = false;
            this.chooseEvent = null;
        }
    }

    toggleEventCreator() {
        this.displayEventCreator = !this.displayEventCreator;
    }
    
    toggleEventEditor(event?: IEventsOfCalendar) {
        this.chooseEvent = event ? event : null;
    }

    datesIsMatch(date1, date2): boolean {
        return (
            date1.getDate() === date2.getDate() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        ) 
        ? true
        : false;
    }

    deleteEvent(id: number): void {
        this.calendarService.deleteEvent(id).subscribe(
            (res: any) => {
                if(res.message === 'OK') {
                    this.eventBusService.emit(new EventData('DeleteEvent', id));
                    this.day.events = this.day.events.filter(event => event.id !== id);
                }
            },
            err => console.error(err)
        );
    }

}
