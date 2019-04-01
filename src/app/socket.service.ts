import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpErrorResponse } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class SocketService {
 
  private url ='https://myplannerbackend.sathyainfotechpro.com';
  private socket;

  constructor(public http: HttpClient) {
    // connection is being created i.e handshake
    this.socket = io(this.url);
    console.log("socket connected");
  }

  public verifyUser = () =>{
    return Observable.create((observer)=>{
      this.socket.on("verify-user",(socketData)=>{
        observer.next(socketData)
      })
    })
  }//end verify user

  public setUser = (token) => {
    this.socket.emit("set-user", token);
  }//end set user

  public onlineUserList = () => {
    return Observable.create((observer) => {
      this.socket.on("onlineUsersPlannerList", (userList) => {
        observer.next(userList);
      }); // end Socket
    }); // end Observable
  } // end onlineUserList

  public messageSent = (data) => {
    this.socket.emit('notify', data);
  }//end messageSent

  public messageReceiver = () => {
    return Observable.create((observer) => {
      this.socket.on("msg", (data) => {
        observer.next(data);
      });//end socket
    });//end return of Observable
  }//end messageReceiver

  public messageSentById = (data) => {
    this.socket.emit('notifyById', data);
  }

  public messageReceiverById = (userId) => {
    return Observable.create((observer) => {
      this.socket.on(userId, (data) => {
        observer.next(data);
      });//end socket
    });//end return of Observable
  }

  public exitSocket = ()  => {
    this.socket.emit("disconnect", "");
  }

  public handleError = (err: HttpErrorResponse) => {
    let errorMessage = '';
    if (err.error instanceof Error) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message}`;
    } // end condition *if
    console.error(errorMessage);
    return Observable.throw(errorMessage);
  }  // END handleError
}
