import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { RouteGuardService } from './route-guard.service';
import { UserComponent } from './user/user.component';
import { AdminComponent } from './admin/admin.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { FormsModule} from '@angular/forms';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarUtilsModule } from './../shared/calendar/module';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import { UserDetailsComponent } from './user-details/user-details.component';
import { FilterPipe } from '../filter.pipe';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NgxSpinnerModule } from 'ngx-spinner';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgxSpinnerModule,
    SharedModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    CalendarModule.forRoot({
      provide: DateAdapter,
      useFactory: adapterFactory
    }),
    NgbModule,
    CalendarUtilsModule,
    RouterModule.forChild([
      {path:'user', component:UserComponent,canActivate:[RouteGuardService] },
      {path:'admin', component:AdminComponent,canActivate:[RouteGuardService] },
      {path: 'edit-user', component : EditUserComponent},
      {path: 'change-password', component : ChangePasswordComponent}
    ])
  ],
  declarations: [UserComponent, AdminComponent,EditUserComponent,ChangePasswordComponent,UserDetailsComponent,FilterPipe],
  providers:[RouteGuardService],
  exports: [RouterModule]
})
export class DashboardModule { }
