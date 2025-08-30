CREATE DATABASE IF NOT EXISTS LivestockDB;
USE LivestockDB;

-- 1. FARM
CREATE TABLE FARM (
    FarmID INT PRIMARY KEY,
    FarmName VARCHAR(50),
    areaName VARCHAR(150),
    City VARCHAR(50),
    district VARCHAR(50),
    zip VARCHAR(50),
    country VARCHAR(50)
);

-- 2. LIVE_STOCK
CREATE TABLE LIVE_STOCK (
    animal_id INT PRIMARY KEY,
    animal_type VARCHAR(50),
    birth_date DATE,
    gender VARCHAR(8),
    rearing_period INT,
    breed VARCHAR(50),
    farm_id INT,
    CONSTRAINT fk_farm Foreign KEY (farm_id) REFERENCES FARM(FarmID)
);

-- 3. PURCHASE_RECORD
CREATE TABLE PURCHASE_RECORD (
    purchase_id INT PRIMARY KEY,
    liveStockPrice DOUBLE,
    date DATE,
    farm_id INT,
    animal_Id INT,
    CONSTRAINT fk_farm_1 FOREIGN KEY (farm_id) REFERENCES FARM(FarmID),
    CONSTRAINT fk_animal FOREIGN KEY (animal_Id) REFERENCES LIVE_STOCK(animal_id)
);

-- 4. LIVE_STOCK_W
CREATE TABLE LIVE_STOCK_W (
    animal_id INT,
    date DATE,
    weight FLOAT,
    CONSTRAINT pk_animal PRIMARY KEY (animal_id, date, weight)
);

-- 5. LIVE_STOCK_CARE
CREATE TABLE LIVE_STOCK_CARE (
    LS_care_id INT PRIMARY KEY,
    type VARCHAR(50),
    name VARCHAR(100),
    manufacturer VARCHAR(100),
    genericName VARCHAR(100),
    manufacturer_date DATE,
    expire_date DATE
);

-- 6. LIVE_STOCK_CARE_RECORDS
CREATE TABLE LIVE_STOCK_CARE_RECORDS (
    record_id INT PRIMARY KEY,
    date DATE,
    time DATE,
    givenQunatity INT,
    animal_Id INT,
    LS_care_id INT,
    CONSTRAINT fk_animal_1 FOREIGN KEY (animal_Id) REFERENCES LIVE_STOCK(animal_id),
    CONSTRAINT fk_LS_care FOREIGN KEY (LS_care_id) REFERENCES LIVE_STOCK_CARE(LS_care_id)
);

-- 7. SLAUGHTER_HOUSE
CREATE TABLE SLAUGHTER_HOUSE (
    slaughterHouse_id INT PRIMARY KEY,
    area VARCHAR(100),
    city VARCHAR(100),
    country VARCHAR(100),
    slaughter_house_capacity FLOAT
);

-- 8. SLAUGHTER_HOUSE_ANIMAL
CREATE TABLE SLAUGHTER_HOUSE_ANIMAL (
    slaughterHouse_id INT PRIMARY KEY,
    typeOfAnimal VARCHAR(50)
);

-- 9. WAREHOUSE
CREATE TABLE WAREHOUSE (
    warehouse_id INT PRIMARY KEY,
    area VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    storage_capacity FLOAT,
    storage_feature VARCHAR(50)
);

-- 10. SHIPMENT
CREATE TABLE SHIPMENT (
    shipmentId INT PRIMARY KEY,
    shipmentDate DATE,
    time DATE,
    rate FLOAT,
    `from` VARCHAR(100),
    `to` VARCHAR(100),
    type VARCHAR(50),
    warehouseId INT,
    CONSTRAINT fk_wareHouse FOREIGN KEY (warehouseId) REFERENCES WAREHOUSE(warehouse_id)
);

-- 11. AGENT
CREATE TABLE AGENT (
    agent_Id INT PRIMARY KEY,
    agentName VARCHAR(50),
    area VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    country VARCHAR(50)
);

