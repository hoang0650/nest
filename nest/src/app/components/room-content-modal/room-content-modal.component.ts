import { Component, OnInit, Input } from '@angular/core';
import { ItemData} from 'src/app/interfaces/room';
import { ProductService } from 'src/app/services/product.service';

@Component({
  selector: 'app-room-content-modal',
  templateUrl: './room-content-modal.component.html',
  styleUrls: ['./room-content-modal.component.css']
})

export class RoomContentModalComponent implements OnInit {

  @Input() roomData: any; // Assuming you will pass roomData as an Input

  listData: any [] = []

  constructor() { }

  ngOnInit(): void {
  this.fetchCurrentRoom()
  }

  fetchCurrentRoom(): void{
    if(this.roomData.roomNumber){
      const lastEvents = this.roomData.events[this.roomData.events.length -1]
      this.listData =[lastEvents]
    }   
  }


  

}

