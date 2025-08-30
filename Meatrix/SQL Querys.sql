CREATE DATABASE IF NOT EXISTS LivestockDB;
USE LivestockDB;

-- 1. FARM
CREATE TABLE FARM (
    FarmID INT AUTO_INCREMENT PRIMARY KEY,
    FarmName VARCHAR(50),
    areaName VARCHAR(150),
    City VARCHAR(50),
    district VARCHAR(50),
    zip VARCHAR(50),
    country VARCHAR(50)
);

-- 2. LIVE_STOCK
CREATE TABLE LIVE_STOCK (
    animal_id INT AUTO_INCREMENT PRIMARY KEY,
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
    purchase_id INT AUTO_INCREMENT PRIMARY KEY,
    liveStockPrice DOUBLE,
    date DATE,
    farm_id INT,
    animal_Id INT,
    CONSTRAINT fk_farm_1 FOREIGN KEY (farm_id) REFERENCES FARM(FarmID),
    CONSTRAINT fk_animal FOREIGN KEY (animal_Id) REFERENCES LIVE_STOCK(animal_id)
);

-- 4. LIVE_STOCK_W
CREATE TABLE LIVE_STOCK_W (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    animal_id INT,
    date DATE,
    weight FLOAT,
    CONSTRAINT fk_animal_weight FOREIGN KEY (animal_id) REFERENCES LIVE_STOCK(animal_id)
);

-- 5. LIVE_STOCK_CARE
CREATE TABLE LIVE_STOCK_CARE (
    LS_care_id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(50),
    name VARCHAR(100),
    manufacturer VARCHAR(100),
    genericName VARCHAR(100),
    manufacturer_date DATE,
    expire_date DATE
);

-- 6. LIVE_STOCK_CARE_RECORDS
CREATE TABLE LIVE_STOCK_CARE_RECORDS (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE,
    time TIME,
    givenQunatity INT,
    animal_Id INT,
    LS_care_id INT,
    CONSTRAINT fk_animal_1 FOREIGN KEY (animal_Id) REFERENCES LIVE_STOCK(animal_id),
    CONSTRAINT fk_LS_care FOREIGN KEY (LS_care_id) REFERENCES LIVE_STOCK_CARE(LS_care_id)
);

-- 7. SLAUGHTER_HOUSE
CREATE TABLE SLAUGHTER_HOUSE (
    slaughterHouse_id INT AUTO_INCREMENT PRIMARY KEY,
    area VARCHAR(100),
    city VARCHAR(100),
    country VARCHAR(100),
    slaughter_house_capacity FLOAT
);

-- 8. SLAUGHTER_HOUSE_ANIMAL
CREATE TABLE SLAUGHTER_HOUSE_ANIMAL (
    record_id INT AUTO_INCREMENT PRIMARY KEY,
    slaughterHouse_id INT,
    typeOfAnimal VARCHAR(50),
    CONSTRAINT fk_slaughter_house FOREIGN KEY (slaughterHouse_id) REFERENCES SLAUGHTER_HOUSE(slaughterHouse_id)
);

-- 9. WAREHOUSE
CREATE TABLE WAREHOUSE (
    warehouse_id INT AUTO_INCREMENT PRIMARY KEY,
    area VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    country VARCHAR(50),
    storage_capacity FLOAT,
    storage_feature VARCHAR(50)
);

-- 10. SHIPMENT
CREATE TABLE SHIPMENT (
    shipmentId INT AUTO_INCREMENT PRIMARY KEY,
    shipmentDate DATE,
    time TIME,
    rate FLOAT,
    `from` VARCHAR(100),
    `to` VARCHAR(100),
    type VARCHAR(50),
    warehouseId INT,
    CONSTRAINT fk_wareHouse FOREIGN KEY (warehouseId) REFERENCES WAREHOUSE(warehouse_id)
);

-- 11. AGENT
CREATE TABLE AGENT (
    agent_Id INT AUTO_INCREMENT PRIMARY KEY,
    agentName VARCHAR(50),
    area VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    country VARCHAR(50)
);

-- 12. MEAT_BATCH
CREATE TABLE MEAT_BATCH (
    batch_id INT AUTO_INCREMENT PRIMARY KEY,
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
    industry_Id INT AUTO_INCREMENT PRIMARY KEY,
    shopName VARCHAR(100),
    area VARCHAR(50),
    city VARCHAR(50),
    district VARCHAR(50),
    country VARCHAR(50),
    industryType VARCHAR(50)
);

-- 14. MEAT_PRODUCT
CREATE TABLE MEAT_PRODUCT (
    Meatproduct_Id INT AUTO_INCREMENT PRIMARY KEY,
    nutritionInfo VARCHAR(100),
    packagingDate DATE,
    expireDate DATE,
    price FLOAT,
    quantity INT,
    industryId INT,
    CONSTRAINT fk_industry_product FOREIGN KEY (industryId) REFERENCES INDUSTRY(industry_Id)
);

-- 15. CUSTOMER
CREATE TABLE CUSTOMER (
    customer_Id INT AUTO_INCREMENT PRIMARY KEY,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    phoneNumber VARCHAR(50),
    address VARCHAR(100)
);

-- 16. `Order`
CREATE TABLE `Order` (
    orderID INT AUTO_INCREMENT PRIMARY KEY,
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
    deliveryId INT AUTO_INCREMENT PRIMARY KEY,
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
    salesId INT AUTO_INCREMENT PRIMARY KEY,
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
    order_line_id INT AUTO_INCREMENT PRIMARY KEY,
    orderID INT,
    industryId INT,
    MeatProduct_Id INT,
    CONSTRAINT fk_order_line_order FOREIGN KEY (orderID) REFERENCES `Order`(orderID),
    CONSTRAINT fk_order_line_industry FOREIGN KEY (industryId) REFERENCES INDUSTRY(industry_Id),
    CONSTRAINT fk_order_line_product FOREIGN KEY (MeatProduct_Id) REFERENCES MEAT_PRODUCT(Meatproduct_Id)
);

-- 20. Consumption Patterns
CREATE TABLE CONSUMPTION_PATTERNS (
    pattern_id INT AUTO_INCREMENT PRIMARY KEY,
    region VARCHAR(100),
    population INT,
    meat_type VARCHAR(50),
    per_capita FLOAT,
    total_diet FLOAT,
    nutrition_contribution VARCHAR(100),
    demographic VARCHAR(100),
    year INT
);

