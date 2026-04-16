namespace my.app;

entity Students {
  key ID : Integer;
  name : String;
  age : Integer;
  course : String;
}

entity Books {
  key ID : Integer;
  title : String;
  author : String;
}

entity Orders {
  key ID : Integer;
  product : String;
  amount : Integer;
}

entity Employees {
  key ID : Integer;
  name : String;
  department : String;
}

entity Products {
  key ID : Integer;
  name : String;
  price : Integer;
}

entity Customers {
  key ID : Integer;
  name : String;
  city : String;
}

entity Sales {
  key ID : Integer;
  region : String;
  revenue : Integer;
}

entity Inventory {
  key ID : Integer;
  item : String;
  quantity : Integer;
}

entity Payments {
  key ID : Integer;
  method : String;
  amount : Integer;
}

entity Courses {
  key ID : Integer;
  title : String;
  duration : String;
}