import express from "express"
import mysql from "mysql2/promise"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3002 // Using a different port to avoid conflict

// Middleware
app.use(express.json())
app.use(express.static(__dirname))

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Shihab14032001",
  database: "livestockdb",
}

// Create database connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "ButcherDashBoard.html"))
})

// Health check endpoint
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

// ============= BUTCHER DASHBOARD ENDPOINTS =============

// Get dashboard stats
app.get("/api/butcher/dashboard-stats", async (req, res) => {
  try {
    // Total animals received
    const [animalCount] = await pool.execute("SELECT COUNT(*) as count FROM LIVE_STOCK")
    
    // Total animals slaughtered
    const [slaughterCount] = await pool.execute(`
      SELECT COUNT(DISTINCT animal_Id) as count 
      FROM MEAT_BATCH 
      WHERE animal_Id IS NOT NULL
    `)
    
    // Total meat distributed
    const [meatDistributed] = await pool.execute(`
      SELECT COALESCE(SUM(quantity), 0) as total 
      FROM SALES_RECORD 
      WHERE agentId IS NOT NULL
    `)
    
    // Pending orders (assuming orders without completion date are pending)
    const [pendingOrders] = await pool.execute(`
      SELECT COUNT(*) as count 
      FROM \`Order\` 
      WHERE deliveryId IS NULL
    `)

    res.json({
      totalAnimalsReceived: animalCount[0].count,
      totalSlaughtered: slaughterCount[0].count,
      totalMeatDistributed: meatDistributed[0].total,
      pendingOrders: pendingOrders[0].count
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    res.status(500).json({ error: "Failed to fetch dashboard stats" })
  }
})

// Get animal intake records
app.get("/api/butcher/animals", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        ls.animal_id as id,
        ls.animal_id as animalId,
        f.FarmName as farmerName,
        ls.breed,
        ls.animal_type as type,
        lsw.weight,
        ls.gender,
        pr.date as receivedDate,
        CASE 
          WHEN mb.animal_Id IS NOT NULL THEN 'slaughtered'
          ELSE 'received'
        END as status
      FROM LIVE_STOCK ls
      JOIN FARM f ON ls.farm_id = f.FarmID
      JOIN PURCHASE_RECORD pr ON ls.animal_id = pr.animal_Id
      LEFT JOIN LIVE_STOCK_W lsw ON ls.animal_id = lsw.animal_id
      LEFT JOIN MEAT_BATCH mb ON ls.animal_id = mb.animal_Id
      ORDER BY pr.date DESC
    `)
    res.json(rows)
  } catch (error) {
    console.error("Error fetching animals:", error)
    res.status(500).json({ error: "Failed to fetch animals" })
  }
})

// Add animal intake record
app.post("/api/butcher/animals", async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const { farmerId, farmerName, animalId, breed, animalType, gender, weight, vaccine, receivedDate } = req.body

    // First, find or create farm
    let farmId
    const [farmRows] = await connection.execute(
      "SELECT FarmID FROM FARM WHERE FarmName = ?",
      [farmerName]
    )
    
    if (farmRows.length > 0) {
      farmId = farmRows[0].FarmID
    } else {
      const [result] = await connection.execute(
        "INSERT INTO FARM (FarmName, areaName, City, district, zip, country) VALUES (?, 'Unknown', 'Unknown', 'Unknown', '0000', 'Bangladesh')",
        [farmerName]
      )
      farmId = result.insertId
    }

    // Add to LIVE_STOCK
    const [livestockResult] = await connection.execute(
      "INSERT INTO LIVE_STOCK (animal_type, birth_date, gender, rearing_period, breed, farm_id) VALUES (?, ?, ?, 365, ?, ?)",
      [animalType, receivedDate, gender, breed, farmId]
    )
    
    const newAnimalId = livestockResult.insertId

    // Add weight record
    await connection.execute(
      "INSERT INTO LIVE_STOCK_W (animal_id, date, weight) VALUES (?, ?, ?)",
      [newAnimalId, receivedDate, weight]
    )

    // Add purchase record
    await connection.execute(
      "INSERT INTO PURCHASE_RECORD (liveStockPrice, date, farm_id, animal_Id) VALUES (0, ?, ?, ?)",
      [receivedDate, farmId, newAnimalId]
    )

    await connection.commit()
    res.json({ id: newAnimalId, message: "Animal added successfully" })
  } catch (error) {
    await connection.rollback()
    console.error("Error adding animal:", error)
    res.status(500).json({ error: "Failed to add animal" })
  } finally {
    connection.release()
  }
})

// Get slaughter records
app.get("/api/butcher/slaughter-records", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        mb.batch_id as id,
        mb.batch_id as batchId,
        mb.produce_date as slaughterDate,
        COUNT(DISTINCT mb.animal_Id) as totalAnimals,
        mb.total_weight as totalMeatYield,
        ROUND((mb.total_weight / SUM(lsw.weight)) * 100, 2) as slaughterRate,
        ROUND(AVG(lsw.weight), 2) as averageWeight,
        ROUND(SUM(lcr.givenQunatity) / mb.total_weight, 2) as fcr
      FROM MEAT_BATCH mb
      JOIN LIVE_STOCK_W lsw ON mb.animal_Id = lsw.animal_id
      JOIN LIVE_STOCK_CARE_RECORDS lcr ON mb.animal_Id = lcr.animal_Id
      GROUP BY mb.batch_id
      ORDER BY mb.produce_date DESC
    `)
    res.json(rows)
  } catch (error) {
    console.error("Error fetching slaughter records:", error)
    res.status(500).json({ error: "Failed to fetch slaughter records" })
  }
})

