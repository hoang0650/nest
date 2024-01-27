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

  checkInRoom(id: string, payload: object): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/checkin/${id}`, payload);
  }

  checkOutRoom(id: string, payload: object): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/checkout/${id}`, payload);
  }

  // blockUser(id: string, action:string, payload: Object){
  //   return this.http.post(`${this.Root_url}/${id}/${action}`,payload={'blocked':true});
  // }

  checkOut(roomNumber: number): Observable<any> {
    const url = `${this.apiUrl}/checkout`;
    return this.http.post<any>(url, { roomNumber });
  }
}
