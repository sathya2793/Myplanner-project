import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Cookie } from "ng2-cookies/ng2-cookies";


@Injectable({
  providedIn: 'root'
})
export class AppService {
  
  private url = "https://myplannerbackend.sathyainfotechpro.com/api/v1/users";  

  constructor(public http: HttpClient) { } // end constructor

  public getUserInfoFromLocalstorage = () => {
    return JSON.parse(localStorage.getItem("userInfo"));
  }; // end getUserInfoFromLocalstorage

  public signupFunction(data: any): Observable<any> {
    const params = new HttpParams()
      .set("firstName", data.firstName)
      .set("lastName", data.lastName)
      .set("userName",data.userName)
      .set("countryName", data.countryName)
      .set("mobileNumber", data.mobileNumber)
      .set("email", data.email)
      .set("password", data.password)
    return this.http.post(`${this.url}/signup`, params);
  } // end of signupFunction function.

  public editUserFunction(data: any): Observable<any> {
    const params = new HttpParams()
      .set("firstName", data.firstName)
      .set("lastName", data.lastName)
      .set("countryName", data.countryName)
      .set("mobileNumber", data.mobileNumber)
    return this.http.post(`${this.url}/editUser/${data.userId}?authToken=${data.authToken}`, params);
  } // end of editUserFunction function.

  public changePassword(data: any): Observable<any> {
    const params = new HttpParams()
      .set("password", data.password)
    return this.http.post(`${this.url}/changePassword/${data.userId}?authToken=${data.authToken}`, params);
  } // end of changePassword function.

  public getCountryList(): Observable<any> {
    return this.http.get("../assets/json/countryList.json");
  }//end getCountryList

  public getCountryCodes(): Observable<any> {
    return this.http.get("../assets/json/countryCodes.json");
  }//end getCountryCodes

  public signinFunction(data: any): Observable<any> {
    const params = new HttpParams()
      .set("email", data.email)
      .set("password", data.password);
    return this.http.post(`${this.url}/login`, params);
  } // end of signinFunction function.

  public setUserInfoInLocalStorage = data => {
    localStorage.setItem("userInfo", JSON.stringify(data));
  };// end of setUserInfoInLocalStorage functions.

  public sendForgetLinkFunction(data: any): Observable<any> {
    const params = new HttpParams()
      .set("email", data.email);
    return this.http.post(`${this.url}/forgotPassword`, params);
  }//end sendResetLink function

  public sendResetLinkFunction(data: any): Observable<any> {
    const params = new HttpParams()
      .set("password", data.password);
    return this.http.post(`${this.url}/resetPassword/${data.userId}`, params);
  }//end sendResetLink function

  public sendVerifyLinkFunction(data: any): Observable<any> {
    const params = new HttpParams()
      .set("secretToken", data.secretToken);
    return this.http.post(`${this.url}/verify`, params);
  }

  public logout(data): Observable<any> {
    const params = new HttpParams()
      .set("userId", Cookie.get("receiverId"));
    return this.http.post(`${this.url}/logout?authToken=${data.authToken}`, params);
  } // end logout function

  public getallUserList(data): Observable<any> {
    if(data.query === undefined || data.query === "" || data.query === null)
    {
      return this.http.get(`${this.url}/getallUserList?pageNo=${data.pageNo}&size=${data.size}&authToken=${data.authToken}`);
    }
    else{
      return this.http.get(`${this.url}/getallUserList?pageNo=${data.pageNo}&size=${data.size}&query=${data.query}&authToken=${data.authToken}`);
    }
  } // end getFriendList function

  private handleError(err: HttpErrorResponse) {
    let errorMessage = "";
    if (err.error instanceof Error) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${
        err.message
        }`;
    } // end condition *if
    console.error(errorMessage);
    return Observable.throw(errorMessage);
  } // END handleError


}