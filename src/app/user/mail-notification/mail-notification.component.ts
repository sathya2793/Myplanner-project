import { Component, OnInit } from '@angular/core';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-mail-notification',
  templateUrl: './mail-notification.component.html',
  styleUrls: ['./mail-notification.component.css']
})
export class MailNotificationComponent implements OnInit {
  receiverName:string;

  constructor(public router: Router,
    private titleService: Title) { }

  ngOnInit() {
    this.receiverName =  Cookie.get('email-id');
      this.titleService.setTitle("Mail Notification");
  }

  public goToSignIn: any = () => {
    Cookie.delete('email-id');
    this.router.navigate(['/']);
  } // end goToSignIn
}
