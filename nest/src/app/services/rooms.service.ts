import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class RoomsService {
  private apiUrl = 'http://localhost:3000/rooms';

  constructor(private http: HttpClient) { }

  getRooms(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  checkIn(roomNumber: number): Observable<any> {
    const url = `${this.apiUrl}/checkin`;
    return this.http.post<any>(url, { roomNumber });
  }

  checkOut(roomNumber: number): Observable<any> {
    const url = `${this.apiUrl}/checkout`;
    return this.http.post<any>(url, { roomNumber });
  }
}
