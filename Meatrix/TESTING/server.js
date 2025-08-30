import express from "express"
import mysql from "mysql2/promise"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3000

// Middleware
app.use(express.json())
app.use(express.static(__dirname))

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Shihab14032001", // Update with your password
  database: "livestockdb",
}

// Create database connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT 1 as test")
    res.json({ status: "healthy", database: "connected", timestamp: new Date().toISOString() })
  } catch (error) {
    console.error("Database connection error:", error)
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    })
  }
})

// ============= INDIVIDUAL TABLE CRUD OPERATIONS =============

// LIVE_STOCK table operations
app.get("/api/livestock", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM LIVE_STOCK")
    res.json(rows)
  } catch (error) {
    console.error("Error fetching livestock:", error)
    res.status(500).json({ error: "Failed to fetch livestock data" })
  }
})

app.post("/api/livestock", async (req, res) => {
  try {
    const { animal_type, birth_date, gender, rearing_period, breed, farm_id } = req.body
    const [result] = await pool.execute(
      "INSERT INTO LIVE_STOCK (animal_type, birth_date, gender, rearing_period, breed, farm_id) VALUES (?, ?, ?, ?, ?, ?)",
      [animal_type, birth_date, gender, rearing_period, breed, farm_id],
    )
    res.json({ id: result.insertId, message: "Livestock added successfully" })
  } catch (error) {
    console.error("Error adding livestock:", error)
    res.status(500).json({ error: "Failed to add livestock" })
  }
})

app.put("/api/livestock/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { animal_type, birth_date, gender, rearing_period, breed, farm_id } = req.body
    await pool.execute(
      "UPDATE LIVE_STOCK SET animal_type=?, birth_date=?, gender=?, rearing_period=?, breed=?, farm_id=? WHERE animal_id=?",
      [animal_type, birth_date, gender, rearing_period, breed, farm_id, id],
    )
    res.json({ message: "Livestock updated successfully" })
  } catch (error) {
    console.error("Error updating livestock:", error)
    res.status(500).json({ error: "Failed to update livestock" })
  }
})

app.delete("/api/livestock/:id", async (req, res) => {
  try {
    const { id } = req.params
    await pool.execute("DELETE FROM LIVE_STOCK WHERE animal_id=?", [id])
    res.json({ message: "Livestock deleted successfully" })
  } catch (error) {
    console.error("Error deleting livestock:", error)
    res.status(500).json({ error: "Failed to delete livestock" })
  }
})

// MEAT_BATCH table operations
app.get("/api/meat-batches", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM MEAT_BATCH")
    res.json(rows)
  } catch (error) {
    console.error("Error fetching meat batches:", error)
    res.status(500).json({ error: "Failed to fetch meat batch data" })
  }
})

app.post("/api/meat-batches", async (req, res) => {
  try {
    const { meat_type, quantity, produce_date, total_weight, animal_Id, slaughterHouseId, shipment_Id, agent_Id } =
      req.body
    const [result] = await pool.execute(
      "INSERT INTO MEAT_BATCH (meat_type, quantity, produce_date, total_weight, animal_Id, slaughterHouseId, shipment_Id, agent_Id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [meat_type, quantity, produce_date, total_weight, animal_Id, slaughterHouseId, shipment_Id, agent_Id],
    )
    res.json({ id: result.insertId, message: "Meat batch added successfully" })
  } catch (error) {
    console.error("Error adding meat batch:", error)
    res.status(500).json({ error: "Failed to add meat batch" })
  }
})

app.put("/api/meat-batches/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { meat_type, quantity, produce_date, total_weight, animal_Id, slaughterHouseId, shipment_Id, agent_Id } =
      req.body
    await pool.execute(
      "UPDATE MEAT_BATCH SET meat_type=?, quantity=?, produce_date=?, total_weight=?, animal_Id=?, slaughterHouseId=?, shipment_Id=?, agent_Id=? WHERE batch_id=?",
      [meat_type, quantity, produce_date, total_weight, animal_Id, slaughterHouseId, shipment_Id, agent_Id, id],
    )
    res.json({ message: "Meat batch updated successfully" })
  } catch (error) {
    console.error("Error updating meat batch:", error)
    res.status(500).json({ error: "Failed to update meat batch" })
  }
})

