import mysql from "mysql2/promise";

export let meatProductT;
export let productionRecordT;
export let priceTrendT;
export let consumptionPatternT;
export let demandElasticityT;
export let SupplyDemandT;
export let insightsReportsT;

// create async function
export async function loadData() {
  // Connect to DB
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Bolbona15203118",
    // Bolbona15203118
    // Shihab14032001
    database: "livestockdb",
  });

  // meatProductT Loading
  const [meatProduct] = await connection.execute(`
    SELECT  
        m.meat_type AS Product_type, 
        l.breed AS Breed, 
        lw.weight AS Weight,
        m.total_weight AS Carcass_weight, 
        ROUND((lr.givenQunatity*100)/lw.weight,2) AS FCR,
        l.Rearing_Period
    FROM meat_batch m
    JOIN live_stock l USING(animal_id)
    JOIN live_stock_w lw USING(animal_id)
    JOIN live_stock_care_records lr USING(animal_id)

  `);
  meatProductT = meatProduct;


  // productionRecordT Loading
  const [productionRecord] = await connection.execute(`
    SELECT 
      YEAR(m.produce_date) AS 'Year',
      f.areaName AS Region,
      COUNT(l.animal_id) AS LiveStockPopulation,
      ROUND(
          (COUNT(DISTINCT m.animal_id) * 100.0 / NULLIF(COUNT(DISTINCT l.animal_id), 0)), 
          2
      ) AS SlaughterRatePercentage,
      COUNT(m.batch_id) AS AnimalsSlaughtered,
      SUM(m.total_weight) AS TotalMeatYield,
      (SUM(m.total_weight)/COUNT(m.batch_id)) AS AVGYieldPerAnimal
    FROM farm f
    JOIN live_stock l ON f.farmID = l.farm_id
    JOIN meat_batch m USING(animal_id)
    JOIN slaughter_house s ON m.slaughterHouseId = s.slaughterHouse_Id
    GROUP BY YEAR(m.produce_date), f.areaName, s.area;
  `);
  productionRecordT = productionRecord;


  // priceTrendT Loading
  const [priceTrend] = await connection.execute(`
    SELECT 
      DATE_FORMAT(m.produce_date, '%Y-%m') AS Date,
      COALESCE(i.area, a.area) AS Region,
      m.meat_type AS ProductType,
      sl.meatBatchPrice AS WholeSalePrice,
      mp.price AS RetailPrice,
      ROUND(
          (
              (AVG(sl.meatBatchPrice) - LAG(AVG(sl.meatBatchPrice)) 
                  OVER (PARTITION BY COALESCE(i.area, a.area))) 
              / LAG(AVG(sl.meatBatchPrice)) 
                  OVER (PARTITION BY COALESCE(i.area, a.area))
          ) * 100, 
          1
      ) AS PriceChangePercentage
    FROM meat_batch m 
    JOIN sales_record sl ON sl.batch_id = m.batch_id
    JOIN meat_product mp ON mp.industryId = sl.industryId
    LEFT JOIN industry i ON i.industry_Id = sl.industryId
    LEFT JOIN agent a ON a.agent_id = sl.agentId
    GROUP BY DATE_FORMAT(m.produce_date, '%Y-%m'), COALESCE(i.area, a.area), m.meat_type, sl.meatBatchPrice, mp.price;
  `);
  priceTrendT = priceTrend;


  // consumptionPatternT Loading
  const [consumptionPattern] = await connection.execute(`
    SELECT * FROM consumption_patterns
  `);
  consumptionPatternT = consumptionPattern;


  // demandElasticityT Loading
  const [demandElasticity] = await connection.execute(`
    SELECT 
      mb.meat_type AS ProductType,
      YEAR(sr.date) AS TimePeriod,
      ROUND(AVG(sr.meatBatchPrice / sr.quantity), 2) AS AveragePrice,
      ROUND(SUM(sr.quantity) / 1000, 0) AS QuantityDemanded,
      ROUND(
          (
              (SUM(sr.quantity) - LAG(SUM(sr.quantity)) OVER w) 
              / LAG(SUM(sr.quantity)) OVER w
          ) / (
              (AVG(sr.meatBatchPrice / NULLIF(sr.quantity, 0)) 
              - LAG(AVG(sr.meatBatchPrice / NULLIF(sr.quantity, 0))) OVER w) 
              / LAG(AVG(sr.meatBatchPrice / NULLIF(sr.quantity, 0))) OVER w
          ), 
          2
      ) AS PriceElasticityOfDemand
    FROM sales_record sr
    JOIN meat_batch mb ON sr.batch_id = mb.batch_id
    GROUP BY mb.meat_type, YEAR(sr.date)
    WINDOW w AS (PARTITION BY mb.meat_type);
  `);
  demandElasticityT = demandElasticity;


  // SupplyDemandT Loading
  const [SupplyDemand] = await connection.execute(`
    SELECT 
      i.district AS Region,
      YEAR(sr.date) AS TimePeriod,
      ROUND(SUM(mb.total_weight) / 1000, 0) AS SupplyVolume,
      ROUND(SUM(sr.quantity) / 1000, 0) AS DemandVolume,
      ROUND((SUM(mb.total_weight) - SUM(sr.quantity)) / 1000, 0) AS SurplusDeficit,
      ROUND((SUM(mb.total_weight) / SUM(sr.quantity)) * 100, 1) AS SelfSufficiencyRatio
    FROM sales_record sr
    JOIN meat_batch mb ON sr.batch_id = mb.batch_id
    JOIN industry i ON sr.industryId = i.industry_Id
    WHERE sr.date IS NOT NULL
    GROUP BY i.district, YEAR(sr.date), MONTH(sr.date);

  `);
  SupplyDemandT = SupplyDemand;


  // insightsReportsT Loading
  // const [insightsReports] = await connection.execute(`
  //   -- Write SQL query to generate insights report
  // `);
  // insightsReportsT = insightsReports;

  
  console.log("meatProductT",meatProductT);
  console.log("productionRecordT",productionRecordT);
  console.log("priceTrendT",priceTrendT);
  console.log("consumptionPatternT",consumptionPatternT);
  console.log("demandElasticityT",demandElasticityT);
  console.log("SupplyDemandT",SupplyDemandT);

  // Close connection
  await connection.end();
}

// Run function
loadData();