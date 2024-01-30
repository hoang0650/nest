import { Directive, HostListener, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { NzModalService, NzModalRef } from 'ng-zorro-antd/modal';
import { RoomsService } from '../services/rooms.service';
import { ProductService } from '../services/product.service';
import { take, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Directive({
  selector: '[appModalControl]',
  exportAs: 'appModalControl'
})
export class ModalControlDirective implements OnInit, OnDestroy {
  @Input() room: any; // Assuming you pass the entire room object to the directive
  @Output() roomSelected = new EventEmitter<any>();
  newRoom: any

  private destroy$ = new Subject<void>();
  private modalRef: NzModalRef | null = null;

  constructor(
    private modalService: NzModalService,
    private roomsService: RoomsService,
  ) {
    this.newRoom = { values: {} }
  }

  ngOnInit(): void {
    // Additional initialization logic if needed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('click') onClick() {
    if (this.room) {
      console.log('room1', this.room);
      this.newRoom = this.room
      console.log('new', this.newRoom);

      this.roomSelected.emit(this.room._id);

      this.showModal();
    }
  }

  showModal(): void {
    this.modalRef = this.modalService.create({
      nzTitle: 'Check-In',
      nzContent: 'Check in our room',
      nzFooter: [
        {
          label: 'OK',
          type: 'primary',
          onClick: () => this.handleCheck(),
        },
      ],
      // Add more modal options as needed
    });
  }

  handleCheck(): void {
    if (!this.room || !this.room._id) {
      console.warn('Invalid room or room ID provided.');
      this.modalRef?.close();
      return;
    }
  
    const lastEvent = this.room.events[this.room.events.length - 1];
  
    if (this.room.roomStatus === 'available') {
      // Room is available, perform check-in
      this.newRoom = {
        roomStatus: 'active',
        events: [
          ...this.room.events,
          {
            type: 'checkin',
            checkinTime: new Date(),
          },
        ],
      };
      this.roomsService.checkInRoom(this.room._id, this.newRoom)
      .pipe(take(1))
      .subscribe(
        (room) => {
          console.log('Check-in/out successful. Room:', room);
          this.modalRef?.close();
        },
        (error) => {
          console.error('Error during check-in/out:', error);
          this.modalRef?.close();
        }
      );
    } else if (this.room.roomStatus === 'active' && lastEvent.type === 'checkin') {
      // Room is active and last event is check-in, perform check-out
      lastEvent.type = 'checkout';
      lastEvent.checkoutTime = new Date();
      lastEvent.payment = this.calculatePayment(lastEvent.checkinTime, lastEvent.checkoutTime);
  
      this.newRoom = {
        roomStatus: 'dirty',
        events: [...this.room.events],
      };
      this.roomsService.checkOutRoom(this.room._id, this.newRoom)
      .pipe(take(1))
      .subscribe(
        (room) => {
          console.log('Check-in/out successful. Room:', room);
          this.modalRef?.close();
        },
        (error) => {
          console.error('Error during check-in/out:', error);
          this.modalRef?.close();
        }
      );
    } else {
      // Handle other cases as needed
      console.warn('Invalid room status or room not in a check-in state for check-in/check-out.');
      this.modalRef?.close();
      return;
    }
  }

  calculatePayment(checkinTime: any, checkoutTime: Date): number {
    if (checkinTime && checkoutTime) {
      // Chuyển đổi chuỗi ngày thành đối tượng Date
      const checkinDate = new Date(checkinTime);
  
      const durationInHours = Math.ceil((checkoutTime.getTime() - checkinDate.getTime()) / (1000 * 60 * 60));
  
      let payment = 0;
  
      // Giá cho giờ đầu là 50$
      payment += this.room.hourlyRate;
  
      // Nếu durationInHours < 8, cộng thêm 10$ cho mỗi giờ tiếp theo
      if(durationInHours<=1){
        payment = this.room.hourlyRate;
      } else if (durationInHours > 1 && durationInHours <= 8) {
        payment += (durationInHours - 1) * 10000;
      } else if (durationInHours > 8) {
        // Nếu durationInHours > 8, cộng thêm 10$ cho mỗi giờ tiếp theo sau 8 giờ
        payment += (8 - 1) * 10000;
      } else if (durationInHours<=12){
        payment = this.room.nightlyRate
      } else if (durationInHours < 24){
        payment = this.room.dailyRate
      } else {
        const nights = Math.ceil(durationInHours / 24);
        payment = this.room.nightlyRate * nights;
      }
  
      return payment;
    } else {
      // Handle the case where checkinTime or checkoutTime is undefined
      return 0;
    }
  }
  
  
}