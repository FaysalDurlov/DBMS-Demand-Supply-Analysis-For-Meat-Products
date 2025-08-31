// Application State
let currentSection = "dashboard"
const isLoading = false
let sidebarExpanded = false

// API base URL
const API_BASE_URL = "http://localhost:3002/api/butcher"

// DataManager class for handling data storage and retrieval
class ButcherDataManager {
  constructor() {
    this.animals = []
    this.slaughterRecords = []
    this.warehouseInventory = []
    this.distributions = []
    this.agentOrders = []
    this.activities = []
    this.stats = {
      totalAnimalsReceived: 0,
      totalSlaughtered: 0,
      totalMeatDistributed: 0,
      pendingOrders: 0
    }
    this.analytics = {
      avgSlaughterRate: 0,
      totalMeatYield: 0,
      avgFCR: 0,
      totalAgents: 0,
      totalRevenue: 0,
      avgPricePerKg: 0
    }
  }

  async fetchData() {
    try {
      await this.fetchStats()
      await this.fetchAnimals()
      await this.fetchSlaughterRecords()
      await this.fetchWarehouseInventory()
      await this.fetchDistributions()
      await this.fetchOrders()
      await this.fetchAnalytics()
      await this.fetchActivities()
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  async fetchStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard-stats`)
      if (response.ok) {
        this.stats = await response.json()
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  async fetchAnimals() {
    try {
      const response = await fetch(`${API_BASE_URL}/animals`)
      if (response.ok) {
        this.animals = await response.json()
      }
    } catch (error) {
      console.error("Error fetching animals:", error)
    }
  }

  async fetchSlaughterRecords() {
    try {
      const response = await fetch(`${API_BASE_URL}/slaughter-records`)
      if (response.ok) {
        this.slaughterRecords = await response.json()
      }
    } catch (error) {
      console.error("Error fetching slaughter records:", error)
    }
  }

  async fetchWarehouseInventory() {
    try {
      const response = await fetch(`${API_BASE_URL}/warehouse`)
      if (response.ok) {
        this.warehouseInventory = await response.json()
      }
    } catch (error) {
      console.error("Error fetching warehouse inventory:", error)
    }
  }

  async fetchDistributions() {
    try {
      const response = await fetch(`${API_BASE_URL}/distributions`)
      if (response.ok) {
        this.distributions = await response.json()
      }
    } catch (error) {
      console.error("Error fetching distributions:", error)
    }
  }

  async fetchOrders() {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`)
      if (response.ok) {
        this.agentOrders = await response.json()
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  async fetchAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics`)
      if (response.ok) {
        this.analytics = await response.json()
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    }
  }

  async fetchActivities() {
    try {
      const response = await fetch(`${API_BASE_URL}/activities`)
      if (response.ok) {
        this.activities = await response.json()
      }
    } catch (error) {
      console.error("Error fetching activities:", error)
    }
  }

  async addAnimal(animal) {
    try {
      const response = await fetch(`${API_BASE_URL}/animals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(animal)
      })
      
      if (response.ok) {
        await this.fetchAnimals()
        await this.fetchStats()
        await this.fetchActivities()
        return true
      }
      return false
    } catch (error) {
      console.error("Error adding animal:", error)
      return false
    }
  }

  async addSlaughterRecord(record) {
    try {
      const response = await fetch(`${API_BASE_URL}/slaughter-records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(record)
      })
      
      if (response.ok) {
        await this.fetchSlaughterRecords()
        await this.fetchAnimals()
        await this.fetchStats()
        await this.fetchActivities()
        return true
      }
      return false
    } catch (error) {
      console.error("Error adding slaughter record:", error)
      return false
    }
  }

  async addDistribution(distribution) {
    try {
      const response = await fetch(`${API_BASE_URL}/distributions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(distribution)
      })
      
      if (response.ok) {
        await this.fetchDistributions()
        await this.fetchStats()
        await this.fetchActivities()
        return true
      }
      return false
    } catch (error) {
      console.error("Error adding distribution:", error)
      return false
    }
  }

  async addAgentOrder(order) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(order)
      })
      
      if (response.ok) {
        await this.fetchOrders()
        await this.fetchStats()
        await this.fetchActivities()
        return true
      }
      return false
    } catch (error) {
      console.error("Error adding order:", error)
      return false
    }
  }

  getStats() {
    return this.stats
  }

  getAnalytics() {
    return this.analytics
  }
}

