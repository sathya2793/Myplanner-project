import { Component, OnInit, ViewChild, TemplateRef, OnDestroy } from '@angular/core';
import { isSameDay, isSameMonth } from 'date-fns';
import { Subject } from 'rxjs';
import { CalendarEvent, CalendarEventTimesChangedEvent, CalendarView, CalendarEventAction, CalendarEventTitleFormatter } from 'angular-calendar';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { colors } from './../../shared/calendar/colors';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ScheduleService } from 'src/app/schedule.service';
import { SocketService } from 'src/app/socket.service';
import * as _ from 'lodash';
import { CustomEventTitleFormatter } from './../custom-event-title-formatter.provider';
import { getAllScheduleData, getAllSingleScheduleData, getallUserListData, createData, updateData, deleteData, infoData } from './admin';
import { NgForm } from '@angular/forms';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
  providers: [
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter
    },
    SocketService
  ]
})

export class AdminComponent implements OnInit, OnDestroy {

  //view meeting pop-up
  @ViewChild('viewContent') viewContent: TemplateRef<any>;

  //edit meeting pop-up
  @ViewChild('editContent') editContent: TemplateRef<any>;

  //delete meeting pop-up
  @ViewChild('deleteContent') deleteContent: TemplateRef<any>;

  //reminder meeting pop-up
  @ViewChild('notifyContent') notifyContent: TemplateRef<any>;

  public showSidebar: boolean;
  public allUserList: any = [];
  public allUser: any = [];
  public authToken: string;
  public receiverId: string;
  public receiverName: string;
  public userId: string;
  public pageNo: number = 1;
  public size: number = 10;
  public loadMore: boolean = true;
  public loadingUser: boolean = false;
  public editEventName: string;
  public editStart: Date;
  public editEnd: Date;
  public editVenue: string;
  public editDescription: string;
  public editParticipate: string;
  public editUser: string;
  public editId: string;
  public search: string = "";
  public status: boolean = false;
  public onLineUserList: any = [];
  public eventName: string;
  public start: string;
  public end: string;
  public venue: string;
  public description: string;
  public participate: string;
  public displayUserName: string;
  public displayFirstName: string;
  public displayEmail: string;
  public displayMobileNumber: string;
  public displayLastName: string;
  public displayTotalevent: number;
  public items: any = [];
  public events: any = [];
  public activeDayIsOpen: boolean = true;
  public selectedList: boolean = false;
  public selectedRow: number;
  public snooze: boolean = true;
  public userInfo: any;
  
  setClickedRow: (index: any) => void;

  refresh: Subject<any> = new Subject();

  view: CalendarView = CalendarView.Month;

  viewDate: Date = new Date();

  modalData: {
    action: string;
    event: CalendarEvent;
  };