-- 12. MEAT_BATCH
CREATE TABLE MEAT_BATCH (
    batch_id INT PRIMARY KEY,
    meat_type VARCHAR(50),
    quantity INT,
    produce_date DATE,
    total_weight FLOAT,
    animal_Id INT,
    slaughterHouseId INT,
    shipment_Id INT,
    agent_Id INT,
    CONSTRAINT fk_animalid FOREIGN KEY (animal_Id) REFERENCES LIVE_STOCK(animal_id),
    CONSTRAINT fk_slaughter FOREIGN KEY (slaughterHouseId) REFERENCES SLAUGHTER_HOUSE(slaughterHouse_id),
    CONSTRAINT fk_shipment FOREIGN KEY (shipment_Id) REFERENCES SHIPMENT(shipmentId),
    CONSTRAINT fk_agent FOREIGN KEY (agent_Id) REFERENCES AGENT(agent_Id)
);

-- 13. INDUSTRY
CREATE TABLE INDUSTRY (
    industry_Id INT PRIMARY KEY,
    shopName VARCHAR(100),
    area VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    country VARCHAR(50),
    industryType VARCHAR(50)
);

-- 14. MEAT_PRODUCT
CREATE TABLE MEAT_PRODUCT (
    Meatproduct_Id INT PRIMARY KEY,
    nutritionInfo VARCHAR(100),
    packagingDate DATE,
    expireDate DATE,
    price FLOAT,
    quantity INT,
    industryId INT
);

-- 15. CUSTOMER
CREATE TABLE CUSTOMER (
    customer_Id INT PRIMARY KEY,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    phoneNumber VARCHAR(50),
    address VARCHAR(100)
);

-- 16. `Order`
CREATE TABLE `Order` (
    orderID INT PRIMARY KEY,
    orderDate DATE,
    totalQuantity FLOAT,
    totalPrice FLOAT,
    customer_Id INT,
    industryId INT,
    MeatProduct_Id INT,
    CONSTRAINT fk_customer FOREIGN KEY (customer_Id) REFERENCES CUSTOMER(customer_Id),
    CONSTRAINT fk_industry FOREIGN KEY (industryId) REFERENCES INDUSTRY(industry_Id),
    CONSTRAINT fk_meat FOREIGN KEY (MeatProduct_Id) REFERENCES MEAT_PRODUCT(Meatproduct_Id)
);

-- 17. DELIVERY
CREATE TABLE DELIVERY (
    deliveryId INT PRIMARY KEY,
    deliveryDate DATE,
    type VARCHAR(50),
    rate FLOAT,
    `from` VARCHAR(100),
    `to` VARCHAR(100),
    orderID INT,
    warehouse_ID INT,
    Meatproduct_Id INT,
    industry_ID INT,
    CONSTRAINT fk_order FOREIGN KEY (orderID) REFERENCES `Order`(orderID),
    CONSTRAINT fk_warehouse_id FOREIGN KEY (warehouse_ID) REFERENCES WAREHOUSE(warehouse_id),
    CONSTRAINT fk_meatproduct FOREIGN KEY (Meatproduct_Id) REFERENCES MEAT_PRODUCT(Meatproduct_Id),
    CONSTRAINT fk_industryid FOREIGN KEY (industry_ID) REFERENCES INDUSTRY(industry_Id)
);

-- 18. SALES_RECORD
CREATE TABLE SALES_RECORD (
    salesId INT PRIMARY KEY,
    meatBatchPrice FLOAT,
    quantity FLOAT,
    date DATE,
    agentId INT,
    industryId INT,
    batch_id INT,
    CONSTRAINT fk_agent_id FOREIGN KEY (agentId) REFERENCES AGENT(agent_Id),
    CONSTRAINT fk_industry_id FOREIGN KEY (industryId) REFERENCES INDUSTRY(industry_Id),
    CONSTRAINT fk_batch FOREIGN KEY (batch_id) REFERENCES MEAT_BATCH(batch_id)
);

