import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private url = "https://myplannerbackend.sathyainfotechpro.com/api/v1/schedule";

  constructor(public http: HttpClient) { } // end constructor
 
  public createNewList(data: any): Observable<any> {
    console.log(JSON.stringify(data));
    const params = new HttpParams()
      .set("adminId", data.adminId)
      .set("adminName", data.adminName)
      .set("eventName", data.eventName)
      .set("start", data.start)
      .set("end", data.end)
      .set("venue", data.venue)
      .set("description", data.description)
      .set("participateId", data.participateId)
      .set("participateName", data.participateName)
    return this.http.post(`${this.url}/createMeeting?authToken=${data.authToken}`, params);
  } // end of createNewList function.

  public updateList(data: any): Observable<any> {
    const params = new HttpParams()
      .set("id",data.id)
      .set("adminId", data.adminId)
      .set("adminName", data.adminName)
      .set("eventName", data.eventName)
      .set("start", data.start)
      .set("end", data.end)
      .set("venue", data.venue)
      .set("description", data.description)
      .set("participateId", data.participateId)
      .set("participateName", data.participateName)
    return this.http.post(`${this.url}/updateMeeting?authToken=${data.authToken}`, params);
  } // end of createNewList function.

  public deleteList(data: any): Observable<any> {
    const params = new HttpParams()
    .set("id",data.id)
    return this.http.post(`${this.url}/deleteMeeting?authToken=${data.authToken}`, params);
  } // end of createNewList function.

  public getAllSchedule(data:any): Observable<any> {
    return this.http.get(`${this.url}/getAllSchedule/${data.adminId}?authToken=${data.authToken}`);
  } // end of getAllSchedule

  public getSingleSchedule(data:any): Observable<any> {
    return this.http.get(`${this.url}/getAllSingleUserSchedule/${data.userId}?authToken=${data.authToken}`);
  } // end of getSingleSchedule


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
