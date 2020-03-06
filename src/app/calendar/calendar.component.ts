import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CalendarService, IEventsOfCalendar } from '../calendar.service';
import { EventBusService, EventData } from '../event-bus.service';

export interface Day {
    date: Date;
    events: Array<IEventsOfCalendar>;
}

@Component({
    selector: 'app-calendar',
    templateUrl: './calendar.component.html',
    styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {
    dateOfCalendar: Date;
    events: Array<IEventsOfCalendar> = [];
    month: Array<Day> = [];
    offset: any = { display: 'none' };

    constructor(
        private calendarService: CalendarService,
        private eventBusService: EventBusService) {

        this.dateOfCalendar = new Date();
        this.dateOfCalendar.setDate(1);
    }

    ngOnInit(): void {
        this.getEvents()

        this.eventBusService.on('CreateEvent', (newEvent: IEventsOfCalendar) => {
            this.events.push(newEvent);
            this.addEventsToMonth();
        });

        this.eventBusService.on('UpdateEvent', (updatedEvent: IEventsOfCalendar) => {
            const idx = this.events.findIndex(event => event.id === updatedEvent.id);
            if(idx !== -1) {
                this.events[idx] = updatedEvent;
                this.addEventsToMonth();
            }
        })

        this.eventBusService.on('DeleteEvent', (id: number) => {
            this.events = this.events.filter(event => event.id !== id);
            this.addEventsToMonth();
        });
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

    addEventsToMonth() {      
        const eventsOfCurrentMonth = this.events.filter(event => 
            this.monthsIsMatch(new Date(event.date), this.dateOfCalendar)
        );
        this.createMonth(eventsOfCurrentMonth);
    }

    createMonth(eventsOfMonth: Array<IEventsOfCalendar>): void {
        this.month = [];
        let month = this.dateOfCalendar.getMonth();
                
        while(this.dateOfCalendar.getMonth() == month) {
            const number = this.dateOfCalendar.getDate();

            let day: Day = { date: new Date(this.dateOfCalendar), events: [] };
            
            eventsOfMonth.forEach(event => {
                if (this.monthsIsMatch(new Date(event.date), this.dateOfCalendar)
                && new Date(event.date).getDate() === number) {
                    
                    day.events.push(event);
                }
            });           
            this.month.push(day);
            this.dateOfCalendar.setDate(number+1);
        }
        
        this.dateOfCalendar.setMonth(month);

        this.setOffset();
    }

    flipCalendar(event) {        
        if(event.target.textContent === '>') {
            this.dateOfCalendar = new Date(this.dateOfCalendar.setMonth((this.dateOfCalendar.getMonth() + 1) % 12));
        } else {
            this.dateOfCalendar = new Date(this.dateOfCalendar.setMonth((this.dateOfCalendar.getMonth() - 1) % 12));
        }
        this.addEventsToMonth();
    }

    resetDate() {
        this.dateOfCalendar = new Date();
        this.dateOfCalendar.setDate(1);
        this.addEventsToMonth();
    }

    checkCurrentMonth() {
        return ( this.monthsIsMatch(this.dateOfCalendar, new Date()) )
        ? {'btn-disabled': true}
        : {'btn-disabled': false};
    }

    dateIsMatch(date1, date2) {
        if(date1.getDate() === date2.getDate()) {
            return this.monthsIsMatch(date1, date2);
        }
        return false;
    }

    monthsIsMatch(date1, date2) {
        return (
            date1.getMonth() === date2.getMonth() &&
            date1.getFullYear() === date2.getFullYear()
        ) 
        ? true
        : false;
    }

    setOffset() {
        // console.log('Year: ', this.dateOfCalendar.getFullYear());
        // console.log('Month: ', this.dateOfCalendar.getMonth());
        const dayOfWeek = new Date(`${this.dateOfCalendar.getFullYear()} ${this.dateOfCalendar.getMonth()}`).getDay();
        // console.log(dayOfWeek);
        const gridColumnEnd = dayOfWeek ? (dayOfWeek) : 7;

        if(gridColumnEnd !== 1) {
            this.offset = {
                gridColumnStart: 1,
                gridColumnEnd
            };
        }
    }

    showComponentEventControl(day: Day) {
        this.eventBusService.emit(new EventData('SelectDay', day));
    }

    isCurrentDay(date) {
        return (this.dateIsMatch(date, new Date)) ? true: false;
    }

}