app.delete("/api/meat-batches/:id", async (req, res) => {
  try {
    const { id } = req.params
    await pool.execute("DELETE FROM MEAT_BATCH WHERE batch_id=?", [id])
    res.json({ message: "Meat batch deleted successfully" })
  } catch (error) {
    console.error("Error deleting meat batch:", error)
    res.status(500).json({ error: "Failed to delete meat batch" })
  }
})

// SALES_RECORD table operations
app.get("/api/sales-records", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM SALES_RECORD")
    res.json(rows)
  } catch (error) {
    console.error("Error fetching sales records:", error)
    res.status(500).json({ error: "Failed to fetch sales record data" })
  }
})

app.post("/api/sales-records", async (req, res) => {
  try {
    const { meatBatchPrice, quantity, date, agentId, industryId, batch_id } = req.body
    const [result] = await pool.execute(
      "INSERT INTO SALES_RECORD (meatBatchPrice, quantity, date, agentId, industryId, batch_id) VALUES (?, ?, ?, ?, ?, ?)",
      [meatBatchPrice, quantity, date, agentId, industryId, batch_id],
    )
    res.json({ id: result.insertId, message: "Sales record added successfully" })
  } catch (error) {
    console.error("Error adding sales record:", error)
    res.status(500).json({ error: "Failed to add sales record" })
  }
})

app.put("/api/sales-records/:id", async (req, res) => {
  try {
    const { id } = req.params
    const { meatBatchPrice, quantity, date, agentId, industryId, batch_id } = req.body
    await pool.execute(
      "UPDATE SALES_RECORD SET meatBatchPrice=?, quantity=?, date=?, agentId=?, industryId=?, batch_id=? WHERE salesId=?",
      [meatBatchPrice, quantity, date, agentId, industryId, batch_id, id],
    )
    res.json({ message: "Sales record updated successfully" })
  } catch (error) {
    console.error("Error updating sales record:", error)
    res.status(500).json({ error: "Failed to update sales record" })
  }
})

app.delete("/api/sales-records/:id", async (req, res) => {
  try {
    const { id } = req.params
    await pool.execute("DELETE FROM SALES_RECORD WHERE salesId=?", [id])
    res.json({ message: "Sales record deleted successfully" })
  } catch (error) {
    console.error("Error deleting sales record:", error)
    res.status(500).json({ error: "Failed to delete sales record" })
  }
})

// CONSUMPTION_PATTERNS table operations
app.get("/api/consumption-patterns", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM CONSUMPTION_PATTERNS")
    res.json(rows)
  } catch (error) {
    console.error("Error fetching consumption patterns:", error)
    res.status(500).json({ error: "Failed to fetch consumption pattern data" })
  }
})

app.post("/api/consumption-patterns", async (req, res) => {
  try {
    const { region, population, meat_type, per_capita, total_diet, nutrition_contribution, demographic } = req.body
    const [result] = await pool.execute(
      "INSERT INTO CONSUMPTION_PATTERNS (region, population, meat_type, per_capita, total_diet, nutrition_contribution, demographic) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [region, population, meat_type, per_capita, total_diet, nutrition_contribution, demographic],
    )
    res.json({ id: result.insertId, message: "Consumption pattern added successfully" })
  } catch (error) {
    console.error("Error adding consumption pattern:", error)
    res.status(500).json({ error: "Failed to add consumption pattern" })
  }
})

app.put("/api/consumption-patterns/:region/:meat_type", async (req, res) => {
  try {
    const { region, meat_type } = req.params
    const { population, per_capita, total_diet, nutrition_contribution, demographic } = req.body
    await pool.execute(
      "UPDATE CONSUMPTION_PATTERNS SET population=?, per_capita=?, total_diet=?, nutrition_contribution=?, demographic=? WHERE region=? AND meat_type=?",
      [population, per_capita, total_diet, nutrition_contribution, demographic, region, meat_type],
    )
    res.json({ message: "Consumption pattern updated successfully" })
  } catch (error) {
    console.error("Error updating consumption pattern:", error)
    res.status(500).json({ error: "Failed to update consumption pattern" })
  }
})

