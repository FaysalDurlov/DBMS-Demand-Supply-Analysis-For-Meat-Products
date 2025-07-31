import { LogOut } from "../CommonFeatureScript.js";

// Application State
let currentStep = "login"
let isLoading = false
let currentUser = null

// User types array - easily modifiable
const USER_TYPES = [
  { value: "farmer", label: "Farmer" },
  { value: "veterinarian", label: "Veterinarian" },
  { value: "supplier", label: "Supplier" },
  { value: "manager", label: "Farm Manager" },
  { value: "inspector", label: "Inspector" },
]

// Users database - stores all registered users
let users = [
  {
    id: "john123",
    email: "john@example.com",
    password: "password123",
    userType: "farmer",
    createdAt: new Date().toISOString(),
  },
]

// DOM Elements
const elements = {
  // Steps
  loginStep: document.getElementById("loginStep"),
  signupStep: document.getElementById("signupStep"),

  // Forms
  loginForm: document.getElementById("loginForm"),
  signupForm: document.getElementById("signupForm"),

  // Login inputs
  loginId: document.getElementById("loginId"),
  password: document.getElementById("password"),

  // Signup inputs - removed userName
  userEmail: document.getElementById("userEmail"),
  userType: document.getElementById("userType"),
  userPassword: document.getElementById("userPassword"),
  confirmPassword: document.getElementById("confirmPassword"),

  // Buttons
  loginBtn: document.getElementById("loginBtn"),
  switchToSignup: document.getElementById("switchToSignup"),
  passwordToggle: document.getElementById("passwordToggle"),
  backBtn: document.getElementById("backBtn"),
  createAccountBtn: document.getElementById("createAccountBtn"),
  copyDetailsBtn: document.getElementById("copyDetailsBtn"),
  proceedToLoginBtn: document.getElementById("proceedToLoginBtn"),

  // Messages
  errorMessage: document.getElementById("errorMessage"),
  successMessage: document.getElementById("successMessage"),
  errorText: document.getElementById("errorText"),
  successText: document.getElementById("successText"),

  // Popup elements
  successPopup: document.getElementById("successPopup"),
  popupUserId: document.getElementById("popupUserId"),
  popupUserEmail: document.getElementById("popupUserEmail"),
  popupUserType: document.getElementById("popupUserType"),

  // Loading
  loadingOverlay: document.getElementById("loadingOverlay"),
  loadingTitle: document.getElementById("loadingTitle"),
  loadingSubtitle: document.getElementById("loadingSubtitle"),

  // Icons
  eyeIcon: document.getElementById("eyeIcon"),
}

// DataManager class for handling data storage and retrieval
class DataManager {
  constructor() {
    this.animals = JSON.parse(localStorage.getItem("animals") || "[]")
    this.sales = JSON.parse(localStorage.getItem("sales") || "[]")
    this.purchases = JSON.parse(localStorage.getItem("purchases") || "[]")
    this.activities = JSON.parse(localStorage.getItem("activities") || "[]")
  }

  saveData() {
    localStorage.setItem("animals", JSON.stringify(this.animals))
    localStorage.setItem("sales", JSON.stringify(this.sales))
    localStorage.setItem("purchases", JSON.stringify(this.purchases))
    localStorage.setItem("activities", JSON.stringify(this.activities))
  }

  addAnimal(animal) {
    animal.id = this.generateId("A")
    animal.dateAdded = new Date().toISOString()
    animal.fcr = this.calculateFCR(animal)
    this.animals.push(animal)
    this.addActivity(`Added new animal: ${animal.animalName} (${animal.animalId})`)
    this.saveData()
    return animal
  }

  updateAnimal(animalId, updatedData) {
    const index = this.animals.findIndex((animal) => animal.animalId === animalId)
    if (index !== -1) {
      // Keep the original ID and creation date
      const originalAnimal = this.animals[index]
      updatedData.id = originalAnimal.id
      updatedData.dateAdded = originalAnimal.dateAdded
      updatedData.animalId = originalAnimal.animalId // Ensure ID cannot be changed
      updatedData.fcr = this.calculateFCR(updatedData)

      this.animals[index] = updatedData
      this.addActivity(`Updated animal: ${updatedData.animalName} (${updatedData.animalId})`)
      this.saveData()
      return updatedData
    }
    return null
  }

  getAnimalById(animalId) {
    return this.animals.find((animal) => animal.animalId === animalId)
  }

