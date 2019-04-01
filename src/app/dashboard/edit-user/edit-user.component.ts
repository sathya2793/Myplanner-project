import { Component, OnInit } from '@angular/core';
import { AppService } from './../../app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { editData } from './edit-user';
import { NgxSpinnerService } from 'ngx-spinner';
@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {

  public userInfo: any;
  public countryCode: any;
  public mobileNumber: any;
  public firstName: any;
  public lastName: any;
  public email: any;
  public passWord: any;
  public confirmPassword: any;
  public userPattern = "^[a-zA-Z]{4,}[a-zA-Z0-9\s@#_-\w]*$";
  public lastPattern = "[a-zA-Z]{1,}$";
  public mobilePattern = "^[0-9]{10}$";
  public wholeNumber: any;
  public country_Name: any;
  public number: any;
  public countryName: any;
  public userName: any;
  public userId: any;
  public authToken: string;
  public showSidebar: boolean ;
  public updatedOn: any;
  public friends: any[] = [];
  public admin: boolean;
  
  constructor(public appService: AppService,
    public router: Router,
    private toastr: ToastrService,
    private ballLoader: NgxSpinnerService
  ) {
  }

  ngOnInit() {
    this.ballLoader.show(); setTimeout(() => { this.ballLoader.hide(); }, 1000);
    this.authToken=Cookie.get('authToken');
    this.checkToken();
    this.userInfo = this.appService.getUserInfoFromLocalstorage();
    this.firstName=this.userInfo.firstName;
    this.lastName=this.userInfo.lastName;
    this.wholeNumber=this.userInfo.mobileNumber;
    this.wholeNumber= this.wholeNumber.toString();
    this.mobileNumber=this.wholeNumber.slice( -10); 
    this.userName=this.userInfo.userName;
    this.email=this.userInfo.email;
    this.country_Name=this.userInfo.countryName;
    this.countryCode=this.wholeNumber.slice(0,this.wholeNumber.length-10);
    this.userId=this.userInfo.userId;
    this.updatedOn=this.userInfo.updatedOn;
    this.admin=this.userInfo.admin
  }

  public checkToken:any =() =>{
    if (this.authToken === undefined || this.authToken === '' || this.authToken === null) {
      this.toastr.warning("Something went Wrong,Please Login again");
      this.router.navigate(['/']);
  } 
  }//end checkToken

  public editUserFunction: any = () => {
    let data:editData = {
      admin :this.admin,
      active:true,
      countryName: this.countryName,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      userName: this.userName,
      mobileNumber: this.countryCode + this.mobileNumber,
      secretToken: "",
      updatedOn:this.updatedOn,
      userId:this.userId,

      authToken:this.authToken
    }
    this.appService.editUserFunction(data).subscribe( (apiResponse) => {this.ballLoader.show(); setTimeout(() => { this.ballLoader.hide(); }, 500);
      if (apiResponse.status === 200) {
        this.toastr.success('Updated successful');
        Cookie.set("receiverName",this.firstName+ " " + this.lastName);
        this.appService.setUserInfoInLocalStorage(data);
      } else {
        this.toastr.info(apiResponse.message);
      }
    }), (err) => {
      this.toastr.error('some error occured');
      console.log(err);
    }; // end condition

  } // end editUserFunction

  public receiverCode($event){
    this.countryCode =$event
  }//end receiverCode
  
  public receiverName($event){
    this.countryName=$event
  }//end receiverName

  public recieveMessage($event) {
    this.showSidebar = $event;
  }//end recieveMessage
 
}