-- Populating EveryTable with Data (at least 20 records per table)

INSERT INTO FARM (FarmName, areaName, City, district, zip, country) VALUES
("Green Pastures","North Zone","Dhaka","Dhaka","1207","Bangladesh"),
("Sunny Farm","East Zone","Chittagong","Chittagong","4000","Bangladesh"),
("River Ranch","South Zone","Khulna","Khulna","9100","Bangladesh"),
("Hilltop Farm","West Zone","Sylhet","Sylhet","3100","Bangladesh"),
("Golden Fields","Central Zone","Rajshahi","Rajshahi","6200","Bangladesh"),
("Blue Sky Farm","North Zone","Barisal","Barisal","8200","Bangladesh"),
("Sunrise Farm","East Zone","Rangpur","Rangpur","5400","Bangladesh"),
("Moonlight Ranch","South Zone","Mymensingh","Mymensingh","2200","Bangladesh"),
("Emerald Farm","West Zone","Comilla","Comilla","3500","Bangladesh"),
("Silver Meadows","Central Zone","Jessore","Jessore","7400","Bangladesh"),
("Happy Farm","North Zone","Dhaka","Dhaka","1206","Bangladesh"),
("Prosperity Farm","East Zone","Chittagong","Chittagong","4001","Bangladesh"),
("Green Valley","South Zone","Khulna","Khulna","9101","Bangladesh"),
("Mountain View","West Zone","Sylhet","Sylhet","3101","Bangladesh"),
("Sunset Fields","Central Zone","Rajshahi","Rajshahi","6201","Bangladesh"),
("Ocean Breeze","North Zone","Barisal","Barisal","8201","Bangladesh"),
("Morning Dew","East Zone","Rangpur","Rangpur","5401","Bangladesh"),
("Starlight Ranch","South Zone","Mymensingh","Mymensingh","2201","Bangladesh"),
("Diamond Farm","West Zone","Comilla","Comilla","3501","Bangladesh"),
("Golden Meadows","Central Zone","Jessore","Jessore","7401","Bangladesh"),
("Future Farm","North Zone","Dhaka","Dhaka","1208","Bangladesh"),
("New Hope Farm","East Zone","Chittagong","Chittagong","4002","Bangladesh"),
("Green World","South Zone","Khulna","Khulna","9102","Bangladesh"),
("Hill Side","West Zone","Sylhet","Sylhet","3102","Bangladesh"),
("River Side","Central Zone","Rajshahi","Rajshahi","6202","Bangladesh");

INSERT INTO LIVE_STOCK (animal_type, birth_date, gender, rearing_period, breed, farm_id) VALUES
('Cattle', '2022-01-01', 'Male', 720, 'Brahman', 1),
('Cattle', '2021-06-15', 'Female', 750, 'Holstein', 2),
('Cattle', '2020-12-20', 'Male', 730, 'Angus', 3),
('Cattle', '2022-03-10', 'Female', 700, 'Jersey', 4),
('Goat',  '2021-09-05', 'Male', 365, 'Boer Goat', 5),
('Goat',  '2020-11-11', 'Female', 420, 'Nubian Goat', 6),
('Goat',  '2022-05-25', 'Male', 330, 'Black Bengal Goat', 7),
('Chicken', '2021-07-30', 'Female', 180, 'Leghorn', 8),
('Chicken', '2020-10-10', 'Male', 210, 'Cornish Cross', 9),
('Chicken', '2022-02-14', 'Female', 200, 'Rhode Island Red', 10),
('Cattle', '2021-01-15', 'Male', 700, 'Sahiwal', 11),
('Cattle', '2020-08-20', 'Female', 750, 'Red Sindhi', 12),
('Goat', '2021-03-25', 'Male', 380, 'Jamunapari', 13),
('Goat', '2020-12-10', 'Female', 400, 'Beetal', 14),
('Chicken', '2021-05-15', 'Male', 190, 'Plymouth Rock', 15),
('Chicken', '2020-09-20', 'Female', 210, 'Sussex', 16),
('Cattle', '2021-11-05', 'Male', 710, 'Gir', 17),
('Cattle', '2020-07-12', 'Female', 740, 'Tharparkar', 18),
('Goat', '2021-04-18', 'Male', 370, 'Sirohi', 19),
('Goat', '2020-10-25', 'Female', 390, 'Barbari', 20),
('Chicken', '2021-06-30', 'Male', 200, 'Orpington', 1),
('Chicken', '2020-08-15', 'Female', 220, 'Wyandotte', 2),
('Cattle', '2021-02-10', 'Male', 720, 'Kankrej', 3),
('Cattle', '2020-05-20', 'Female', 760, 'Ongole', 4),
('Goat', '2021-07-05', 'Male', 360, 'Malabari', 5);

INSERT INTO PURCHASE_RECORD (liveStockPrice, date, farm_id, animal_Id) VALUES
(15000.00, '2023-01-01', 1, 1),
(16000.00, '2023-01-02', 2, 2),
(17000.00, '2023-01-03', 3, 3),
(18000.00, '2023-01-04', 4, 4),
(19000.00, '2023-01-05', 5, 5),
(20000.00, '2023-01-06', 6, 6),
(21000.00, '2023-01-07', 7, 7),
(22000.00, '2023-01-08', 8, 8),
(23000.00, '2023-01-09', 9, 9),
(24000.00, '2023-01-10', 10, 10),
(15500.00, '2022-01-01', 11, 11),
(16500.00, '2022-01-02', 12, 12),
(17500.00, '2022-01-03', 13, 13),
(18500.00, '2022-01-04', 14, 14),
(19500.00, '2022-01-05', 15, 15),
(20500.00, '2022-01-06', 16, 16),
(21500.00, '2022-01-07', 17, 17),
(22500.00, '2022-01-08', 18, 18),
(23500.00, '2022-01-09', 19, 19),
(24500.00, '2022-01-10', 20, 20),
(25000.00, '2021-01-01', 1, 21),
(26000.00, '2021-01-02', 2, 22),
(27000.00, '2021-01-03', 3, 23),
(28000.00, '2021-01-04', 4, 24),
(29000.00, '2021-01-05', 5, 25);

