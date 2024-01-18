import { Injectable } from '@angular/core';
// import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalComponent } from '../components/modal/modal.component';
@Injectable({
  providedIn: 'root'
})
export class ModalService {
  // private modalRef: NgbModalRef | null = null;

  constructor() { }

  openCheckInModal(roomNumber: number): void {
    // this.modalRef = this.modalService.open(ModalComponent);
    // this.modalRef.componentInstance.roomNumber = roomNumber;
  }

  // closeCheckInModal(): void {
  //   if (this.modalRef) {
  //     this.modalRef.close();
  //     this.modalRef = null;
  //   }
  // }
}
