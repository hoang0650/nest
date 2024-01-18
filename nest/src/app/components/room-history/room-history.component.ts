import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
// import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-room-history',
  templateUrl: './room-history.component.html',
  styleUrls: ['./room-history.component.css']
})
export class RoomHistoryComponent implements OnInit {

  roomHistory: any [] = [];

  

  constructor(private productService:ProductService,
    // , private modal:ModalComponent
    ) { }

  ngOnInit(): void {
    this.productService.products$.subscribe((data)=>{
      this.roomHistory = data;
    })
  }

 

  

}
