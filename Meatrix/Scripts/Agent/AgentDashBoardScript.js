// Application State
let currentSection = "dashboard"
const isLoading = false
let sidebarExpanded = false

// DataManager class for handling data storage and retrieval
class AgentDataManager {
  constructor() {
    this.purchases = JSON.parse(localStorage.getItem("agent_purchases") || "[]")
    this.warehouseInventory = JSON.parse(localStorage.getItem("agent_warehouse") || "[]")
    this.sales = JSON.parse(localStorage.getItem("agent_sales") || "[]")
    this.vendorOrders = JSON.parse(localStorage.getItem("agent_vendor_orders") || "[]")
    this.activities = JSON.parse(localStorage.getItem("agent_activities") || "[]")
  }

  saveData() {
    localStorage.setItem("agent_purchases", JSON.stringify(this.purchases))
    localStorage.setItem("agent_warehouse", JSON.stringify(this.warehouseInventory))
    localStorage.setItem("agent_sales", JSON.stringify(this.sales))
    localStorage.setItem("agent_vendor_orders", JSON.stringify(this.vendorOrders))
    localStorage.setItem("agent_activities", JSON.stringify(this.activities))
  }

  generateId(prefix) {
    return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 5)}`
  }

  addPurchase(purchase) {
    purchase.id = this.generateId("PUR")
    purchase.purchaseDate = purchase.purchaseDate || new Date().toISOString().split("T")[0]
    purchase.status = "purchased"
    this.purchases.push(purchase)
    this.addActivity(
      `Meat batch purchased: ${purchase.batchId} from ${purchase.slaughterhouse} - ${purchase.meatQuantity}kg`,
    )
    this.saveData()
    return purchase
  }

  addToWarehouse(warehouseItem) {
    warehouseItem.id = this.generateId("WH")
    warehouseItem.storedDate = warehouseItem.storedDate || new Date().toISOString().split("T")[0]
    warehouseItem.status = "available"

    // Get purchase details
    const purchase = this.purchases.find((p) => p.id === warehouseItem.purchaseId)
    if (purchase) {
      warehouseItem.batchId = purchase.batchId
      warehouseItem.animalType = purchase.animalType
      warehouseItem.breed = purchase.breed
      warehouseItem.gender = purchase.gender
      warehouseItem.vaccine = purchase.vaccine
      warehouseItem.slaughterDate = purchase.slaughterDate
      warehouseItem.quantity = purchase.meatQuantity
      warehouseItem.availableQuantity = purchase.meatQuantity
      warehouseItem.reservedQuantity = 0
      warehouseItem.purchasePrice = purchase.purchasePrice
    }

    this.warehouseInventory.push(warehouseItem)
    this.addActivity(`Batch ${warehouseItem.batchId} stored in warehouse at ${warehouseItem.storageLocation}`)
    this.saveData()
    return warehouseItem
  }

  updateWarehouseStock(warehouseId, quantity, operation = "reserve") {
    const item = this.warehouseInventory.find((w) => w.id === warehouseId)
    if (!item) return null

    if (operation === "reserve") {
      if (item.availableQuantity >= quantity) {
        item.availableQuantity -= quantity
        item.reservedQuantity += quantity
        item.status = item.availableQuantity > 0 ? "available" : "reserved"
      }
    } else if (operation === "sell") {
      item.availableQuantity -= quantity
      if (item.availableQuantity <= 0) {
        item.status = "sold"
      }
    }

    this.saveData()
    return item
  }

  addSale(sale) {
    sale.id = this.generateId("SALE")
    sale.saleDate = sale.saleDate || new Date().toISOString().split("T")[0]

    // Get warehouse item details
    const warehouseItem = this.warehouseInventory.find((w) => w.id === sale.warehouseId)
    if (warehouseItem) {
      // Update warehouse stock
      this.updateWarehouseStock(warehouseItem.id, Number.parseFloat(sale.quantity), "sell")

      // Calculate profit
      const purchasePricePerKg = warehouseItem.purchasePrice / warehouseItem.quantity
      const costPrice = purchasePricePerKg * Number.parseFloat(sale.quantity)
      sale.profit = (Number.parseFloat(sale.sellingPrice) - costPrice).toFixed(2)

      // Add animal details to sale
      sale.batchId = warehouseItem.batchId
      sale.animalType = warehouseItem.animalType
      sale.breed = warehouseItem.breed
      sale.gender = warehouseItem.gender
      sale.vaccine = warehouseItem.vaccine
      sale.slaughterDate = warehouseItem.slaughterDate
    }

    this.sales.push(sale)
    this.addActivity(
      `Sale recorded: ${sale.quantity}kg ${sale.animalType} to ${sale.vendorName} in ${sale.region} - $${sale.sellingPrice}`,
    )
    this.saveData()
    return sale
  }

  addVendorOrder(order) {
    order.id = this.generateId("ORD")
    order.orderDate = order.orderDate || new Date().toISOString().split("T")[0]
    order.status = "pending"

    this.vendorOrders.push(order)
    this.addActivity(
      `New vendor order: ${order.quantity}kg ${order.meatType} from ${order.vendorName} (${order.vendorType}) in ${order.region}`,
    )
    this.saveData()
    return order
  }

  updateOrderStatus(orderId, status) {
    const index = this.vendorOrders.findIndex((order) => order.id === orderId)
    if (index !== -1) {
      this.vendorOrders[index].status = status
      this.addActivity(`Order ${orderId} status updated to ${status}`)
      this.saveData()
      return this.vendorOrders[index]
    }
    return null
  }

  addActivity(description) {
    const activity = {
      id: this.generateId("ACT"),
      description,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
    }
    this.activities.unshift(activity)

    // Keep only last 50 activities
    if (this.activities.length > 50) {
      this.activities = this.activities.slice(0, 50)
    }
    this.saveData()
  }

  getStats() {
    const totalPurchases = this.purchases.length
    const warehouseStock = this.warehouseInventory.reduce((sum, item) => sum + item.availableQuantity, 0)
    const totalSales = this.sales.reduce((sum, sale) => sum + Number.parseFloat(sale.quantity || 0), 0)
    const pendingOrders = this.vendorOrders.filter((order) => order.status === "pending").length

    return {
      totalPurchases,
      warehouseStock: warehouseStock.toFixed(1),
      totalSales: totalSales.toFixed(1),
      pendingOrders,
    }
  }

  getWarehouseStats() {
    const totalBatches = this.warehouseInventory.length
    const availableStock = this.warehouseInventory.reduce((sum, item) => sum + item.availableQuantity, 0)
    const reservedStock = this.warehouseInventory.reduce((sum, item) => sum + item.reservedQuantity, 0)

    return {
      totalBatches,
      availableStock: availableStock.toFixed(1),
      reservedStock: reservedStock.toFixed(1),
    }
  }

  getAnalytics() {
    const totalPurchaseValue = this.purchases.reduce(
      (sum, purchase) => sum + Number.parseFloat(purchase.purchasePrice || 0),
      0,
    )
    const avgPurchasePrice =
      this.purchases.length > 0
        ? (
            totalPurchaseValue / this.purchases.reduce((sum, p) => sum + Number.parseFloat(p.meatQuantity || 0), 0)
          ).toFixed(2)
        : 0

    const totalMeatPurchased = this.purchases.reduce((sum, p) => sum + Number.parseFloat(p.meatQuantity || 0), 0)

    const totalSalesRevenue = this.sales.reduce((sum, sale) => sum + Number.parseFloat(sale.sellingPrice || 0), 0)
    const avgSellingPrice =
      this.sales.length > 0
        ? (totalSalesRevenue / this.sales.reduce((sum, s) => sum + Number.parseFloat(s.quantity || 0), 0)).toFixed(2)
        : 0

    const totalProfit = this.sales.reduce((sum, sale) => sum + Number.parseFloat(sale.profit || 0), 0)

    // Regional analysis
    const regionSales = {}
    const meatTypeDemand = {}
    this.sales.forEach((sale) => {
      regionSales[sale.region] = (regionSales[sale.region] || 0) + Number.parseFloat(sale.quantity || 0)
      meatTypeDemand[sale.animalType] = (meatTypeDemand[sale.animalType] || 0) + Number.parseFloat(sale.quantity || 0)
    })

    const topRegion = Object.keys(regionSales).reduce((a, b) => (regionSales[a] > regionSales[b] ? a : b), "-")
    const topMeatType = Object.keys(meatTypeDemand).reduce(
      (a, b) => (meatTypeDemand[a] > meatTypeDemand[b] ? a : b),
      "-",
    )
    const activeVendors = new Set(this.sales.map((sale) => sale.vendorName)).size

    return {
      totalPurchaseValue: totalPurchaseValue.toFixed(2),
      avgPurchasePrice,
      totalMeatPurchased: totalMeatPurchased.toFixed(1),
      totalSalesRevenue: totalSalesRevenue.toFixed(2),
      avgSellingPrice,
      totalProfit: totalProfit.toFixed(2),
      topRegion,
      topMeatType,
      activeVendors,
    }
  }

  getAvailablePurchases() {
    return this.purchases.filter((purchase) => !this.warehouseInventory.some((item) => item.purchaseId === purchase.id))
  }

  getAvailableWarehouseItems() {
    return this.warehouseInventory.filter((item) => item.status === "available" && item.availableQuantity > 0)
  }
}

// Dashboard class for managing the dashboard functionality
class AgentDashboard {
  constructor() {
    this.dataManager = new AgentDataManager()
    this.init()
  }

  init() {
    this.sidebar = document.getElementById("sidebar")
    this.mainContent = document.getElementById("mainContent")
    this.header = document.getElementById("header")
    this.headerTitle = document.getElementById("headerTitle")
    this.content = document.getElementById("content")

    this.setupEventListeners()
    this.updateDashboard()
    this.populateSelects()
    this.showSection("dashboard")
  }

  setupEventListeners() {
    // Sidebar hover events
    this.sidebar.addEventListener("mouseenter", () => this.handleSidebarMouseEnter())
    this.sidebar.addEventListener("mouseleave", () => this.handleSidebarMouseLeave())

    // Main content click event
    this.content.addEventListener("click", () => this.handleMainContentClick())

    // Prevent sidebar clicks from bubbling to main content
    this.sidebar.addEventListener("click", (e) => e.stopPropagation())

    // Navigation item clicks
    const navItems = document.querySelectorAll(".nav-item")
    navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault()
        this.handleNavItemClick(item)
      })
    })

    // Form submissions
    this.setupFormHandlers()

    // Search and filter functionality
    this.setupSearchAndFilters()

    // Table sorting
    this.setupTableSorting()

    // Logout button
    const logoutBtn = document.querySelector(".logout-btn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        console.log("Logout clicked")
        // Add logout functionality here
      })
    }
  }

  setupFormHandlers() {
    // Purchase Form
    const purchaseForm = document.getElementById("purchaseForm")
    if (purchaseForm) {
      purchaseForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handlePurchase(new FormData(purchaseForm))
      })
    }

    // Warehouse Form
    const warehouseForm = document.getElementById("warehouseForm")
    if (warehouseForm) {
      warehouseForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleWarehouse(new FormData(warehouseForm))
      })
    }

    // Sale Form
    const saleForm = document.getElementById("saleForm")
    if (saleForm) {
      saleForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleSale(new FormData(saleForm))
      })
    }

    // Vendor Order Form
    const vendorOrderForm = document.getElementById("vendorOrderForm")
    if (vendorOrderForm) {
      vendorOrderForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleVendorOrder(new FormData(vendorOrderForm))
      })
    }
  }

  handlePurchase(formData) {
    const purchase = {
      batchId: formData.get("batchId"),
      slaughterhouse: formData.get("slaughterhouse"),
      meatQuantity: formData.get("meatQuantity"),
      animalType: formData.get("animalType"),
      breed: formData.get("breed"),
      gender: formData.get("gender"),
      vaccine: formData.get("vaccine"),
      slaughterDate: formData.get("slaughterDate"),
      purchaseDate: formData.get("purchaseDate"),
      purchasePrice: formData.get("purchasePrice"),
    }

    this.dataManager.addPurchase(purchase)
    this.updatePurchasesTable()
    this.updateDashboard()
    this.populateSelects()
    closeModal("purchaseModal")
    document.getElementById("purchaseForm").reset()
  }

  handleWarehouse(formData) {
    const warehouseItem = {
      purchaseId: formData.get("warehouseBatchId"),
      storageLocation: formData.get("storageLocation"),
      storageTemperature: formData.get("storageTemperature"),
      storedDate: formData.get("storedDate"),
      notes: formData.get("storageNotes"),
    }

    this.dataManager.addToWarehouse(warehouseItem)
    this.updateWarehouseTable()
    this.updateDashboard()
    this.populateSelects()
    closeModal("warehouseModal")
    document.getElementById("warehouseForm").reset()
  }

  handleSale(formData) {
    const sale = {
      warehouseId: formData.get("saleWarehouseBatch"),
      vendorName: formData.get("vendorName"),
      vendorType: formData.get("vendorType"),
      region: formData.get("vendorRegion"),
      quantity: formData.get("saleQuantity"),
      sellingPrice: formData.get("sellingPrice"),
      saleDate: formData.get("saleDate"),
    }

    this.dataManager.addSale(sale)
    this.updateSalesTable()
    this.updateWarehouseTable()
    this.updateDashboard()
    this.populateSelects()
    closeModal("saleModal")
    document.getElementById("saleForm").reset()
  }

  handleVendorOrder(formData) {
    const order = {
      vendorName: formData.get("orderVendorName"),
      vendorType: formData.get("orderVendorType"),
      region: formData.get("orderVendorRegion"),
      meatType: formData.get("orderMeatType"),
      quantity: formData.get("orderQuantity"),
      orderDate: formData.get("orderDate"),
      requiredDate: formData.get("requiredDate"),
      expectedPrice: formData.get("expectedPrice"),
    }

    this.dataManager.addVendorOrder(order)
    this.updateVendorOrdersTable()
    this.updateDashboard()
    closeModal("vendorOrderModal")
    document.getElementById("vendorOrderForm").reset()
  }

  updateDashboard() {
    const stats = this.dataManager.getStats()
    document.getElementById("totalPurchases").textContent = stats.totalPurchases
    document.getElementById("warehouseStock").textContent = `${stats.warehouseStock} kg`
    document.getElementById("totalSales").textContent = `${stats.totalSales} kg`
    document.getElementById("pendingOrders").textContent = stats.pendingOrders

    this.updateRecentActivities()
    this.updateAnalytics()
  }

  updateRecentActivities() {
    const activitiesContainer = document.getElementById("recentActivities")
    const activities = this.dataManager.activities.slice(0, 5)

    if (activities.length === 0) {
      activitiesContainer.innerHTML = '<div class="activity-item empty-state"><p>No recent activities</p></div>'
      return
    }

    activitiesContainer.innerHTML = activities
      .map(
        (activity) => `
      <div class="activity-item">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>${activity.description}</span>
          <small style="color: var(--text-secondary);">${activity.date}</small>
        </div>
      </div>
    `,
      )
      .join("")
  }

  updateAnalytics() {
    const analytics = this.dataManager.getAnalytics()

    const elements = {
      totalPurchaseValue: document.getElementById("totalPurchaseValue"),
      avgPurchasePrice: document.getElementById("avgPurchasePrice"),
      totalMeatPurchased: document.getElementById("totalMeatPurchased"),
      totalSalesRevenue: document.getElementById("totalSalesRevenue"),
      avgSellingPrice: document.getElementById("avgSellingPrice"),
      totalProfit: document.getElementById("totalProfit"),
      topRegion: document.getElementById("topRegion"),
      topMeatType: document.getElementById("topMeatType"),
      activeVendors: document.getElementById("activeVendors"),
    }

    Object.keys(elements).forEach((key) => {
      if (elements[key]) {
        if (key.includes("Price") || key.includes("Value") || key.includes("Revenue") || key.includes("Profit")) {
          elements[key].textContent = `$${analytics[key]}`
        } else if (key.includes("Purchased")) {
          elements[key].textContent = `${analytics[key]} kg`
        } else {
          elements[key].textContent = analytics[key]
        }
      }
    })
  }

  updatePurchasesTable() {
    const tbody = document.getElementById("purchasesBody")
    const purchases = this.dataManager.purchases

    if (purchases.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="9">No purchases recorded yet. Click "Purchase Meat Batch" to get started.</td></tr>'
      return
    }

    tbody.innerHTML = purchases
      .map(
        (purchase) => `
      <tr>
        <td>${purchase.batchId}</td>
        <td>${purchase.slaughterhouse}</td>
        <td>${purchase.meatQuantity}</td>
        <td>${purchase.animalType}</td>
        <td>${purchase.breed}</td>
        <td>$${purchase.purchasePrice}</td>
        <td>${purchase.purchaseDate}</td>
        <td>${purchase.slaughterDate}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewPurchaseDetails('${purchase.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("")
  }

  updateWarehouseTable() {
    const tbody = document.getElementById("warehouseBody")
    const inventory = this.dataManager.warehouseInventory

    if (inventory.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="10">No items in warehouse yet. Purchase meat batches to populate inventory.</td></tr>'
      return
    }

    tbody.innerHTML = inventory
      .map(
        (item) => `
      <tr>
        <td>${item.id}</td>
        <td>${item.batchId}</td>
        <td>${item.animalType}</td>
        <td>${item.quantity}</td>
        <td>${item.availableQuantity}</td>
        <td>${item.storageLocation}</td>
        <td>${item.storageTemperature}°C</td>
        <td>${item.storedDate}</td>
        <td><span class="badge badge-${item.status}">${item.status}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewWarehouseDetails('${item.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("")
  }

  updateSalesTable() {
    const tbody = document.getElementById("salesBody")
    const sales = this.dataManager.sales

    if (sales.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="9">No sales recorded yet. Click "Record Sale" to add your first sale.</td></tr>'
      return
    }

    tbody.innerHTML = sales
      .map(
        (sale) => `
      <tr>
        <td>${sale.vendorName}</td>
        <td>${sale.vendorType}</td>
        <td>${sale.region}</td>
        <td>${sale.quantity}</td>
        <td>${sale.animalType}</td>
        <td>$${sale.sellingPrice}</td>
        <td>${sale.saleDate}</td>
        <td>$${sale.profit}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewSaleDetails('${sale.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("")
  }

  updateVendorOrdersTable() {
    const tbody = document.getElementById("vendorOrdersBody")
    const orders = this.dataManager.vendorOrders

    if (orders.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="10">No vendor orders yet. Click "New Vendor Order" to add your first order.</td></tr>'
      return
    }

    tbody.innerHTML = orders
      .map(
        (order) => `
      <tr>
        <td>${order.id}</td>
        <td>${order.vendorName}</td>
        <td>${order.vendorType}</td>
        <td>${order.region}</td>
        <td>${order.meatType}</td>
        <td>${order.quantity}</td>
        <td>${order.orderDate}</td>
        <td>${order.requiredDate}</td>
        <td><span class="badge badge-${order.status}">${order.status}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewOrderDetails('${order.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn-icon" title="Update Status" onclick="updateOrderStatus('${order.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("")
  }

  populateSelects() {
    // Populate warehouse batch select for adding to warehouse
    const warehouseBatchSelect = document.getElementById("warehouseBatchId")
    if (warehouseBatchSelect) {
      const availablePurchases = this.dataManager.getAvailablePurchases()
      warehouseBatchSelect.innerHTML =
        '<option value="">Select Batch</option>' +
        availablePurchases
          .map(
            (purchase) =>
              `<option value="${purchase.id}">Batch ${purchase.batchId} - ${purchase.meatQuantity}kg ${purchase.animalType}</option>`,
          )
          .join("")
    }

    // Populate sale warehouse batch select
    const saleWarehouseBatchSelect = document.getElementById("saleWarehouseBatch")
    if (saleWarehouseBatchSelect) {
      const availableItems = this.dataManager.getAvailableWarehouseItems()
      saleWarehouseBatchSelect.innerHTML =
        '<option value="">Select Batch</option>' +
        availableItems
          .map(
            (item) =>
              `<option value="${item.id}">Batch ${item.batchId} - ${item.availableQuantity}kg ${item.animalType} available</option>`,
          )
          .join("")
    }
  }

  setupSearchAndFilters() {
    // Add search and filter functionality here
    // Similar to the butcher dashboard implementation
  }

  setupTableSorting() {
    const sortableHeaders = document.querySelectorAll(".sortable")
    sortableHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        const table = header.closest("table")
        const column = header.dataset.sort
        this.sortTable(table, column)
      })
    })
  }

  sortTable(table, column) {
    const tbody = table.querySelector("tbody")
    const rows = Array.from(tbody.querySelectorAll("tr:not(.empty-state)"))
    const columnIndex = Array.from(table.querySelectorAll("th")).findIndex((th) => th.dataset.sort === column)

    rows.sort((a, b) => {
      const aValue = a.cells[columnIndex].textContent.trim()
      const bValue = b.cells[columnIndex].textContent.trim()

      // Handle numeric values
      if (!isNaN(aValue) && !isNaN(bValue)) {
        return Number.parseFloat(aValue) - Number.parseFloat(bValue)
      }

      // Handle text values
      return aValue.localeCompare(bValue)
    })

    // Clear and re-append sorted rows
    const emptyState = tbody.querySelector(".empty-state")
    tbody.innerHTML = ""
    if (emptyState) tbody.appendChild(emptyState)
    rows.forEach((row) => tbody.appendChild(row))
  }

  handleSidebarMouseEnter() {
    this.expandSidebar()
  }

  handleSidebarMouseLeave() {
    setTimeout(() => {
      this.collapseSidebar()
    }, 300)
  }

  handleMainContentClick() {
    if (sidebarExpanded) {
      this.collapseSidebar()
    }
  }

  handleNavItemClick(item) {
    // Remove active class from all nav items
    document.querySelectorAll(".nav-item").forEach((navItem) => {
      navItem.classList.remove("active")
    })

    // Add active class to clicked item
    item.classList.add("active")

    const sectionName = item.dataset.section
    console.log("Navigating to:", sectionName)

    // Update header title based on selection
    if (this.headerTitle) {
      const titles = {
        dashboard: "Agent Dashboard",
        purchases: "Meat Purchases",
        warehouse: "Warehouse Management",
        sales: "Sales to Vendors",
        "vendor-orders": "Vendor Orders",
        analytics: "Analytics & Reports",
        settings: "Settings",
      }
      this.headerTitle.textContent = titles[sectionName] || "AgentPro Dashboard"
    }

    // Show appropriate section
    this.showSection(sectionName)
  }

  showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll(".section-content").forEach((section) => {
      section.style.display = "none"
      section.classList.remove("active")
    })

    // Show selected section
    let sectionId = "dashboard-section" // default
    switch (sectionName) {
      case "dashboard":
        sectionId = "dashboard-section"
        this.updateDashboard()
        break
      case "purchases":
        sectionId = "purchases-section"
        this.updatePurchasesTable()
        break
      case "warehouse":
        sectionId = "warehouse-section"
        this.updateWarehouseTable()
        this.updateWarehouseStats()
        break
      case "sales":
        sectionId = "sales-section"
        this.updateSalesTable()
        break
      case "vendor-orders":
        sectionId = "vendor-orders-section"
        this.updateVendorOrdersTable()
        break
      case "analytics":
        sectionId = "analytics-section"
        this.updateAnalytics()
        break
      case "settings":
        sectionId = "settings-section"
        break
    }

    const targetSection = document.getElementById(sectionId)
    if (targetSection) {
      targetSection.style.display = "block"
      targetSection.classList.add("active")
    }

    this.populateSelects()
    currentSection = sectionName
  }

  updateWarehouseStats() {
    const stats = this.dataManager.getWarehouseStats()

    const totalBatchesEl = document.getElementById("totalWarehouseBatches")
    const availableStockEl = document.getElementById("availableStock")
    const reservedStockEl = document.getElementById("reservedStock")

    if (totalBatchesEl) totalBatchesEl.textContent = stats.totalBatches
    if (availableStockEl) availableStockEl.textContent = `${stats.availableStock} kg`
    if (reservedStockEl) reservedStockEl.textContent = `${stats.reservedStock} kg`
  }

  expandSidebar() {
    sidebarExpanded = true
    this.sidebar.classList.add("expanded")
    this.mainContent.classList.add("expanded")
    this.header.classList.add("expanded")
    this.headerTitle.classList.add("hidden")
  }

  collapseSidebar() {
    sidebarExpanded = false
    this.sidebar.classList.remove("expanded")
    this.mainContent.classList.remove("expanded")
    this.header.classList.remove("expanded")
    this.headerTitle.classList.remove("hidden")
  }
}

// Global functions for modal management
function showPurchaseModal() {
  document.getElementById("purchaseModal").classList.add("active")
}

function showWarehouseModal() {
  const availablePurchases = dashboard.dataManager.getAvailablePurchases()
  if (availablePurchases.length === 0) {
    alert("No purchased batches available to add to warehouse. Please purchase meat batches first.")
    return
  }
  document.getElementById("warehouseModal").classList.add("active")
}

function showSaleModal() {
  const availableItems = dashboard.dataManager.getAvailableWarehouseItems()
  if (availableItems.length === 0) {
    alert("No warehouse items available for sale. Please add items to warehouse first.")
    return
  }
  document.getElementById("saleModal").classList.add("active")
}

function showVendorOrderModal() {
  document.getElementById("vendorOrderModal").classList.add("active")
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active")
}

// Global functions for viewing details
function viewPurchaseDetails(purchaseId) {
  const purchase = dashboard.dataManager.purchases.find((p) => p.id === purchaseId)
  if (purchase) {
    alert(
      `Purchase Details:\n\nBatch ID: ${purchase.batchId}\nSlaughterhouse: ${purchase.slaughterhouse}\nQuantity: ${purchase.meatQuantity}kg\nAnimal Type: ${purchase.animalType}\nBreed: ${purchase.breed}\nGender: ${purchase.gender}\nVaccine: ${purchase.vaccine}\nSlaughter Date: ${purchase.slaughterDate}\nPurchase Date: ${purchase.purchaseDate}\nPrice: $${purchase.purchasePrice}`,
    )
  }
}

function viewWarehouseDetails(warehouseId) {
  const item = dashboard.dataManager.warehouseInventory.find((w) => w.id === warehouseId)
  if (item) {
    alert(
      `Warehouse Details:\n\nWarehouse ID: ${item.id}\nBatch ID: ${item.batchId}\nAnimal Type: ${item.animalType}\nTotal Quantity: ${item.quantity}kg\nAvailable: ${item.availableQuantity}kg\nReserved: ${item.reservedQuantity}kg\nStorage Location: ${item.storageLocation}\nTemperature: ${item.storageTemperature}°C\nStored Date: ${item.storedDate}\nStatus: ${item.status}\nNotes: ${item.notes || "None"}`,
    )
  }
}

function viewSaleDetails(saleId) {
  const sale = dashboard.dataManager.sales.find((s) => s.id === saleId)
  if (sale) {
    alert(
      `Sale Details:\n\nVendor: ${sale.vendorName} (${sale.vendorType})\nRegion: ${sale.region}\nQuantity: ${sale.quantity}kg\nAnimal Type: ${sale.animalType}\nBreed: ${sale.breed}\nSelling Price: $${sale.sellingPrice}\nProfit: $${sale.profit}\nSale Date: ${sale.saleDate}\nBatch ID: ${sale.batchId}`,
    )
  }
}

function viewOrderDetails(orderId) {
  const order = dashboard.dataManager.vendorOrders.find((o) => o.id === orderId)
  if (order) {
    alert(
      `Order Details:\n\nOrder ID: ${order.id}\nVendor: ${order.vendorName} (${order.vendorType})\nRegion: ${order.region}\nMeat Type: ${order.meatType}\nQuantity: ${order.quantity}kg\nOrder Date: ${order.orderDate}\nRequired Date: ${order.requiredDate}\nExpected Price: $${order.expectedPrice}\nStatus: ${order.status}`,
    )
  }
}

function updateOrderStatus(orderId) {
  const newStatus = prompt("Enter new status (pending, processing, completed):")
  if (newStatus && ["pending", "processing", "completed"].includes(newStatus.toLowerCase())) {
    dashboard.dataManager.updateOrderStatus(orderId, newStatus.toLowerCase())
    dashboard.updateVendorOrdersTable()
    dashboard.updateDashboard()
  } else if (newStatus) {
    alert("Invalid status. Please use: pending, processing, or completed")
  }
}

// Global dashboard instance
let dashboard

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  dashboard = new AgentDashboard()
})

// Console log for debugging
console.log("AgentPro Dashboard System Loaded")
