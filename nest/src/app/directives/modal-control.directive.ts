import { Directive, HostListener, ElementRef,Input } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { RoomsService } from '../services/rooms.service';
import { ProductService } from '../services/product.service';
@Directive({
  selector: '[appModalControl]',
  exportAs: 'appModalControl'
})
export class ModalControlDirective {
  @Input() roomNumber!: number;

  constructor(private modalService: NzModalService, private productService:ProductService) { }


  @HostListener('click') onClick() {
    this.showModal();
  }

  showModal(): void {
    this.modalService.create({
      nzTitle: 'CheckIn',
      nzContent: 'Check in our room',
      // nzFooter: [
      //   {
      //     label: 'OK',
          
      //   },
      //   {
      //     label: 'Cancel',
      //   },
      // ],
      // Add more modal options as needed
    });
  }



}
