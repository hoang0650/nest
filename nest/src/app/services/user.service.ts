import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json', 'charset': 'UTF-8' })
  private options = { headers: this.headers }
  constructor(private http: HttpClient) { }

  register(user: any): Observable<any> {
    return this.http.post('/api/user', JSON.stringify(user), this.options)
  }

  login(credentials: any): Observable<any> {
    return this.http.post('/api/login', JSON.stringify(credentials), this.options)
  }

  getUsers(): Observable<any> {
    return this.http.get('/api/users').pipe(map((res: any) => { return res.JSON() }))
  }

  countUsers(): Observable<any>{
    return this.http.get('/api/users/count').pipe(map((res:any)=>{return res.JSON()}))
  }

  addUser(user:any):Observable<any>{
    return this.http.post('/api/user', JSON.stringify(user), this.options)
  }

  getUser(user:any): Observable<any>{
    return this.http.get(`/api/user/${user._id}`).pipe(map((res:any)=>{return res.JSON()}))
  }

  editUser(user:any):Observable<any>{
    return this.http.put(`/api/user/${user._id}`, JSON.stringify(user), this.options)
  }

  deleteUser(user:any): Observable<any>{
    return this.http.delete(`/api/user/${user._id}`, this.options)
  }

}
