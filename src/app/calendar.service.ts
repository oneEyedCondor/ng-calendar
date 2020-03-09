import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface IEventsOfCalendar {
    id: number;
    title: string;
    date: Date;
};

interface requestBody {
    id?: number;
    name: string;
    date: Date;
}

@Injectable()
export class CalendarService {

    constructor(private http: HttpClient) { }

    getEvents(): Observable<Array<IEventsOfCalendar>> {
        return this.http.get<any>('http://localhost:5791/api/events')
            .pipe(
                map(events => {
                    return events.map(event => ({
                        id: event.id, 
                        title: event.name, 
                        date: event.date
                    }));
                }),
            );
    }

    createEvent(body: requestBody): Observable<IEventsOfCalendar> {
        return this.http.post<any>('http://localhost:5791/api/events', body)
            .pipe(
                map(event => ({ id: event.id, title: event.name, date: event.date }))
            );
    }

    updateEvent(body: requestBody) {
        return this.http.put('http://localhost:5791/api/events', body);
    }

    deleteEvent(id: number) {
        return this.http.delete(`http://localhost:5791/api/events/${id}`);
    }
}