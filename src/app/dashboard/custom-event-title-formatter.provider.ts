import { LOCALE_ID, Inject } from '@angular/core';
import { CalendarEventTitleFormatter, CalendarEvent } from 'angular-calendar';
import { DatePipe } from '@angular/common';

export class CustomEventTitleFormatter extends CalendarEventTitleFormatter {
  constructor(@Inject(LOCALE_ID) private locale: string) {
    super();
  }

  // you can override any of the methods defined in the parent class

  month(event: CalendarEvent): string {
    return `<b>[${new DatePipe(this.locale).transform(
      event.start,
      'hh:mm a',
      this.locale
    )} - ${new DatePipe(this.locale).transform(
        event.end,
        'hh:mm a',
        this.locale
      )} ] ${event.title} </b>`;
  }

 /* week(event: CalendarEvent): string {
    return `<b>${new DatePipe(this.locale).transform(
      event.start,
      'hh:mm a',
      this.locale
    )}</b> - ${new DatePipe(this.locale).transform(
        event.end,
        'hh:mm a',
        this.locale
      )}</b> ${event.title}`;
  }

  day(event: CalendarEvent): string {
    return `<b>${new DatePipe(this.locale).transform(
      event.start,
      'hh:mm a',
      this.locale
    )}<</b> - ${new DatePipe(this.locale).transform(
        event.end,
        'hh:mm a',
        this.locale
      )}</b> ${event.title}`;
  }*/
  
}