// Application State
let currentSection = "dashboard"
const isLoading = false
let sidebarExpanded = false

// DataManager class for handling data storage and retrieval
class ButcherDataManager {
  constructor() {
    this.animals = JSON.parse(localStorage.getItem("butcher_animals") || "[]")
    this.slaughterRecords = JSON.parse(localStorage.getItem("butcher_slaughter_records") || "[]")
    this.warehouseInventory = JSON.parse(localStorage.getItem("butcher_warehouse_inventory") || "[]")
    this.distributions = JSON.parse(localStorage.getItem("butcher_distributions") || "[]")
    this.agentOrders = JSON.parse(localStorage.getItem("butcher_agent_orders") || "[]")
    this.activities = JSON.parse(localStorage.getItem("butcher_activities") || "[]")
  }

  saveData() {
    localStorage.setItem("butcher_animals", JSON.stringify(this.animals))
    localStorage.setItem("butcher_slaughter_records", JSON.stringify(this.slaughterRecords))
    localStorage.setItem("butcher_warehouse_inventory", JSON.stringify(this.warehouseInventory))
    localStorage.setItem("butcher_distributions", JSON.stringify(this.distributions))
    localStorage.setItem("butcher_agent_orders", JSON.stringify(this.agentOrders))
    localStorage.setItem("butcher_activities", JSON.stringify(this.activities))
  }