  addSale(sale) {
    sale.id = this.generateId("S")
    sale.dateRecorded = new Date().toISOString()
    // Remove animal from active list
    const animalIndex = this.animals.findIndex((a) => a.animalId === sale.saleAnimalId)
    if (animalIndex !== -1) {
      const animal = this.animals[animalIndex]
      sale.breed = animal.breed
      sale.animalType = animal.animalType
      this.animals.splice(animalIndex, 1)
    }
    this.sales.push(sale)
    this.addActivity(`Recorded sale: ${sale.saleAnimalId} to ${sale.buyerName} for $${sale.salePrice}`)
    this.saveData()
    return sale
  }

  addPurchase(purchase) {
    purchase.id = this.generateId("P")
    purchase.dateRecorded = new Date().toISOString()
    this.purchases.push(purchase)
    this.addActivity(
      `Recorded purchase: ${purchase.purchaseAnimalId} from ${purchase.sellerName} for $${purchase.purchasePrice}`,
    )
    this.saveData()
    return purchase
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
  }

  generateId(prefix) {
    return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 5)}`
  }

  calculateFCR(animal) {
    // Simple FCR calculation: Feed consumed / Weight gained
    // This is a basic calculation - in real scenario, you'd track weight changes over time
    const baseWeight = animal.currentWeight * 0.8 // Assume 80% of current weight was initial
    const weightGain = animal.currentWeight - baseWeight
    const dailyFeed = Number.parseFloat(animal.dailyFeedQuantity)
    const daysOwned = 30 // Assume 30 days for calculation
    const totalFeed = dailyFeed * daysOwned
    return weightGain > 0 ? (totalFeed / weightGain).toFixed(2) : 0
  }

  getStats() {
    const totalAnimals = this.animals.length
    const totalSalesValue = this.sales.reduce((sum, sale) => sum + Number.parseFloat(sale.salePrice || 0), 0)
    const totalFeedCost = this.animals.reduce((sum, animal) => {
      const dailyCost =
        Number.parseFloat(animal.dailyFeedQuantity || 0) * Number.parseFloat(animal.feedCostPerUnit || 0)
      return sum + dailyCost * 30 // Monthly cost
    }, 0)
    const avgFCR =
      this.animals.length > 0
        ? (
            this.animals.reduce((sum, animal) => sum + Number.parseFloat(animal.fcr || 0), 0) / this.animals.length
          ).toFixed(2)
        : 0

    return {
      totalAnimals,
      totalSalesValue: totalSalesValue.toFixed(2),
      totalFeedCost: totalFeedCost.toFixed(2),
      avgFCR,
    }
  }
}

// Dashboard class for managing the dashboard functionality
class Dashboard {
  constructor() {
    this.isExpanded = false
    this.hoverTimeout = null
    this.currentTab = "sales"
    this.sortDirection = {}
    this.dataManager = new DataManager()
    this.init()
  }

  init() {
    this.sidebar = document.getElementById("sidebar")
    this.mainContent = document.getElementById("mainContent")
    this.header = document.getElementById("header")
    this.headerTitle = document.getElementById("headerTitle")
    this.content = document.getElementById("content")
    this.setupEventListeners()
    this.initializeCharts()
    this.updateDashboard()
    this.populateAnimalSelects()
    // Initialize with dashboard section
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

    // Tab navigation for Sales & Purchases section
    const tabBtns = document.querySelectorAll(".tab-btn")
    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.switchTab(btn.dataset.tab)
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
        LogOut();
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

    // Edit Animal Form
    const editAnimalForm = document.getElementById("editAnimalForm")
    if (editAnimalForm) {
      editAnimalForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleEditAnimal(new FormData(editAnimalForm))
      })
    }

    // Add Sale Form
    const addSaleForm = document.getElementById("addSaleForm")
    if (addSaleForm) {
      addSaleForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleAddSale(new FormData(addSaleForm))
      })
    }

    // Add Purchase Form
    const addPurchaseForm = document.getElementById("addPurchaseForm")
    if (addPurchaseForm) {
      addPurchaseForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleAddPurchase(new FormData(addPurchaseForm))
      })
    }
  }

  handleAddAnimal(formData) {
    const animal = {
      animalId: formData.get("animalId"),
      animalName: formData.get("animalName"),
      animalType: formData.get("animalType"),
      breed: formData.get("breed"),
      gender: formData.get("gender"),
      currentWeight: formData.get("currentWeight"),
      feedType: formData.get("feedType"),
      dailyFeedQuantity: formData.get("dailyFeedQuantity"),
      feedCostPerUnit: formData.get("feedCostPerUnit"),
      purchaseDate: formData.get("purchaseDate"),
      lastVaccination: formData.get("lastVaccination"),
      vaccinationType: formData.get("vaccinationType"),
    }
    this.dataManager.addAnimal(animal)
    this.updateAnimalTable()
    this.updateDashboard()
    this.populateAnimalSelects()
    closeModal("addAnimalModal")
    document.getElementById("addAnimalForm").reset()
  }

  handleEditAnimal(formData) {
    const animalId = formData.get("editAnimalId")
    const updatedAnimal = {
      animalName: formData.get("editAnimalName"),
      animalType: formData.get("editAnimalType"),
      breed: formData.get("editBreed"),
      gender: formData.get("editGender"),
      currentWeight: formData.get("editCurrentWeight"),
      feedType: formData.get("editFeedType"),
      dailyFeedQuantity: formData.get("editDailyFeedQuantity"),
      feedCostPerUnit: formData.get("editFeedCostPerUnit"),
      purchaseDate: formData.get("editPurchaseDate"),
      lastVaccination: formData.get("editLastVaccination"),
      vaccinationType: formData.get("editVaccinationType"),
    }

    const result = this.dataManager.updateAnimal(animalId, updatedAnimal)
    if (result) {
      this.updateAnimalTable()
      this.updateDashboard()
      this.populateAnimalSelects()
      closeModal("editAnimalModal")
      document.getElementById("editAnimalForm").reset()
    } else {
      alert("Error updating animal. Please try again.")
    }
  }

  handleAddSale(formData) {
    const sale = {
      saleAnimalId: formData.get("saleAnimalId"),
      saleWeight: formData.get("saleWeight"),
      salePrice: formData.get("salePrice"),
      buyerName: formData.get("buyerName"),
      buyerContact: formData.get("buyerContact"),
      saleDate: formData.get("saleDate"),
    }
    this.dataManager.addSale(sale)
    this.updateSalesTable()
    this.updateAnimalTable()
    this.updateDashboard()
    this.populateAnimalSelects()
    closeModal("addSaleModal")
    document.getElementById("addSaleForm").reset()
  }

  handleAddPurchase(formData) {
    const purchase = {
      purchaseAnimalId: formData.get("purchaseAnimalId"),
      purchaseBreed: formData.get("purchaseBreed"),
      purchaseGender: formData.get("purchaseGender"),
      purchaseWeight: formData.get("purchaseWeight"),
      purchasePrice: formData.get("purchasePrice"),
      sellerName: formData.get("sellerName"),
      sellerContact: formData.get("sellerContact"),
      purchaseDateInput: formData.get("purchaseDateInput"),
    }
    this.dataManager.addPurchase(purchase)
    this.updatePurchaseTable()
    this.updateDashboard()
    this.populateAnimalSelects()
    closeModal("addPurchaseModal")
    document.getElementById("addPurchaseForm").reset()
  }

  updateDashboard() {
    const stats = this.dataManager.getStats()
    document.getElementById("totalAnimals").textContent = stats.totalAnimals
    document.getElementById("totalSalesValue").textContent = `$${stats.totalSalesValue}`
    document.getElementById("totalFeedCost").textContent = `$${stats.totalFeedCost}`
    document.getElementById("avgFCR").textContent = stats.avgFCR
    this.updateRecentActivities()
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

  updateAnimalTable() {
    const tbody = document.getElementById("animalRecordsBody")
    const animals = this.dataManager.animals
    if (animals.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="10">No animals added yet. Click "Add Animal" to get started.</td></tr>'
      return
    }

    tbody.innerHTML = animals
      .map(
        (animal) => `
      <tr>
        <td>${animal.animalId}</td>
        <td>${animal.animalName}</td>
        <td>${animal.breed}</td>
        <td>${animal.feedType}</td>
        <td>${animal.dailyFeedQuantity}</td>
        <td>$${animal.feedCostPerUnit}</td>
        <td>${animal.currentWeight}</td>
        <td>${animal.fcr}</td>
        <td>${animal.lastVaccination || "N/A"}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewAnimalDetails('${animal.animalId}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn-icon" title="Edit" onclick="editAnimal('${animal.animalId}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
            <button class="btn-icon btn-danger" title="Delete" onclick="deleteAnimal('${animal.animalId}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
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
    const tbody = document.getElementById("salesTableBody")
    const sales = this.dataManager.sales
    if (sales.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="8">No sales recorded yet. Click "Record Sale" to add your first sale.</td></tr>'
      return
    }

    tbody.innerHTML = sales
      .map(
        (sale) => `
      <tr>
        <td>${sale.id}</td>
        <td>${sale.saleAnimalId}</td>
        <td>${sale.breed || "N/A"}</td>
        <td>${sale.saleWeight}</td>
        <td>$${sale.salePrice}</td>
        <td>${sale.buyerName}</td>
        <td>${sale.saleDate}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn-icon" title="Print Receipt">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6,9 6,2 18,2 18,9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("")
  }

  updatePurchaseTable() {
    const tbody = document.getElementById("purchaseTableBody")
    const purchases = this.dataManager.purchases
    if (purchases.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="9">No purchases recorded yet. Click "Record Purchase" to add your first purchase.</td></tr>'
      return
    }

    tbody.innerHTML = purchases
      .map(
        (purchase) => `
      <tr>
        <td>${purchase.id}</td>
        <td>${purchase.purchaseAnimalId}</td>
        <td>${purchase.purchaseBreed}</td>
        <td>${purchase.purchaseGender}</td>
        <td>${purchase.purchaseWeight}</td>
        <td>$${purchase.purchasePrice}</td>
        <td>${purchase.sellerName}</td>
        <td>${purchase.purchaseDateInput}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn-icon" title="Edit">
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

  populateAnimalSelects() {
    const saleAnimalSelect = document.getElementById("saleAnimalId")
    if (saleAnimalSelect) {
      saleAnimalSelect.innerHTML =
        '<option value="">Select Animal</option>' +
        this.dataManager.animals
          .map(
            (animal) =>
              `<option value="${animal.animalId}">${animal.animalId} - ${animal.animalName} (${animal.breed})</option>`,
          )
          .join("")
    }
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

    // Sales Search
    const salesSearch = document.getElementById("salesSearch")
    if (salesSearch) {
      salesSearch.addEventListener("input", (e) => {
        this.filterTable("salesTable", e.target.value, "search")
      })
    }

    // Purchase Search
    const purchaseSearch = document.getElementById("purchaseSearch")
    if (purchaseSearch) {
      purchaseSearch.addEventListener("input", (e) => {
        this.filterTable("purchaseTable", e.target.value, "search")
      })
    }
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
        const typeCell = cells[2] // Breed column
        shouldShow = typeCell.textContent.toLowerCase().includes(searchTerm)
      }

      row.style.display = shouldShow ? "" : "none"
    })
  }

  sortTable(table, column) {
    const tbody = table.querySelector("tbody")
    const rows = Array.from(tbody.querySelectorAll("tr:not(.empty-state)"))
    const isAscending = this.sortDirection[column] !== "asc"
    this.sortDirection[column] = isAscending ? "asc" : "desc"

    const columnIndex = Array.from(table.querySelectorAll("th")).findIndex((th) => th.dataset.sort === column)

    rows.sort((a, b) => {
      const aValue = a.cells[columnIndex].textContent.trim()
      const bValue = b.cells[columnIndex].textContent.trim()

      // Handle numeric values
      if (!isNaN(aValue) && !isNaN(bValue)) {
        return isAscending ? aValue - bValue : bValue - aValue
      }

      // Handle text values
      return isAscending ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
    })

    // Clear and re-append sorted rows
    const emptyState = tbody.querySelector(".empty-state")
    tbody.innerHTML = ""
    if (emptyState) tbody.appendChild(emptyState)
    rows.forEach((row) => tbody.appendChild(row))

    // Update header indicators
    table.querySelectorAll("th").forEach((th) => {
      th.classList.remove("sort-asc", "sort-desc")
    })
    const header = table.querySelector(`th[data-sort="${column}"]`)
    header.classList.add(isAscending ? "sort-asc" : "sort-desc")
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    document.querySelector(`[data-tab="${tabName}"]`).classList.add("active")

    // Update tab content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active")
    })
    document.getElementById(`${tabName}-tab`).classList.add("active")

    this.currentTab = tabName

    // Update tables when switching tabs
    if (tabName === "sales") {
      this.updateSalesTable()
    } else if (tabName === "purchases") {
      this.updatePurchaseTable()
    }
  }

  initializeCharts() {
    // Simple chart placeholders - in a real app, you'd use Chart.js or similar
    const chartContainers = document.querySelectorAll(".chart-container")
    chartContainers.forEach((container) => {
      if (!container.querySelector("canvas")) return
      const canvas = container.querySelector("canvas")
      const ctx = canvas.getContext("2d")
      // Simple line chart simulation
      this.drawSimpleChart(ctx, canvas.width, canvas.height)
    })
  }

  drawSimpleChart(ctx, width, height) {
    ctx.clearRect(0, 0, width, height)
    // Draw axes
    ctx.strokeStyle = "#e5e7eb"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(40, height - 40)
    ctx.lineTo(width - 20, height - 40)
    ctx.moveTo(40, 20)
    ctx.lineTo(40, height - 40)
    ctx.stroke()

    // Draw sample data line
    ctx.strokeStyle = "#2563eb"
    ctx.lineWidth = 2
    ctx.beginPath()
    const points = [
      { x: 60, y: height - 60 },
      { x: 120, y: height - 80 },
      { x: 180, y: height - 70 },
      { x: 240, y: height - 90 },
      { x: 300, y: height - 85 },
      { x: 360, y: height - 95 },
    ]
    points.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.stroke()

    // Draw data points
    ctx.fillStyle = "#2563eb"
    points.forEach((point) => {
      ctx.beginPath()
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI)
      ctx.fill()
    })
  }

  updateCharts() {
    // Re-draw charts when market tab is activated
    setTimeout(() => {
      this.initializeCharts()
    }, 100)
  }

  handleSidebarMouseEnter() {
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout)
      this.hoverTimeout = null
    }
    this.expandSidebar()
  }

  handleSidebarMouseLeave() {
    this.hoverTimeout = setTimeout(() => {
      this.collapseSidebar()
    }, 300)
  }

  handleMainContentClick() {
    if (this.isExpanded) {
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
        dashboard: "Farmer Dashboard",
        animals: "Animal Records",
        "sales-purchases": "Sales & Purchases",
        "market-prices": "Market Analysis",
        traders: "Trader Selections",
        settings: "Settings",
      }
      this.headerTitle.textContent = titles[sectionName] || "Meatrix Dashboard"
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
      case "sales-purchases":
        sectionId = "sales-purchases-section"
        this.updateSalesTable()
        this.updatePurchaseTable()
        break
      case "market-prices":
        sectionId = "market-prices-section"
        this.updateCharts()
        break
      case "traders":
        sectionId = "traders-section"
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

    this.populateAnimalSelects()
  }

  expandSidebar() {
    this.isExpanded = true
    this.sidebar.classList.add("expanded")
    this.mainContent.classList.add("expanded")
    this.header.classList.add("expanded")
    this.headerTitle.classList.add("hidden")
  }

  collapseSidebar() {
    this.isExpanded = false
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

function showEditAnimalModal(animalId) {
  const animal = dashboard.dataManager.getAnimalById(animalId)
  if (!animal) {
    alert("Animal not found!")
    return
  }

  // Populate the edit form with current animal data
  document.getElementById("editAnimalId").value = animal.animalId
  document.getElementById("editAnimalName").value = animal.animalName
  document.getElementById("editAnimalType").value = animal.animalType
  document.getElementById("editBreed").value = animal.breed
  document.getElementById("editGender").value = animal.gender
  document.getElementById("editCurrentWeight").value = animal.currentWeight
  document.getElementById("editFeedType").value = animal.feedType
  document.getElementById("editDailyFeedQuantity").value = animal.dailyFeedQuantity
  document.getElementById("editFeedCostPerUnit").value = animal.feedCostPerUnit
  document.getElementById("editPurchaseDate").value = animal.purchaseDate
  document.getElementById("editLastVaccination").value = animal.lastVaccination || ""
  document.getElementById("editVaccinationType").value = animal.vaccinationType || ""

  // Show the modal
  document.getElementById("editAnimalModal").classList.add("active")
}

function showAddSaleModal() {
  const animals = dashboard.dataManager.animals
  if (animals.length === 0) {
    alert("Please add animals first before recording sales.")
    return
  }
  document.getElementById("addSaleModal").classList.add("active")
}

function showAddPurchaseModal() {
  document.getElementById("addPurchaseModal").classList.add("active")
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active")
}

// Global functions for button actions
function viewAnimalDetails(animalId) {
  const animal = dashboard.dataManager.animals.find((a) => a.animalId === animalId)
  if (animal) {
    alert(
      `Animal Details:\n\nID: ${animal.animalId}\nName: ${animal.animalName}\nBreed: ${animal.breed}\nWeight: ${animal.currentWeight}kg\nFeed Type: ${animal.feedType}\nDaily Feed: ${animal.dailyFeedQuantity}kg\nFCR: ${animal.fcr}`,
    )
  }
}

function editAnimal(animalId) {
  showEditAnimalModal(animalId)
}

function deleteAnimal(animalId) {
  if (confirm(`Are you sure you want to delete animal ${animalId}?`)) {
    const index = dashboard.dataManager.animals.findIndex((a) => a.animalId === animalId)
    if (index !== -1) {
      dashboard.dataManager.animals.splice(index, 1)
      dashboard.dataManager.addActivity(`Deleted animal: ${animalId}`)
      dashboard.dataManager.saveData()
      dashboard.updateAnimalTable()
      dashboard.updateDashboard()
      dashboard.populateAnimalSelects()
    }
  }
}

// Global dashboard instance
let dashboard

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  dashboard = new Dashboard()
  initializeApp()
  setupEventListeners()
  generateParticles()
})

