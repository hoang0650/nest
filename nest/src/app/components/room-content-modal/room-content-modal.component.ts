import { Component, OnInit, Input } from '@angular/core';
import { EventData, RoomHistory } from 'src/app/interfaces/room';
import { ProductService } from 'src/app/services/product.service';
interface Event {
  type: string;
  payment: number;
  checkinTime: string;
  checkoutTime: string;
}

interface RoomData {
  roomNumber: number;
  events: Event[];
}

interface CheckoutData {
  checkoutTime: string;
  events: Event[];
}

@Component({
  selector: 'app-room-content-modal',
  templateUrl: './room-content-modal.component.html',
  styleUrls: ['./room-content-modal.component.css']
})

export class RoomContentModalComponent implements OnInit {

  @Input() roomData: any; // Assuming you will pass roomData as an Input

  listOfData: RoomHistory[] = [];

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.updateListOfData();
  }

  private updateListOfData(): void {
    this.productService.products$.subscribe(products => {
      const allEvents: any[] = [];

      // Flatten the list of events from different room numbers
      products.forEach(product => {
        allEvents.push(...product.events.map((event:any) => ({
          roomNumber: product.roomNumber,
          checkoutTime: event.checkoutTime
        })));
      });

      // Sort all events by checkout time in descending order
      allEvents.sort((a, b) => {
        return new Date(b.checkoutTime).getTime() - new Date(a.checkoutTime).getTime();
      });

      const n = allEvents.length;
      // Take the first item (latest checkout) from the sorted list
      const latestCheckout = allEvents[0];
      const nextNCheckouts = allEvents.slice(1, n + 1);

      // Access the roomNumber and other information if needed
      const roomNumber = latestCheckout.roomNumber;
      const checkoutTime = latestCheckout.checkoutTime;

      // Do something with roomNumber and checkoutTime

      console.log('Latest Checkout Time:', checkoutTime, 'for Room Number:', roomNumber);
      console.log('Next', n, 'Checkouts:', nextNCheckouts);
    });
  }
}