-- 19. ORDER_LINE
CREATE TABLE ORDER_LINE (
    orderID INT,
    industryId INT,
    MeatProduct_Id INT,
    CONSTRAINT pk_order PRIMARY KEY (orderID, industryId, MeatProduct_Id)
);

-- 20. Consumption Patterns
CREATE TABLE CONSUMPTION_PATTERNS (
	region VARCHAR(100),
    population INT,
    meat_type VARCHAR(50),
    per_capita FLOAT,
    total_diet FLOAT,
    nutrition_contribution VARCHAR(100),
    demographic VARCHAR(100)
);

-- Populating EveryTable with Data

INSERT INTO FARM (FarmID, FarmName, areaName, City, district, zip, country) VALUES
(1,"Green Pastures","North Zone","Dhaka","Dhaka","1207","Bangladesh"),
(2,"Sunny Farm","East Zone","Chittagong","Chittagong","4000","Bangladesh"),
(3,"River Ranch","South Zone","Khulna","Khulna","9100","Bangladesh"),
(4,"Hilltop Farm","West Zone","Sylhet","Sylhet","3100","Bangladesh"),
(5,"Golden Fields","Central Zone","Rajshahi","Rajshahi","6200","Bangladesh"),
(6,"Blue Sky Farm","North Zone","Barisal","Barisal","8200","Bangladesh"),
(7,"Sunrise Farm","East Zone","Rangpur","Rangpur","5400","Bangladesh"),
(8,"Moonlight Ranch","South Zone","Mymensingh","Mymensingh","2200","Bangladesh"),
(9,"Emerald Farm","West Zone","Comilla","Comilla","3500","Bangladesh"),
(10,"Silver Meadows","Central Zone","Jessore","Jessore","7400","Bangladesh");


INSERT INTO LIVE_STOCK VALUES
(101, 'Cattle', '2022-01-01', 'Male', 720, 'Brahman', 1),
(102, 'Cattle', '2021-06-15', 'Female', 750, 'Holstein', 2),
(103, 'Cattle', '2020-12-20', 'Male', 730, 'Angus', 3),
(104, 'Cattle', '2022-03-10', 'Female', 700, 'Jersey', 4),
(105, 'Goat',  '2021-09-05', 'Male', 365, 'Boer Goat', 5),
(106, 'Goat',  '2020-11-11', 'Female', 420, 'Nubian Goat', 6),
(107, 'Goat',  '2022-05-25', 'Male', 330, 'Black Bengal Goat', 7),
(108, 'Chicken', '2021-07-30', 'Female', 180, 'Leghorn', 8),
(109, 'Chicken', '2020-10-10', 'Male', 210, 'Cornish Cross', 9),
(110, 'Chicken', '2022-02-14', 'Female', 200, 'Rhode Island Red', 10);


INSERT INTO PURCHASE_RECORD VALUES
(1, 15000.00, '2023-01-01', 1, 101),
(2, 16000.00, '2023-01-02', 2, 102),
(3, 17000.00, '2023-01-03', 3, 103),
(4, 18000.00, '2023-01-04', 4, 104),
(5, 19000.00, '2023-01-05', 5, 105),
(6, 20000.00, '2023-01-06', 6, 106),
(7, 21000.00, '2023-01-07', 7, 107),
(8, 22000.00, '2023-01-08', 8, 108),
(9, 23000.00, '2023-01-09', 9, 109),
(10, 24000.00, '2023-01-10', 10, 110);

INSERT INTO LIVE_STOCK_W VALUES
(101, '2023-01-01', 250.5),
(102, '2023-01-01', 260.0),
(103, '2023-01-01', 270.2),
(104, '2023-01-01', 280.3),
(105, '2023-01-01', 290.4),
(106, '2023-01-01', 300.5),
(107, '2023-01-01', 310.6),
(108, '2023-01-01', 320.7),
(109, '2023-01-01', 330.8),
(110, '2023-01-01', 340.9);

