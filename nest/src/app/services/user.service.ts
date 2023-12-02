import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, BehaviorSubject } from 'rxjs';
import { User } from '../interfaces/users';
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private headers = new HttpHeaders({ 'Content-Type': 'application/json', 'charset': 'UTF-8' })
  private options = { headers: this.headers }
  private apiUrl = 'http://localhost:3000/users'
  private loggedIn = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient) { }

  get isLoggedIn(): Observable<boolean>{
    return this.loggedIn.asObservable();
  }

  //1. sử dụng kiểu any
  // signUp(userData: any): Observable<any>{
  //   return this.http.post(`${this.apiUrl}/signup`,userData);
  // }

  //2. sử dụng interface
  signUp(userData: User): Observable<User>{
    return this.http.post<User>(`${this.apiUrl}/signup`,userData);
  }
  
  register(user: any): Observable<any> {
    return this.http.post('/api/user', JSON.stringify(user), this.options)
  }

  // 1. login with JSON
  // login(credentials: any): Observable<any> {
  //   return this.http.post('/api/login', JSON.stringify(credentials), this.options)
  // }

  login(userData:any): Observable<any>{
    this.loggedIn.next(true)
    return this.http.post<User>(`${this.apiUrl}/login`,userData);
  }

  logout(): void {
    return this.loggedIn.next(false)
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