INSERT INTO LIVE_STOCK_W (animal_id, date, weight) VALUES
(1, '2023-01-01', 250.5),
(2, '2023-01-01', 260.0),
(3, '2023-01-01', 270.2),
(4, '2023-01-01', 280.3),
(5, '2023-01-01', 290.4),
(6, '2023-01-01', 300.5),
(7, '2023-01-01', 310.6),
(8, '2023-01-01', 320.7),
(9, '2023-01-01', 330.8),
(10, '2023-01-01', 340.9),
(11, '2022-06-01', 255.5),
(12, '2022-06-01', 265.0),
(13, '2022-06-01', 275.2),
(14, '2022-06-01', 285.3),
(15, '2022-06-01', 295.4),
(16, '2022-06-01', 305.5),
(17, '2022-06-01', 315.6),
(18, '2022-06-01', 325.7),
(19, '2022-06-01', 335.8),
(20, '2022-06-01', 345.9),
(21, '2021-12-01', 260.5),
(22, '2021-12-01', 270.0),
(23, '2021-12-01', 280.2),
(24, '2021-12-01', 290.3),
(25, '2021-12-01', 300.4);

INSERT INTO LIVE_STOCK_CARE (type, name, manufacturer, genericName, manufacturer_date, expire_date) VALUES
('Vaccine', 'BoviShield', 'AgroVet', 'Bovine Vaccine', '2023-01-01', '2024-01-01'),
('Medicine', 'LivoCare', 'VetPharma', 'Liver Tonic', '2023-01-02', '2024-01-02'),
('Supplement', 'NutriMix', 'FarmHealth', 'Mineral Mix', '2023-01-03', '2024-01-03'),
('Vaccine', 'FMDGuard', 'BioVet', 'FMD Vaccine', '2023-01-04', '2024-01-04'),
('Medicine', 'AntibioticX', 'VetMed', 'Broad Spectrum', '2023-01-05', '2024-01-05'),
('Supplement', 'CalBoost', 'AgriCare', 'Calcium Mix', '2023-01-06', '2024-01-06'),
('Vaccine', 'BrucellaVax', 'BioFarm', 'Brucellosis Vaccine', '2023-01-07', '2024-01-07'),
('Medicine', 'WormOut', 'VetLife', 'Dewormer', '2023-01-08', '2024-01-08'),
('Supplement', 'ProBio', 'FarmPlus', 'Probiotic', '2023-01-09', '2024-01-09'),
('Vaccine', 'AnthraxVax', 'AgroBio', 'Anthrax Vaccine', '2023-01-10', '2024-01-10'),
('Vaccine', 'PoultryShield', 'AgroVet', 'Poultry Vaccine', '2022-01-01', '2023-01-01'),
('Medicine', 'PoultryCare', 'VetPharma', 'Poultry Tonic', '2022-01-02', '2023-01-02'),
('Supplement', 'PoultryMix', 'FarmHealth', 'Poultry Mineral', '2022-01-03', '2023-01-03'),
('Vaccine', 'GoatGuard', 'BioVet', 'Goat Vaccine', '2022-01-04', '2023-01-04'),
('Medicine', 'GoatCare', 'VetMed', 'Goat Medicine', '2022-01-05', '2023-01-05'),
('Supplement', 'GoatBoost', 'AgriCare', 'Goat Supplement', '2022-01-06', '2023-01-06'),
('Vaccine', 'CattleShield', 'BioFarm', 'Cattle Vaccine', '2022-01-07', '2023-01-07'),
('Medicine', 'CattleCare', 'VetLife', 'Cattle Medicine', '2022-01-08', '2023-01-08'),
('Supplement', 'CattleMix', 'FarmPlus', 'Cattle Supplement', '2022-01-09', '2023-01-09'),
('Vaccine', 'LivestockVax', 'AgroBio', 'Livestock Vaccine', '2022-01-10', '2023-01-10'),
('Vaccine', 'MultiShield', 'AgroVet', 'Multi Vaccine', '2021-01-01', '2022-01-01'),
('Medicine', 'MultiCare', 'VetPharma', 'Multi Tonic', '2021-01-02', '2022-01-02'),
('Supplement', 'MultiMix', 'FarmHealth', 'Multi Mineral', '2021-01-03', '2022-01-03'),
('Vaccine', 'FarmGuard', 'BioVet', 'Farm Vaccine', '2021-01-04', '2022-01-04'),
('Medicine', 'FarmCare', 'VetMed', 'Farm Medicine', '2021-01-05', '2022-01-05');

INSERT INTO LIVE_STOCK_CARE_RECORDS (date, time, givenQunatity, animal_Id, LS_care_id) VALUES
('2023-01-01', '10:00:00', 1, 1, 1),
('2023-01-02', '11:00:00', 2, 2, 2),
('2023-01-03', '12:00:00', 3, 3, 3),
('2023-01-04', '13:00:00', 1, 4, 4),
('2023-01-05', '14:00:00', 2, 5, 5),
('2023-01-06', '15:00:00', 3, 6, 6),
('2023-01-07', '16:00:00', 1, 7, 7),
('2023-01-08', '17:00:00', 2, 8, 8),
('2023-01-09', '18:00:00', 3, 9, 9),
('2023-01-10', '19:00:00', 1, 10, 10),
('2022-06-01', '10:30:00', 1, 11, 11),
('2022-06-02', '11:30:00', 2, 12, 12),
('2022-06-03', '12:30:00', 3, 13, 13),
('2022-06-04', '13:30:00', 1, 14, 14),
('2022-06-05', '14:30:00', 2, 15, 15),
('2022-06-06', '15:30:00', 3, 16, 16),
('2022-06-07', '16:30:00', 1, 17, 17),
('2022-06-08', '17:30:00', 2, 18, 18),
('2022-06-09', '18:30:00', 3, 19, 19),
('2022-06-10', '19:30:00', 1, 20, 20),
('2021-12-01', '09:00:00', 1, 21, 21),
('2021-12-02', '10:00:00', 2, 22, 22),
('2021-12-03', '11:00:00', 3, 23, 23),
('2021-12-04', '12:00:00', 1, 24, 24),
('2021-12-05', '13:00:00', 2, 25, 25);