INSERT INTO LIVE_STOCK_CARE VALUES
(1, 'Vaccine', 'BoviShield', 'AgroVet', 'Bovine Vaccine', '2023-01-01', '2024-01-01'),
(2, 'Medicine', 'LivoCare', 'VetPharma', 'Liver Tonic', '2023-01-02', '2024-01-02'),
(3, 'Supplement', 'NutriMix', 'FarmHealth', 'Mineral Mix', '2023-01-03', '2024-01-03'),
(4, 'Vaccine', 'FMDGuard', 'BioVet', 'FMD Vaccine', '2023-01-04', '2024-01-04'),
(5, 'Medicine', 'AntibioticX', 'VetMed', 'Broad Spectrum', '2023-01-05', '2024-01-05'),
(6, 'Supplement', 'CalBoost', 'AgriCare', 'Calcium Mix', '2023-01-06', '2024-01-06'),
(7, 'Vaccine', 'BrucellaVax', 'BioFarm', 'Brucellosis Vaccine', '2023-01-07', '2024-01-07'),
(8, 'Medicine', 'WormOut', 'VetLife', 'Dewormer', '2023-01-08', '2024-01-08'),
(9, 'Supplement', 'ProBio', 'FarmPlus', 'Probiotic', '2023-01-09', '2024-01-09'),
(10, 'Vaccine', 'AnthraxVax', 'AgroBio', 'Anthrax Vaccine', '2023-01-10', '2024-01-10');

INSERT INTO LIVE_STOCK_CARE_RECORDS VALUES
(1, '2023-01-01', '2023-01-01', 1, 101, 1),
(2, '2023-01-02', '2023-01-02', 2, 102, 2),
(3, '2023-01-03', '2023-01-03', 3, 103, 3),
(4, '2023-01-04', '2023-01-04', 1, 104, 4),
(5, '2023-01-05', '2023-01-05', 2, 105, 5),
(6, '2023-01-06', '2023-01-06', 3, 106, 6),
(7, '2023-01-07', '2023-01-07', 1, 107, 7),
(8, '2023-01-08', '2023-01-08', 2, 108, 8),
(9, '2023-01-09', '2023-01-09', 3, 109, 9),
(10, '2023-01-10', '2023-01-10', 1, 110, 10);

INSERT INTO SLAUGHTER_HOUSE VALUES
(1, 'North Zone', 'Dhaka', 'Bangladesh', 500.0),
(2, 'East Zone', 'Chittagong', 'Bangladesh', 600.0),
(3, 'South Zone', 'Khulna', 'Bangladesh', 700.0),
(4, 'West Zone', 'Sylhet', 'Bangladesh', 800.0),
(5, 'Central Zone', 'Rajshahi', 'Bangladesh', 900.0),
(6, 'North Zone', 'Barisal', 'Bangladesh', 1000.0),
(7, 'East Zone', 'Rangpur', 'Bangladesh', 1100.0),
(8, 'South Zone', 'Mymensingh', 'Bangladesh', 1200.0),
(9, 'West Zone', 'Comilla', 'Bangladesh', 1300.0),
(10, 'Central Zone', 'Jessore', 'Bangladesh', 1400.0);

INSERT INTO SLAUGHTER_HOUSE_ANIMAL VALUES
(1, 'Cow'),
(2, 'Goat'),
(3, 'Buffalo'),
(4, 'Sheep'),
(5, 'Camel'),
(6, 'Pig'),
(7, 'Chicken'),
(8, 'Duck'),
(9, 'Turkey'),
(10, 'Rabbit');

INSERT INTO WAREHOUSE VALUES
(1, 'Zone A', 'Dhaka', 'Dhaka', 1000.0, 'Cold'),
(2, 'Zone B', 'Chittagong', 'Chittagong', 1100.0, 'Dry'),
(3, 'Zone C', 'Khulna', 'Khulna', 1200.0, 'Cold'),
(4, 'Zone D', 'Sylhet', 'Sylhet', 1300.0, 'Dry'),
(5, 'Zone E', 'Rajshahi', 'Rajshahi', 1400.0, 'Cold'),
(6, 'Zone F', 'Barisal', 'Barisal', 1500.0, 'Dry'),
(7, 'Zone G', 'Rangpur', 'Rangpur', 1600.0, 'Cold'),
(8, 'Zone H', 'Mymensingh', 'Mymensingh', 1700.0, 'Dry'),
(9, 'Zone I', 'Comilla', 'Comilla', 1800.0, 'Cold'),
(10, 'Zone J', 'Jessore', 'Jessore', 1900.0, 'Dry');