function initializeApp() {
  // Add fade-in animation to content wrapper
  const contentWrapper = document.querySelector(".content-wrapper")
  contentWrapper.classList.add("fade-in")

  // Set initial step
  showStep("login")
}

function setupEventListeners() {
  // Form submissions
  elements.loginForm.addEventListener("submit", handleLogin)

  // Button clicks
  elements.switchToSignup.addEventListener("click", () => showStep("signup"))
  elements.passwordToggle.addEventListener("click", togglePassword)
  elements.backBtn.addEventListener("click", goBackToLogin)
  elements.createAccountBtn.addEventListener("click", handleCreateAccount)
  elements.copyDetailsBtn.addEventListener("click", copyLoginDetails)
  elements.proceedToLoginBtn.addEventListener("click", proceedToLogin)

  // Input events for clearing messages
  elements.loginId.addEventListener("input", clearMessages)
  elements.password.addEventListener("input", clearMessages)
  elements.userEmail.addEventListener("input", clearMessages)
  elements.userPassword.addEventListener("input", clearMessages)
  elements.confirmPassword.addEventListener("input", clearMessages)

  // Close popup when clicking outside
  elements.successPopup.addEventListener("click", (e) => {
    if (e.target === elements.successPopup) {
      closeSuccessPopup()
    }
  })
}