INSERT INTO SLAUGHTER_HOUSE (area, city, country, slaughter_house_capacity) VALUES
('North Zone', 'Dhaka', 'Bangladesh', 500.0),
('East Zone', 'Chittagong', 'Bangladesh', 600.0),
('South Zone', 'Khulna', 'Bangladesh', 700.0),
('West Zone', 'Sylhet', 'Bangladesh', 800.0),
('Central Zone', 'Rajshahi', 'Bangladesh', 900.0),
('North Zone', 'Barisal', 'Bangladesh', 1000.0),
('East Zone', 'Rangpur', 'Bangladesh', 1100.0),
('South Zone', 'Mymensingh', 'Bangladesh', 1200.0),
('West Zone', 'Comilla', 'Bangladesh', 1300.0),
('Central Zone', 'Jessore', 'Bangladesh', 1400.0),
('North Zone', 'Dhaka', 'Bangladesh', 550.0),
('East Zone', 'Chittagong', 'Bangladesh', 650.0),
('South Zone', 'Khulna', 'Bangladesh', 750.0),
('West Zone', 'Sylhet', 'Bangladesh', 850.0),
('Central Zone', 'Rajshahi', 'Bangladesh', 950.0),
('North Zone', 'Barisal', 'Bangladesh', 1050.0),
('East Zone', 'Rangpur', 'Bangladesh', 1150.0),
('South Zone', 'Mymensingh', 'Bangladesh', 1250.0),
('West Zone', 'Comilla', 'Bangladesh', 1350.0),
('Central Zone', 'Jessore', 'Bangladesh', 1450.0),
('North Zone', 'Dhaka', 'Bangladesh', 600.0),
('East Zone', 'Chittagong', 'Bangladesh', 700.0),
('South Zone', 'Khulna', 'Bangladesh', 800.0),
('West Zone', 'Sylhet', 'Bangladesh', 900.0),
('Central Zone', 'Rajshahi', 'Bangladesh', 1000.0);

INSERT INTO SLAUGHTER_HOUSE_ANIMAL (slaughterHouse_id, typeOfAnimal) VALUES
(1, 'Cow'),
(2, 'Goat'),
(3, 'Buffalo'),
(4, 'Sheep'),
(5, 'Camel'),
(6, 'Pig'),
(7, 'Chicken'),
(8, 'Duck'),
(9, 'Turkey'),
(10, 'Rabbit'),
(11, 'Cow'),
(12, 'Goat'),
(13, 'Buffalo'),
(14, 'Sheep'),
(15, 'Camel'),
(16, 'Pig'),
(17, 'Chicken'),
(18, 'Duck'),
(19, 'Turkey'),
(20, 'Rabbit'),
(21, 'Cow'),
(22, 'Goat'),
(23, 'Buffalo'),
(24, 'Sheep'),
(25, 'Camel');

INSERT INTO WAREHOUSE (area, city, district, country, storage_capacity, storage_feature) VALUES
('Zone A', 'Dhaka', 'Dhaka','Bangladesh', 1000.0, 'Cold'),
('Zone B', 'Chittagong', 'Chittagong','Bangladesh', 1100.0, 'Dry'),
('Zone C', 'Khulna', 'Khulna','Bangladesh', 1200.0, 'Cold'),
('Zone D', 'Sylhet', 'Sylhet','Bangladesh', 1300.0, 'Dry'),
('Zone E', 'Rajshahi', 'Rajshahi','Bangladesh', 1400.0, 'Cold'),
('Zone F', 'Barisal', 'Barisal','Bangladesh', 1500.0, 'Dry'),
('Zone G', 'Rangpur', 'Rangpur','Bangladesh', 1600.0, 'Cold'),
('Zone H', 'Mymensingh', 'Mymensingh','Bangladesh', 1700.0, 'Dry'),
('Zone I', 'Comilla', 'Comilla','Bangladesh', 1800.0, 'Cold'),
('Zone J', 'Jessore', 'Jessore','Bangladesh', 1900.0, 'Dry'),
('Zone K', 'Dhaka', 'Dhaka','Bangladesh', 1050.0, 'Cold'),
('Zone L', 'Chittagong', 'Chittagong','Bangladesh', 1150.0, 'Dry'),
('Zone M', 'Khulna', 'Khulna','Bangladesh', 1250.0, 'Cold'),
('Zone N', 'Sylhet', 'Sylhet','Bangladesh', 1350.0, 'Dry'),
('Zone O', 'Rajshahi', 'Rajshahi','Bangladesh', 1450.0, 'Cold'),
('Zone P', 'Barisal', 'Barisal','Bangladesh', 1550.0, 'Dry'),
('Zone Q', 'Rangpur', 'Rangpur','Bangladesh', 1650.0, 'Cold'),
('Zone R', 'Mymensingh', 'Mymensingh','Bangladesh', 1750.0, 'Dry'),
('Zone S', 'Comilla', 'Comilla','Bangladesh', 1850.0, 'Cold'),
('Zone T', 'Jessore', 'Jessore','Bangladesh', 1950.0, 'Dry'),
('Zone U', 'Dhaka', 'Dhaka','Bangladesh', 1100.0, 'Cold'),
('Zone V', 'Chittagong', 'Chittagong','Bangladesh', 1200.0, 'Dry'),
('Zone W', 'Khulna', 'Khulna','Bangladesh', 1300.0, 'Cold'),
('Zone X', 'Sylhet', 'Sylhet','Bangladesh', 1400.0, 'Dry'),
('Zone Y', 'Rajshahi', 'Rajshahi','Bangladesh', 1500.0, 'Cold');

