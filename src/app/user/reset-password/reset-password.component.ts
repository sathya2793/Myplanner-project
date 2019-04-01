import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import {resetPasswordData} from './reset-password'
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  public passWord: string;
  public userPattern = "^[a-zA-Z]{4,}[a-zA-Z0-9\s@#_-\w]*$";
  public emailPattern = "^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]{3,}.[a-zA-Z0-9-.]{2,}$";
  public showEyeProp: boolean = false;
  public confirmpassword: string;
  public showEyeProp1: boolean = false;
  public userId: string
  constructor(public appService: AppService,
    public router: Router,
    private toastr: ToastrService,
    public _route: ActivatedRoute,
    private titleService: Title
    ) { 
    }

  ngOnInit() {
    this.titleService.setTitle("Reset Password");
  }

  public goToSignIn: any = () => {
    this.router.navigate(['/']);
    console.log("Welcome to Login page");
  } // end goToSignIn

  public resetFunction: any = () => {
      let data:resetPasswordData = {
        userId : this._route.snapshot.paramMap.get('userId'),
        password: this.passWord
      }
          this.appService.sendResetLinkFunction(data).subscribe((apiResponse) => {
          if (apiResponse.status === 200) {
            this.toastr.success('Password Reset successful');
            setTimeout(() => {
              this.goToSignIn();
            }, 2000);
          } else {
            this.toastr.info(apiResponse.message);
            console.log(apiResponse.message);
          }
        }, (err) => {
          this.toastr.error('some error occured');
          console.log(err);
        }); // end condition
  } // end signupFunction
}