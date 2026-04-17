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
  favorite : Boolean;
}

entity Orders {
  key ID : UUID;
  customer : String;
  amount : Decimal(10,2);
  status   : String;
}

entity Employees {
  key ID : Integer;
  name : String;
  department : String;
  salary : Integer;
  status : String;
}