INSERT INTO SHIPMENT (shipmentDate, time, rate, `from`, `to`, type, warehouseId) VALUES
('2023-02-01', '08:00:00', 500.0, 'Dhaka', 'Chittagong', 'Truck', 1),
('2023-02-02', '09:00:00', 600.0, 'Khulna', 'Sylhet', 'Van', 2),
('2023-02-03', '10:00:00', 700.0, 'Rajshahi', 'Barisal', 'Ship', 3),
('2023-02-04', '11:00:00', 800.0, 'Rangpur', 'Mymensingh', 'Truck', 4),
('2023-02-05', '12:00:00', 900.0, 'Comilla', 'Jessore', 'Van', 5),
('2023-02-06', '13:00:00', 1000.0, 'Dhaka', 'Khulna', 'Ship', 6),
('2023-02-07', '14:00:00', 1100.0, 'Sylhet', 'Rajshahi', 'Truck', 7),
('2023-02-08', '15:00:00', 1200.0, 'Barisal', 'Rangpur', 'Van', 8),
('2023-02-09', '16:00:00', 1300.0, 'Mymensingh', 'Comilla', 'Ship', 9),
('2023-02-10', '17:00:00', 1400.0, 'Jessore', 'Dhaka', 'Truck', 10),
('2022-08-01', '08:30:00', 550.0, 'Dhaka', 'Chittagong', 'Truck', 11),
('2022-08-02', '09:30:00', 650.0, 'Khulna', 'Sylhet', 'Van', 12),
('2022-08-03', '10:30:00', 750.0, 'Rajshahi', 'Barisal', 'Ship', 13),
('2022-08-04', '11:30:00', 850.0, 'Rangpur', 'Mymensingh', 'Truck', 14),
('2022-08-05', '12:30:00', 950.0, 'Comilla', 'Jessore', 'Van', 15),
('2022-08-06', '13:30:00', 1050.0, 'Dhaka', 'Khulna', 'Ship', 16),
('2022-08-07', '14:30:00', 1150.0, 'Sylhet', 'Rajshahi', 'Truck', 17),
('2022-08-08', '15:30:00', 1250.0, 'Barisal', 'Rangpur', 'Van', 18),
('2022-08-09', '16:30:00', 1350.0, 'Mymensingh', 'Comilla', 'Ship', 19),
('2022-08-10', '17:30:00', 1450.0, 'Jessore', 'Dhaka', 'Truck', 20),
('2021-11-01', '07:00:00', 600.0, 'Dhaka', 'Chittagong', 'Truck', 21),
('2021-11-02', '08:00:00', 700.0, 'Khulna', 'Sylhet', 'Van', 22),
('2021-11-03', '09:00:00', 800.0, 'Rajshahi', 'Barisal', 'Ship', 23),
('2021-11-04', '10:00:00', 900.0, 'Rangpur', 'Mymensingh', 'Truck', 24),
('2021-11-05', '11:00:00', 1000.0, 'Comilla', 'Jessore', 'Van', 25);

INSERT INTO AGENT (agentName, area, city, district, country) VALUES
('Agent A', 'Area A', 'Dhaka', 'Dhaka', 'Bangladesh'),
('Agent B', 'Area B', 'Chittagong', 'Chittagong', 'Bangladesh'),
('Agent C', 'Area C', 'Khulna', 'Khulna', 'Bangladesh'),
('Agent D', 'Area D', 'Sylhet', 'Sylhet', 'Bangladesh'),
('Agent E', 'Area E', 'Rajshahi', 'Rajshahi', 'Bangladesh'),
('Agent F', 'Area F', 'Barisal', 'Barisal', 'Bangladesh'),
('Agent G', 'Area G', 'Rangpur', 'Rangpur', 'Bangladesh'),
('Agent H', 'Area H', 'Mymensingh', 'Mymensingh', 'Bangladesh'),
('Agent I', 'Area I', 'Comilla', 'Comilla', 'Bangladesh'),
('Agent J', 'Area J', 'Jessore', 'Jessore', 'Bangladesh'),
('Agent K', 'Area K', 'Dhaka', 'Dhaka', 'Bangladesh'),
('Agent L', 'Area L', 'Chittagong', 'Chittagong', 'Bangladesh'),
('Agent M', 'Area M', 'Khulna', 'Khulna', 'Bangladesh'),
('Agent N', 'Area N', 'Sylhet', 'Sylhet', 'Bangladesh'),
('Agent O', 'Area O', 'Rajshahi', 'Rajshahi', 'Bangladesh'),
('Agent P', 'Area P', 'Barisal', 'Barisal', 'Bangladesh'),
('Agent Q', 'Area Q', 'Rangpur', 'Rangpur', 'Bangladesh'),
('Agent R', 'Area R', 'Mymensingh', 'Mymensingh', 'Bangladesh'),
('Agent S', 'Area S', 'Comilla', 'Comilla', 'Bangladesh'),
('Agent T', 'Area T', 'Jessore', 'Jessore', 'Bangladesh'),
('Agent U', 'Area U', 'Dhaka', 'Dhaka', 'Bangladesh'),
('Agent V', 'Area V', 'Chittagong', 'Chittagong', 'Bangladesh'),
('Agent W', 'Area W', 'Khulna', 'Khulna', 'Bangladesh'),
('Agent X', 'Area X', 'Sylhet', 'Sylhet', 'Bangladesh'),
('Agent Y', 'Area Y', 'Rajshahi', 'Rajshahi', 'Bangladesh');

INSERT INTO MEAT_BATCH (meat_type, quantity, produce_date, total_weight, animal_Id, slaughterHouseId, shipment_Id, agent_Id) VALUES
('Beef', 100, '2023-02-01', 500.0, 1, 1, 1, 1),
('Mutton', 200, '2023-02-02', 600.0, 2, 2, 2, 2),
('Chicken', 300, '2023-02-03', 700.0, 3, 3, 3, 3),
('Beef', 400, '2023-02-04', 800.0, 4, 4, 4, 4),
('Mutton', 500, '2023-02-05', 900.0, 5, 5, 5, 5),
('Chicken', 600, '2023-02-06', 1000.0, 6, 6, 6, 6),
('Beef', 700, '2023-02-07', 1100.0, 7, 7, 7, 7),
('Mutton', 800, '2023-02-08', 1200.0, 8, 8, 8, 8),
('Chicken', 900, '2023-02-09', 1300.0, 9, 9, 9, 9),
('Beef', 1000, '2023-02-10', 1400.0, 10, 10, 10, 10),
('Mutton', 1100, '2022-08-01', 550.0, 11, 11, 11, 11),
('Chicken', 1200, '2022-08-02', 650.0, 12, 12, 12, 12),
('Beef', 1300, '2022-08-03', 750.0, 13, 13, 13, 13),
('Mutton', 1400, '2022-08-04', 850.0, 14, 14, 14, 14),
('Chicken', 1500, '2022-08-05', 950.0, 15, 15, 15, 15),
('Beef', 1600, '2022-08-06', 1050.0, 16, 16, 16, 16),
('Mutton', 1700, '2022-08-07', 1150.0, 17, 17, 17, 17),
('Chicken', 1800, '2022-08-08', 1250.0, 18, 18, 18, 18),
('Beef', 1900, '2022-08-09', 1350.0, 19, 19, 19, 19),
('Mutton', 2000, '2022-08-10', 1450.0, 20, 20, 20, 20),
('Chicken', 2100, '2021-11-01', 600.0, 21, 21, 21, 21),
('Beef', 2200, '2021-11-02', 700.0, 22, 22, 22, 22),
('Mutton', 2300, '2021-11-03', 800.0, 23, 23, 23, 23),
('Chicken', 2400, '2021-11-04', 900.0, 24, 24, 24, 24),
('Beef', 2500, '2021-11-05', 1000.0, 25, 25, 25, 25);