// Add slaughter record
app.post("/api/butcher/slaughter-records", async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const { batchId, slaughterDate, animalIds, totalMeatYield, feedConversionRatio, rearingPeriod, notes } = req.body

    // For each animal, create a meat batch record
    for (const animalId of animalIds) {
      const [result] = await connection.execute(
        "INSERT INTO MEAT_BATCH (meat_type, quantity, produce_date, total_weight, animal_Id, slaughterHouseId, shipment_Id, agent_Id) VALUES ('Beef', 1, ?, ?, ?, 1, 1, 1)",
        [slaughterDate, totalMeatYield / animalIds.length, animalId]
      )
    }

    await connection.commit()
    res.json({ message: "Slaughter record added successfully" })
  } catch (error) {
    await connection.rollback()
    console.error("Error adding slaughter record:", error)
    res.status(500).json({ error: "Failed to add slaughter record" })
  } finally {
    connection.release()
  }
})

// Get warehouse inventory
app.get("/api/butcher/warehouse", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        mb.batch_id as id,
        mb.batch_id as batchId,
        mb.produce_date as slaughterDate,
        mb.produce_date as receivedDate,
        mb.total_weight as totalMeat,
        mb.total_weight as availableMeat,
        0 as reservedMeat,
        w.area as location,
        '4.0' as temperature,
        'available' as status
      FROM MEAT_BATCH mb
      JOIN WAREHOUSE w ON mb.shipment_Id = w.warehouse_id
      ORDER BY mb.produce_date DESC
    `)
    res.json(rows)
  } catch (error) {
    console.error("Error fetching warehouse inventory:", error)
    res.status(500).json({ error: "Failed to fetch warehouse inventory" })
  }
})

// Get distribution records
app.get("/api/butcher/distributions", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        sr.salesId as id,
        a.agentName as agentName,
        a.area as agentLocation,
        mb.batch_id as batchId,
        sr.quantity as meatAmount,
        ls.breed as animalBreed,
        ls.animal_type as animalType,
        sr.date as distributionDate,
        sr.meatBatchPrice as price
      FROM SALES_RECORD sr
      JOIN AGENT a ON sr.agentId = a.agent_Id
      JOIN MEAT_BATCH mb ON sr.batch_id = mb.batch_id
      JOIN LIVE_STOCK ls ON mb.animal_Id = ls.animal_id
      ORDER BY sr.date DESC
    `)
    res.json(rows)
  } catch (error) {
    console.error("Error fetching distributions:", error)
    res.status(500).json({ error: "Failed to fetch distributions" })
  }
})