INSERT INTO SHIPMENT VALUES
(1, '2023-02-01', '2023-02-01', 500.0, 'Dhaka', 'Chittagong', 'Truck', 1),
(2, '2023-02-02', '2023-02-02', 600.0, 'Khulna', 'Sylhet', 'Van', 2),
(3, '2023-02-03', '2023-02-03', 700.0, 'Rajshahi', 'Barisal', 'Ship', 3),
(4, '2023-02-04', '2023-02-04', 800.0, 'Rangpur', 'Mymensingh', 'Truck', 4),
(5, '2023-02-05', '2023-02-05', 900.0, 'Comilla', 'Jessore', 'Van', 5),
(6, '2023-02-06', '2023-02-06', 1000.0, 'Dhaka', 'Khulna', 'Ship', 6),
(7, '2023-02-07', '2023-02-07', 1100.0, 'Sylhet', 'Rajshahi', 'Truck', 7),
(8, '2023-02-08', '2023-02-08', 1200.0, 'Barisal', 'Rangpur', 'Van', 8),
(9, '2023-02-09', '2023-02-09', 1300.0, 'Mymensingh', 'Comilla', 'Ship', 9),
(10, '2023-02-10', '2023-02-10', 1400.0, 'Jessore', 'Dhaka', 'Truck', 10);

INSERT INTO AGENT VALUES
(1, 'Agent A', 'Area A', 'Dhaka', 'Dhaka', 'Bangladesh'),
(2, 'Agent B', 'Area B', 'Chittagong', 'Chittagong', 'Bangladesh'),
(3, 'Agent C', 'Area C', 'Khulna', 'Khulna', 'Bangladesh'),
(4, 'Agent D', 'Area D', 'Sylhet', 'Sylhet', 'Bangladesh'),
(5, 'Agent E', 'Area E', 'Rajshahi', 'Rajshahi', 'Bangladesh'),
(6, 'Agent F', 'Area F', 'Barisal', 'Barisal', 'Bangladesh'),
(7, 'Agent G', 'Area G', 'Rangpur', 'Rangpur', 'Bangladesh'),
(8, 'Agent H', 'Area H', 'Mymensingh', 'Mymensingh', 'Bangladesh'),
(9, 'Agent I', 'Area I', 'Comilla', 'Comilla', 'Bangladesh'),
(10, 'Agent J', 'Area J', 'Jessore', 'Jessore', 'Bangladesh');

INSERT INTO INDUSTRY VALUES
(1, 'MeatMart', 'Area A', 'Dhaka', 'Dhaka', 'Bangladesh', 'Retail'),
(2, 'ProteinPlus', 'Area B', 'Chittagong', 'Chittagong', 'Bangladesh', 'Wholesale'),
(3, 'Carnivore Co.', 'Area C', 'Khulna', 'Khulna', 'Bangladesh', 'Retail'),
(4, 'MeatHub', 'Area D', 'Sylhet', 'Sylhet', 'Bangladesh', 'Wholesale'),
(5, 'FreshCuts', 'Area E', 'Rajshahi', 'Rajshahi', 'Bangladesh', 'Retail'),
(6, 'MeatExpress', 'Area F', 'Barisal', 'Barisal', 'Bangladesh', 'Wholesale'),
(7, 'PrimeMeat', 'Area G', 'Rangpur', 'Rangpur', 'Bangladesh', 'Retail'),
(8, 'ButcherBox', 'Area H', 'Mymensingh', 'Mymensingh', 'Bangladesh', 'Wholesale'),
(9, 'MeatWorld', 'Area I', 'Comilla', 'Comilla', 'Bangladesh', 'Retail'),
(10, 'ProteinPalace', 'Area J', 'Jessore', 'Jessore', 'Bangladesh', 'Wholesale');