function generateParticles() {
  const particlesContainer = document.querySelector(".particles-container")
  const particleCount = 20

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div")
    particle.className = "particle"
    particle.style.left = Math.random() * 100 + "%"
    particle.style.top = Math.random() * 100 + "%"
    particle.style.animationDelay = Math.random() * 2 + "s"
    particlesContainer.appendChild(particle)
  }
}

function showStep(step) {
  // Hide all steps
  document.querySelectorAll(".step-container").forEach((container) => {
    container.classList.remove("active")
    container.classList.add("prev")
  })

  // Show target step
  setTimeout(() => {
    const targetStep = document.getElementById(step + "Step")
    if (targetStep) {
      targetStep.classList.remove("prev")
      targetStep.classList.add("active")
    }
    currentStep = step
  }, 100)
}

function showLoading(title = "Processing...", subtitle = "Please wait while we process your request") {
  elements.loadingTitle.textContent = title
  elements.loadingSubtitle.textContent = subtitle
  elements.loadingOverlay.classList.remove("hidden")
  isLoading = true

  // Update button states
  updateButtonStates()
}

function hideLoading() {
  elements.loadingOverlay.classList.add("hidden")
  isLoading = false

  // Update button states
  updateButtonStates()
}

function updateButtonStates() {
  const buttons = [elements.loginBtn, elements.createAccountBtn]

  buttons.forEach((btn) => {
    if (btn) {
      if (isLoading) {
        btn.classList.add("loading")
        btn.disabled = true

        // Update button text
        const btnText = btn.querySelector(".btn-text")
        if (btnText) {
          if (btn === elements.loginBtn) btnText.textContent = "Signing In..."
          else if (btn === elements.createAccountBtn) btnText.textContent = "Creating Account..."
        }
      } else {
        btn.classList.remove("loading")
        btn.disabled = false

        // Restore button text
        const btnText = btn.querySelector(".btn-text")
        if (btnText) {
          if (btn === elements.loginBtn) btnText.textContent = "Sign In"
          else if (btn === elements.createAccountBtn) btnText.textContent = "Sign Up"
        }
      }
    }
  })
}