  generateId(prefix) {
    return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 5)}`
  }

  addAnimal(animal) {
    animal.id = this.generateId("ANI")
    animal.receivedDate = animal.receivedDate || new Date().toISOString().split("T")[0]
    animal.status = "received"
    this.animals.push(animal)
    this.addActivity(`Animal intake recorded: ${animal.animalId} from ${animal.farmerName}`)
    this.saveData()
    return animal
  }

  updateAnimal(animalId, updatedData) {
    const index = this.animals.findIndex((animal) => animal.id === animalId)
    if (index !== -1) {
      const originalAnimal = this.animals[index]
      updatedData.id = originalAnimal.id
      updatedData.receivedDate = originalAnimal.receivedDate
      this.animals[index] = { ...originalAnimal, ...updatedData }
      this.addActivity(`Animal updated: ${updatedData.animalId}`)
      this.saveData()
      return this.animals[index]
    }
    return null
  }

  getAnimalById(animalId) {
    return this.animals.find((animal) => animal.id === animalId)
  }

  addSlaughterRecord(record) {
    record.id = this.generateId("SLR")
    record.slaughterDate = record.slaughterDate || new Date().toISOString().split("T")[0]

    // Calculate slaughter metrics
    const selectedAnimals = this.animals.filter((animal) => record.animalIds.includes(animal.id))
    record.totalAnimals = selectedAnimals.length
    record.averageWeight =
      selectedAnimals.reduce((sum, animal) => sum + Number.parseFloat(animal.weight), 0) / record.totalAnimals
    record.slaughterRate =
      (Number.parseFloat(record.totalMeatYield) / (record.averageWeight * record.totalAnimals)) * 100

    // Update animal status to slaughtered
    this.animals = this.animals.map((animal) =>
      record.animalIds.includes(animal.id) ? { ...animal, status: "slaughtered" } : animal,
    )

    this.slaughterRecords.push(record)
    this.addActivity(`Slaughter recorded: Batch ${record.batchId} - ${record.totalMeatYield}kg meat yield`)
    this.saveData()
    return record
  }

  addWarehouseBatch(warehouseBatch) {
    warehouseBatch.id = this.generateId("WH")
    warehouseBatch.receivedDate = warehouseBatch.receivedDate || new Date().toISOString().split("T")[0]
    warehouseBatch.status = "received"

    // Get slaughter record details
    const slaughterRecord = this.slaughterRecords.find((record) => record.id === warehouseBatch.slaughterRecordId)
    if (slaughterRecord) {
      warehouseBatch.batchId = slaughterRecord.batchId
      warehouseBatch.slaughterDate = slaughterRecord.slaughterDate
      warehouseBatch.totalMeat = slaughterRecord.totalMeatYield
      warehouseBatch.availableMeat = slaughterRecord.totalMeatYield
      warehouseBatch.reservedMeat = 0
      warehouseBatch.animalIds = slaughterRecord.animalIds

      // Update slaughter record status
      slaughterRecord.warehouseStatus = "received"
    }

    this.warehouseInventory.push(warehouseBatch)
    this.addActivity(`Batch ${warehouseBatch.batchId} received in warehouse at ${warehouseBatch.storageLocation}`)
    this.saveData()
    return warehouseBatch
  }

  updateWarehouseStock(warehouseBatchId, meatAmount, operation = "reserve") {
    const batch = this.warehouseInventory.find((b) => b.id === warehouseBatchId)
    if (!batch) return null

    if (operation === "reserve") {
      if (batch.availableMeat >= meatAmount) {
        batch.availableMeat -= meatAmount
        batch.reservedMeat += meatAmount
        batch.status = batch.availableMeat > 0 ? "available" : "reserved"
      }
    } else if (operation === "ship") {
      batch.reservedMeat -= meatAmount
      if (batch.availableMeat === 0 && batch.reservedMeat === 0) {
        batch.status = "shipped"
      }
    }

    this.saveData()
    return batch
  }

  getAvailableWarehouseBatches() {
    return this.warehouseInventory.filter((batch) => batch.status === "received" || batch.status === "available")
  }

  getWarehouseStats() {
    const totalBatches = this.warehouseInventory.length
    const availableStock = this.warehouseInventory.reduce((sum, batch) => sum + batch.availableMeat, 0)
    const reservedStock = this.warehouseInventory.reduce((sum, batch) => sum + batch.reservedMeat, 0)

    return {
      totalBatches,
      availableStock: availableStock.toFixed(1),
      reservedStock: reservedStock.toFixed(1),
    }
  }

  addDistribution(distribution) {
    distribution.id = this.generateId("DIST")
    distribution.distributionDate = new Date().toISOString().split("T")[0]

    // Get warehouse batch details instead of slaughter batch
    const warehouseBatch = this.warehouseInventory.find((batch) => batch.id === distribution.batchId)
    if (warehouseBatch) {
      // Update warehouse stock
      this.updateWarehouseStock(warehouseBatch.id, Number.parseFloat(distribution.meatAmount), "ship")

      // Get animal details from the batch
      const batchAnimals = this.animals.filter((animal) => warehouseBatch.animalIds.includes(animal.id))
      const representativeAnimal = batchAnimals[0]

      distribution.animalBreed = representativeAnimal?.breed || ""
      distribution.animalType = representativeAnimal?.type || ""
      distribution.vaccine = representativeAnimal?.vaccine || ""
      distribution.gender = representativeAnimal?.gender || ""
      distribution.averageWeight = warehouseBatch.totalMeat / warehouseBatch.animalIds.length
      distribution.warehouseBatchId = warehouseBatch.id
      distribution.originalBatchId = warehouseBatch.batchId
    }

    this.distributions.push(distribution)
    this.addActivity(`Meat shipped: ${distribution.meatAmount}kg to ${distribution.agentName} from warehouse`)
    this.saveData()
    return distribution
  }

  addAgentOrder(order) {
    order.id = this.generateId("ORD")
    order.orderDate = new Date().toISOString().split("T")[0]
    order.status = "pending"

    this.agentOrders.push(order)
    this.addActivity(`New order received: ${order.quantity}kg ${order.meatType} from ${order.agentName}`)
    this.saveData()
    return order
  }

  updateOrderStatus(orderId, status) {
    const index = this.agentOrders.findIndex((order) => order.id === orderId)
    if (index !== -1) {
      this.agentOrders[index].status = status
      this.addActivity(`Order ${orderId} status updated to ${status}`)
      this.saveData()
      return this.agentOrders[index]
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
    const totalAnimalsReceived = this.animals.length
    const totalSlaughtered = this.animals.filter((animal) => animal.status === "slaughtered").length
    const totalMeatDistributed = this.distributions.reduce(
      (sum, dist) => sum + Number.parseFloat(dist.meatAmount || 0),
      0,
    )
    const pendingOrders = this.agentOrders.filter((order) => order.status === "pending").length

    return {
      totalAnimalsReceived,
      totalSlaughtered,
      totalMeatDistributed: totalMeatDistributed.toFixed(1),
      pendingOrders,
    }
  }

  getAnalytics() {
    const avgSlaughterRate =
      this.slaughterRecords.length > 0
        ? (
            this.slaughterRecords.reduce((sum, record) => sum + record.slaughterRate, 0) / this.slaughterRecords.length
          ).toFixed(1)
        : 0

    const totalMeatYield = this.slaughterRecords
      .reduce((sum, record) => sum + Number.parseFloat(record.totalMeatYield || 0), 0)
      .toFixed(1)

    const avgFCR =
      this.slaughterRecords.length > 0
        ? (
            this.slaughterRecords.reduce((sum, record) => sum + Number.parseFloat(record.feedConversionRatio || 0), 0) /
            this.slaughterRecords.length
          ).toFixed(2)
        : 0

    const totalAgents = new Set(this.distributions.map((dist) => dist.agentId)).size
    const totalRevenue = this.distributions
      .reduce((sum, dist) => sum + Number.parseFloat(dist.price || 0), 0)
      .toFixed(2)
    const avgPricePerKg =
      this.distributions.length > 0
        ? (
            this.distributions.reduce(
              (sum, dist) => sum + Number.parseFloat(dist.price || 0) / Number.parseFloat(dist.meatAmount || 1),
              0,
            ) / this.distributions.length
          ).toFixed(2)
        : 0

    return {
      avgSlaughterRate,
      totalMeatYield,
      avgFCR,
      totalAgents,
      totalRevenue,
      avgPricePerKg,
    }
  }
}

// Dashboard class for managing the dashboard functionality
class ButcherDashboard {
  constructor() {
    this.dataManager = new ButcherDataManager()
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
    // Add Animal Form
    const addAnimalForm = document.getElementById("addAnimalForm")
    if (addAnimalForm) {
      addAnimalForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleAddAnimal(new FormData(addAnimalForm))
      })
    }

    // Add Slaughter Form
    const addSlaughterForm = document.getElementById("addSlaughterForm")
    if (addSlaughterForm) {
      addSlaughterForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleAddSlaughter(new FormData(addSlaughterForm))
      })
    }

    // Receive Batch Form
    const receiveBatchForm = document.getElementById("receiveBatchForm")
    if (receiveBatchForm) {
      receiveBatchForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleReceiveBatch(new FormData(receiveBatchForm))
      })
    }

    // Ship to Agent Form
    const shipToAgentForm = document.getElementById("shipToAgentForm")
    if (shipToAgentForm) {
      shipToAgentForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleShipToAgent(new FormData(shipToAgentForm))
      })
    }

    // Add Distribution Form
    const addDistributionForm = document.getElementById("addDistributionForm")
    if (addDistributionForm) {
      addDistributionForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleAddDistribution(new FormData(addDistributionForm))
      })
    }

    // Add Order Form
    const addOrderForm = document.getElementById("addOrderForm")
    if (addOrderForm) {
      addOrderForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleAddOrder(new FormData(addOrderForm))
      })
    }
  }

  handleReceiveBatch(formData) {
    const warehouseBatch = {
      slaughterRecordId: formData.get("warehouseBatchId"),
      storageLocation: formData.get("storageLocation"),
      storageTemperature: formData.get("storageTemperature"),
      receivedDate: formData.get("receivedDate"),
      notes: formData.get("warehouseNotes"),
    }

    this.dataManager.addWarehouseBatch(warehouseBatch)
    this.updateWarehouseTable()
    this.updateDashboard()
    this.populateSelects()
    closeModal("receiveBatchModal")
    document.getElementById("receiveBatchForm").reset()
  }

  handleShipToAgent(formData) {
    const distribution = {
      batchId: formData.get("shipBatchId"),
      agentId: formData.get("shipAgentId"),
      agentName: formData.get("shipAgentName"),
      agentLocation: formData.get("shipAgentLocation"),
      meatAmount: formData.get("shipMeatAmount"),
      price: formData.get("shipPrice"),
      shipDate: formData.get("shipDate"),
      trackingNumber: formData.get("trackingNumber"),
    }

    this.dataManager.addDistribution(distribution)
    this.updateDistributionTable()
    this.updateWarehouseTable()
    this.updateDashboard()
    closeModal("shipToAgentModal")
    document.getElementById("shipToAgentForm").reset()
  }

  handleAddAnimal(formData) {
    const animal = {
      farmerId: formData.get("farmerId"),
      farmerName: formData.get("farmerName"),
      animalId: formData.get("animalId"),
      breed: formData.get("breed"),
      type: formData.get("animalType"),
      gender: formData.get("gender"),
      weight: formData.get("weight"),
      vaccine: formData.get("vaccine"),
      receivedDate: formData.get("receivedDate"),
    }

    this.dataManager.addAnimal(animal)
    this.updateAnimalTable()
    this.updateDashboard()
    this.populateSelects()
    closeModal("addAnimalModal")
    document.getElementById("addAnimalForm").reset()
  }

  handleAddSlaughter(formData) {
    const selectedAnimals = Array.from(document.querySelectorAll('input[name="selectedAnimals"]:checked')).map(
      (checkbox) => checkbox.value,
    )

    if (selectedAnimals.length === 0) {
      alert("Please select at least one animal for slaughter")
      return
    }

    const record = {
      batchId: formData.get("batchId"),
      slaughterDate: formData.get("slaughterDate"),
      animalIds: selectedAnimals,
      totalMeatYield: formData.get("totalMeatYield"),
      feedConversionRatio: formData.get("feedConversionRatio"),
      rearingPeriod: formData.get("rearingPeriod"),
      notes: formData.get("notes"),
    }

    this.dataManager.addSlaughterRecord(record)
    this.updateSlaughterTable()
    this.updateAnimalTable()
    this.updateDashboard()
    this.populateSelects()
    closeModal("addSlaughterModal")
    document.getElementById("addSlaughterForm").reset()
  }

  handleAddDistribution(formData) {
    const distribution = {
      batchId: formData.get("distributionBatchId"),
      agentId: formData.get("agentId"),
      agentName: formData.get("agentName"),
      agentLocation: formData.get("agentLocation"),
      meatAmount: formData.get("meatAmount"),
      price: formData.get("distributionPrice"),
    }

    this.dataManager.addDistribution(distribution)
    this.updateDistributionTable()
    this.updateDashboard()
    closeModal("addDistributionModal")
    document.getElementById("addDistributionForm").reset()
  }

  handleAddOrder(formData) {
    const order = {
      agentId: formData.get("orderAgentId"),
      agentName: formData.get("orderAgentName"),
      agentLocation: formData.get("orderAgentLocation"),
      meatType: formData.get("meatType"),
      quantity: formData.get("quantity"),
      requiredDate: formData.get("requiredDate"),
      price: formData.get("orderPrice"),
    }

    this.dataManager.addAgentOrder(order)
    this.updateOrdersTable()
    this.updateDashboard()
    closeModal("addOrderModal")
    document.getElementById("addOrderForm").reset()
  }

  updateDashboard() {
    const stats = this.dataManager.getStats()
    document.getElementById("totalAnimalsReceived").textContent = stats.totalAnimalsReceived
    document.getElementById("totalSlaughtered").textContent = stats.totalSlaughtered
    document.getElementById("totalMeatDistributed").textContent = `${stats.totalMeatDistributed} kg`
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

    const avgSlaughterRateEl = document.getElementById("avgSlaughterRate")
    const totalMeatYieldEl = document.getElementById("totalMeatYield")
    const avgFCREl = document.getElementById("avgFCR")
    const totalAgentsEl = document.getElementById("totalAgents")
    const totalRevenueEl = document.getElementById("totalRevenue")
    const avgPricePerKgEl = document.getElementById("avgPricePerKg")

    if (avgSlaughterRateEl) avgSlaughterRateEl.textContent = `${analytics.avgSlaughterRate}%`
    if (totalMeatYieldEl) totalMeatYieldEl.textContent = `${analytics.totalMeatYield} kg`
    if (avgFCREl) avgFCREl.textContent = analytics.avgFCR
    if (totalAgentsEl) totalAgentsEl.textContent = analytics.totalAgents
    if (totalRevenueEl) totalRevenueEl.textContent = `$${analytics.totalRevenue}`
    if (avgPricePerKgEl) avgPricePerKgEl.textContent = `$${analytics.avgPricePerKg}`
  }

  updateAnimalTable() {
    const tbody = document.getElementById("animalRecordsBody")
    const animals = this.dataManager.animals

    if (animals.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="9">No animals recorded yet. Click "Add Animal" to get started.</td></tr>'
      return
    }

    tbody.innerHTML = animals
      .map(
        (animal) => `
      <tr>
        <td>${animal.animalId}</td>
        <td>${animal.farmerName}</td>
        <td>${animal.breed}</td>
        <td>${animal.type}</td>
        <td>${animal.weight}</td>
        <td>${animal.vaccine}</td>
        <td>${animal.receivedDate}</td>
        <td><span class="badge badge-${animal.status}">${animal.status}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewAnimalDetails('${animal.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn-icon" title="Edit" onclick="editAnimal('${animal.id}')">
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

  updateSlaughterTable() {
    const tbody = document.getElementById("slaughterRecordsBody")
    const records = this.dataManager.slaughterRecords

    if (records.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="8">No slaughter records yet. Click "Record Slaughter" to add your first record.</td></tr>'
      return
    }

    tbody.innerHTML = records
      .map(
        (record) => `
      <tr>
        <td>${record.batchId}</td>
        <td>${record.slaughterDate}</td>
        <td>${record.totalAnimals}</td>
        <td>${record.totalMeatYield}</td>
        <td>${record.slaughterRate.toFixed(1)}%</td>
        <td>${record.averageWeight.toFixed(1)}</td>
        <td>${record.feedConversionRatio}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewSlaughterDetails('${record.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn-icon" title="Edit" onclick="editSlaughterRecord('${record.id}')">
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

  updateDistributionTable() {
    const tbody = document.getElementById("distributionRecordsBody")
    const distributions = this.dataManager.distributions

    if (distributions.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="8">No distribution records yet. Click "Record Distribution" to add your first record.</td></tr>'
      return
    }

    tbody.innerHTML = distributions
      .map(
        (dist) => `
      <tr>
        <td>${dist.agentName}</td>
        <td>${dist.agentLocation}</td>
        <td>${dist.batchId || "N/A"}</td>
        <td>${dist.meatAmount}</td>
        <td>${dist.animalBreed} (${dist.animalType})</td>
        <td>${dist.distributionDate}</td>
        <td>$${dist.price}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewDistributionDetails('${dist.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn-icon" title="Edit" onclick="editDistribution('${dist.id}')">
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

  updateOrdersTable() {
    const tbody = document.getElementById("ordersBody")
    const orders = this.dataManager.agentOrders

    if (orders.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="9">No orders yet. Click "New Order" to add your first order.</td></tr>'
      return
    }

    tbody.innerHTML = orders
      .map(
        (order) => `
      <tr>
        <td>${order.agentName}</td>
        <td>${order.agentLocation}</td>
        <td>${order.meatType}</td>
        <td>${order.quantity}</td>
        <td>${order.orderDate}</td>
        <td>${order.requiredDate}</td>
        <td><span class="badge badge-${order.status}">${order.status}</span></td>
        <td>$${order.price}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewOrderDetails('${order.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn-icon" title="Edit" onclick="editOrder('${order.id}')">
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

  updateWarehouseTable() {
    const tbody = document.getElementById("warehouseInventoryBody")
    const inventory = this.dataManager.warehouseInventory

    if (inventory.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="10">No batches in warehouse yet. Batches will appear here after slaughter.</td></tr>'
      return
    }

    tbody.innerHTML = inventory
      .map(
        (batch) => `
        <tr>
            <td>${batch.batchId}</td>
            <td>${batch.slaughterDate}</td>
            <td>${batch.receivedDate}</td>
            <td>${batch.totalMeat}</td>
            <td>${batch.availableMeat}</td>
            <td>${batch.reservedMeat}</td>
            <td>${batch.storageLocation}</td>
            <td>${batch.storageTemperature}°C</td>
            <td><span class="badge badge-${batch.status}">${batch.status}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="btn-icon" title="Ship to Agent" onclick="showShipToAgentModal('${batch.id}')" ${batch.availableMeat <= 0 ? "disabled" : ""}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                            <circle cx="17" cy="18" r="2"/>
                            <circle cx="7" cy="18" r="2"/>
                        </svg>
                    </button>
                    <button class="btn-icon" title="View Details" onclick="viewWarehouseBatchDetails('${batch.id}')">
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

  populateSelects() {
    // Populate warehouse batch select for receiving
    const warehouseBatchSelect = document.getElementById("warehouseBatchId")
    if (warehouseBatchSelect) {
      const unreceivedBatches = this.dataManager.slaughterRecords.filter(
        (record) => !record.warehouseStatus || record.warehouseStatus !== "received",
      )
      warehouseBatchSelect.innerHTML =
        '<option value="">Select Batch</option>' +
        unreceivedBatches
          .map(
            (record) =>
              `<option value="${record.id}">Batch ${record.batchId} - ${record.totalMeatYield}kg (${record.slaughterDate})</option>`,
          )
          .join("")
    }

    // Populate ship batch select
    const shipBatchSelect = document.getElementById("shipBatchId")
    if (shipBatchSelect) {
      const availableBatches = this.dataManager.getAvailableWarehouseBatches()
      shipBatchSelect.innerHTML =
        '<option value="">Select Batch</option>' +
        availableBatches
          .map(
            (batch) =>
              `<option value="${batch.id}">Batch ${batch.batchId} - ${batch.availableMeat}kg available</option>`,
          )
          .join("")
    }

    // Populate batch select for distribution (now from warehouse)
    const batchSelect = document.getElementById("distributionBatchId")
    if (batchSelect) {
      const availableBatches = this.dataManager.getAvailableWarehouseBatches()
      batchSelect.innerHTML =
        '<option value="">Select Batch</option>' +
        availableBatches
          .map(
            (batch) =>
              `<option value="${batch.id}">Batch ${batch.batchId} - ${batch.availableMeat}kg available</option>`,
          )
          .join("")
    }

    // Populate animal selection for slaughter
    this.updateAnimalSelection()
  }

  setupSearchAndFilters() {
    // Animal Records Search
    const animalSearch = document.getElementById("animalSearch")
    if (animalSearch) {
      animalSearch.addEventListener("input", (e) => {
        this.filterTable("animalRecordsTable", e.target.value, "search")
      })
    }

    // Animal Type Filter
    const animalTypeFilter = document.getElementById("animalTypeFilter")
    if (animalTypeFilter) {
      animalTypeFilter.addEventListener("change", (e) => {
        this.filterTable("animalRecordsTable", e.target.value, "type")
      })
    }

    // Animal Status Filter
    const animalStatusFilter = document.getElementById("animalStatusFilter")
    if (animalStatusFilter) {
      animalStatusFilter.addEventListener("change", (e) => {
        this.filterTable("animalRecordsTable", e.target.value, "status")
      })
    }

    // Other search filters can be added similarly
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

  filterTable(tableId, searchTerm, filterType) {
    const table = document.getElementById(tableId)
    if (!table) return

    const tbody = table.querySelector("tbody")
    const rows = tbody.querySelectorAll("tr:not(.empty-state)")

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td")
      let shouldShow = true

      if (filterType === "search" && searchTerm) {
        const searchText = Array.from(cells)
          .slice(0, -1) // Exclude actions column
          .map((cell) => cell.textContent.toLowerCase())
          .join(" ")
        shouldShow = searchText.includes(searchTerm.toLowerCase())
      } else if (filterType === "type" && searchTerm !== "all") {
        const typeCell = cells[3] // Type column
        shouldShow = typeCell.textContent.toLowerCase().includes(searchTerm)
      } else if (filterType === "status" && searchTerm !== "all") {
        const statusCell = cells[7] // Status column
        shouldShow = statusCell.textContent.toLowerCase().includes(searchTerm)
      }

      row.style.display = shouldShow ? "" : "none"
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
        dashboard: "Butcher Dashboard",
        animals: "Animal Intake Records",
        slaughter: "Slaughter Records",
        warehouse: "Warehouse Management",
        distribution: "Meat Distribution",
        orders: "Agent Orders",
        analytics: "Analytics & Reports",
        settings: "Settings",
      }
      this.headerTitle.textContent = titles[sectionName] || "ButcherPro Dashboard"
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
      case "animals":
        sectionId = "animals-section"
        this.updateAnimalTable()
        break
      case "slaughter":
        sectionId = "slaughter-section"
        this.updateSlaughterTable()
        break
      case "warehouse":
        sectionId = "warehouse-section"
        this.updateWarehouseTable()
        this.updateWarehouseStats()
        break
      case "distribution":
        sectionId = "distribution-section"
        this.updateDistributionTable()
        break
      case "orders":
        sectionId = "orders-section"
        this.updateOrdersTable()
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
function showAddAnimalModal() {
  document.getElementById("addAnimalModal").classList.add("active")
}

function showAddSlaughterModal() {
  const availableAnimals = dashboard.dataManager.animals.filter((animal) => animal.status === "received")
  if (availableAnimals.length === 0) {
    alert("No animals available for slaughter. Please add animals first.")
    return
  }
  dashboard.updateAnimalSelection()
  document.getElementById("addSlaughterModal").classList.add("active")
}

function showAddDistributionModal() {
  const availableBatches = dashboard.dataManager.slaughterRecords
  if (availableBatches.length === 0) {
    alert("No slaughter batches available. Please record slaughter first.")
    return
  }
  document.getElementById("addDistributionModal").classList.add("active")
}

function showAddOrderModal() {
  document.getElementById("addOrderModal").classList.add("active")
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active")
}

// Global functions for button actions
function viewAnimalDetails(animalId) {
  const animal = dashboard.dataManager.animals.find((a) => a.id === animalId)
  if (animal) {
    alert(
      `Animal Details:\n\nID: ${animal.animalId}\nFarmer: ${animal.farmerName}\nBreed: ${animal.breed}\nType: ${animal.type}\nWeight: ${animal.weight}kg\nVaccine: ${animal.vaccine}\nStatus: ${animal.status}`,
    )
  }
}

function editAnimal(animalId) {
  // Implementation for editing animal
  console.log("Edit animal:", animalId)
}

function viewSlaughterDetails(recordId) {
  const record = dashboard.dataManager.slaughterRecords.find((r) => r.id === recordId)
  if (record) {
    alert(
      `Slaughter Details:\n\nBatch ID: ${record.batchId}\nDate: ${record.slaughterDate}\nAnimals: ${record.totalAnimals}\nMeat Yield: ${record.totalMeatYield}kg\nSlaughter Rate: ${record.slaughterRate.toFixed(1)}%\nFCR: ${record.feedConversionRatio}`,
    )
  }
}

function editSlaughterRecord(recordId) {
  console.log("Edit slaughter record:", recordId)
}

function viewDistributionDetails(distributionId) {
  const dist = dashboard.dataManager.distributions.find((d) => d.id === distributionId)
  if (dist) {
    alert(
      `Distribution Details:\n\nAgent: ${dist.agentName}\nLocation: ${dist.agentLocation}\nMeat Amount: ${dist.meatAmount}kg\nAnimal: ${dist.animalBreed} (${dist.animalType})\nPrice: $${dist.price}`,
    )
  }
}

function editDistribution(distributionId) {
  console.log("Edit distribution:", distributionId)
}

function viewOrderDetails(orderId) {
  const order = dashboard.dataManager.agentOrders.find((o) => o.id === orderId)
  if (order) {
    alert(
      `Order Details:\n\nAgent: ${order.agentName}\nLocation: ${order.agentLocation}\nMeat Type: ${order.meatType}\nQuantity: ${order.quantity}kg\nRequired Date: ${order.requiredDate}\nStatus: ${order.status}\nPrice: $${order.price}`,
    )
  }
}

function editOrder(orderId) {
  console.log("Edit order:", orderId)
}

// Global functions for warehouse management
function showReceiveBatchModal() {
  const unreceivedBatches = dashboard.dataManager.slaughterRecords.filter(
    (record) => !record.warehouseStatus || record.warehouseStatus !== "received",
  )
  if (unreceivedBatches.length === 0) {
    alert("No slaughter batches available to receive. Please complete slaughter records first.")
    return
  }
  document.getElementById("receiveBatchModal").classList.add("active")
}

function showShipToAgentModal(batchId = null) {
  const availableBatches = dashboard.dataManager.getAvailableWarehouseBatches()
  if (availableBatches.length === 0) {
    alert("No warehouse batches available for shipping.")
    return
  }

  if (batchId) {
    document.getElementById("shipBatchId").value = batchId
  }

  document.getElementById("shipToAgentModal").classList.add("active")
}

function viewWarehouseBatchDetails(batchId) {
  const batch = dashboard.dataManager.warehouseInventory.find((b) => b.id === batchId)
  if (batch) {
    alert(
      `Warehouse Batch Details:\n\nBatch ID: ${batch.batchId}\nSlaughter Date: ${batch.slaughterDate}\nReceived Date: ${batch.receivedDate}\nStorage Location: ${batch.storageLocation}\nTemperature: ${batch.storageTemperature}°C\nTotal Meat: ${batch.totalMeat}kg\nAvailable: ${batch.availableMeat}kg\nReserved: ${batch.reservedMeat}kg\nStatus: ${batch.status}\nNotes: ${batch.notes || "None"}`,
    )
  }
}

// Global dashboard instance
let dashboard

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  dashboard = new ButcherDashboard()
})

// Console log for debugging
console.log("ButcherPro Dashboard System Loaded")
