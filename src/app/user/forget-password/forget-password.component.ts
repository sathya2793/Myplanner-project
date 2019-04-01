import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { AppService } from 'src/app/app.service';
import { ToastrService } from 'ngx-toastr';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Title } from '@angular/platform-browser';
import { forgetPasswordData} from './forget-password'
@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.css']
})
export class ForgetPasswordComponent implements OnInit {

public email :any;
  constructor(public appService: AppService,
    public router: Router,
    private toastr: ToastrService,
    private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Forget Password");
  }
  public sendResetLink :any = () => {
    let data:forgetPasswordData = {
      email: this.email
    }
    this.appService.sendForgetLinkFunction(data)
      .subscribe((apiResponse) => {
        if (apiResponse.status == 200) {
          this.toastr.success("Mail Sented Sucessfully", "Sucess!");
          Cookie.set('forget-email', data.email);
          setTimeout(() => {
            this.router.navigate(['/forget-password-msg']);
          }, 2000);
        }
        else {
          this.toastr.error(apiResponse.message, "Error!");
        }
      },
        (error) => {
          this.toastr.error("Some Error Occurred", "Error!");
        });

  }//end of sendResetLink 
  public goToSignIn: any = () => {

    this.router.navigate(['/']);

  } // end goToSignIn

}
