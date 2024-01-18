import { Component } from '@angular/core';


declare var $: any;
@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {

  constructor() {}

  open(){
    $('#exampleModal').modal('show')
  }

  close(){
    $('#exampleModal').modal('hide')
  }

  
  


}