function showError(message) {
  elements.errorText.textContent = message
  elements.errorMessage.classList.remove("hidden")
  elements.successMessage.classList.add("hidden")

  // Auto-hide after 4 seconds
  setTimeout(() => {
    elements.errorMessage.classList.add("hidden")
  }, 4000)
}

function showSuccess(message) {
  elements.successText.textContent = message
  elements.successMessage.classList.remove("hidden")
  elements.errorMessage.classList.add("hidden")

  // Auto-hide after 3 seconds
  setTimeout(() => {
    elements.successMessage.classList.add("hidden")
  }, 3000)
}

function clearMessages() {
  elements.errorMessage.classList.add("hidden")
  elements.successMessage.classList.add("hidden")
}

// Generate unique user ID from email
function generateUniqueId(email) {
  const emailPrefix = email.split("@")[0].toLowerCase()
  let number = Math.floor(Math.random() * 999) + 1
  let newId = emailPrefix + number

  // Ensure ID is unique by checking against existing users
  while (users.find((u) => u.id === newId)) {
    number = Math.floor(Math.random() * 999) + 1
    newId = emailPrefix + number
  }

  return newId
}

// Check if email already exists
function emailExists(email) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

async function handleLogin(e) {
  e.preventDefault()
  clearMessages()

  const loginId = elements.loginId.value.trim()
  const password = elements.password.value

  if (!loginId || !password) {
    showError("Please fill in all fields")
    return
  }

  showLoading("Authenticating...", "Please wait while we verify your credentials")

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Find user by ID or email
  const user = users.find(
    (u) => u.id.toLowerCase() === loginId.toLowerCase() || u.email.toLowerCase() === loginId.toLowerCase(),
  )

  if (!user) {
    hideLoading()
    showError("User not found. Please check your credentials or create a new account.")
    return
  }

  if (user.password !== password) {
    hideLoading()
    showError("Incorrect password. Please try again.")
    return
  }

  // Successful login
  currentUser = user
  hideLoading()
  showSuccess("Login successful!")

  setTimeout(() => {
    localStorage.setItem("currentUser", JSON.stringify(user))
    // In a real app, redirect to dashboard
    alert(`Welcome back, ${user.name}! Redirecting to dashboard...`)
  }, 2000)
}

