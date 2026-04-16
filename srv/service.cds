using { my.app as db } from '../db/schema';

service CatalogService {
  entity Students as projection on db.Students;
  entity Books as projection on db.Books;
  entity Orders as projection on db.Orders;
  entity Employees as projection on db.Employees;
  entity Products as projection on db.Products;
  entity Customers as projection on db.Customers;
  entity Sales as projection on db.Sales;
  entity Inventory as projection on db.Inventory;
  entity Payments as projection on db.Payments;
  entity Courses as projection on db.Courses;
}