INSERT INTO INDUSTRY (shopName, area, city, district, country, industryType) VALUES
('Shop A', 'Area A', 'Dhaka', 'Dhaka', 'Bangladesh', 'Retail'),
('Shop B', 'Area B', 'Chittagong', 'Chittagong', 'Bangladesh', 'Wholesale'),
('Shop C', 'Area C', 'Khulna', 'Khulna', 'Bangladesh', 'Retail'),
('Shop D', 'Area D', 'Sylhet', 'Sylhet', 'Bangladesh', 'Wholesale'),
('Shop E', 'Area E', 'Rajshahi', 'Rajshahi', 'Bangladesh', 'Retail'),
('Shop F', 'Area F', 'Barisal', 'Barisal', 'Bangladesh', 'Wholesale'),
('Shop G', 'Area G', 'Rangpur', 'Rangpur', 'Bangladesh', 'Retail'),
('Shop H', 'Area H', 'Mymensingh', 'Mymensingh', 'Bangladesh', 'Wholesale'),
('Shop I', 'Area I', 'Comilla', 'Comilla', 'Bangladesh', 'Retail'),
('Shop J', 'Area J', 'Jessore', 'Jessore', 'Bangladesh', 'Wholesale'),
('Shop K', 'Area K', 'Dhaka', 'Dhaka', 'Bangladesh', 'Retail'),
('Shop L', 'Area L', 'Chittagong', 'Chittagong', 'Bangladesh', 'Wholesale'),
('Shop M', 'Area M', 'Khulna', 'Khulna', 'Bangladesh', 'Retail'),
('Shop N', 'Area N', 'Sylhet', 'Sylhet', 'Bangladesh', 'Wholesale'),
('Shop O', 'Area O', 'Rajshahi', 'Rajshahi', 'Bangladesh', 'Retail'),
('Shop P', 'Area P', 'Barisal', 'Barisal', 'Bangladesh', 'Wholesale'),
('Shop Q', 'Area Q', 'Rangpur', 'Rangpur', 'Bangladesh', 'Retail'),
('Shop R', 'Area R', 'Mymensingh', 'Mymensingh', 'Bangladesh', 'Wholesale'),
('Shop S', 'Area S', 'Comilla', 'Comilla', 'Bangladesh', 'Retail'),
('Shop T', 'Area T', 'Jessore', 'Jessore', 'Bangladesh', 'Wholesale'),
('Shop U', 'Area U', 'Dhaka', 'Dhaka', 'Bangladesh', 'Retail'),
('Shop V', 'Area V', 'Chittagong', 'Chittagong', 'Bangladesh', 'Wholesale'),
('Shop W', 'Area W', 'Khulna', 'Khulna', 'Bangladesh', 'Retail'),
('Shop X', 'Area X', 'Sylhet', 'Sylhet', 'Bangladesh', 'Wholesale'),
('Shop Y', 'Area Y', 'Rajshahi', 'Rajshahi', 'Bangladesh', 'Retail');

INSERT INTO MEAT_PRODUCT (nutritionInfo, packagingDate, expireDate, price, quantity, industryId) VALUES
('High Protein', '2023-02-01', '2023-03-01', 500.0, 100, 1),
('Low Fat', '2023-02-02', '2023-03-02', 600.0, 200, 2),
('High Protein', '2023-02-03', '2023-03-03', 700.0, 300, 3),
('Low Fat', '2023-02-04', '2023-03-04', 800.0, 400, 4),
('High Protein', '2023-02-05', '2023-03-05', 900.0, 500, 5),
('Low Fat', '2023-02-06', '2023-03-06', 1000.0, 600, 6),
('High Protein', '2023-02-07', '2023-03-07', 1100.0, 700, 7),
('Low Fat', '2023-02-08', '2023-03-08', 1200.0, 800, 8),
('High Protein', '2023-02-09', '2023-03-09', 1300.0, 900, 9),
('Low Fat', '2023-02-10', '2023-03-10', 1400.0, 1000, 10),
('High Protein', '2022-08-01', '2022-09-01', 550.0, 1100, 11),
('Low Fat', '2022-08-02', '2022-09-02', 650.0, 1200, 12),
('High Protein', '2022-08-03', '2022-09-03', 750.0, 1300, 13),
('Low Fat', '2022-08-04', '2022-09-04', 850.0, 1400, 14),
('High Protein', '2022-08-05', '2022-09-05', 950.0, 1500, 15),
('Low Fat', '2022-08-06', '2022-09-06', 1050.0, 1600, 16),
('High Protein', '2022-08-07', '2022-09-07', 1150.0, 1700, 17),
('Low Fat', '2022-08-08', '2022-09-08', 1250.0, 1800, 18),
('High Protein', '2022-08-09', '2022-09-09', 1350.0, 1900, 19),
('Low Fat', '2022-08-10', '2022-09-10', 1450.0, 2000, 20),
('High Protein', '2021-11-01', '2021-12-01', 600.0, 2100, 21),
('Low Fat', '2021-11-02', '2021-12-02', 700.0, 2200, 22),
('High Protein', '2021-11-03', '2021-12-03', 800.0, 2300, 23),
('Low Fat', '2021-11-04', '2021-12-04', 900.0, 2400, 24),
('High Protein', '2021-11-05', '2021-12-05', 1000.0, 2500, 25);

