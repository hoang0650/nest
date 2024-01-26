import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  private apiUrl = 'http://localhost:3000/rooms';

  constructor(private http: HttpClient) { }

  getRooms(){
    return this.http.get<any[]>(this.apiUrl);
  }

  checkInRoom(roomNumber: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/checkin/${roomNumber}`, {});
  }

  checkOutRoom(id: string): Observable<any> {
    return this.http.post<any[]>(`/api/checkout/${id}`, {});
  }

  // blockUser(id: string, action:string, payload: Object){
  //   return this.http.post(`${this.Root_url}/${id}/${action}`,payload={'blocked':true});
  // }

  checkOut(roomNumber: number): Observable<any> {
    const url = `${this.apiUrl}/checkout`;
    return this.http.post<any>(url, { roomNumber });
  }
}
