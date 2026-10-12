
create database Retail_Store;

create table Suppliers(
                          Sup_ID INT PRIMARY KEY AUTO_INCREMENT,
                          Sup_Name varchar(10),
                          S_ContactNumber varchar(20)
);

create table Products(
                         P_ID INT PRIMARY KEY AUTO_INCREMENT,
                         P_Name varchar(100),
                         Price DECIMAL(10,2),
                         Stock_Quantity     INT NOT NULL DEFAULT (0) CHECK (Stock_Quantity>=0),
                         Sup_ID INT
                        ,FOREIGN KEY (Sup_ID) REFERENCES Suppliers(Sup_ID)
);

create table Sales(
                      Sale_ID INT PRIMARY KEY AUTO_INCREMENT,
                      P_ID INT REFERENCES Products,
                      Quantity_Sold INT NOT NULL DEFAULT (0) CHECK (Quantity_Sold>=0),
                      Sale_Date date,
                      FOREIGN KEY (P_ID) REFERENCES Products(P_ID)
);

#Q14  Create user and grant permissions

CREATE USER IF NOT EXISTS 'store_manager'@'localhost'
IDENTIFIED BY 'Use_A_Strong_Password';

GRANT SELECT, INSERT, UPDATE
ON retail_store.*
TO 'store_manager'@'localhost';


#Q15 Revoke UPDATE permission
REVOKE UPDATE
    ON retail_store.*
    FROM 'store_manager'@'localhost';



#Q16 Grant DELETE only on Sales table
GRANT DELETE
    ON retail_store.Sales
    TO 'store_manager'@'localhost';