INSERT INTO CUSTOMER (firstName, lastName, phoneNumber, address) VALUES
('John', 'Doe', '0123456789', 'Address 1'),
('Jane', 'Smith', '0123456790', 'Address 2'),
('Bob', 'Johnson', '0123456791', 'Address 3'),
('Alice', 'Williams', '0123456792', 'Address 4'),
('Charlie', 'Brown', '0123456793', 'Address 5'),
('David', 'Miller', '0123456794', 'Address 6'),
('Eva', 'Davis', '0123456795', 'Address 7'),
('Frank', 'Garcia', '0123456796', 'Address 8'),
('Grace', 'Rodriguez', '0123456797', 'Address 9'),
('Henry', 'Martinez', '0123456798', 'Address 10'),
('Ivy', 'Hernandez', '0123456799', 'Address 11'),
('Jack', 'Lopez', '0123456800', 'Address 12'),
('Karen', 'Gonzalez', '0123456801', 'Address 13'),
('Leo', 'Wilson', '0123456802', 'Address 14'),
('Mia', 'Anderson', '0123456803', 'Address 15'),
('Noah', 'Thomas', '0123456804', 'Address 16'),
('Olivia', 'Taylor', '0123456805', 'Address 17'),
('Paul', 'Moore', '0123456806', 'Address 18'),
('Quinn', 'Jackson', '0123456807', 'Address 19'),
('Ryan', 'Martin', '0123456808', 'Address 20'),
('Sara', 'Lee', '0123456809', 'Address 21'),
('Tom', 'Perez', '0123456810', 'Address 22'),
('Uma', 'Thompson', '0123456811', 'Address 23'),
('Victor', 'White', '0123456812', 'Address 24'),
('Wendy', 'Harris', '0123456813', 'Address 25');

INSERT INTO `Order` (orderDate, totalQuantity, totalPrice, customer_Id, industryId, MeatProduct_Id) VALUES
('2023-03-01', 10.0, 5000.0, 1, 1, 1),
('2023-03-02', 20.0, 12000.0, 2, 2, 2),
('2023-03-03', 30.0, 21000.0, 3, 3, 3),
('2023-03-04', 40.0, 32000.0, 4, 4, 4),
('2023-03-05', 50.0, 45000.0, 5, 5, 5),
('2023-03-06', 60.0, 60000.0, 6, 6, 6),
('2023-03-07', 70.0, 77000.0, 7, 7, 7),
('2023-03-08', 80.0, 96000.0, 8, 8, 8),
('2023-03-09', 90.0, 117000.0, 9, 9, 9),
('2023-03-10', 100.0, 140000.0, 10, 10, 10),
('2022-09-01', 11.0, 6050.0, 11, 11, 11),
('2022-09-02', 22.0, 14300.0, 12, 12, 12),
('2022-09-03', 33.0, 24750.0, 13, 13, 13),
('2022-09-04', 44.0, 37400.0, 14, 14, 14),
('2022-09-05', 55.0, 52250.0, 15, 15, 15),
('2022-09-06', 66.0, 69300.0, 16, 16, 16),
('2022-09-07', 77.0, 88550.0, 17, 17, 17),
('2022-09-08', 88.0, 110000.0, 18, 18, 18),
('2022-09-09', 99.0, 133650.0, 19, 19, 19),
('2022-09-10', 110.0, 159500.0, 20, 20, 20),
('2021-12-01', 12.0, 7200.0, 21, 21, 21),
('2021-12-02', 24.0, 16800.0, 22, 22, 22),
('2021-12-03', 36.0, 28800.0, 23, 23, 23),
('2021-12-04', 48.0, 43200.0, 24, 24, 24),
('2021-12-05', 60.0, 60000.0, 25, 25, 25);

INSERT INTO DELIVERY (deliveryDate, type, rate, `from`, `to`, orderID, warehouse_ID, Meatproduct_Id, industry_ID) VALUES
('2023-03-01', 'Express', 100.0, 'Warehouse A', 'Customer A', 1, 1, 1, 1),
('2023-03-02', 'Standard', 200.0, 'Warehouse B', 'Customer B', 2, 2, 2, 2),
('2023-03-03', 'Express', 300.0, 'Warehouse C', 'Customer C', 3, 3, 3, 3),
('2023-03-04', 'Standard', 400.0, 'Warehouse D', 'Customer D', 4, 4, 4, 4),
('2023-03-05', 'Express', 500.0, 'Warehouse E', 'Customer E', 5, 5, 5, 5),
('2023-03-06', 'Standard', 600.0, 'Warehouse F', 'Customer F', 6, 6, 6, 6),
('2023-03-07', 'Express', 700.0, 'Warehouse G', 'Customer G', 7, 7, 7, 7),
('2023-03-08', 'Standard', 800.0, 'Warehouse H', 'Customer H', 8, 8, 8, 8),
('2023-03-09', 'Express', 900.0, 'Warehouse I', 'Customer I', 9, 9, 9, 9),
('2023-03-10', 'Standard', 1000.0, 'Warehouse J', 'Customer J', 10, 10, 10, 10),
('2022-09-01', 'Express', 110.0, 'Warehouse K', 'Customer K', 11, 11, 11, 11),
('2022-09-02', 'Standard', 220.0, 'Warehouse L', 'Customer L', 12, 12, 12, 12),
('2022-09-03', 'Express', 330.0, 'Warehouse M', 'Customer M', 13, 13, 13, 13),
('2022-09-04', 'Standard', 440.0, 'Warehouse N', 'Customer N', 14, 14, 14, 14),
('2022-09-05', 'Express', 550.0, 'Warehouse O', 'Customer O', 15, 15, 15, 15),
('2022-09-06', 'Standard', 660.0, 'Warehouse P', 'Customer P', 16, 16, 16, 16),
('2022-09-07', 'Express', 770.0, 'Warehouse Q', 'Customer Q', 17, 17, 17, 17),
('2022-09-08', 'Standard', 880.0, 'Warehouse R', 'Customer R', 18, 18, 18, 18),
('2022-09-09', 'Express', 990.0, 'Warehouse S', 'Customer S', 19, 19, 19, 19),
('2022-09-10', 'Standard', 1100.0, 'Warehouse T', 'Customer T', 20, 20, 20, 20),
('2021-12-01', 'Express', 120.0, 'Warehouse U', 'Customer U', 21, 21, 21, 21),
('2021-12-02', 'Standard', 240.0, 'Warehouse V', 'Customer V', 22, 22, 22, 22),
('2021-12-03', 'Express', 360.0, 'Warehouse W', 'Customer W', 23, 23, 23, 23),
('2021-12-04', 'Standard', 480.0, 'Warehouse X', 'Customer X', 24, 24, 24, 24),
('2021-12-05', 'Express', 600.0, 'Warehouse Y', 'Customer Y', 25, 25, 25, 25);

