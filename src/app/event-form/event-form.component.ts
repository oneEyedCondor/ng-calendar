import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CalendarService, IEventsOfCalendar } from '../calendar.service';
import { EventBusService, EventData } from '../event-bus.service';

@Component({
    selector: 'app-event-form',
    templateUrl: './event-form.component.html',
    styleUrls: ['./event-form.component.scss']
})
export class EventFormComponent implements OnInit {
    @Input() action: string;
    @Input() chooseDate?: Date;
    @Input() event?: IEventsOfCalendar;
    @Output() hide = new EventEmitter();
    
    eventForm: FormGroup;
    currentDate: string = '';

    constructor(
        private formBuilder: FormBuilder,
        private calendarService: CalendarService,
        private eventBusService: EventBusService) { }

    ngOnInit() {
        this.currentDate = this.convertDate(new Date());
        this.createEventForm();
    }

    createEventForm() {
        let eventName = '';
        let eventDate = '';

        if(this.event) {
            eventName = this.event.title;
            eventDate = this.convertDate(this.event.date);
        } else {
            eventDate = this.convertDate(this.chooseDate);
        }
        
        this.eventForm = this.formBuilder.group({
            'eventName': [eventName, [ Validators.required ]],
            'eventDate': [eventDate],
        });
    }

    displayHandler() {
        this.hide.emit();
    }

    onSubmit() {
        if(this.action === 'create') {
            this.createEvent();
        } else {
            this.editEvent();
        }
        this.displayHandler();
    }

    convertDate(date: Date): string {
        const year = new Date(date).getFullYear();
        const m = new Date(date).getMonth()+1;
        const month = (m < 10) ? ('0'+ m) : m;
        const d = new Date(date).getDate();
        const day = (d < 10) ? ('0'+ d) : d;

        return `${year}-${month}-${day}`;
    }

    createEvent() {
        const newEvent = {
            name:  this.eventForm.value.eventName, 
            date:  this.eventForm.value.eventDate
        };

        this.calendarService.createEvent(newEvent).subscribe(
            (event: IEventsOfCalendar) => {
                this.eventBusService.emit(new EventData('CreateEvent', event));
            },
            err => console.error(err)
        );
    }

    editEvent() {
        const updatedEvent = {
            id:     this.event.id,
            name:   this.eventForm.value.eventName,
            date:   this.eventForm.value.eventDate
        };
        
        this.calendarService.updateEvent(updatedEvent).subscribe(
            (response: any) => {
                if(response.message === 'OK') {
                    this.eventBusService.emit(new EventData('UpdateEvent', {
                        id:     updatedEvent.id,
                        title:  updatedEvent.name,
                        date:   updatedEvent.date
                    }));
                }
            },
            err => console.error(err)
        );
    }

}