async function handleCreateAccount() {
  clearMessages()

  const email = elements.userEmail.value.trim()
  const userType = elements.userType.value
  const password = elements.userPassword.value
  const confirmPassword = elements.confirmPassword.value

  // Validation
  if (!email || !userType || !password || !confirmPassword) {
    showError("Please fill in all fields")
    return
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    showError("Please enter a valid email address")
    return
  }

  // Check if email already exists
  if (emailExists(email)) {
    showError("An account with this email already exists")
    return
  }

  if (password.length < 6) {
    showError("Password must be at least 6 characters long")
    return
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match")
    return
  }

  showLoading("Creating Account...", "Generating your unique ID and setting up your profile")

  // Simulate account creation delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Generate unique ID from email
  const generatedId = generateUniqueId(email)

  // Create new user
  const newUser = {
    id: generatedId,
    email: email,
    password: password,
    userType: userType,
    createdAt: new Date().toISOString(),
  }

  // Add to users array
  users.push(newUser)
  currentUser = newUser

  hideLoading()

  // Show success popup with login details
  showSuccessPopup(newUser)

  // Save to localStorage for persistence
  localStorage.setItem("users", JSON.stringify(users))
}

function showSuccessPopup(user) {
  const userTypeLabel = USER_TYPES.find((type) => type.value === user.userType)?.label || user.userType

  // Populate popup with user details
  elements.popupUserId.textContent = user.id
  elements.popupUserEmail.textContent = user.email
  elements.popupUserType.textContent = userTypeLabel

  // Show popup
  elements.successPopup.classList.remove("hidden")
}

