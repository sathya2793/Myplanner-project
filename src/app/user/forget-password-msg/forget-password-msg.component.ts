import { Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Title } from '@angular/platform-browser';
@Component({
  selector: 'app-forget-password-msg',
  templateUrl: './forget-password-msg.component.html',
  styleUrls: ['./forget-password-msg.component.css']
})
export class ForgetPasswordMsgComponent implements OnInit {
  receiverName:string;
  constructor(public router: Router,
    private titleService: Title) { }

  ngOnInit() {
    this.titleService.setTitle("Forget Password Message");
    this.receiverName =  Cookie.get('forget-email');
  }

  public goToSignIn: any = () => {
    Cookie.delete('forget-email');
    this.router.navigate(['/']);
  } // end goToSignIn

  
}