INSERT INTO MEAT_PRODUCT VALUES
(1, 'High Protein','2022-01-01', '2024-01-01', 500.0, 100, 1),
(2, 'Low Fat','2022-01-01', '2024-01-02', 600.0, 200, 2),
(3, 'Organic','2022-01-01', '2024-01-03', 700.0, 300, 3),
(4, 'Lean Cut','2022-01-01', '2024-01-04', 800.0, 400, 4),
(5, 'Premium','2022-01-01', '2024-01-05', 900.0, 500, 5),
(6, 'Standard','2022-01-01', '2024-01-06', 1000.0, 600, 6),
(7, 'Economy','2022-01-01', '2024-01-07', 1100.0, 700, 7),
(8, 'Deluxe','2022-01-01', '2024-01-08', 1200.0, 800, 8),
(9, 'Budget','2022-01-01', '2024-01-09', 1300.0, 900, 9),
(10, 'Family Pack','2022-01-01', '2024-01-10', 1400.0, 1000, 10);

INSERT INTO CUSTOMER VALUES
(1, 'John', 'Doe', '01711111111', '123 Street, Dhaka'),
(2, 'Jane', 'Smith', '01722222222', '456 Avenue, Chittagong'),
(3, 'Ali', 'Khan', '01733333333', '789 Road, Khulna'),
(4, 'Sara', 'Rahman', '01744444444', '101 Lane, Sylhet'),
(5, 'Tom', 'Haque', '01755555555', '202 Block, Rajshahi'),
(6, 'Nina', 'Akter', '01766666666', '303 Sector, Barisal'),
(7, 'Omar', 'Islam', '01777777777', '404 Zone, Rangpur'),
(8, 'Lily', 'Begum', '01788888888', '505 Area, Mymensingh'),
(9, 'Zahid', 'Ahmed', '01799999999', '606 Place, Comilla'),
(10, 'Maya', 'Chowdhury', '01800000000', '707 Spot, Jessore');

INSERT INTO `Order` VALUES
(1, '2023-03-01', 10.0, 5000.0, 1, 1, 1),
(2, '2023-03-02', 20.0, 6000.0, 2, 2, 2),
(3, '2023-03-03', 30.0, 7000.0, 3, 3, 3),
(4, '2023-03-04', 40.0, 8000.0, 4, 4, 4),
(5, '2023-03-05', 50.0, 9000.0, 5, 5, 5),
(6, '2023-03-06', 60.0, 10000.0, 6, 6, 6),
(7, '2023-03-07', 70.0, 11000.0, 7, 7, 7),
(8, '2023-03-08', 80.0, 12000.0, 8, 8, 8),
(9, '2023-03-09', 90.0, 13000.0, 9, 9, 9),
(10, '2023-03-10', 100.0, 14000.0, 10, 10, 10);

INSERT INTO DELIVERY VALUES
(1, '2023-03-11', 'Express', 500.0, 'Dhaka', 'Chittagong', 1, 1, 1, 1),
(2, '2023-03-12', 'Standard', 600.0, 'Khulna', 'Sylhet', 2, 2, 2, 2),
(3, '2023-03-13', 'Express', 700.0, 'Rajshahi', 'Barisal', 3, 3, 3, 3),
(4, '2023-03-14', 'Standard', 800.0, 'Rangpur', 'Mymensingh', 4, 4, 4, 4),
(5, '2023-03-15', 'Express', 900.0, 'Comilla', 'Jessore', 5, 5, 5, 5),
(6, '2023-03-16', 'Standard', 1000.0, 'Dhaka', 'Khulna', 6, 6, 6, 6),
(7, '2023-03-17', 'Express', 1100.0, 'Sylhet', 'Rajshahi', 7, 7, 7, 7),
(8, '2023-03-18', 'Standard', 1200.0, 'Barisal', 'Rangpur', 8, 8, 8, 8),
(9, '2023-03-19', 'Express', 1300.0, 'Mymensingh', 'Comilla', 9, 9, 9, 9),
(10, '2023-03-20', 'Standard', 1400.0, 'Jessore', 'Dhaka', 10, 10, 10, 10);