function closeSuccessPopup() {
  elements.successPopup.classList.add("hidden")
}

function copyLoginDetails() {
  const details = `
Meatrix Login Details:
User ID: ${elements.popupUserId.textContent}
Email: ${elements.popupUserEmail.textContent}
Role: ${elements.popupUserType.textContent}

You can login using either your User ID or Email Address.
  `.trim()

  // Copy to clipboard
  navigator.clipboard
    .writeText(details)
    .then(() => {
      // Update button text temporarily
      const originalText = elements.copyDetailsBtn.innerHTML
      elements.copyDetailsBtn.innerHTML = `
        <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        Copied!
      `

      setTimeout(() => {
        elements.copyDetailsBtn.innerHTML = originalText
      }, 2000)
    })
    .catch(() => {
      alert("Details copied to clipboard!")
    })
}

function proceedToLogin() {
  closeSuccessPopup()
  showStep("login")

  // Pre-fill login form with the new user's ID
  if (currentUser) {
    elements.loginId.value = currentUser.id
    elements.loginId.focus()
  }

  // Clear signup form
  elements.userEmail.value = ""
  elements.userType.value = ""
  elements.userPassword.value = ""
  elements.confirmPassword.value = ""
}

function togglePassword() {
  const passwordInput = elements.password
  const eyeIcon = elements.eyeIcon

  if (passwordInput.type === "password") {
    passwordInput.type = "text"
    eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        `
  } else {
    passwordInput.type = "password"
    eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        `
  }
}

