import { Component, OnInit, Input } from '@angular/core';
import { AppService } from '../../app.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Title } from '@angular/platform-browser';
import {singupData} from './singup'
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  
  public firstName: any;
  public lastName: any;
  public userName: any;
  public mobileNumber: any;
  public email: any;
  public passWord: string;
  public confirmPassword: string;
  public userPattern = "^[a-zA-Z]{4,}[a-zA-Z0-9\s@#_-\w]*$";
  public lastPattern = "[a-zA-Z]{1,}$";
  public emailPattern = "^/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/";
  public passwordPattern = "^[A-Za-z_]{1,}.{7,30}$";
  public countryCode: any;
  public countryName: any;
  
  constructor(public appService: AppService,
    public router: Router,
    private toastr: ToastrService,
    private titleService: Title
  ) {
  }

  ngOnInit() {
    this.titleService.setTitle("SignUp");
    }

  public goToMailNotification: any = () => {
    this.router.navigate(['/mail-notification']);
  } // end goToMailNotification

  public goToSignIn: any = () => {
    this.router.navigate(['/']);
  } // end goToSignIn



  public signupFunction: any = () => {
    if(this.countryCode){
    let data:singupData = {
      firstName: this.firstName,
      lastName: this.lastName,
      userName: this.userName,
      countryName: this.countryName,
      mobileNumber: this.countryCode + this.mobileNumber,
      email: this.email,
      password: this.passWord
    }
    this.appService.signupFunction(data).subscribe((apiResponse) => {
      if (apiResponse.status === 200) {
        this.toastr.success('Signup successful');
        Cookie.set('email-id', data.email);
        setTimeout(() => {
          this.goToMailNotification();
        }, 2000);
      } else {
        this.toastr.error(apiResponse.message);
        console.log(apiResponse.message);
      }
    }, (err) => {
      this.toastr.error('some error occured');
      console.log(err);
    }); // end condition
  }
  else{
    this.toastr.warning("Select the Countries");
  }
  } // end signupFunction

  receiverCode($event){
    this.countryCode =$event
  }

  receiverName($event){
    this.countryName=$event
  }

}