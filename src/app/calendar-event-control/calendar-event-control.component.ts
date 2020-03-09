import { Component, OnInit, OnDestroy } from '@angular/core';
import { CalendarService, IEventsOfCalendar } from '../calendar.service';
import { EventBusService, EventData } from '../event-bus.service';
import { Subscription } from 'rxjs';
import { Day } from '../calendar/calendar.component';

@Component({
    selector: 'app-calendar-event-control',
    templateUrl: './calendar-event-control.component.html',
    styleUrls: ['./calendar-event-control.component.scss']
})
export class CalendarEventControlComponent implements OnInit, OnDestroy {
    day: Day;
    chooseEvent: IEventsOfCalendar;
    display: boolean = false;
    displayEventCreator: boolean = false;
    hideCreateEventBtn: boolean = true;
    private subscription: Subscription = new Subscription();

    constructor(
        private calendarService: CalendarService,
        private eventBusService: EventBusService) { }

    ngOnInit(): void {
        const sub1 = this.eventBusService.on('SelectDay', (day: Day) => {
            this.day = day;
            this.display = true;
            this.hideCreateEventBtn = true;
            
            if(day.date > new Date() || this.datesIsMatch(day.date)) {
                this.hideCreateEventBtn = false;
            }
        });

        const sub2 = this.eventBusService.on('CreateEvent', (newEvent: IEventsOfCalendar) => {
            this.day.events.push(newEvent);
        });
        
        const sub3 = this.eventBusService.on('UpdateEvent', (updatedEvent: IEventsOfCalendar) => {
            const match = this.datesIsMatch(new Date(updatedEvent.date), new Date(this.day.date));
            if(match) {
                this.day.events = this.day.events.map(
                    event => (event.id !== updatedEvent.id)? event: updatedEvent
                );
            } else {
                this.day.events = this.day.events.filter(event => event.id !== updatedEvent.id);
            }
        });

        this.subscription.add(sub1).add(sub2).add(sub3);
    }
    
    ngOnDestroy(): void {
        this.subscription.unsubscribe();
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

    datesIsMatch(date1, date2=new Date()): boolean {
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