// Dashboard class for managing the dashboard functionality
class ButcherDashboard {
  constructor() {
    this.dataManager = new ButcherDataManager()
    this.init()
  }

  async init() {
    this.sidebar = document.getElementById("sidebar")
    this.mainContent = document.getElementById("mainContent")
    this.header = document.getElementById("header")
    this.headerTitle = document.getElementById("headerTitle")
    this.content = document.getElementById("content")

    this.setupEventListeners()
    await this.dataManager.fetchData()
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
    // In the setupFormHandlers method, update the addAnimalForm handler:

const addAnimalForm = document.getElementById("addAnimalForm");
if (addAnimalForm) {
  addAnimalForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const isEditing = document.querySelector("#addAnimalForm button[type='submit']").textContent === "Update Animal";
    
    if (isEditing) {
      // Handle update logic here
      alert("Update functionality would be implemented here");
      closeModal("addAnimalModal");
      // Reset button text
      document.querySelector("#addAnimalForm button[type='submit']").textContent = "Add Animal";
    } else {
      await this.handleAddAnimal(new FormData(addAnimalForm));
    }
  });
}

    // Add Slaughter Form
    const addSlaughterForm = document.getElementById("addSlaughterForm")
    if (addSlaughterForm) {
      addSlaughterForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        await this.handleAddSlaughter(new FormData(addSlaughterForm))
      })
    }

    // Add Distribution Form
    const addDistributionForm = document.getElementById("addDistributionForm")
    if (addDistributionForm) {
      addDistributionForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        await this.handleAddDistribution(new FormData(addDistributionForm))
      })
    }

    // Add Order Form
    const addOrderForm = document.getElementById("addOrderForm")
    if (addOrderForm) {
      addOrderForm.addEventListener("submit", async (e) => {
        e.preventDefault()
        await this.handleAddOrder(new FormData(addOrderForm))
      })
    }
  }

  async handleAddAnimal(formData) {
    const animal = {
      farmerId: formData.get("farmerId"),
      farmerName: formData.get("farmerName"),
      animalId: formData.get("animalId"),
      breed: formData.get("breed"),
      animalType: formData.get("animalType"),
      gender: formData.get("gender"),
      weight: formData.get("weight"),
      vaccine: formData.get("vaccine"),
      receivedDate: formData.get("receivedDate"),
    }

    const success = await this.dataManager.addAnimal(animal)
    if (success) {
      this.updateAnimalTable()
      this.updateDashboard()
      closeModal("addAnimalModal")
      document.getElementById("addAnimalForm").reset()
    } else {
      alert("Failed to add animal. Please try again.")
    }
  }

  async handleAddSlaughter(formData) {
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

    const success = await this.dataManager.addSlaughterRecord(record)
    if (success) {
      this.updateSlaughterTable()
      this.updateAnimalTable()
      this.updateDashboard()
      closeModal("addSlaughterModal")
      document.getElementById("addSlaughterForm").reset()
    } else {
      alert("Failed to add slaughter record. Please try again.")
    }
  }

  async handleAddDistribution(formData) {
    const distribution = {
      agentId: formData.get("agentId"),
      agentName: formData.get("agentName"),
      agentLocation: formData.get("agentLocation"),
      batchId: formData.get("distributionBatchId"),
      meatAmount: formData.get("meatAmount"),
      price: formData.get("distributionPrice"),
    }

    const success = await this.dataManager.addDistribution(distribution)
    if (success) {
      this.updateDistributionTable()
      this.updateDashboard()
      closeModal("addDistributionModal")
      document.getElementById("addDistributionForm").reset()
    } else {
      alert("Failed to add distribution record. Please try again.")
    }
  }

  async handleAddOrder(formData) {
    const order = {
      agentId: formData.get("orderAgentId"),
      agentName: formData.get("orderAgentName"),
      agentLocation: formData.get("orderAgentLocation"),
      meatType: formData.get("meatType"),
      quantity: formData.get("quantity"),
      requiredDate: formData.get("requiredDate"),
      price: formData.get("orderPrice"),
    }

    const success = await this.dataManager.addAgentOrder(order)
    if (success) {
      this.updateOrdersTable()
      this.updateDashboard()
      closeModal("addOrderModal")
      document.getElementById("addOrderForm").reset()
    } else {
      alert("Failed to add order. Please try again.")
    }
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
          <small style="color: var(--text-secondary);">${new Date(activity.timestamp).toLocaleDateString()}</small>
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

  // Update the updateAnimalTable method:
updateAnimalTable() {
  const tbody = document.getElementById("animalRecordsBody");
  const animals = this.dataManager.animals;

  if (animals.length === 0) {
    tbody.innerHTML =
      '<tr class="empty-state"><td colspan="9">No animals recorded yet. Click "Add Animal" to get started.</td></tr>';
    return;
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
        <td>${animal.vaccine || "N/A"}</td>
        <td>${new Date(animal.receivedDate).toLocaleDateString()}</td>
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
    .join("");
}

  updateSlaughterTable() {
    const tbody = document.getElementById("slaughterRecordsBody")
    const records = this.dataManager.slaughterRecords

    if (records.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="8">No slaughter records yet. Click "Add Slaughter Record" to get started.</td></tr>'
      return
    }

    tbody.innerHTML = records
      .map(
        (record) => `
      <tr>
        <td>${record.batchId}</td>
        <td>${new Date(record.slaughterDate).toLocaleDateString()}</td>
        <td>${record.totalAnimals}</td>
        <td>${record.totalMeatYield} kg</td>
        <td>${record.slaughterRate}%</td>
        <td>${record.averageWeight} kg</td>
        <td>${record.fcr}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewSlaughterDetails('${record.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn-icon" title="Delete" onclick="deleteSlaughterRecord('${record.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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
        '<tr class="empty-state"><td colspan="8">No inventory records yet. Inventory will appear here after slaughter records are added.</td></tr>'
      return
    }

    tbody.innerHTML = inventory
      .map(
        (item) => `
      <tr>
        <td>${item.batchId}</td>
        <td>${new Date(item.slaughterDate).toLocaleDateString()}</td>
        <td>${new Date(item.receivedDate).toLocaleDateString()}</td>
        <td>${item.totalMeat} kg</td>
        <td>${item.availableMeat} kg</td>
        <td>${item.reservedMeat} kg</td>
        <td>${item.location}</td>
        <td>${item.temperature}°C</td>
        <td><span class="badge badge-${item.status}">${item.status}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewWarehouseItem('${item.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn-icon" title="Move" onclick="moveWarehouseItem('${item.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 8l4 4-4 4M7 8l-4 4 4 4"/>
                <path d="M3 12h18"/>
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
        '<tr class="empty-state"><td colspan="8">No distribution records yet. Click "Add Distribution" to get started.</td></tr>'
      return
    }

    tbody.innerHTML = distributions
      .map(
        (distribution) => `
      <tr>
        <td>${distribution.id}</td>
        <td>${distribution.agentName}</td>
        <td>${distribution.agentLocation}</td>
        <td>${distribution.batchId}</td>
        <td>${distribution.meatAmount} kg</td>
        <td>${distribution.animalBreed}</td>
        <td>${new Date(distribution.distributionDate).toLocaleDateString()}</td>
        <td>$${distribution.price}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewDistributionDetails('${distribution.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn-icon" title="Generate Invoice" onclick="generateInvoice('${distribution.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
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
    const tbody = document.getElementById("agentOrdersBody")
    const orders = this.dataManager.agentOrders

    if (orders.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="8">No orders yet. Click "Add Order" to get started.</td></tr>'
      return
    }

    tbody.innerHTML = orders
      .map(
        (order) => `
      <tr>
        <td>${order.id}</td>
        <td>${order.agentName}</td>
        <td>${order.agentLocation}</td>
        <td>${order.meatType}</td>
        <td>${order.quantity} kg</td>
        <td>${new Date(order.orderDate).toLocaleDateString()}</td>
        <td>${new Date(order.requiredDate).toLocaleDateString()}</td>
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
            <button class="btn-icon" title="Update Status" onclick="updateOrderStatus('${order.id}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
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
    // Populate animal selection for slaughter records
    const animalSelect = document.getElementById("slaughterAnimals")
    if (animalSelect) {
      const availableAnimals = this.dataManager.animals.filter((animal) => animal.status === "received")
      
      if (availableAnimals.length === 0) {
        animalSelect.innerHTML = '<option value="">No animals available for slaughter</option>'
      } else {
        animalSelect.innerHTML = availableAnimals
          .map(
            (animal) => `
          <div class="checkbox-item">
            <input type="checkbox" id="animal-${animal.id}" name="selectedAnimals" value="${animal.id}">
            <label for="animal-${animal.id}">${animal.animalId} - ${animal.breed} ${animal.type}</label>
          </div>
        `,
          )
          .join("")
      }
    }

    // Populate batch selection for distributions
    const batchSelect = document.getElementById("distributionBatchId")
    if (batchSelect) {
      const availableBatches = this.dataManager.warehouseInventory.filter((item) => item.status === "available")
      
      if (availableBatches.length === 0) {
        batchSelect.innerHTML = '<option value="">No batches available</option>'
      } else {
        batchSelect.innerHTML = availableBatches
          .map(
            (batch) => `
          <option value="${batch.batchId}">Batch ${batch.batchId} (${batch.availableMeat} kg available)</option>
        `,
          )
          .join("")
      }
    }
  }

  setupSearchAndFilters() {
    // Search functionality
    const searchInputs = document.querySelectorAll(".search-input")
    searchInputs.forEach((input) => {
      input.addEventListener("input", (e) => {
        const searchTerm = e.target.value.toLowerCase()
        const tableId = e.target.getAttribute("data-table")
        this.filterTable(tableId, searchTerm)
      })
    })

    // Filter functionality
    const filterButtons = document.querySelectorAll(".filter-btn")
    filterButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const filterType = e.target.getAttribute("data-filter")
        const tableId = e.target.getAttribute("data-table")
        this.applyFilter(tableId, filterType)
      })
    })
  }

  filterTable(tableId, searchTerm) {
    const table = document.getElementById(tableId)
    if (!table) return

    const rows = table.querySelectorAll("tbody tr")
    rows.forEach((row) => {
      const text = row.textContent.toLowerCase()
      row.style.display = text.includes(searchTerm) ? "" : "none"
    })
  }

  applyFilter(tableId, filterType) {
    const table = document.getElementById(tableId)
    if (!table) return

    const rows = table.querySelectorAll("tbody tr")
    rows.forEach((row) => {
      if (filterType === "all") {
        row.style.display = ""
      } else {
        const statusCell = row.querySelector("td:nth-child(8)") || row.querySelector("td:nth-child(9)")
        if (statusCell) {
          const status = statusCell.textContent.toLowerCase()
          row.style.display = status.includes(filterType) ? "" : "none"
        }
      }
    })
  }

  setupTableSorting() {
    const sortButtons = document.querySelectorAll(".sort-btn")
    sortButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const columnIndex = parseInt(e.target.getAttribute("data-column"))
        const tableId = e.target.getAttribute("data-table")
        this.sortTable(tableId, columnIndex)
      })
    })
  }

  sortTable(tableId, columnIndex) {
    const table = document.getElementById(tableId)
    if (!table) return

    const tbody = table.querySelector("tbody")
    const rows = Array.from(tbody.querySelectorAll("tr"))

    // Determine sort direction
    const isAscending = tbody.getAttribute("data-sort-direction") !== "asc"
    tbody.setAttribute("data-sort-direction", isAscending ? "asc" : "desc")

    rows.sort((a, b) => {
      const aValue = a.cells[columnIndex].textContent.trim()
      const bValue = b.cells[columnIndex].textContent.trim()

      // Try to parse as numbers if possible
      const aNum = parseFloat(aValue)
      const bNum = parseFloat(bValue)

      if (!isNaN(aNum) && !isNaN(bNum)) {
        return isAscending ? aNum - bNum : bNum - aNum
      }

      // Otherwise sort as strings
      return isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    })

    // Remove existing rows
    while (tbody.firstChild) {
      tbody.removeChild(tbody.firstChild)
    }

    // Add sorted rows
    rows.forEach((row) => tbody.appendChild(row))
  }

  handleSidebarMouseEnter() {
    if (!sidebarExpanded) {
      this.sidebar.classList.add("expanded")
      sidebarExpanded = true
    }
  }

  handleSidebarMouseLeave() {
    if (sidebarExpanded) {
      this.sidebar.classList.remove("expanded")
      sidebarExpanded = false
    }
  }

  handleMainContentClick() {
    if (sidebarExpanded) {
      this.sidebar.classList.remove("expanded")
      sidebarExpanded = false
    }
  }

  handleNavItemClick(item) {
    const section = item.getAttribute("data-section")
    this.showSection(section)
  }

  // In ButcherDashBoardScript.js, replace the showSection method:

