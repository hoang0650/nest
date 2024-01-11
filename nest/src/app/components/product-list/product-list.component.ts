import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/services/product.service';
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css']
})
export class ProductListComponent implements OnInit {

  products = [
    { id: 1, name: 'Product 1', description: 'Description 1' },
    { id: 2, name: 'Product 2', description: 'Description 2' },
    // Thêm các sản phẩm khác
  ];
  
  constructor(public productService: ProductService) { }

  ngOnInit(): void {
    console.log('product', this.products[0].id);
    
  }

  onSelect(product: number): void {
    // this.productService.setSelectedProduct(product)
    const selectedProduct = this.productService.getProductById(product)
    console.log('Selected Product:', selectedProduct);
  }

}
