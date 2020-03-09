import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CalendarService, IEventsOfCalendar } from '../calendar.service';
import { EventBusService, EventData } from '../event-bus.service';
import { Subscription } from 'rxjs';

export interface Day {
    date: Date;
    events: Array<IEventsOfCalendar>;
}

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit, OnDestroy {
    dateOfCalendar: Date;
    events: Array<IEventsOfCalendar> = [];
    month: Array<Day> = [];
    offset: any = { display: 'none' };
    private subscription: Subscription = new Subscription();

    constructor(
        private calendarService: CalendarService,
        private eventBusService: EventBusService) {

        this.dateOfCalendar = new Date();
        this.dateOfCalendar.setDate(1);
    }

    ngOnInit(): void {
        this.getEvents()

        const sub1 = this.eventBusService.on('CreateEvent', (newEvent: IEventsOfCalendar) => {
            this.events.push(newEvent);
            this.addEventsToMonth();
        });

        const sub2 = this.eventBusService.on('UpdateEvent', (updatedEvent: IEventsOfCalendar) => {
            const idx = this.events.findIndex(event => event.id === updatedEvent.id);
            if(idx !== -1) {
                this.events[idx] = updatedEvent;
                this.addEventsToMonth();
            }
        });

        const sub3 = this.eventBusService.on('DeleteEvent', (id: number) => {
            this.events = this.events.filter(event => event.id !== id);
            this.addEventsToMonth();
        });

        this.subscription.add(sub1).add(sub2).add(sub3);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    getEvents(): void {
        this.calendarService.getEvents().subscribe(
            (events: Array<IEventsOfCalendar>) => {
                this.events = events;
                this.addEventsToMonth();
            },
            (err: HttpErrorResponse) => console.error(err)
        );
    }

    addEventsToMonth(): void {      
        const eventsOfCurrentMonth = this.events.filter(event => 
            this.monthsIsMatch(new Date(event.date))
        );
        this.createMonth(eventsOfCurrentMonth);
    }

    createMonth(eventsOfMonth: Array<IEventsOfCalendar>): void {
        this.month = [];
        const savedDate = new Date(this.dateOfCalendar);
                
        while(this.dateOfCalendar.getMonth() == savedDate.getMonth()) {
            let day: Day = { date: new Date(this.dateOfCalendar), events: [] };
            
            eventsOfMonth.forEach(event => {
                if(this.datesIsMatch(new Date(event.date), this.dateOfCalendar)) {
                    day.events.push(event);
                }
            });           
            this.month.push(day);
            this.dateOfCalendar.setDate(this.dateOfCalendar.getDate()+1);
        }
        this.dateOfCalendar = new Date(savedDate);        
        this.setOffset();
    }

    flipCalendar(event): void {
        let newNumberOfMonth;
        if(event.target.textContent === '>') {
            newNumberOfMonth = (this.dateOfCalendar.getMonth() + 1);
        } else {
            newNumberOfMonth = (this.dateOfCalendar.getMonth() - 1);
        }
        this.dateOfCalendar = new Date(this.dateOfCalendar.setMonth(newNumberOfMonth));

        this.addEventsToMonth();
    }

    resetDate(): void {
        this.dateOfCalendar = new Date();
        this.dateOfCalendar.setDate(1);

        this.addEventsToMonth();
    }

    datesIsMatch(date1, date2=new Date()): boolean {
        if(date1.getDate() === date2.getDate()) {
            return this.monthsIsMatch(date1, date2);
        }
        return false;
    }

    monthsIsMatch(date1=new Date(), date2=this.dateOfCalendar): boolean {
        return (
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        ) 
        ? true
        : false;
    }

    setOffset(): void {
        const dayOfWeek = this.dateOfCalendar.getDay();
        const gridColumnEnd = dayOfWeek ? (dayOfWeek) : 7;

        if(gridColumnEnd !== 1) {
            this.offset = {
                gridColumnStart: 1,
                gridColumnEnd
            };
        } else {
            this.offset = { display: 'none' };
        }
    }

    showComponentEventControl(day: Day): void {
        const dateIsMoreOrEqualCurrent = day.date > new Date() || this.datesIsMatch(day.date);
        
        if(dateIsMoreOrEqualCurrent || day.events.length ) {
            this.eventBusService.emit(new EventData('SelectDay', day));
        }
    }
}
