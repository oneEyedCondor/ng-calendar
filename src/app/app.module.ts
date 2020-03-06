import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';

import { CalendarService } from './calendar.service';
import { EventBusService } from './event-bus.service';

import { AppComponent } from './app.component';
import { CalendarComponent } from './calendar/calendar.component';
import { CalendarEventControlComponent } from './calendar-event-control/calendar-event-control.component';
import { EventFormComponent } from './event-form/event-form.component';

@NgModule({
    declarations: [
        AppComponent,
        CalendarComponent,
        CalendarEventControlComponent,
        EventFormComponent
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
        FullCalendarModule
    ],
    providers: [ 
        CalendarService, 
        EventBusService 
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule { }
