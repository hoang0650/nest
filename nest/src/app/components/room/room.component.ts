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
  roomNumber!: number // Replace with actual room number
  rooms: any[] = [];
  selectedRoomId: string | null = null;

  constructor(public productService: ProductService) {
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

  getRoomStatusClass(roomStatus: any): string {
    switch (roomStatus) {
      case 'available':
        return 'inactive-room';
      case 'active':
        return 'active-room';
      case 'dirty':
        return 'dirty-room';
      default:
        return 'inactive-room'; // Handle any other cases or return a default class
    }
  }

  switchValue = false;

  onSelect(roomId: any): void {
    this.selectedRoomId = roomId;
  }



}


