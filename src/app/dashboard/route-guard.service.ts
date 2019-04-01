import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})

export class RouteGuardService implements CanActivate {

  constructor(private router: Router,private toastr: ToastrService) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    let authToken = Cookie.get('authToken');
    console.log("in guard service");
    if (authToken === undefined || authToken === '' || authToken === null) {
      this.router.navigate(['/']);
      this.toastr.warning("Something went Wrong,Please Login again");
      return false;
    } else {
      return true;
    }

  }

}