INSERT INTO SALES_RECORD (meatBatchPrice, quantity, date, agentId, industryId, batch_id) VALUES
(5000.0, 10.0, '2023-03-01', 1, 1, 1),
(12000.0, 20.0, '2023-03-02', 2, 2, 2),
(21000.0, 30.0, '2023-03-03', 3, 3, 3),
(32000.0, 40.0, '2023-03-04', 4, 4, 4),
(45000.0, 50.0, '2023-03-05', 5, 5, 5),
(60000.0, 60.0, '2023-03-06', 6, 6, 6),
(77000.0, 70.0, '2023-03-07', 7, 7, 7),
(96000.0, 80.0, '2023-03-08', 8, 8, 8),
(117000.0, 90.0, '2023-03-09', 9, 9, 9),
(140000.0, 100.0, '2023-03-10', 10, 10, 10),
(6050.0, 11.0, '2022-09-01', 11, 11, 11),
(14300.0, 22.0, '2022-09-02', 12, 12, 12),
(24750.0, 33.0, '2022-09-03', 13, 13, 13),
(37400.0, 44.0, '2022-09-04', 14, 14, 14),
(52250.0, 55.0, '2022-09-05', 15, 15, 15),
(69300.0, 66.0, '2022-09-06', 16, 16, 16),
(88550.0, 77.0, '2022-09-07', 17, 17, 17),
(110000.0, 88.0, '2022-09-08', 18, 18, 18),
(133650.0, 99.0, '2022-09-09', 19, 19, 19),
(159500.0, 110.0, '2022-09-10', 20, 20, 20),
(7200.0, 12.0, '2021-12-01', 21, 21, 21),
(16800.0, 24.0, '2021-12-02', 22, 22, 22),
(28800.0, 36.0, '2021-12-03', 23, 23, 23),
(43200.0, 48.0, '2021-12-04', 24, 24, 24),
(60000.0, 60.0, '2021-12-05', 25, 25, 25);

INSERT INTO ORDER_LINE (orderID, industryId, MeatProduct_Id) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 3),
(4, 4, 4),
(5, 5, 5),
(6, 6, 6),
(7, 7, 7),
(8, 8, 8),
(9, 9, 9),
(10, 10, 10),
(11, 11, 11),
(12, 12, 12),
(13, 13, 13),
(14, 14, 14),
(15, 15, 15),
(16, 16, 16),
(17, 17, 17),
(18, 18, 18),
(19, 19, 19),
(20, 20, 20),
(21, 21, 21),
(22, 22, 22),
(23, 23, 23),
(24, 24, 24),
(25, 25, 25);

INSERT INTO CONSUMPTION_PATTERNS (region, population, meat_type, per_capita, total_diet, nutrition_contribution, demographic, year) VALUES
('Dhaka', 10000000, 'Beef', 10.5, 25.0, 'High Protein', 'Urban', 2023),
('Chittagong', 5000000, 'Mutton', 8.2, 20.0, 'Medium Protein', 'Urban', 2023),
('Khulna', 3000000, 'Chicken', 12.0, 30.0, 'Low Fat', 'Urban', 2023),
('Sylhet', 2000000, 'Beef', 9.8, 22.0, 'High Protein', 'Urban', 2023),
('Rajshahi', 2500000, 'Mutton', 7.5, 18.0, 'Medium Protein', 'Urban', 2023),
('Barisal', 1500000, 'Chicken', 11.2, 28.0, 'Low Fat', 'Rural', 2023),
('Rangpur', 1800000, 'Beef', 8.9, 21.0, 'High Protein', 'Rural', 2023),
('Mymensingh', 1200000, 'Mutton', 6.8, 16.0, 'Medium Protein', 'Rural', 2023),
('Comilla', 2200000, 'Chicken', 10.8, 27.0, 'Low Fat', 'Rural', 2023),
('Jessore', 1900000, 'Beef', 9.2, 23.0, 'High Protein', 'Rural', 2023),
('Dhaka', 9500000, 'Beef', 10.0, 24.0, 'High Protein', 'Urban', 2022),
('Chittagong', 4800000, 'Mutton', 7.8, 19.0, 'Medium Protein', 'Urban', 2022),
('Khulna', 2800000, 'Chicken', 11.5, 29.0, 'Low Fat', 'Urban', 2022),
('Sylhet', 1900000, 'Beef', 9.2, 21.0, 'High Protein', 'Urban', 2022),
('Rajshahi', 2400000, 'Mutton', 7.0, 17.0, 'Medium Protein', 'Urban', 2022),
('Barisal', 1400000, 'Chicken', 10.8, 27.0, 'Low Fat', 'Rural', 2022),
('Rangpur', 1700000, 'Beef', 8.5, 20.0, 'High Protein', 'Rural', 2022),
('Mymensingh', 1100000, 'Mutton', 6.5, 15.0, 'Medium Protein', 'Rural', 2022),
('Comilla', 2100000, 'Chicken', 10.2, 26.0, 'Low Fat', 'Rural', 2022),
('Jessore', 1800000, 'Beef', 8.8, 22.0, 'High Protein', 'Rural', 2022),
('Dhaka', 9000000, 'Beef', 9.5, 23.0, 'High Protein', 'Urban', 2021),
('Chittagong', 4600000, 'Mutton', 7.5, 18.0, 'Medium Protein', 'Urban', 2021),
('Khulna', 2600000, 'Chicken', 11.0, 28.0, 'Low Fat', 'Urban', 2021),
('Sylhet', 1800000, 'Beef', 8.8, 20.0, 'High Protein', 'Urban', 2021),
('Rajshahi', 2300000, 'Mutton', 6.8, 16.0, 'Medium Protein', 'Urban', 2021);