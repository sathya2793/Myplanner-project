import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-user-details',
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent implements OnInit {
  @Input() userFullName: any;
  @Input() userStatus: string;
  constructor() { }

  public firstChar: string;


  ngOnInit(): void {
    this.firstChar = this.userFullName[0];
  } // end ngOnInit

}
