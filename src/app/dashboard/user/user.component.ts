import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { isSameDay, isSameMonth } from 'date-fns';
import { Subject } from 'rxjs';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarView, CalendarEventTitleFormatter } from 'angular-calendar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { colors } from './../../shared/calendar/colors';
import { ToastrService } from 'ngx-toastr';
import { AppService } from 'src/app/app.service';
import { ScheduleService } from 'src/app/schedule.service';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { SocketService } from 'src/app/socket.service';
import * as _ from 'lodash';
import { CustomEventTitleFormatter } from '../custom-event-title-formatter.provider';
import { getAllSingleScheduleData, infoData } from './user';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-user',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  providers: [
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter
    }, SocketService
  ]
})
export class UserComponent implements OnInit, OnDestroy {

  showSidebar: any;

  @ViewChild('viewContent') viewContent: TemplateRef<any>;

  @ViewChild('notifyContent') notifyContent: TemplateRef<any>;

  public activeDayIsOpen: boolean = true;
  public events: any = [];
  public schedule: any = [];
  public authToken: string;
  public userId: string;
  public items: any = [];
  public receiverName: string;
  public snooze: boolean = true;
  public userInfo: any;

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  view: string = 'month'; // to view month
  viewDate: Date = new Date();
  CalendarView = CalendarView;
  refresh: Subject<any> = new Subject();


  //public remindMe: boolean = true;

  constructor(private _modal: NgbModal, private _appService: AppService, private _scheduleService: ScheduleService, private _router: Router, private _toastr: ToastrService, private _socketService: SocketService,private _titleService: Title) { }

  ngOnInit() {
    this._titleService.setTitle("User");
    this.authToken = Cookie.get('authToken');
    this.userId = Cookie.get('receiverId');
    this.receiverName = Cookie.get('receiverName');
    this.userInfo = this._appService.getUserInfoFromLocalstorage();
    this.checkAdmin();
    this.verifyUserConfirmation();
    this.getAllSchedule();
    this.getMessageFromAdmin();
    this.getMessageFromAdminById();
    //this will load for every 5 seconds
    setInterval(() => {
      this.reminder();
    }, 5000);
  }


  public verifyUserConfirmation: any = () => {
    this._socketService.verifyUser()
      .subscribe(() => {
        this._socketService.setUser(this.authToken);
      })
  }

  //method to get All Schedule of user
  public getAllSchedule = () => {
    let data: getAllSingleScheduleData = {
      'userId': this.userId,
      'authToken': this.authToken
    }
    this.items = [];
    this.events = [];
    this._scheduleService.getSingleSchedule(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          for (let i = 0, j = 0; i < Object.keys(apiResponse.data).length; i++) {
            this.items.push(
              {
                adminName: apiResponse.data[i].adminName,
                title: apiResponse.data[i].eventName,
                start: new Date(apiResponse.data[i].start),
                end: new Date(apiResponse.data[i].end),
                venue: apiResponse.data[i].venue,
                description: apiResponse.data[i].description,
                status: "snooze",
                color: colors[j],
              });
            (j == 6) ? j = 0 : j++;
            this.events = _.orderBy(this.items, 'start', 'asc');
          }
          this.refresh.next();
        }
        else if (apiResponse.status == 500) {
          this.errorMsg();
        }
        else if (apiResponse.status == 403) {
          this._toastr.info(apiResponse.message);
        }
        else {
          this._toastr.error(apiResponse.message);
        }
      }),
      (error) => {
        this._toastr.error(error.message);
        this.errorMsg();
      }
  }//end getAllSchedule

  //calendar day clicked
  dayClicked({ date, events }: { date: Date; events: CalendarEvent[] }): void {
    if (isSameMonth(date, this.viewDate)) {
      this.viewDate = date;
      if (
        (isSameDay(this.viewDate, date) && this.activeDayIsOpen === true) ||
        events.length === 0
      ) {
        this.activeDayIsOpen = false;
      } else {
        this.activeDayIsOpen = true;
      }
    }
  }//end dayClicked

  eventTimesChanged({
    event,
    newStart,
    newEnd
  }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.handleEvent('Dropped or resized', event);
    this.refresh.next();
  }//end eventTimesChanged

  //handle event for clicked,edited,delete the meeting to open pop-up dialog
  handleEvent(action: string, event: CalendarEvent): void {
    this.modalData = { event, action };
    this._modal.open(this.viewContent, { size: 'lg' });
  }//end handleEvent

  public getMessageFromAdmin = (): any => {
    this._socketService.messageReceiver().subscribe((data) => {
      this._toastr.info(data);
    })
  }//end getMessageFromAdmin 

  public getMessageFromAdminById = (): any => {
    this._socketService.messageReceiverById(this.userId).subscribe((data) => {
      this._toastr.info(data.status, data.message);
      this.getAllSchedule();
    })
  }// getMessageFromAdminById 

  //reminder function - will popup dialog reminder about upcoming meeting
  public reminder = (): any => {
    let currentTime = new Date().getTime();
    for (let meeting of this.events) {
      if (isSameDay(new Date(), meeting.start) && new Date(meeting.start).getTime() - currentTime <= 60000
        && new Date(meeting.start).getTime() > currentTime) {
        if (meeting.status == "snooze" && this.snooze) {
          this.modalData = { action: 'clicked', event: meeting };
          this._modal.open(this.notifyContent, { size: 'sm' });
          this.snooze = false;//to avoid overflow
        }//end inner if
      }//end if
      else if (currentTime > new Date(meeting.start).getTime() &&
        new Date(currentTime - meeting.start).getTime() < 10000) {
        let info: infoData = {
          status: 'Reminder',
          message: `Meeting ${meeting.title} Started!, Gentle Reminder`,
          userId: this.userId
        }
        this._socketService.messageSentById(info);
      }
    }//end for
  }//end reminder function

  //error msg - goto login page if error occur
  public errorMsg = (): any => {
    this._toastr.warning("Something went Wrong,Please Login again");
    Cookie.deleteAll();
    localStorage.removeItem('userInfo');
    this._router.navigate(['/']);
  }//end errorMsg function

  public checkAdmin = () =>{
    if (this.userInfo.admin) {
      this.errorMsg();
    } 
   }//end checkAdmin

  //recieveMessage - for side bar
  public recieveMessage = ($event): void => {
    this.showSidebar = $event;
  }//end recieveMessage function

  public ngOnDestroy = (): void => {
    this._socketService.exitSocket();//exit socket service to avoid many connection
  }//end ngOnDestroy

}
