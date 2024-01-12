import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private productsSource = new BehaviorSubject<any[]>([]);
  products$ = this.productsSource.asObservable()
  // products$ = this.apiService.loadData<any>('products');

  constructor(private apiService: ApiService) {
    // Mô phỏng việc tải dữ liệu từ server
    this.loadProducts();
  }

  private loadProducts() {
    // Giả sử có một API hoặc dữ liệu từ server
    const fakeServerData = [
      { id: 1, name: 'Product 1', description: 'Description 1' },
      { id: 2, name: 'Product 2', description: 'Description 2' },
      { id: 3, name: 'Product 3', description: 'Description 3' },
      { id: 4, name: 'Product 1', description: 'Description 4' },
      { id: 5, name: 'Product 2', description: 'Description 5' },
      { id: 6, name: 'Product 3', description: 'Description 6' },
      { id: 7, name: 'Product 1', description: 'Description 7' },
      { id: 8, name: 'Product 2', description: 'Description 8' },
     
    ];

    // Cập nhật dữ liệu trong BehaviorSubject
    this.productsSource.next(fakeServerData);

    // Gọi API để lấy dữ liệu sản phẩm
    //  this.http.get<any[]>('YOUR_API_ENDPOINT').subscribe(
    //   data => {
    // Cập nhật dữ liệu trong BehaviorSubject
    //     this.productsSource.next(data);
    //   },
    //   error => {
    //     console.error('Error loading products:', error);
    //   }
    // );
  }
  
  updateProducts(newData: any[]): void {
    this.productsSource.next(newData);
  }

  setSelectedProduct(product: any): void {
    this.productsSource.next(product);
  }

  getSelectedProduct(): Observable<any> {
    return this.productsSource.asObservable();
  }

  getProductById(id: number): any {
    // Lấy sản phẩm từ dữ liệu hiện tại
    const currentProducts = this.productsSource.value;
    return currentProducts.find(product => product.id === id);
  }


}
