import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { AppService } from 'src/app/app.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Title } from '@angular/platform-browser';
import { TitleService } from '../title.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit{

  @Output() messageEvent = new EventEmitter<boolean>();

  public userName: string;
  public authToken: string;
  public showSidebar: boolean =false;
  public userId: string;
  public countUnreadMsg:number;
  public title:string;
  public checkAdmin : boolean;
  userInfo: any;
  constructor(
    public appService: AppService,
    public toastr: ToastrService,
    public router: Router,
    private titleService: Title,
    private data: TitleService
  ) { }

  ngOnInit() {
    this.authToken = Cookie.get('authToken');
    this.userId = Cookie.get("receiverId");
    this.userName = Cookie.get('receiverName');
    this.userInfo = this.appService.getUserInfoFromLocalstorage();
    this.data.currentMessage.subscribe(message => this.title = message);
    this.checkAdmin =  this.userInfo.admin;
  }

  public logout: any = () => {
    let data: any = { authToken: this.authToken };
    this.appService.logout(data)
      .subscribe((apiResponse) => {
          if (apiResponse.message == "Invalid Or Expired AuthorizationKey" || apiResponse.message == "Failed To Authorized" || apiResponse.status == 200) {
            Cookie.deleteAll();
            localStorage.removeItem('userInfo');
            this.router.navigate(['/']);
            this.toastr.info(apiResponse.message);
          }
          else {
            this.toastr.error(apiResponse.message)
          } // end condition
      }), (err) => {
        this.toastr.error('some error occured');
        Cookie.deleteAll();
        localStorage.removeItem('userInfo');
        this.router.navigate(['/']);
      }
  } // end logout

  public changedTitle : any = (msg :string) => {
    this.data.changeMessage(msg);
    this.data.currentMessage.subscribe(message => this.title = message)
    this.titleService.setTitle(msg);
  }

  public toggle = () => {
    this.showSidebar = !this.showSidebar;
    this.messageEvent.emit(this.showSidebar);
  }

}