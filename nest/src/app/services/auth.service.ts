import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelper } from 'angular2-jwt';
import { UserService } from '../services/user.service';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  loggedIn = false;
  isAdmin = false;
  jwtHelper: JwtHelper = new JwtHelper();
  currentUser = { _id: '', username: '', role: '' }
  constructor(private userService: UserService, private route:Router) {
    const token:any = localStorage.getItem('token');
    if(token){
      // const decodedUser = this.d
    }
   }

   login(emailAndPassword:any){
      return this.userService.login(emailAndPassword).subscribe(res=>{
        localStorage.setItem('token',res.token);
        const decodedUser = this.decodedUserFromToken(res.token);
        this.setCurrentUser(decodedUser);
        return this.loggedIn;
      })
   }

   logout(){
    localStorage.removeItem('token');
    this.loggedIn = false;
    this.isAdmin = false;
    this.currentUser = {_id:'', username:'', role:''};
    this.route.navigate(['/'])
   }

   decodedUserFromToken(token:any){
    return this.jwtHelper.decodeToken(token).user;
   }

   setCurrentUser(decodedUser:any){
    this.loggedIn = true;
    this.currentUser._id = decodedUser._id;
    this.currentUser.username = decodedUser.username;
    this.currentUser.role = decodedUser.role;
    decodedUser.role === 'admin' ? this.isAdmin = true: this.isAdmin = false;
    delete decodedUser.role;
   }

}
