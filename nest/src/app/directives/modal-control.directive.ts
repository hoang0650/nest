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
  @Input() roomNumber: number | undefined;
  @Output() roomSelected = new EventEmitter<number>();

  constructor(
    private route: ActivatedRoute,
    private modalService: NzModalService,
    private roomsService: RoomsService,
    private productService: ProductService
  ) {}

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
              this.roomsService.checkInRoom(this.roomNumber).subscribe(
                (room) =>{
                  console.log('value', room);
                  modal.close();
                },
                (error) => {
                  console.error('Error during check-in:', error);
                  // Handle error or display a message to the user
                }
              );
              // Additional logic to close the modal if needed
            }
          },
        },
      ],
      // Add more modal options as needed
    });
  }
}
