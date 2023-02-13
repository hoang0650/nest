import { Component } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { User } from './interfaces/users';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'nest';
  private usersCollection: AngularFirestoreCollection<User>;
  users: Observable<User[]>;
  // user1s: User[]=[];
  constructor(private readonly afs: AngularFirestore) {
    this.usersCollection = afs.collection<User>('Nest');
    //this.items = this.itemsCollection.valueChanges();
    // .valueChanges() is simple. It just returns the 
    // JSON data without metadata. If you need the 
    // doc.id() in the value you must persist it your self
    // or use .snapshotChanges() instead. Only using for versions 7 and earlier



    this.users = this.usersCollection.valueChanges({ idField: 'keyid' }); //chỉ sử dụng cho Angular 8,9
    this.users.subscribe(data => {
      console.log('data',data);
      
    })
    //id1: ten field đại diện cho documnent id, lưu ý không 
    //được đặt trùng với tên field khai báo trong dữ liệu
  }
}
