import { Directive, HostListener, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { RoomsService } from '../services/rooms.service';
import { ActivatedRoute } from '@angular/router';
import { ProductService } from '../services/product.service';
import _ from 'lodash';

@Directive({
  selector: '[appModalControl]',
  exportAs: 'appModalControl'
})
export class ModalControlDirective implements OnInit {
  @Input() roomNumber: string | undefined;
  @Output() roomSelected = new EventEmitter<any>();

  newRoom: any;
  

  constructor(
    private route: ActivatedRoute,
    private modalService: NzModalService,
    private roomsService: RoomsService,
    private productService: ProductService
  ) {
    this.newRoom = { 
      values:{}
    }
  }
  

  ngOnInit(): void {
    // Additional initialization logic if needed
  }

  @HostListener('click') onClick() {
    if (this.roomNumber !== undefined) {
      console.log('roomid', this.roomNumber);
      this.roomSelected.emit(this.roomNumber);
      this.showModal();
    }
  }

  showModal(): void {
    console.log('Show modal function executed');
    const modal =this.modalService.create({
      nzTitle: 'CheckIn',
      nzContent: 'Check in our room',
      nzFooter: [
        {
          label: 'OK',
          type: 'primary',
          onClick: () => {
            console.log('Update room status function executed');
            if (this.roomNumber) {
              console.log('roomid2', this.roomNumber);
              // Perform check-in logic using the roomsService
              // var events:any = {
              //   type: 'checkout',
              //   checkoutTime: new Date(),
              //   roomStatus: 'dirty'
              // }
              var events:any = {
                type: 'checkin',
                checkinTime: new Date(),
                roomStatus: 'active'
              }
            this.newRoom['events'] = events
              this.roomsService.checkInRoom(this.roomNumber, this.newRoom).subscribe(
                (room) =>{
                  console.log('value', room);
                  modal.close();
                },
                (error) => {
                  console.error('Error during check-in:', error);
                }
              );
              // this.roomsService.checkOutRoom(this.roomNumber, this.newRoom).subscribe(
              //   (room) =>{
              //     console.log('value', room);
              //     modal.close();
              //   },
              //   (error) => {
              //     console.error('Error during check-in:', error);
              //   }
              // );
            }
          },
        },
      ],
      // Add more modal options as needed
    });
  }
  // calculatePayment(checkinTime: Date, checkoutTime: Date): number {
  //   const durationInHours = Math.ceil((checkoutTime.getTime() - checkinTime.getTime()) / (1000 * 60 * 60));
  
  //   let payment = 0;
  
  //   if (durationInHours <= 1) {
  //     payment = this.roomSelected.hourlyRate;
  //   } else if (durationInHours <= 24) {
  //     payment = this.roomSelected.dailyRate;
  //   } else {
  //     // For longer durations, calculate based on nightly rate
  //     const nights = Math.ceil(durationInHours / 24);
  //     payment = this.roomSelected.nightlyRate * nights;
  //   }
  
  //   return payment;
  // }

}
