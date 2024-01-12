import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {

  roomNumber: number = 101; // Replace with actual room number
  isActive: boolean = true; // Replace with actual logic
  showHistory: boolean = false;
  history: any[] = [
    { date: new Date(), action: 'Checked in' },
    // Add more history items as needed
  ];
  roomHistory: any[] = [];

  constructor(public productService: ProductService) { }

  ngOnInit(): void {
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;

    if (this.showHistory) {
      // Fetch data from ProductService and set it in RoomHistoryComponent
      const historyData = this.productService.products$;
      // You can update this logic based on your actual data retrieval mechanism
      // this.productService.updateProducts([...<any>historyData, { date: new Date(), action: 'Viewed history' }]);
      this.roomHistory=[...<any>historyData, { date: new Date(), action: 'Viewed history' }];
    }
  }
}


