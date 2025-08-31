// agent-server.js
import express from "express";
import mysql from "mysql2/promise";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use(express.static(__dirname));

// Database connection configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Shihab14032001",
  database: "livestockdb",
};

// Create database connection pool
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "AgentDashBoard.html"))
})

// Health check endpoint
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT 1 as test");
    res.json({ status: "healthy", database: "connected", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("Database connection error:", error);
    res.status(500).json({
      status: "error",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ============= AGENT DASHBOARD SPECIFIC ENDPOINTS =============

// Get agent purchases (combines MEAT_BATCH with SLAUGHTER_HOUSE and AGENT)
app.get("/api/agent-purchases", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        mb.batch_id,
        mb.meat_type,
        mb.quantity,
        mb.total_weight,
        mb.produce_date,
        sh.area as slaughterhouse_area,
        sh.city as slaughterhouse_city,
        a.agentName,
        a.area as agent_area,
        pr.liveStockPrice as purchase_price,
        pr.date as purchase_date,
        l.breed,
        l.gender
      FROM MEAT_BATCH mb
      JOIN SLAUGHTER_HOUSE sh ON mb.slaughterHouseId = sh.slaughterHouse_id
      JOIN AGENT a ON mb.agent_Id = a.agent_Id
      JOIN PURCHASE_RECORD pr ON mb.animal_Id = pr.animal_Id
      JOIN LIVE_STOCK l ON mb.animal_Id = l.animal_id
      ORDER BY mb.produce_date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching agent purchases:", error);
    res.status(500).json({ error: "Failed to fetch agent purchases" });
  }
});

// Add new purchase (creates entries in multiple tables)
app.post("/api/agent-purchases", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { 
      batchId, 
      slaughterhouse, 
      meatQuantity, 
      animalType, 
      breed, 
      gender, 
      vaccine, 
      slaughterDate, 
      purchaseDate, 
      purchasePrice,
      agentId 
    } = req.body;

    // 1. First create a livestock record
    const [livestockResult] = await connection.execute(
      `INSERT INTO LIVE_STOCK (animal_type, birth_date, gender, breed, farm_id) 
       VALUES (?, DATE_SUB(?, INTERVAL 2 YEAR), ?, ?, 1)`,
      [animalType, slaughterDate, gender, breed]
    );
    const animalId = livestockResult.insertId;

    // 2. Create a purchase record
    await connection.execute(
      `INSERT INTO PURCHASE_RECORD (liveStockPrice, date, farm_id, animal_Id) 
       VALUES (?, ?, 1, ?)`,
      [purchasePrice, purchaseDate, animalId]
    );

    // 3. Find or create slaughterhouse
    let slaughterHouseId;
    const [slaughterhouseRows] = await connection.execute(
      "SELECT slaughterHouse_id FROM SLAUGHTER_HOUSE WHERE area = ? LIMIT 1",
      [slaughterhouse]
    );

    if (slaughterhouseRows.length > 0) {
      slaughterHouseId = slaughterhouseRows[0].slaughterHouse_id;
    } else {
      const [shResult] = await connection.execute(
        "INSERT INTO SLAUGHTER_HOUSE (area, city, country, slaughter_house_capacity) VALUES (?, 'Unknown', 'Bangladesh', 1000)",
        [slaughterhouse]
      );
      slaughterHouseId = shResult.insertId;
    }

    // 4. Create meat batch
    const [batchResult] = await connection.execute(
      `INSERT INTO MEAT_BATCH 
       (meat_type, quantity, produce_date, total_weight, animal_Id, slaughterHouseId, shipment_Id, agent_Id) 
       VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
      [animalType, meatQuantity, purchaseDate, meatQuantity, animalId, slaughterHouseId, agentId || 1]
    );

    await connection.commit();
    res.json({ id: batchResult.insertId, message: "Purchase added successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error adding purchase:", error);
    res.status(500).json({ error: "Failed to add purchase" });
  } finally {
    connection.release();
  }
});

// Update purchase
app.put("/api/agent-purchases/:id", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;
    const { slaughterhouse, meatQuantity, animalType, purchaseDate, purchasePrice } = req.body;

    // Get the meat batch to find related IDs
    const [batchRows] = await connection.execute(
      "SELECT animal_Id, slaughterHouseId FROM MEAT_BATCH WHERE batch_id = ?",
      [id]
    );
    
    if (batchRows.length === 0) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    const animalId = batchRows[0].animal_Id;
    const slaughterHouseId = batchRows[0].slaughterHouseId;

    // Update slaughterhouse if needed
    if (slaughterhouse) {
      await connection.execute(
        "UPDATE SLAUGHTER_HOUSE SET area = ? WHERE slaughterHouse_id = ?",
        [slaughterhouse, slaughterHouseId]
      );
    }

    // Update livestock
    await connection.execute(
      "UPDATE LIVE_STOCK SET animal_type = ? WHERE animal_id = ?",
      [animalType, animalId]
    );

    // Update purchase record
    await connection.execute(
      "UPDATE PURCHASE_RECORD SET liveStockPrice = ?, date = ? WHERE animal_Id = ?",
      [purchasePrice, purchaseDate, animalId]
    );

    // Update meat batch
    await connection.execute(
      "UPDATE MEAT_BATCH SET meat_type = ?, quantity = ?, total_weight = ?, produce_date = ? WHERE batch_id = ?",
      [animalType, meatQuantity, meatQuantity, purchaseDate, id]
    );

    await connection.commit();
    res.json({ message: "Purchase updated successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error updating purchase:", error);
    res.status(500).json({ error: "Failed to update purchase" });
  } finally {
    connection.release();
  }
});

// Delete purchase
app.delete("/api/agent-purchases/:id", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const { id } = req.params;

    // Get related IDs first
    const [batchRows] = await connection.execute(
      "SELECT animal_Id FROM MEAT_BATCH WHERE batch_id = ?",
      [id]
    );
    
    if (batchRows.length === 0) {
      return res.status(404).json({ error: "Purchase not found" });
    }

    const animalId = batchRows[0].animal_Id;

    // Delete in correct order to maintain referential integrity
    await connection.execute("DELETE FROM MEAT_BATCH WHERE batch_id = ?", [id]);
    await connection.execute("DELETE FROM PURCHASE_RECORD WHERE animal_Id = ?", [animalId]);
    await connection.execute("DELETE FROM LIVE_STOCK WHERE animal_id = ?", [animalId]);

    await connection.commit();
    res.json({ message: "Purchase deleted successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error deleting purchase:", error);
    res.status(500).json({ error: "Failed to delete purchase" });
  } finally {
    connection.release();
  }
});

// Get warehouse inventory (combines MEAT_BATCH with storage information)
app.get("/api/warehouse-inventory", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        mb.batch_id,
        mb.meat_type,
        mb.quantity as total_quantity,
        mb.quantity as available_quantity,
        0 as reserved_quantity,
        w.area as storage_location,
        w.storage_feature as temperature,
        mb.produce_date as stored_date,
        'available' as status
      FROM MEAT_BATCH mb
      JOIN WAREHOUSE w ON mb.shipment_Id = w.warehouse_id
      ORDER BY mb.produce_date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching warehouse inventory:", error);
    res.status(500).json({ error: "Failed to fetch warehouse inventory" });
  }
});

// Add to warehouse
app.post("/api/warehouse-inventory", async (req, res) => {
  try {
    const { batchId, storageLocation, storageTemperature, storedDate } = req.body;

    // Find or create warehouse
    const [warehouseRows] = await pool.execute(
      "SELECT warehouse_id FROM WAREHOUSE WHERE area = ? LIMIT 1",
      [storageLocation]
    );

    let warehouseId;
    if (warehouseRows.length > 0) {
      warehouseId = warehouseRows[0].warehouse_id;
    } else {
      const [whResult] = await pool.execute(
        "INSERT INTO WAREHOUSE (area, city, district, country, storage_capacity, storage_feature) VALUES (?, 'Unknown', 'Unknown', 'Bangladesh', 1000, ?)",
        [storageLocation, storageTemperature]
      );
      warehouseId = whResult.insertId;
    }

    // Create a shipment record
    const [shipmentResult] = await pool.execute(
      "INSERT INTO SHIPMENT (shipmentDate, time, rate, `from`, `to`, type, warehouseId) VALUES (?, '12:00:00', 100, 'Slaughterhouse', 'Warehouse', 'Truck', ?)",
      [storedDate, warehouseId]
    );

    // Update the meat batch with the shipment reference
    await pool.execute(
      "UPDATE MEAT_BATCH SET shipment_Id = ? WHERE batch_id = ?",
      [shipmentResult.insertId, batchId]
    );

    res.json({ message: "Item added to warehouse successfully" });
  } catch (error) {
    console.error("Error adding to warehouse:", error);
    res.status(500).json({ error: "Failed to add item to warehouse" });
  }
});

// Get sales records (combines SALES_RECORD with MEAT_BATCH, INDUSTRY, and AGENT)
app.get("/api/sales-records", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        sr.salesId,
        sr.meatBatchPrice as selling_price,
        sr.quantity,
        sr.date as sale_date,
        i.shopName as vendor_name,
        i.industryType as vendor_type,
        i.area as region,
        mb.meat_type as animal_type,
        (sr.meatBatchPrice - pr.liveStockPrice) as profit
      FROM SALES_RECORD sr
      JOIN INDUSTRY i ON sr.industryId = i.industry_Id
      JOIN MEAT_BATCH mb ON sr.batch_id = mb.batch_id
      JOIN PURCHASE_RECORD pr ON mb.animal_Id = pr.animal_Id
      ORDER BY sr.date DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching sales records:", error);
    res.status(500).json({ error: "Failed to fetch sales records" });
  }
});

// Add sales record
app.post("/api/sales-records", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { vendorName, vendorType, region, quantity, sellingPrice, saleDate, batchId, agentId } = req.body;

    // Find or create industry (vendor)
    let industryId;
    const [industryRows] = await connection.execute(
      "SELECT industry_Id FROM INDUSTRY WHERE shopName = ? LIMIT 1",
      [vendorName]
    );

    if (industryRows.length > 0) {
      industryId = industryRows[0].industry_Id;
    } else {
      const [industryResult] = await connection.execute(
        "INSERT INTO INDUSTRY (shopName, industryType, area, city, district, country) VALUES (?, ?, ?, 'Unknown', 'Unknown', 'Bangladesh')",
        [vendorName, vendorType, region]
      );
      industryId = industryResult.insertId;
    }

    // Create sales record
    const [salesResult] = await connection.execute(
      "INSERT INTO SALES_RECORD (meatBatchPrice, quantity, date, agentId, industryId, batch_id) VALUES (?, ?, ?, ?, ?, ?)",
      [sellingPrice, quantity, saleDate, agentId || 1, industryId, batchId]
    );

    await connection.commit();
    res.json({ id: salesResult.insertId, message: "Sales record added successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error adding sales record:", error);
    res.status(500).json({ error: "Failed to add sales record" });
  } finally {
    connection.release();
  }
});

// Get vendor orders (combines ORDER with INDUSTRY and MEAT_PRODUCT)
app.get("/api/vendor-orders", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT 
        o.orderID,
        o.orderDate,
        o.totalQuantity as quantity,
        o.totalPrice as expected_price,
        i.shopName as vendor_name,
        i.industryType as vendor_type,
        i.area as region,
        mp.nutritionInfo as meat_type,
        'pending' as status
      FROM \`Order\` o
      JOIN INDUSTRY i ON o.industryId = i.industry_Id
      JOIN MEAT_PRODUCT mp ON o.MeatProduct_Id = mp.Meatproduct_Id
      ORDER BY o.orderDate DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching vendor orders:", error);
    res.status(500).json({ error: "Failed to fetch vendor orders" });
  }
});

// Add vendor order
app.post("/api/vendor-orders", async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { vendorName, vendorType, region, meatType, quantity, orderDate, requiredDate, expectedPrice } = req.body;

    // Find or create industry (vendor)
    let industryId;
    const [industryRows] = await connection.execute(
      "SELECT industry_Id FROM INDUSTRY WHERE shopName = ? LIMIT 1",
      [vendorName]
    );

    if (industryRows.length > 0) {
      industryId = industryRows[0].industry_Id;
    } else {
      const [industryResult] = await connection.execute(
        "INSERT INTO INDUSTRY (shopName, industryType, area, city, district, country) VALUES (?, ?, ?, 'Unknown', 'Unknown', 'Bangladesh')",
        [vendorName, vendorType, region]
      );
      industryId = industryResult.insertId;
    }

    // Find or create meat product
    let meatProductId;
    const [productRows] = await connection.execute(
      "SELECT Meatproduct_Id FROM MEAT_PRODUCT WHERE nutritionInfo = ? LIMIT 1",
      [meatType]
    );

    if (productRows.length > 0) {
      meatProductId = productRows[0].Meatproduct_Id;
    } else {
      const [productResult] = await connection.execute(
        "INSERT INTO MEAT_PRODUCT (nutritionInfo, packagingDate, expireDate, price, quantity, industryId) VALUES (?, ?, DATE_ADD(?, INTERVAL 30 DAY), ?, ?, ?)",
        [meatType, orderDate, orderDate, expectedPrice, quantity, industryId]
      );
      meatProductId = productResult.insertId;
    }

    // Create order
    const [orderResult] = await connection.execute(
      "INSERT INTO `Order` (orderDate, totalQuantity, totalPrice, customer_Id, industryId, MeatProduct_Id) VALUES (?, ?, ?, 1, ?, ?)",
      [orderDate, quantity, expectedPrice * quantity, industryId, meatProductId]
    );

    await connection.commit();
    res.json({ id: orderResult.insertId, message: "Vendor order added successfully" });
  } catch (error) {
    await connection.rollback();
    console.error("Error adding vendor order:", error);
    res.status(500).json({ error: "Failed to add vendor order" });
  } finally {
    connection.release();
  }
});

// Update order status
app.put("/api/vendor-orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // In a real application, you would update the order status in the database
    // For this example, we'll just return success
    res.json({ message: `Order ${id} status updated to ${status}` });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

// Get analytics data
app.get("/api/analytics", async (req, res) => {
  try {
    // Total purchases value and count
    const [purchaseStats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_purchases,
        SUM(pr.liveStockPrice) as total_purchase_value,
        AVG(pr.liveStockPrice) as avg_purchase_price,
        SUM(mb.total_weight) as total_meat_purchased
      FROM PURCHASE_RECORD pr
      JOIN MEAT_BATCH mb ON pr.animal_Id = mb.animal_Id
    `);

    // Sales analytics
    const [salesStats] = await pool.execute(`
      SELECT 
        SUM(sr.meatBatchPrice) as total_sales_revenue,
        AVG(sr.meatBatchPrice / NULLIF(sr.quantity, 0)) as avg_selling_price,
        SUM(sr.meatBatchPrice - pr.liveStockPrice) as total_profit
      FROM SALES_RECORD sr
      JOIN MEAT_BATCH mb ON sr.batch_id = mb.batch_id
      JOIN PURCHASE_RECORD pr ON mb.animal_Id = pr.animal_Id
    `);

    // Regional analysis
    const [regionalStats] = await pool.execute(`
      SELECT 
        i.area as region,
        SUM(sr.quantity) as total_quantity,
        SUM(sr.meatBatchPrice) as total_revenue
      FROM SALES_RECORD sr
      JOIN INDUSTRY i ON sr.industryId = i.industry_Id
      GROUP BY i.area
      ORDER BY total_revenue DESC
      LIMIT 1
    `);

    // Most demanded meat type
    const [meatTypeStats] = await pool.execute(`
      SELECT 
        mb.meat_type,
        SUM(sr.quantity) as total_quantity
      FROM SALES_RECORD sr
      JOIN MEAT_BATCH mb ON sr.batch_id = mb.batch_id
      GROUP BY mb.meat_type
      ORDER BY total_quantity DESC
      LIMIT 1
    `);

    // Active vendors
    const [vendorStats] = await pool.execute(`
      SELECT COUNT(DISTINCT industryId) as active_vendors
      FROM SALES_RECORD
    `);

    res.json({
      purchase: purchaseStats[0],
      sales: salesStats[0],
      topRegion: regionalStats[0]?.region || "N/A",
      topMeatType: meatTypeStats[0]?.meat_type || "N/A",
      activeVendors: vendorStats[0]?.active_vendors || 0
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

// Get reference data for dropdowns
app.get("/api/reference/slaughterhouses", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT DISTINCT area as name FROM SLAUGHTER_HOUSE");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching slaughterhouses:", error);
    res.status(500).json({ error: "Failed to fetch slaughterhouses" });
  }
});

app.get("/api/reference/agents", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT agent_Id as id, agentName as name FROM AGENT");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching agents:", error);
    res.status(500).json({ error: "Failed to fetch agents" });
  }
});

app.get("/api/reference/batches", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT batch_id as id, meat_type as type, total_weight as weight FROM MEAT_BATCH");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching batches:", error);
    res.status(500).json({ error: "Failed to fetch batches" });
  }
});

// Get available batches for warehouse
app.get("/api/reference/available-batches", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT mb.batch_id, mb.meat_type, mb.total_weight 
      FROM MEAT_BATCH mb
      WHERE mb.shipment_Id IS NULL OR mb.shipment_Id = 0
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching available batches:", error);
    res.status(500).json({ error: "Failed to fetch available batches" });
  }
});

// Get available warehouse items for sale
app.get("/api/reference/available-warehouse-items", async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT mb.batch_id, mb.meat_type, mb.total_weight as available_quantity
      FROM MEAT_BATCH mb
      WHERE mb.shipment_Id IS NOT NULL AND mb.shipment_Id != 0
    `);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching available warehouse items:", error);
    res.status(500).json({ error: "Failed to fetch available warehouse items" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Agent Dashboard Server running on http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});
