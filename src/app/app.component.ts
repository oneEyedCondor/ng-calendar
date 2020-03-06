import { Component, OnInit } from '@angular/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import { CalendarService, IEventsOfCalendar } from './calendar.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    //////
    //hide
    //////
    calendarPlugins = [dayGridPlugin];
    calendarEvents: Array<IEventsOfCalendar> = [];

    constructor(private calendarService: CalendarService) {}

    ngOnInit(): void {
        this.calendarService.getEvents().subscribe(
            (events: Array<IEventsOfCalendar>) => {
                this.calendarEvents = events;
            },
            (err: HttpErrorResponse) => console.error(err)
        );
    }
    
    handleDateClick(event) {
    }

    addEventOfCalendar() {
        // const event = {};
        // this.calendarEvents = [...this.calendarEvents, event];
    }
}
