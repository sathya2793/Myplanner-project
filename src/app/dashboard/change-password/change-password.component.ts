import { Component, OnInit } from '@angular/core';
import { AppService } from './../../app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import {passwordData} from './change-password';
import { NgxSpinnerService } from 'ngx-spinner';
import { NgForm } from '@angular/forms';
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  
  public showSidebar: boolean;
  public passWord: string;
  public showEyeProp: boolean = false;
  public confirmpassword: string;
  public showEyeProp1: boolean = false;
  public userInfo: any;
  public userId:string;
  authToken: any;

  constructor(public appService: AppService,
    public router: Router,
    private toastr: ToastrService,
    private ballLoader: NgxSpinnerService) { }

  ngOnInit() {
    this.ballLoader.show(); setTimeout(() => { this.ballLoader.hide(); }, 1000);
    this.userInfo = this.appService.getUserInfoFromLocalstorage();
    this.userId=this.userInfo.userId;
    this.passWord="";
    this.confirmpassword="";
    this.authToken=Cookie.get('authToken');
  }
  public changePassword: any = (form: NgForm) => {
    let data:passwordData = {
      userId : this.userId,
      password : this.passWord,
      authToken: this.authToken
    }
    this.appService.changePassword(data).subscribe(
      (apiResponse) => {this.ballLoader.show(); setTimeout(() => { this.ballLoader.hide(); }, 500);
        if (apiResponse.status === 200) {
          this.toastr.success('Password updated successful');
        } else {
          this.toastr.error(apiResponse.message);
          console.log(apiResponse.message);
        }
        form.reset();
      }, (err) => {
        this.toastr.error('some error occured');
        console.log(err);
      }); // end condition
} // end changePassword

  public recieveMessage($event) {
    this.showSidebar = $event;
  }//end recieveMessage
}
