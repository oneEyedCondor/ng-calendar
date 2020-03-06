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
    display: boolean = false;
    day: Day;
    displayEventCreator: boolean = false;
    displayEventEditor: boolean = false;
    chooseEvent: IEventsOfCalendar;

    constructor(
        private calendarService: CalendarService,
        private eventBusService: EventBusService) { }

    ngOnInit(): void {
        this.eventBusService.on('SelectDay', (day: Day) => {
            this.display = true;
            this.day = day;
        });

        this.eventBusService.on('CreateEvent', (newEvent: IEventsOfCalendar) => {
            this.day.events.push(newEvent);
        });

        this.eventBusService.on('DeleteEvent', (id: number) => {
            this.day.events = this.day.events.filter(event => event.id !== id);
        });

        this.eventBusService.on('UpdateEvent', (updatedEvent: IEventsOfCalendar) => {
            console.log(updatedEvent);
            // const idx = this.day.events.findIndex(event => event.id === updatedEvent.id);
            const date1 = new Date(updatedEvent.date);

            this.day.events = this.day.events.filter(event => event.id !== updatedEvent.id);

            if (date1.getDate() === this.day.date.getDate() &&
                date1.getMonth() === this.day.date.getMonth() &&
                date1.getFullYear() === this.day.date.getFullYear() ) {

                this.day.events.push(updatedEvent);
            }
            
        });
    }

    toggleDisplay(event) {
        if(event.target.className.includes('event-control')) {
            this.display = false;
            this.displayEventCreator = false;
            this.displayEventEditor = false;
        }
    }

    toggleEventCreator() {
        this.displayEventCreator = !this.displayEventCreator;
    }
    
    toggleEventEditor(event?: IEventsOfCalendar) {
        this.chooseEvent = event ? event : null;
        this.displayEventEditor = !this.displayEventEditor;
    }

    deleteEvent(id: number): void {
        this.calendarService.deleteEvent(id).subscribe(
            (res: any) => {
                if(res.message === 'OK') {
                    this.eventBusService.emit(new EventData('DeleteEvent', id));
                }
            },
            err => {
                console.error(err);
            }
        );
    }

}