INSERT INTO MEAT_BATCH VALUES
(1, 'Beef', 100, '2023-03-01', 500.0, 101, 1, 1, 1),
(2, 'Goat', 200, '2023-03-02', 600.0, 102, 2, 2, 2),
(3, 'Buffalo', 300, '2023-03-03', 700.0, 103, 3, 3, 3),
(4, 'Sheep', 400, '2023-03-04', 800.0, 104, 4, 4, 4),
(5, 'Camel', 500, '2023-03-05', 900.0, 105, 5, 5, 5),
(6, 'Pig', 600, '2023-03-06', 1000.0, 106, 6, 6, 6),
(7, 'Chicken', 700, '2023-03-07', 1100.0, 107, 7, 7, 7),
(8, 'Duck', 800, '2023-03-08', 1200.0, 108, 8, 8, 8),
(9, 'Turkey', 900, '2023-03-09', 1300.0, 109, 9, 9, 9),
(10, 'Rabbit', 1000, '2023-03-10', 1400.0, 110, 10, 10, 10);

INSERT INTO SALES_RECORD VALUES
(1, 500.0, 10.0, '2023-04-01', 1, 1, 1),
(2, 600.0, 20.0, '2023-04-02', 2, 2, 2),
(3, 700.0, 30.0, '2023-04-03', 3, 3, 3),
(4, 800.0, 40.0, '2023-04-04', 4, 4, 4),
(5, 900.0, 50.0, '2023-04-05', 5, 5, 5),
(6, 1000.0, 60.0, '2023-04-06', 6, 6, 6),
(7, 1100.0, 70.0, '2023-04-07', 7, 7, 7),
(8, 1200.0, 80.0, '2023-04-08', 8, 8, 8),
(9, 1300.0, 90.0, '2023-04-09', 9, 9, 9),
(10, 1400.0, 100.0, '2023-04-10', 10, 10, 10);

INSERT INTO ORDER_LINE VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 3),
(4, 4, 4),
(5, 5, 5),
(6, 6, 6),
(7, 7, 7),
(8, 8, 8),
(9, 9, 9),
(10, 10, 10);

INSERT INTO CONSUMPTION_PATTERNS (region, population, meat_type, per_capita, total_diet, nutrition_contribution, demographic) VALUES
('North District', 450000, 'Beef', 45.2, 18.5, 'Protein 25g/day, Iron 3mg/day', 'Urban/High Income'),
('South District', 620000, 'Chicken', 38.7, 22.3, 'Protein 22g/day, Iron 1.5mg/day', 'Urban/Middle Income'),
('East District', 380000, 'Mutton', 28.4, 15.2, 'Protein 20g/day, Iron 2.8mg/day', 'Rural/High Income'),
('West District', 290000, 'Goat', 22.1, 12.8, 'Protein 18g/day, Iron 2.2mg/day', 'Rural/Middle Income'),
('Central District', 520000, 'Pork', 31.5, 16.7, 'Protein 21g/day, Iron 1.8mg/day', 'Urban/Middle Income'),
('North District', 450000, 'Chicken', 42.8, 24.1, 'Protein 24g/day, Iron 1.6mg/day', 'Urban/Low Income'),
('South District', 620000, 'Beef', 35.6, 16.9, 'Protein 22g/day, Iron 2.5mg/day', 'Urban/High Income'),
('East District', 380000, 'Goat', 19.3, 11.4, 'Protein 16g/day, Iron 2.0mg/day', 'Rural/Low Income'),
('West District', 290000, 'Chicken', 26.7, 19.8, 'Protein 19g/day, Iron 1.3mg/day', 'Rural/Middle Income'),
('Central District', 520000, 'Mutton', 29.8, 14.5, 'Protein 19g/day, Iron 2.6mg/day', 'Urban/High Income');