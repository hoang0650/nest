import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  isLoggedIn = false;

  constructor(private userService: UserService) {
    this.userService.isLoggedIn.subscribe((status)=>{
      this.isLoggedIn = status
    })
  }

  ngOnInit(): void {
  }

  logOut(){
    this.userService.logout()
  }

}