// Add distribution record
app.post("/api/butcher/distributions", async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const { agentId, agentName, agentLocation, batchId, meatAmount, price } = req.body

    // Find or create agent
    let agent_Id
    const [agentRows] = await connection.execute(
      "SELECT agent_Id FROM AGENT WHERE agentName = ?",
      [agentName]
    )
    
    if (agentRows.length > 0) {
      agent_Id = agentRows[0].agent_Id
    } else {
      const [result] = await connection.execute(
        "INSERT INTO AGENT (agentName, area, city, district, country) VALUES (?, ?, 'Unknown', 'Unknown', 'Bangladesh')",
        [agentName, agentLocation]
      )
      agent_Id = result.insertId
    }

    // Add sales record
    await connection.execute(
      "INSERT INTO SALES_RECORD (meatBatchPrice, quantity, date, agentId, industryId, batch_id) VALUES (?, ?, CURDATE(), ?, 1, ?)",
      [price, meatAmount, agent_Id, batchId]
    )

    await connection.commit()
    res.json({ message: "Distribution record added successfully" })
  } catch (error) {
    await connection.rollback()
    console.error("Error adding distribution record:", error)
    res.status(500).json({ error: "Failed to add distribution record" })
  } finally {
    connection.release()
  }
})

// Get agent orders
app.get("/api/butcher/orders", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        o.orderID as id,
        a.agentName as agentName,
        a.area as agentLocation,
        mb.meat_type as meatType,
        o.totalQuantity as quantity,
        o.orderDate,
        o.orderDate as requiredDate,
        CASE 
          WHEN d.deliveryId IS NOT NULL THEN 'completed'
          ELSE 'pending'
        END as status,
        o.totalPrice as price
      FROM \`Order\` o
      JOIN AGENT a ON o.industryId = a.agent_Id
      JOIN MEAT_PRODUCT mp ON o.MeatProduct_Id = mp.Meatproduct_Id
      JOIN MEAT_BATCH mb ON mp.industryId = mb.batch_id
      LEFT JOIN DELIVERY d ON o.orderID = d.orderID
      ORDER BY o.orderDate DESC
    `)
    res.json(rows)
  } catch (error) {
    console.error("Error fetching orders:", error)
    res.status(500).json({ error: "Failed to fetch orders" })
  }
})

// Add agent order
app.post("/api/butcher/orders", async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const { agentId, agentName, agentLocation, meatType, quantity, requiredDate, price } = req.body

    // Find or create agent
    let agent_Id
    const [agentRows] = await connection.execute(
      "SELECT agent_Id FROM AGENT WHERE agentName = ?",
      [agentName]
    )
    
    if (agentRows.length > 0) {
      agent_Id = agentRows[0].agent_Id
    } else {
      const [result] = await connection.execute(
        "INSERT INTO AGENT (agentName, area, city, district, country) VALUES (?, ?, 'Unknown', 'Unknown', 'Bangladesh')",
        [agentName, agentLocation]
      )
      agent_Id = result.insertId
    }

    // Create a meat product
    const [productResult] = await connection.execute(
      "INSERT INTO MEAT_PRODUCT (nutritionInfo, packagingDate, expireDate, price, quantity, industryId) VALUES ('High Protein', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), ?, ?, 1)",
      [price, quantity]
    )
    
    const productId = productResult.insertId

    // Create order
    await connection.execute(
      "INSERT INTO \`Order\` (orderDate, totalQuantity, totalPrice, customer_Id, industryId, MeatProduct_Id) VALUES (CURDATE(), ?, ?, 1, ?, ?)",
      [quantity, price * quantity, agent_Id, productId]
    )

    await connection.commit()
    res.json({ message: "Order added successfully" })
  } catch (error) {
    await connection.rollback()
    console.error("Error adding order:", error)
    res.status(500).json({ error: "Failed to add order" })
  } finally {
    connection.release()
  }
})

