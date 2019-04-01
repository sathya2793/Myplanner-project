import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountryCodeComponent } from './country-code/country-code.component';
import { NavBarComponent } from './nav-bar/nav-bar.component';
import { FormsModule} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CalendarModule } from 'angular-calendar';
import { CalendarUtilsModule } from './../shared/calendar/module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    CalendarModule,
    CalendarUtilsModule
  ],
  declarations: [NavBarComponent,CountryCodeComponent],
  exports:[NavBarComponent,CountryCodeComponent]
})
export class SharedModule { }
