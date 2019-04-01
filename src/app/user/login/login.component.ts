import { Component, OnInit } from '@angular/core';
import { AppService } from '../../app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Title } from '@angular/platform-browser';
import { loginData} from './login'
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public email: string;
  public password: string;
  constructor(
    public appService: AppService,
    public router: Router,
    public toastr: ToastrService,
    private titleService: Title,
    private ballLoader: NgxSpinnerService
  ) {}

  ngOnInit() {
      this.titleService.setTitle( "Login");
      this.ballLoader.show(); setTimeout(() => { this.ballLoader.hide(); }, 1000);
  }

  public goToSignUp: any = () => {
    this.router.navigate(["/sign-up"]);
  }; // end goToSignUp

  public goToForgetPAssword: any = () => {
    this.router.navigate(["/forget-password"]);
  }; // end goToSignUp

  public sendUsingKeypress: any = (event: any) => {
    if (event.keyCode === 13) {
      // 13 is keycode of enter.
      this.signinFunction();
    }
  }; // end sendMessageUsingKeypress

  public signinFunction: any = () => {
    if (!this.email) {
      this.toastr.warning("enter email");
    } else if (!this.password) {
      this.toastr.warning("enter password");
    } 
    else {
      this.ballLoader.show();
      let data:loginData = {
        email: this.email,
        password: this.password
      };
      this.appService.signinFunction(data).subscribe(
        apiResponse => {  
          if (apiResponse.status === 200) {
            this.ballLoader.hide();
            Cookie.set("authToken", apiResponse.data.authToken);

            Cookie.set("receiverId", apiResponse.data.userDetails.userId);

            Cookie.set("receiverName",apiResponse.data.userDetails.firstName + " " + apiResponse.data.userDetails.lastName);

            this.appService.setUserInfoInLocalStorage(
              apiResponse.data.userDetails
            );
            setTimeout(() => {
            if(apiResponse.data.userDetails.admin)
            {
              this.router.navigate(['/admin']);
            }
            else{
            this.router.navigate(['/user']);
            }
          }, 1000);
          } else {
            this.ballLoader.hide();
            this.toastr.error(apiResponse.message);
            console.log(apiResponse.message);
          }
        }),
        (err) => {
          this.ballLoader.hide();
          this.toastr.error("some error occured");
          console.log(err);
        }
    } // end condition
  }; // end signinFunction
  
}