showSection(section) {
  currentSection = section;

  // Hide all sections
  const sections = document.querySelectorAll(".section-content");
  sections.forEach((sec) => sec.style.display = "none");

  // Show selected section
  const targetSection = document.getElementById(`${section}-section`);
  if (targetSection) {
    targetSection.style.display = "block";
    
    // Update header title based on section
    const sectionTitles = {
      dashboard: "Butcher Dashboard",
      animals: "Animal Intake Records",
      slaughter: "Slaughter Records",
      warehouse: "Warehouse Management",
      distribution: "Meat Distribution",
      orders: "Agent Orders",
      analytics: "Analytics & Reports",
      settings: "Settings"
    };
    
    this.headerTitle.textContent = sectionTitles[section] || "Butcher Dashboard";

    // Update relevant tables
    if (section === "animals") {
      this.updateAnimalTable();
    } else if (section === "slaughter") {
      this.updateSlaughterTable();
    } else if (section === "warehouse") {
      this.updateWarehouseTable();
    } else if (section === "distribution") {
      this.updateDistributionTable();
    } else if (section === "orders") {
      this.updateOrdersTable();
    } else if (section === "analytics") {
      this.updateAnalytics();
    }
  }

  // Update active nav item
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item) => {
    if (item.getAttribute("data-section") === section) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.butcherDashboard = new ButcherDashboard()
})