  //action use to edit and delete
  actions: CalendarEventAction[] = [
    {
      label: '<i class="fa fa-fw fa-pencil"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        this.handleEvent('Edited', event);
      }
    },
    {
      label: '<i class="fa fa-fw fa-times"></i>',
      onClick: ({ event }: { event: CalendarEvent }): void => {
        // this.events = this.events.filter(iEvent => iEvent !== event);
        this.handleEvent('Deleted', event);
      }
    }
  ];

  constructor(private _modal: NgbModal, private _AppService: AppService, private _scheduleService: ScheduleService, private _router: Router, private _toastr: ToastrService, private _socketService: SocketService,private _titleService: Title) {
    // selecte the user list for change the color
    this.setClickedRow = (index) => {
      this.selectedRow = index;
    }
  }

  ngOnInit() {
    this._titleService.setTitle("Admin");
    this.authToken = Cookie.get('authToken');
    this.userId = Cookie.get('receiverId');
    this.receiverName = Cookie.get('receiverName');
    this.userInfo = this._AppService.getUserInfoFromLocalstorage();
    this.allUserList = [];
    this.checkAdmin();
    this.getallUserList();
    this.getAllSchedule();
    //this will load for every 5 seconds
    setInterval(() => {
      this.reminder();
    }, 5000);
  }

  //get all user
  public getallUserList: any = ():any => {
    let data: getallUserListData = { userId: this.userId, pageNo: this.pageNo, size: this.size, query: this.search, authToken: this.authToken };
    this._AppService.getallUserList(data).subscribe((apiResponse) => {
      if (apiResponse.status == 200) {
        if ((apiResponse.data.docs.length === 0)) {
          this.loadMore = false;
        }
        else {
          for (let i = 0; i < apiResponse.data.docs.length; i++) {
            let temp = { 'userId': apiResponse.data.docs[i].userId, 'name': apiResponse.data.docs[i].userName, 'other': apiResponse.data.docs[i], 'status': "offline" };
            this.allUserList.push(temp);
          }
          this.loadMore = true;
        }
        if (this.search.length <= 0 && this.allUserList.length <= 0) {
          this.status = true;
        }
        this.verifyUserConfirmation();
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
      this.loadingUser = false;

    }),
      (error) => {
        this._toastr.error(error.message);
        this.errorMsg();
      }
  }//end getallUserList function

  // load more user for pagination
  public loadMoreUsers:any = ():void => {
    this.loadingUser = true;
    this.pageNo = this.pageNo + 1;
    this.getallUserList();
  }//end loadMoreUsers function

  //send keyword reset all User list
  public sendKeyword:any = ():void => {
    this.allUserList = [];
    this.pageNo = 1;
    this.getallUserList();
  }//end sendKeyword function

  //send Using Keypress function for search
  public sendUsingKeypress: any = (event: any):any => {
    if (event.keyCode === 13) {
      // 13 is keycode of enter.
      this.sendKeyword();
    }
  }//end sendUsingKeypress function

  //verify User Confirmation using socket
  public verifyUserConfirmation: any = ():any => {
    this._socketService.verifyUser()
      .subscribe(() => {
        this._socketService.setUser(this.authToken);
        this._socketService.messageSent(this.receiverName + " Admin Is Online Now");
        this.getOnlineUserList();
      }),
      (error) => {
        this._toastr.error(error.message);
        this._socketService.exitSocket();
        this.errorMsg();
      }
  }//end verifyUserConfirmation function

  //get Online User List using socket
  public getOnlineUserList: any = ():any => {
    this._socketService.onlineUserList()
      .subscribe((data) => {
        this.onLineUserList = [];
        if (Object.keys(data).length > 0) {
          for (let x in data) {
            let temp = { 'userId': x, 'name': data[x], 'status': "online" };
            this.onLineUserList.push(temp);
          }//end online list
          for (let i = 0; i < Object.keys(this.onLineUserList).length; i++) {
            for (let j = 0; j < Object.keys(this.allUserList).length; j++) {
              if (this.allUserList[j].userId === this.onLineUserList[i].userId) {
                this.allUserList[j].status = "online";
              }
            }
          }//end update all list
          this.allUserList = _.sortBy(this.allUserList, ['name', '-status']);//sort list
        }
      }),
      (error) => {
        this._toastr.error(error.message);
        this._socketService.exitSocket();
        this.errorMsg();
      }
  }// end online-user-list 

  //method to get All Schedule of user
  public getAllSchedule:any = ():void=> {
    let data: getAllScheduleData = {
      'adminId': this.userId,
      'authToken': this.authToken
    }
    this._scheduleService.getAllSchedule(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          for (let i = 0, j = 0; i < Object.keys(apiResponse.data).length; i++) {
            this.items.push(
              {
                id: apiResponse.data[i].id,
                participateId: apiResponse.data[i].participateId,
                participateName: apiResponse.data[i].participateName,
                title: apiResponse.data[i].eventName,
                start: new Date(apiResponse.data[i].start),
                end: new Date(apiResponse.data[i].end),
                venue: apiResponse.data[i].venue,
                description: apiResponse.data[i].description,
                status: "snooze",
                color: colors[j],
                actions: this.actions
              });
            (j == 6) ? j = 0 : j++;
            this.events = _.orderBy(this.items, 'start', 'asc');
          }
          this.refresh.next();
        }
        else if (apiResponse.status == 500) {
          this.errorMsg();
        }
        else if (apiResponse.message == "No Schedule Found") {
          this.events = [];
          this._toastr.info("No Schedule Found");
        }
        else if (apiResponse.message == 403) {
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

  //method to get All Schedule of user
  public getAllSingleSchedule:any = (enableId):any=> {
    let data: getAllSingleScheduleData = {
      'userId': enableId,
      'authToken': this.authToken
    }
    this._scheduleService.getSingleSchedule(data).subscribe(
      (apiResponse) => {
        this.displayTotalevent = 0;
        if (apiResponse.status == 200) {
          this.displayTotalevent = Object.keys(apiResponse.data).length;
          for (let i = 0, j = 0; i < Object.keys(apiResponse.data).length; i++) {
            this.items.push(
              {
                id: apiResponse.data[i].id,
                adminName: apiResponse.data[i].adminName,
                participateId: apiResponse.data[i].participateId,
                participateName: apiResponse.data[i].participateName,
                title: apiResponse.data[i].eventName,
                start: new Date(apiResponse.data[i].start),
                end: new Date(apiResponse.data[i].end),
                venue: apiResponse.data[i].venue,
                description: apiResponse.data[i].description,
                color: colors[j],
                actions: this.actions
              });
            (j == 6) ? j = 0 : j++;
            this.events = _.orderBy(this.items, 'start', 'asc');
          }
          this.refresh.next();
        }
        else if (apiResponse.status == 500) {
          this.errorMsg();
        }
        else if (apiResponse.message == "No Schedule Found") {
          this.events = [];
          this._toastr.info("No Schedule Found");
        }
        else {
          this._toastr.error(apiResponse.message);
        }
      }),
      (error) => {
        this._toastr.error(error.message);
        this.errorMsg();
      }
  }//end getAllSingleSchedule

  //user Selected profile details
  public userSelected:any = (selectedUser):void => {
    this.selectedList = true;
    this.items = [];
    this.events = [];
    this.getAllSingleSchedule(selectedUser.userId);
    this.displayUserName = selectedUser.userName;
    this.displayFirstName = selectedUser.firstName;
    this.displayLastName = selectedUser.lastName;
    this.displayEmail = selectedUser.email;
    this.displayMobileNumber = selectedUser.mobileNumber;
  }//end userSelected function

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

  //eventTimesChanged
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
    if (action === "Clicked") {
      this._modal.open(this.viewContent, { size: 'lg' });
    }
    if (action === "Edited") {
      this._modal.open(this.editContent, { size: 'lg' });
      this.editScheduleMeeting(event);
    }
    if (action === "Deleted") {
      this._modal.open(this.deleteContent, { size: 'sm' });
    }
  }//end handleEvent

  // create meeting
  public createNewScheduleMeeting: any = (form: NgForm):any => {
    let str = this.participate;
    let str_array = str.split(',');
    let data: createData = {
      adminId: this.userId,
      adminName: this.receiverName,
      eventName: this.eventName,
      start: new Date(this.start).getTime(),
      end: new Date(this.end).getTime(),
      venue: this.venue,
      description: this.description,
      participateId: str_array[0],
      participateName: str_array[1],
      authToken: this.authToken
    };
    this._scheduleService.createNewList(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          this._toastr.success(apiResponse.message);
          let info: infoData = {
            status: 'Created',
            message: `The ${data.eventName} has created the Meeting by "${data.adminName}".`,
            userId: data.participateId,
            info: data
          }
          this._socketService.messageSentById(info);
        }
        else if (apiResponse.status == 500) {
          this.errorMsg();
        }
        else {
          this._toastr.info(apiResponse.message);
        }
        this.items = [];
        this.events = [];
        this.getAllSchedule();
        form.reset();
      })
      ,
      (error) => {
        this._toastr.error(error.message);
        this.errorMsg();
      }
  }//end createNewScheduleMeeting function


  //set variable for edit meeting
  public editScheduleMeeting:any = (event):void => {
    this.editId = event.id;
    this.editUser = event.participateId + "," + event.participateName;
    this.editEventName = event.title;
    this.editStart = new Date(event.start);
    this.editEnd = new Date(event.end);
    this.editVenue = event.venue;
    this.editDescription = event.description;
  }//end editScheduleMeeting function

  //update Schedule Meeting 
  public updateScheduleMeeting:any = (id):any => {
    let str = this.editUser;
    let str_array = str.split(',');
    let data: updateData = {
      id: id,
      adminId: this.userId,
      adminName: this.receiverName,
      eventName: this.editEventName,
      start: (this.editStart).getTime(),
      end: (this.editEnd).getTime(),
      venue: this.editVenue,
      description: this.editDescription,
      participateId: str_array[0],
      participateName: str_array[1],
      authToken: this.authToken
    };
    this._scheduleService.updateList(data).subscribe(
      (apiResponse) => {
        console.log(JSON.stringify(apiResponse) + "ll" + JSON.stringify(data)  + "user" + this.selectedList );
        if (apiResponse.status == 200) {
          // check if user is selected
          if (this.selectedList) {
            this.items = [];
            this.events = [];
            this.getAllSingleSchedule(data.participateId);
          }
          else {
            this.items = [];
            this.events = [];
            this.getAllSchedule();
          }
          let info = {
            status: 'Updated',
            message: `The ${data.eventName} event has Edited the Meeting by "${data.adminName}".`,
            userId: data.participateId,
            info: data
          }
          this._socketService.messageSentById(info);
          this._toastr.success(apiResponse.message);
        }
        else if (apiResponse.status == 500) {
          this.errorMsg();
        }
        else {
          this._toastr.info(apiResponse.message);
        }
      })//end subcribe
      ,
      (error) => {
        this._toastr.error(error.message);
        this.errorMsg();
      }
  }//end updateScheduleMeeting function


  //delete Schedule Meeting
  public deleteScheduleMeeting:any = (event):any => {
    let data: deleteData = {
      'id': event.id,
      'authToken': this.authToken
    }
    this._scheduleService.deleteList(data).subscribe(
      (apiResponse) => {
        if (apiResponse.status == 200) {
          if (this.selectedList) {
            this.items = [];
            this.events = [];
            this.getAllSingleSchedule(event.participateId);
          }
          else if (apiResponse.status == 500) {
            this.errorMsg();
          }
          else {
            this.items = [];
            this.events = [];
            this.getAllSchedule();
          }
          let info = {
            status: 'Deleted',
            message: `The ${event.title} has cancelled the Meeting by "${this.receiverName}".`,
            userId: event.participateId
          }
          this._socketService.messageSentById(info);
        }
      })//end subcribe
      ,
      (error) => {
        this._toastr.error(error.message);
        this.errorMsg();
      }
  }//end deleteScheduleMeeting function

  //reminder function - will popup dialog reminder about upcoming meeting
  public reminder:any = (): any => {
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
        this._toastr.info(`Meeting ${meeting.title} Started!`, `Gentle Reminder`);
        let info = {
          status: 'Reminder',
          message: `Meeting ${meeting.title} Started!, Gentle Reminder`,
          userId: this.userId
        }
        this._socketService.messageSentById(info);
      }
    }//end for
  }//end reminder function

  //error msg - goto login page if error occur
  public errorMsg:any = (): any => {
    this._toastr.warning("Something went Wrong,Please Login again");
    Cookie.deleteAll();
    localStorage.removeItem('userInfo');
    this._router.navigate(['/']);
  }//end errorMsg function

  //compare two date
  public compareDates:any = (start, end): boolean => {
    let startDate = new Date(start);
    let endDate = new Date(end);
    if (startDate > endDate) {
      return true;
    }
    else {
      return false;
    }
  }//end compareDates

  public checkAdmin = () =>{
    if (!(this.userInfo.admin)) {
      this.errorMsg();
    } 
   }//end checkAdmin

  //recieveMessage - for side bar
  public recieveMessage:any = ($event): void => {
    this.showSidebar = $event;
  }//end recieveMessage function

  public ngOnDestroy:any = (): void => {
    this._socketService.exitSocket();//exit socket service to avoid many connection
  }//end ngOnDestroy

}