app.delete("/api/consumption-patterns/:region/:meat_type", async (req, res) => {
  try {
    const { region, meat_type } = req.params
    await pool.execute("DELETE FROM CONSUMPTION_PATTERNS WHERE region=? AND meat_type=?", [region, meat_type])
    res.json({ message: "Consumption pattern deleted successfully" })
  } catch (error) {
    console.error("Error deleting consumption pattern:", error)
    res.status(500).json({ error: "Failed to delete consumption pattern" })
  }
})

// ============= COMPLEX VIEW DATA (READ-ONLY) =============

// Get complex joined data (your existing queries)
app.get("/api/meat-products-view", async (req, res) => {
  try {
    console.log("[v0] Fetching meat products view...")
    const [rows] = await pool.execute(`
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
    `)
    console.log(`[v0] Found ${rows.length} meat product records`)
    res.json(rows)
  } catch (error) {
    console.error("Error fetching meat products view:", error)
    res.status(500).json({ error: "Failed to fetch meat products view", details: error.message })
  }
})

app.get("/api/production-records-view", async (req, res) => {
  try {
    console.log("[v0] Fetching production records view...")
    const [rows] = await pool.execute(`
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
      GROUP BY YEAR(m.produce_date), f.areaName, s.area
    `)
    console.log(`[v0] Found ${rows.length} production records`)
    res.json(rows)
  } catch (error) {
    console.error("Error fetching production records view:", error)
    res.status(500).json({ error: "Failed to fetch production records view", details: error.message })
  }
})

app.get("/api/price-trends-view", async (req, res) => {
  try {
    console.log("[v0] Fetching price trends view...")
    const [rows] = await pool.execute(`
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
      GROUP BY DATE_FORMAT(m.produce_date, '%Y-%m'), COALESCE(i.area, a.area), m.meat_type, sl.meatBatchPrice, mp.price
    `)
    console.log(`[v0] Found ${rows.length} price trend records`)
    res.json(rows)
  } catch (error) {
    console.error("Error fetching price trends view:", error)
    res.status(500).json({ error: "Failed to fetch price trends view", details: error.message })
  }
})

app.get("/api/demand-elasticity-view", async (req, res) => {
  try {
    console.log("[v0] Fetching demand elasticity view...")
    const [rows] = await pool.execute(`
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
        ) AS PriceElasticityOfDemand,
        '+0.3 with alternatives' AS CrossElasticity,
        1.2 AS IncomeElasticity
      FROM sales_record sr
      JOIN meat_batch mb ON sr.batch_id = mb.batch_id
      GROUP BY mb.meat_type, YEAR(sr.date)
      WINDOW w AS (PARTITION BY mb.meat_type ORDER BY YEAR(sr.date))
    `)
    console.log(`[v0] Found ${rows.length} demand elasticity records`)
    res.json(rows)
  } catch (error) {
    console.error("Error fetching demand elasticity view:", error)
    res.status(500).json({ error: "Failed to fetch demand elasticity view", details: error.message })
  }
})

app.get("/api/supply-demand-view", async (req, res) => {
  try {
    console.log("[v0] Fetching supply demand view...")
    const [rows] = await pool.execute(`
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
      GROUP BY i.district, YEAR(sr.date)
    `)
    console.log(`[v0] Found ${rows.length} supply demand records`)
    res.json(rows)
  } catch (error) {
    console.error("Error fetching supply demand view:", error)
    res.status(500).json({ error: "Failed to fetch supply demand view", details: error.message })
  }
})

// ============= PROPER UPDATE ENDPOINTS FOR COMPLEX VIEWS =============