// Replace the openModal and closeModal functions:

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "auto";
  }
}


// Close modals when clicking outside
window.addEventListener("click", (e) => {
  const modals = document.querySelectorAll(".modal")
  modals.forEach((modal) => {
    if (e.target === modal) {
      modal.style.display = "none"
      document.body.style.overflow = "auto"
    }
  })
})

// Placeholder functions for actions
// Replace the placeholder functions with these:

function viewAnimalDetails(id) {
  const animal = window.butcherDashboard.dataManager.animals.find(a => a.id == id);
  if (animal) {
    alert(`Animal Details:\nID: ${animal.animalId}\nFarmer: ${animal.farmerName}\nBreed: ${animal.breed}\nType: ${animal.type}\nWeight: ${animal.weight} kg\nStatus: ${animal.status}`);
  }
}

function editAnimal(id) {
  const animal = window.butcherDashboard.dataManager.animals.find(a => a.id == id);
  if (animal) {
    // Pre-fill the form with animal data
    document.getElementById("farmerId").value = "FARM-" + animal.farm_id;
    document.getElementById("farmerName").value = animal.farmerName;
    document.getElementById("animalId").value = animal.animalId;
    document.getElementById("breed").value = animal.breed;
    document.getElementById("animalType").value = animal.type.toLowerCase();
    document.getElementById("gender").value = animal.gender.toLowerCase();
    document.getElementById("weight").value = animal.weight;
    document.getElementById("vaccine").value = "Vaccinated";
    document.getElementById("receivedDate").value = new Date(animal.receivedDate).toISOString().split('T')[0];
    
    // Open the modal
    openModal('addAnimalModal');
    
    // Change the button text to indicate editing
    const submitBtn = document.querySelector("#addAnimalForm button[type='submit']");
    submitBtn.textContent = "Update Animal";
  }
}

function viewSlaughterDetails(id) {
  alert(`View slaughter details for ID: ${id}`)
}

function deleteSlaughterRecord(id) {
  if (confirm("Are you sure you want to delete this slaughter record?")) {
    alert(`Delete slaughter record with ID: ${id}`)
  }
}

function viewWarehouseItem(id) {
  alert(`View warehouse item with ID: ${id}`)
}

function moveWarehouseItem(id) {
  alert(`Move warehouse item with ID: ${id}`)
}

function viewDistributionDetails(id) {
  alert(`View distribution details for ID: ${id}`)
}

function generateInvoice(id) {
  alert(`Generate invoice for distribution ID: ${id}`)
}

function viewOrderDetails(id) {
  alert(`View order details for ID: ${id}`)
}

function updateOrderStatus(id) {
  alert(`Update order status for ID: ${id}`)
}