// Get analytics data
app.get("/api/butcher/analytics", async (req, res) => {
  try {
    // Slaughter efficiency
    const [slaughterEfficiency] = await pool.execute(`
      SELECT 
        ROUND(AVG((mb.total_weight / lsw.weight) * 100), 2) as avgSlaughterRate,
        ROUND(SUM(mb.total_weight), 2) as totalMeatYield,
        ROUND(AVG(lcr.givenQunatity / mb.total_weight), 2) as avgFCR
      FROM MEAT_BATCH mb
      JOIN LIVE_STOCK_W lsw ON mb.animal_Id = lsw.animal_id
      JOIN LIVE_STOCK_CARE_RECORDS lcr ON mb.animal_Id = lcr.animal_Id
    `)
    
    // Distribution summary
    const [distributionSummary] = await pool.execute(`
      SELECT 
        COUNT(DISTINCT agentId) as totalAgents,
        ROUND(SUM(meatBatchPrice * quantity), 2) as totalRevenue,
        ROUND(AVG(meatBatchPrice / quantity), 2) as avgPricePerKg
      FROM SALES_RECORD
      WHERE agentId IS NOT NULL
    `)

    res.json({
      avgSlaughterRate: slaughterEfficiency[0].avgSlaughterRate || 0,
      totalMeatYield: slaughterEfficiency[0].totalMeatYield || 0,
      avgFCR: slaughterEfficiency[0].avgFCR || 0,
      totalAgents: distributionSummary[0].totalAgents || 0,
      totalRevenue: distributionSummary[0].totalRevenue || 0,
      avgPricePerKg: distributionSummary[0].avgPricePerKg || 0
    })
  } catch (error) {
    console.error("Error fetching analytics:", error)
    res.status(500).json({ error: "Failed to fetch analytics" })
  }
})

// Get recent activities
app.get("/api/butcher/activities", async (req, res) => {
  try {
    // This is a simplified version - in a real app, you'd have an activity log table
    const [animalActivities] = await pool.execute(`
      SELECT 
        CONCAT('Animal intake: ', ls.animal_id, ' from ', f.FarmName) as description,
        pr.date as timestamp
      FROM LIVE_STOCK ls
      JOIN FARM f ON ls.farm_id = f.FarmID
      JOIN PURCHASE_RECORD pr ON ls.animal_id = pr.animal_Id
      ORDER BY pr.date DESC
      LIMIT 5
    `)
    
    const [slaughterActivities] = await pool.execute(`
      SELECT 
        CONCAT('Slaughter recorded: Batch ', batch_id, ' - ', total_weight, 'kg meat yield') as description,
        produce_date as timestamp
      FROM MEAT_BATCH
      ORDER BY produce_date DESC
      LIMIT 5
    `)
    
    const [distributionActivities] = await pool.execute(`
      SELECT 
        CONCAT('Meat shipped: ', quantity, 'kg to ', a.agentName) as description,
        sr.date as timestamp
      FROM SALES_RECORD sr
      JOIN AGENT a ON sr.agentId = a.agent_Id
      ORDER BY sr.date DESC
      LIMIT 5
    `)
    
    // Combine and sort all activities
    const activities = [
      ...animalActivities.map(a => ({...a, type: 'animal'})),
      ...slaughterActivities.map(a => ({...a, type: 'slaughter'})),
      ...distributionActivities.map(a => ({...a, type: 'distribution'}))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5)
    
    res.json(activities)
  } catch (error) {
    console.error("Error fetching activities:", error)
    res.status(500).json({ error: "Failed to fetch activities" })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Butcher Dashboard Server running on http://localhost:${PORT}`)
  console.log(`Health check available at http://localhost:${PORT}/api/health`)
})