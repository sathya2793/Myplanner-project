import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Title } from '@angular/platform-browser';
import { verifyData} from './verify'
@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {
  public secretToken : string;
  constructor(public appService: AppService,
    public router: Router,
    private toastr: ToastrService,
    private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Verify");
  }
  
  public sendVerifyLink :any = () => {
    let data:verifyData = {
      secretToken: this.secretToken
    }
    this.appService.sendVerifyLinkFunction(data)
      .subscribe((apiResponse) => {
        if (apiResponse.status === 200) {
          this.toastr.success("Thank you! Now you may login.", "Success!");
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 2000);
        }
        else {
          this.toastr.error(apiResponse.message, "Error!");
        }
      }),
        (error) => {
          this.toastr.error("Some Error Occurred", "Error!");
        }
  }//end of sendResetLink

  public goToSignIn: any = () => {

    this.router.navigate(['/']);

  } // end goToSignIn
}