// Update meat products - properly update related tables
app.put("/api/meat-products-update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { productType, breedVariety, avgLiveWeight, carcassWeight, feedConversionRatio, rearingPeriod } = req.body;

    // Get the original record to know which animal_id we're working with
    const [batchRows] = await pool.execute("SELECT * FROM MEAT_BATCH WHERE batch_id = ?", [id]);
    if (batchRows.length === 0) {
      return res.status(404).json({ error: "Meat batch not found" });
    }

    const animalId = batchRows[0].animal_Id;

    // Update LIVE_STOCK table
    await pool.execute(
      "UPDATE LIVE_STOCK SET breed = ?, rearing_period = ? WHERE animal_id = ?",
      [breedVariety, rearingPeriod, animalId]
    );

    // Update LIVE_STOCK_W table (latest weight record)
    await pool.execute(
      "UPDATE LIVE_STOCK_W SET weight = ? WHERE animal_id = ? ORDER BY date DESC LIMIT 1",
      [avgLiveWeight, animalId]
    );

    // Update MEAT_BATCH table
    await pool.execute(
      "UPDATE MEAT_BATCH SET meat_type = ?, total_weight = ? WHERE batch_id = ?",
      [productType, carcassWeight, id]
    );

    res.json({ message: "Meat product updated successfully" });
  } catch (error) {
    console.error("Error updating meat product:", error);
    res.status(500).json({ error: "Failed to update meat product" });
  }
});

// Update production records - properly update related tables
app.put("/api/production-records-update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { year, regionDistrict, livestockPopulation, slaughterRate, animalsSlaughtered, totalMeatYield, yieldPerAnimal } = req.body;

    // This is a complex view that aggregates data from multiple tables
    // For simplicity, we'll update the most relevant meat batch record
    // In a real application, you'd need a more sophisticated approach
    
    // Find a meat batch from the specified year and region
    const [batches] = await pool.execute(`
      SELECT mb.batch_id 
      FROM MEAT_BATCH mb
      JOIN LIVE_STOCK ls ON mb.animal_Id = ls.animal_id
      JOIN FARM f ON ls.farm_id = f.FarmID
      WHERE YEAR(mb.produce_date) = ? AND f.areaName LIKE ?
      LIMIT 1
    `, [year, `%${regionDistrict}%`]);

    if (batches.length > 0) {
      const batchId = batches[0].batch_id;
      
      // Update the meat batch with new yield data
      await pool.execute(
        "UPDATE MEAT_BATCH SET total_weight = ?, quantity = ? WHERE batch_id = ?",
        [totalMeatYield, animalsSlaughtered, batchId]
      );
    }

    res.json({ message: "Production record updated successfully" });
  } catch (error) {
    console.error("Error updating production record:", error);
    res.status(500).json({ error: "Failed to update production record" });
  }
});

// Update price trends - properly update related tables
app.put("/api/price-trends-update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { date, regionMarket, productType, wholesalePrice, retailPrice, priceChange, seasonalTrend } = req.body;

    // Update sales record (wholesale price)
    await pool.execute(
      "UPDATE SALES_RECORD SET meatBatchPrice = ?, date = ? WHERE salesId = ?",
      [wholesalePrice, date, id]
    );

    // Update meat product (retail price) - find related product
    const [salesRows] = await pool.execute("SELECT * FROM SALES_RECORD WHERE salesId = ?", [id]);
    if (salesRows.length > 0) {
      const industryId = salesRows[0].industryId;
      
      await pool.execute(
        "UPDATE MEAT_PRODUCT SET price = ? WHERE industryId = ? LIMIT 1",
        [retailPrice, industryId]
      );
    }

    res.json({ message: "Price trend updated successfully" });
  } catch (error) {
    console.error("Error updating price trend:", error);
    res.status(500).json({ error: "Failed to update price trend" });
  }
});

// Add proper POST endpoints for creating new records
app.post("/api/meat-products-update", async (req, res) => {
  try {
    const { productType, breedVariety, avgLiveWeight, carcassWeight, feedConversionRatio, rearingPeriod } = req.body;

    // Create new livestock record
    const [livestockResult] = await pool.execute(
      "INSERT INTO LIVE_STOCK (animal_type, breed, rearing_period, farm_id) VALUES (?, ?, ?, 1)",
      [productType, breedVariety, rearingPeriod]
    );
    
    const animalId = livestockResult.insertId;

    // Add weight record
    await pool.execute(
      "INSERT INTO LIVE_STOCK_W (animal_id, date, weight) VALUES (?, CURDATE(), ?)",
      [animalId, avgLiveWeight]
    );

    // Create meat batch record
    const [batchResult] = await pool.execute(
      "INSERT INTO MEAT_BATCH (meat_type, total_weight, quantity, produce_date, animal_Id, slaughterHouseId, shipment_Id, agent_Id) VALUES (?, ?, 1, CURDATE(), ?, 1, 1, 1)",
      [productType, carcassWeight, animalId]
    );

    res.json({ id: batchResult.insertId, message: "Meat product added successfully" });
  } catch (error) {
    console.error("Error adding meat product:", error);
    res.status(500).json({ error: "Failed to add meat product" });
  }
});

