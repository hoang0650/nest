import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
import { Subscription } from 'rxjs';
import { NzMarks } from 'ng-zorro-antd/slider';
import { ModalService } from 'src/app/services/modal.service';
import { ModalControlDirective } from 'src/app/directives/modal-control.directive';
import { RoomsService } from 'src/app/services/rooms.service';
@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.css']
})
export class RoomComponent implements OnInit {
  // private productsSubscription: Subscription;

  roomNumber!: number // Replace with actual room number
  isActive: boolean = true; // Replace with actual logic
  history: any[] = [
    { date: new Date(), action: 'Checked in' },
    // Add more history items as needed
  ];
  rooms: any[] = [];
  selectedRoomId: string | null = null;

  constructor(public productService: ProductService, private roomService: RoomsService) {
    // this.productsSubscription = this.productService.products$.subscribe((products) => {
    //   this.rooms = products.map((product, index) => ({ id: index + 1, name: `Room ${index + 1}` }));
    // });
  }


  ngOnInit(): void {
  }

  //antd

  hGutter = 16;
  vGutter = 16;
  count = 4;
  array = new Array(this.count);
  marksHGutter: NzMarks = {
    8: '8',
    16: '16',
    24: '24',
    32: '32',
    40: '40',
    48: '48'
  };
  marksVGutter: NzMarks = {
    8: '8',
    16: '16',
    24: '24',
    32: '32',
    40: '40',
    48: '48'
  };
  marksCount: NzMarks = {
    2: '2',
    3: '3',
    4: '4',
    6: '6',
    8: '8',
    12: '12'
  };
  reGenerateArray(count: number): void {
    this.rooms = Array.from({ length: count }, (_, index) => ({ id: index + 1, name: `Room ${index + 1}` }));
  }

  switchValue = false;

  onSelect(roomId: any): void {
    // this.productService.setSelectedProduct(product)
    this.selectedRoomId = roomId;
  }

  // onCheckIn(): void {
  //   if (this.selectedRoomId) {
  //     console.log('Check-in for room:', this.selectedRoomId);
  //   }
  // }


}


