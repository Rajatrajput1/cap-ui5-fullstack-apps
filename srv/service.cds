using { my.app as db } from '../db/schema';

service CatalogService {
  entity Students as projection on db.Students;
  entity Books as projection on db.Books;
  entity Orders as projection on db.Orders;
  entity Employees as projection on db.Employees;
  entity Products as projection on db.Products;
  entity Feedback as projection on db.Feedback;

 
}