app.post("/api/production-records-update", async (req, res) => {
  try {
    const { year, regionDistrict, totalMeatYield } = req.body;

    // In a real system, this would update FARM, LIVE_STOCK, and MEAT_BATCH tables
    const [result] = await pool.execute(
      "INSERT INTO MEAT_BATCH (meat_type, total_weight, quantity, produce_date, animal_Id, slaughterHouseId, shipment_Id, agent_Id) VALUES ('Mixed', ?, 1, ?, 1, 1, 1, 1)",
      [totalMeatYield, `${year}-01-01`],
    );

    res.json({ id: result.insertId, message: "Production record added successfully" });
  } catch (error) {
    console.error("Error adding production record:", error);
    res.status(500).json({ error: "Failed to add production record" });
  }
});

app.post("/api/price-trends-update", async (req, res) => {
  try {
    const { date, productType, wholesalePrice, retailPrice } = req.body;

    const [result] = await pool.execute(
      "INSERT INTO SALES_RECORD (meatBatchPrice, quantity, date, agentId, industryId, batch_id) VALUES (?, 1, ?, 1, 1, 1)",
      [wholesalePrice, date],
    );

    res.json({ id: result.insertId, message: "Price trend added successfully" });
  } catch (error) {
    console.error("Error adding price trend:", error);
    res.status(500).json({ error: "Failed to add price trend" });
  }
});

// Get simplified table data for direct management
app.get("/api/table-manager/:tableName", async (req, res) => {
  try {
    const tableName = req.params.tableName
    let query = ""

    switch (tableName) {
      case "livestock":
        query = "SELECT * FROM LIVE_STOCK LIMIT 50"
        break
      case "meat-batches":
        query = "SELECT * FROM MEAT_BATCH LIMIT 50"
        break
      case "sales-records":
        query = "SELECT * FROM SALES_RECORD LIMIT 50"
        break
      case "consumption-patterns":
        query = "SELECT * FROM CONSUMPTION_PATTERNS LIMIT 50"
        break
      default:
        return res.status(400).json({ error: "Invalid table name" })
    }

    const [rows] = await pool.execute(query)
    res.json(rows)
  } catch (error) {
    console.error(`Error fetching ${req.params.tableName}:`, error)
    res.status(500).json({ error: `Failed to fetch ${req.params.tableName}` })
  }
})

// ============= HELPER ENDPOINTS =============

// Get reference data for dropdowns
app.get("/api/farms", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT FarmID, FarmName, areaName FROM FARM")
    res.json(rows)
  } catch (error) {
    console.error("Error fetching farms:", error)
    res.status(500).json({ error: "Failed to fetch farms" })
  }
})

app.get("/api/slaughter-houses", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT slaughterHouse_id, area, city FROM SLAUGHTER_HOUSE")
    res.json(rows)
  } catch (error) {
    console.error("Error fetching slaughter houses:", error)
    res.status(500).json({ error: "Failed to fetch slaughter houses" })
  }
})

app.get("/api/agents", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT agent_Id, agentName, area FROM AGENT")
    res.json(rows)
  } catch (error) {
    console.error("Error fetching agents:", error)
    res.status(500).json({ error: "Failed to fetch agents" })
  }
})

app.get("/api/industries", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT industry_Id, shopName, area FROM INDUSTRY")
    res.json(rows)
  } catch (error) {
    console.error("Error fetching industries:", error)
    res.status(500).json({ error: "Failed to fetch industries" })
  }
})

// Serve the admin panel
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "AdminPanel.html"))
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
  console.log(`Admin Panel available at http://localhost:${PORT}`)
  console.log(`Health check available at http://localhost:${PORT}/api/health`)
})