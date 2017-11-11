import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/do';

import { UserModel } from './models/user.model';
import { environment } from '../environments/environment';
import { JwtInterceptorService } from './jwt-interceptor.service';

@Injectable()
export class UserService {

  public userEvents = new BehaviorSubject<UserModel>(undefined);

  constructor(private http: HttpClient, private jwtInterceptor: JwtInterceptorService) {
    this.retrieveUser();
  }

  register(login, password, birthYear): Observable<UserModel> {
    const body = { login, password, birthYear };
    return this.http.post<UserModel>(environment.baseUrl + '/api/users', body);
  }

  authenticate(credentials): Observable<UserModel> {
    return this.http.post<UserModel>(environment.baseUrl + '/api/users/authentication', credentials)
      .do((user: UserModel) => this.storeLoggedInUser(user));
  }

  storeLoggedInUser(user) {
    window.localStorage.setItem('rememberMe', JSON.stringify(user));
    this.userEvents.next(user);
    this.jwtInterceptor.setJwtToken(user.token);
  }

  retrieveUser() {
    const strUser = window.localStorage.getItem('rememberMe');
    if (strUser) {
      const user = JSON.parse(strUser);
      this.userEvents.next(user);
      this.jwtInterceptor.setJwtToken(user.token);
    }
  }

  logout() {
    window.localStorage.removeItem('rememberMe');
    this.userEvents.next(null);
    this.jwtInterceptor.removeJwtToken();
  }

}