function goBackToLogin() {
  showStep("login")
  clearMessages()

  // Clear signup form
  elements.userEmail.value = ""
  elements.userType.value = ""
  elements.userPassword.value = ""
  elements.confirmPassword.value = ""
}

// Load users from localStorage on page load
window.addEventListener("load", () => {
  const savedUsers = localStorage.getItem("users")
  if (savedUsers) {
    users = JSON.parse(savedUsers)
  }
})

// Handle window resize for responsive design
window.addEventListener("resize", () => {
  // Regenerate particles on resize
  const particlesContainer = document.querySelector(".particles-container")
  particlesContainer.innerHTML = ""
  generateParticles()
})

// Prevent form submission on Enter key in signup form
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && currentStep === "signup") {
    e.preventDefault()
    handleCreateAccount()
  }
})

// Close popup with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !elements.successPopup.classList.contains("hidden")) {
    closeSuccessPopup()
  }
})

// Console log for debugging
console.log("Meatrix Authentication System Loaded")
console.log("Available User Types:", USER_TYPES)
console.log("Current Users:", users)

// Add Event Listener
function ActivateButtonsOnPage(){
  document.querySelectorAll(".js-show-add-animal-modal").forEach((EachAddAnimalButton)=>{
    EachAddAnimalButton.addEventListener('click',()=>{
      showAddAnimalModal();
    });
  });
  document.querySelectorAll(".js-show-add-sale-modal").forEach((EachAddSaleButton)=>{
    EachAddSaleButton.addEventListener('click',()=>{
      showAddSaleModal();
    });
  });
  document.querySelectorAll(".js-show-add-purchase-modal").forEach((EachAddPurchaseButton)=>{
    EachAddPurchaseButton.addEventListener('click',()=>{
      showAddPurchaseModal();
    });
  });

  //Closing Button Add Event Listener
  document.querySelectorAll(".js-close-modal-addAnimalModal").forEach((closeButton)=>{
    closeButton.addEventListener('click',()=>{
      closeModal('addAnimalModal');
    });
  });
  document.querySelectorAll(".js-close-modal-editAnimalModal").forEach((closeButton)=>{
    closeButton.addEventListener('click',()=>{
      closeModal('editAnimalModal');
    });
  });
  document.querySelectorAll(".js-close-modal-addSaleModal").forEach((closeButton)=>{
    closeButton.addEventListener('click',()=>{
      closeModal('addSaleModal');
    });
  });
  document.querySelectorAll(".js-close-modal-addPurchaseModal").forEach((closeButton)=>{
    closeButton.addEventListener('click',()=>{
      closeModal('addPurchaseModal');
    });
  });
  document.querySelector(".js-CheckMarket-button-dashboardOnClick-market-prices").addEventListener('click',()=>{
    dashboard.showSection('market-prices');
  });
};
ActivateButtonsOnPage();
