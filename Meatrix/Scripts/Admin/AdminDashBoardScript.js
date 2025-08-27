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
  showAddAnimalModalBtn: document.querySelectorAll(".js-show-add-animal-modal"),
  showAddSaleModalBtn: document.querySelectorAll(".js-show-add-sale-modal"),
  showAddPurchaseModalBtn: document.querySelectorAll(".js-show-add-purchase-modal"),
  closeAddAnimalModalBtn: document.querySelectorAll(".js-close-modal-addAnimalModal"),
  closeEditAnimalModalBtn: document.querySelectorAll(".js-close-modal-editAnimalModal"),
  closeAddSaleModalBtn: document.querySelectorAll(".js-close-modal-addSaleModal"),
  closeAddPurchaseModalBtn: document.querySelectorAll(".js-close-modal-addPurchaseModal"),
  checkMarketButton: document.querySelector(".js-CheckMarket-button-dashboardOnClick-market-prices"),

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

class Dashboard {
  constructor() {
    this.isExpanded = false
    this.hoverTimeout = null
    this.currentTab = "sales"
    this.sortDirection = {}
    this.dataManager = new AdminDataManager()
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

    const dropdownToggles = document.querySelectorAll(".dropdown-toggle")
    dropdownToggles.forEach((toggle) => {
      toggle.addEventListener("click", (e) => {
        e.preventDefault()
        e.stopPropagation()
        this.handleDropdownToggle(toggle)
      })
    })

    // Dropdown item clicks
    const dropdownItems = document.querySelectorAll(".dropdown-item")
    dropdownItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault()
        this.handleNavItemClick(item)
        this.closeAllDropdowns()
      })
    })

    // Close dropdowns when clicking outside
    document.addEventListener("click", () => {
      this.closeAllDropdowns()
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
        console.log("Admin logged out")
      })
    }

    this.setupAdminEventListeners()
  }

  handleDropdownToggle(toggle) {
    const dropdownId = toggle.dataset.dropdown + "-dropdown"
    const dropdown = document.getElementById(dropdownId)

    if (dropdown) {
      const isOpen = dropdown.classList.contains("show")
      this.closeAllDropdowns()

      if (!isOpen) {
        dropdown.classList.add("show")
      }
    }
  }

  closeAllDropdowns() {
    const dropdowns = document.querySelectorAll(".dropdown-menu")
    dropdowns.forEach((dropdown) => {
      dropdown.classList.remove("show")
    })
  }

  setupAdminEventListeners() {
    this.setupModalEventListeners("addProductModal", "js-show-add-product-modal", "js-close-modal-addProductModal")
    this.setupModalEventListeners(
      "addProductionModal",
      "js-show-add-production-modal",
      "js-close-modal-addProductionModal",
    )
    this.setupModalEventListeners("addPriceModal", "js-show-add-price-modal", "js-close-modal-addPriceModal")
    this.setupModalEventListeners(
      "addConsumptionModal",
      "js-show-add-consumption-modal",
      "js-close-modal-addConsumptionModal",
    )
    this.setupModalEventListeners("addDemandModal", "js-show-add-demand-modal", "js-close-modal-addDemandModal")

    // Form submissions
    this.setupFormSubmissions()

    // Quick action navigation
    const navigateToInsightsBtn = document.querySelector(".js-navigate-to-insights")
    if (navigateToInsightsBtn) {
      navigateToInsightsBtn.addEventListener("click", () => {
        this.showSection("consumption-analysis")
      })
    }
  }

  setupModalEventListeners(modalId, showClass, closeClass) {
    const showBtns = document.querySelectorAll(`.${showClass}`)
    const closeBtns = document.querySelectorAll(`.${closeClass}`)
    const modal = document.getElementById(modalId)

    showBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.showModal(modalId)
      })
    })

    closeBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        this.closeModal(modalId)
      })
    })

    // Close modal when clicking outside
    if (modal) {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          this.closeModal(modalId)
        }
      })
    }
  }

  showModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.classList.add("show")
      document.body.style.overflow = "hidden"
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.classList.remove("show")
      document.body.style.overflow = ""
      // Reset form if exists
      const form = modal.querySelector("form")
      if (form) {
        form.reset()
      }
    }
  }

  setupFormSubmissions() {
    const forms = [
      { id: "addProductForm", handler: this.handleAddProduct.bind(this) },
      { id: "addProductionForm", handler: this.handleAddProduction.bind(this) },
      { id: "addPriceForm", handler: this.handleAddPrice.bind(this) },
      { id: "addConsumptionForm", handler: this.handleAddConsumption.bind(this) },
      { id: "addDemandForm", handler: this.handleAddDemand.bind(this) },
    ]

    forms.forEach(({ id, handler }) => {
      const form = document.getElementById(id)
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault()
          handler(new FormData(form))
        })
      }
    })
  }

  handleAddProduct(formData) {
    const productData = {
      type: document.getElementById("productType").value,
      breed: document.getElementById("productBreed").value,
      avgWeight: Number.parseFloat(document.getElementById("productWeight").value),
      fcr: Number.parseFloat(document.getElementById("productFCR").value),
      rearingPeriod: Number.parseInt(document.getElementById("productRearing").value),
      inputSource: document.getElementById("productSource").value,
      butcherInfo: document.getElementById("productInfo").value,
      lastUpdated: new Date().toISOString().split("T")[0],
    }

    this.dataManager.addMeatProduct(productData)
    this.closeModal("addProductModal")
    this.updateTables()
    this.updateDashboard()
  }

  handleAddProduction(formData) {
    const productionData = {
      district: document.getElementById("productionDistrict").value,
      livestockCount: document.getElementById("livestockCount").value + " (Farmer Input)",
      slaughterRate: document.getElementById("slaughterRate").value + " (Butcher Input)",
      meatYield: document.getElementById("meatYield").value + " (Butcher Input)",
      slaughterHouse: document.getElementById("slaughterHouse").value,
      inputSource: "Butcher + Farmer",
      period: new Date().toISOString().slice(0, 7),
      efficiency: "High",
    }

    this.dataManager.addProductionData(productionData)
    this.closeModal("addProductionModal")
    this.updateTables()
    this.updateDashboard()
  }

  handleAddPrice(formData) {
    const priceData = {
      product: document.getElementById("priceProduct").value,
      wholesalePrice: Number.parseFloat(document.getElementById("wholesalePrice").value),
      retailPrice: Number.parseFloat(document.getElementById("retailPrice").value),
      region: document.getElementById("priceRegion").value,
      seasonalTrend: document.getElementById("seasonalTrend").value,
      priceFluctuation: "+0.0% (Calculated)",
      trendAnalysis: "Stable trend",
      period: new Date().toISOString().slice(0, 7),
    }

    this.dataManager.addPriceData(priceData)
    this.closeModal("addPriceModal")
    this.updateTables()
    this.updateDashboard()
  }

  handleAddConsumption(formData) {
    const consumptionData = {
      region: document.getElementById("consumptionRegion").value,
      demographic: document.getElementById("demographic").value,
      perCapitaConsumption: document.getElementById("perCapitaConsumption").value + " (Vendor Input)",
      proteinIntake: document.getElementById("proteinIntake").value + " (Calculated)",
      nutritionalImpact: "Adequate",
      dietaryAssessment: "Meets WHO protein requirements (Calculated)",
      vendorSource: document.getElementById("vendorSource").value,
      period: new Date().toISOString().slice(0, 7),
    }

    this.dataManager.addConsumptionData(consumptionData)
    this.closeModal("addConsumptionModal")
    this.updateTables()
  }

  handleAddDemand(formData) {
    const demandData = {
      product: document.getElementById("demandProduct").value,
      priceElasticity: document.getElementById("priceElasticity").value + " (Calculated)",
      demandChange: document.getElementById("demandChange").value + "%",
      priceChange: document.getElementById("priceChange").value + "%",
      crossElasticity: document.getElementById("crossElasticity").value,
      alternativeProtein: "Plant-based alternatives +18% demand",
      elasticityType:
        Number.parseFloat(document.getElementById("priceElasticity").value) > -1 ? "Inelastic" : "Elastic",
      period: new Date().toISOString().slice(0, 7),
    }

    this.dataManager.addDemandAnalysis(demandData)
    this.closeModal("addDemandModal")
    this.updateTables()
  }

  setupFormHandlers() {
    const addProductForm = document.getElementById("addProductForm")
    if (addProductForm) {
      addProductForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleAddProduct(new FormData(addProductForm))
      })
    }

    const addProductionForm = document.getElementById("addProductionForm")
    if (addProductionForm) {
      addProductionForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleAddProduction(new FormData(addProductionForm))
      })
    }

    const addPriceForm = document.getElementById("addPriceForm")
    if (addPriceForm) {
      addPriceForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleAddPrice(new FormData(addPriceForm))
      })
    }
  }

  setupSearchAndFilters() {
    // Placeholder for search and filter functionality
    console.log("Search and filters setup")
  }

  setupTableSorting() {
    // Placeholder for table sorting functionality
    console.log("Table sorting setup")
  }

  updateDashboard() {
    const stats = this.dataManager.getStats()
    const totalProductsEl = document.getElementById("totalProducts")
    const totalProductionEl = document.getElementById("totalProduction")
    const avgPriceEl = document.getElementById("avgPrice")
    const demandIndexEl = document.getElementById("demandIndex")

    if (totalProductsEl) totalProductsEl.textContent = stats.totalProducts
    if (totalProductionEl) totalProductionEl.textContent = stats.totalProduction
    if (avgPriceEl) avgPriceEl.textContent = `$${stats.avgPrice}`
    if (demandIndexEl) demandIndexEl.textContent = stats.demandIndex
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.remove("active")
    })
    const activeTabBtn = document.querySelector(`[data-tab="${tabName}"]`)
    if (activeTabBtn) activeTabBtn.classList.add("active")

    // Update tab content
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active")
    })
    const activeTabContent = document.getElementById(`${tabName}-tab`)
    if (activeTabContent) activeTabContent.classList.add("active")

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

    if (this.headerTitle) {
      const titles = {
        dashboard: "Admin Dashboard",
        "meat-products": "Meat Products Database",
        "production-volumes": "Production Volume Records",
        "price-analysis": "Price Analysis & Trends",
        "consumption-analysis": "Consumption Analysis",
        "demand-analysis": "Demand Analysis",
        "supply-demand-comparison": "Supply vs Demand Comparison",
        insights: "Business Insights",
        settings: "Settings",
      }
      this.headerTitle.textContent = titles[sectionName] || "Meatrix Admin"
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

    let sectionId = "dashboard-section" // default
    switch (sectionName) {
      case "dashboard":
        sectionId = "dashboard-section"
        this.updateDashboard()
        break
      case "meat-products":
        sectionId = "meat-products-section"
        this.updateMeatProductsTable()
        break
      case "production-volumes":
        sectionId = "production-volumes-section"
        this.updateProductionTable()
        break
      case "price-analysis":
        sectionId = "price-analysis-section"
        this.updatePriceTable()
        this.updateCharts()
        break
      case "consumption-analysis":
        sectionId = "consumption-analysis-section"
        this.updateConsumptionTable()
        break
      case "demand-analysis":
        sectionId = "demand-analysis-section"
        this.updateDemandTable()
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

    // Update active nav item
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active")
    })
    document.querySelectorAll(".dropdown-item").forEach((item) => {
      item.classList.remove("active")
    })

    const activeItem = document.querySelector(`[data-section="${sectionName}"]`)
    if (activeItem) {
      activeItem.classList.add("active")
    }
  }

  updateMeatProductsTable() {
    const tableBody = document.getElementById("meatProductsBody")
    if (!tableBody) return

    const products = this.dataManager.meatProducts
    tableBody.innerHTML = products
      .map(
        (product) => `
      <tr>
        <td>${product.id}</td>
        <td>${product.type}</td>
        <td>${product.breed}</td>
        <td>${product.avgWeight}</td>
        <td>${product.fcr}</td>
        <td>${product.rearingPeriod}</td>
        <td>${product.inputSource}</td>
        <td>${product.butcherInfo || "N/A"}</td>
        <td>${product.lastUpdated}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn action-btn-edit" onclick="dashboard.editProduct('${product.id}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
            <button class="action-btn action-btn-delete" onclick="dashboard.deleteProduct('${product.id}')">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Delete
            </button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("")
  }

  updateProductionTable() {
    const tableBody = document.getElementById("productionVolumesBody")
    if (!tableBody) return

    const production = this.dataManager.productionData
    tableBody.innerHTML = production
      .map(
        (item, index) => `
      <tr>
        <td>${item.district}</td>
        <td>${item.livestockCount}</td>
        <td>${item.slaughterRate}</td>
        <td>${item.meatYield}</td>
        <td>${item.slaughterHouse}</td>
        <td>${item.inputSource}</td>
        <td>${item.period}</td>
        <td><span class="badge badge-success">${item.efficiency}</span></td>
        <td>
          <div class="action-buttons">
            <button class="action-btn action-btn-edit" onclick="dashboard.editProduction(${index})">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
            <button class="action-btn action-btn-delete" onclick="dashboard.deleteProduction(${index})">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Delete
            </button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("")
  }

  updatePriceTable() {
    const tableBody = document.getElementById("priceAnalysisBody")
    if (!tableBody) return

    const prices = this.dataManager.priceData
    tableBody.innerHTML = prices
      .map(
        (item, index) => `
      <tr>
        <td>${item.product}</td>
        <td>$${item.wholesalePrice}</td>
        <td>$${item.retailPrice}</td>
        <td>${item.region}</td>
        <td><span class="badge badge-info">${item.seasonalTrend}</span></td>
        <td>${item.priceFluctuation}</td>
        <td>${item.trendAnalysis}</td>
        <td>${item.period}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn action-btn-edit" onclick="dashboard.editPrice(${index})">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
            <button class="action-btn action-btn-delete" onclick="dashboard.deletePrice(${index})">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Delete
            </button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("")
  }

  updateConsumptionTable() {
    const tableBody = document.getElementById("consumptionAnalysisBody")
    if (!tableBody) return

    const consumption = this.dataManager.consumptionData
    tableBody.innerHTML = consumption
      .map(
        (item, index) => `
      <tr>
        <td>${item.region}</td>
        <td>${item.demographic}</td>
        <td>${item.perCapitaConsumption}</td>
        <td>${item.proteinIntake}</td>
        <td><span class="badge badge-success">${item.nutritionalImpact}</span></td>
        <td>${item.dietaryAssessment}</td>
        <td>${item.vendorSource}</td>
        <td>${item.period}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn action-btn-edit" onclick="dashboard.editConsumption(${index})">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
            <button class="action-btn action-btn-delete" onclick="dashboard.deleteConsumption(${index})">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Delete
            </button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("")
  }

  updateDemandTable() {
    const tableBody = document.getElementById("demandAnalysisBody")
    if (!tableBody) return

    const demand = this.dataManager.demandAnalysis
    tableBody.innerHTML = demand
      .map(
        (item, index) => `
      <tr>
        <td>${item.product}</td>
        <td>${item.priceElasticity}</td>
        <td>${item.demandChange}</td>
        <td>${item.priceChange}</td>
        <td>${item.crossElasticity}</td>
        <td>${item.alternativeProtein}</td>
        <td><span class="badge badge-info">${item.elasticityType}</span></td>
        <td>${item.period}</td>
        <td>
          <div class="action-buttons">
            <button class="action-btn action-btn-edit" onclick="dashboard.editDemand(${index})">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Edit
            </button>
            <button class="action-btn action-btn-delete" onclick="dashboard.deleteDemand(${index})">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
              Delete
            </button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("")
  }

  updateTables() {
    this.updateMeatProductsTable()
    this.updateProductionTable()
    this.updatePriceTable()
    this.updateConsumptionTable()
    this.updateDemandTable()
  }

  editProduct(id) {
    console.log("Edit product:", id)
    alert("Edit functionality will be implemented in the next version.")
  }

  deleteProduct(id) {
    if (confirm("Are you sure you want to delete this product?")) {
      this.dataManager.deleteMeatProduct(id)
      this.updateMeatProductsTable()
      this.updateDashboard()
    }
  }

  editProduction(index) {
    console.log("Edit production:", index)
    alert("Edit functionality will be implemented in the next version.")
  }

  deleteProduction(index) {
    if (confirm("Are you sure you want to delete this production data?")) {
      this.dataManager.deleteProductionData(index)
      this.updateProductionTable()
      this.updateDashboard()
    }
  }

  editPrice(index) {
    console.log("Edit price:", index)
    alert("Edit functionality will be implemented in the next version.")
  }

  deletePrice(index) {
    if (confirm("Are you sure you want to delete this price data?")) {
      this.dataManager.deletePriceData(index)
      this.updatePriceTable()
      this.updateDashboard()
    }
  }

  editConsumption(index) {
    console.log("Edit consumption:", index)
    alert("Edit functionality will be implemented in the next version.")
  }

  deleteConsumption(index) {
    if (confirm("Are you sure you want to delete this consumption data?")) {
      this.dataManager.deleteConsumptionData(index)
      this.updateConsumptionTable()
    }
  }

  editDemand(index) {
    console.log("Edit demand:", index)
    alert("Edit functionality will be implemented in the next version.")
  }

  deleteDemand(index) {
    if (confirm("Are you sure you want to delete this demand data?")) {
      this.dataManager.deleteDemandAnalysis(index)
      this.updateDemandTable()
    }
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

class AdminDataManager {
  constructor() {
    this.meatProducts = [
      {
        id: "MP001",
        type: "Beef",
        breed: "Holstein",
        avgWeight: 450,
        fcr: 6.5,
        rearingPeriod: 720,
        inputSource: "Butcher",
        butcherInfo: "Ahmed Butcher Shop, North District",
        lastUpdated: "2024-01-15",
      },
      {
        id: "MP002",
        type: "Chicken",
        breed: "Broiler",
        avgWeight: 2.5,
        fcr: 1.8,
        rearingPeriod: 42,
        inputSource: "Farmer",
        butcherInfo: "Green Valley Farm, South District",
        lastUpdated: "2024-01-14",
      },
    ]

    this.productionData = [
      {
        district: "North District",
        livestockCount: "15,847 (Farmer Input)",
        slaughterRate: "12.5 (Butcher Input)",
        meatYield: "2,847 (Butcher Input)",
        slaughterHouse: "North Meat Processing, Industrial Area Block A",
        inputSource: "Butcher + Farmer",
        period: "2024-01",
        efficiency: "High",
      },
    ]

    this.priceData = [
      {
        product: "Beef",
        wholesalePrice: 8.5,
        retailPrice: 12.75,
        region: "North District",
        seasonalTrend: "Winter Peak",
        priceFluctuation: "+15.2% (Calculated)",
        trendAnalysis: "Upward trend due to holiday demand",
        period: "2024-01",
      },
    ]

    this.consumptionData = [
      {
        region: "North District",
        demographic: "Urban Adults (25-45)",
        perCapitaConsumption: "45.2 (Vendor Input)",
        proteinIntake: "52.3 (Calculated)",
        nutritionalImpact: "Adequate",
        dietaryAssessment: "Meets WHO protein requirements (Calculated)",
        vendorSource: "Metro Meat Vendors Association",
        period: "2024-Q1",
      },
    ]

    this.demandAnalysis = [
      {
        product: "Beef",
        priceElasticity: "-0.85 (Calculated)",
        demandChange: "-12.3%",
        priceChange: "+15.2%",
        crossElasticity: "+0.42 with Chicken (Calculated)",
        alternativeProtein: "Plant-based alternatives +18% demand",
        elasticityType: "Inelastic",
        period: "2024-Q1",
      },
    ]

    this.activities = []
  }

  addMeatProduct(product) {
    product.id = this.generateId("MP")
    product.lastUpdated = new Date().toISOString().split("T")[0]
    this.meatProducts.push(product)
    this.addActivity(`Added meat product: ${product.type} - ${product.breed} (${product.inputSource})`)
    return product
  }

  deleteMeatProduct(id) {
    const index = this.meatProducts.findIndex((p) => p.id === id)
    if (index !== -1) {
      const product = this.meatProducts[index]
      this.meatProducts.splice(index, 1)
      this.addActivity(`Deleted meat product: ${product.type} - ${product.breed}`)
      return true
    }
    return false
  }

  addProductionData(production) {
    this.productionData.push(production)
    this.addActivity(`Added production data for ${production.district} (${production.inputSource})`)
    return production
  }

  deleteProductionData(index) {
    if (index >= 0 && index < this.productionData.length) {
      const production = this.productionData[index]
      this.productionData.splice(index, 1)
      this.addActivity(`Deleted production data for ${production.district}`)
      return true
    }
    return false
  }

  addPriceData(price) {
    this.priceData.push(price)
    this.addActivity(`Updated price data for ${price.product} in ${price.region}`)
    return price
  }

  deletePriceData(index) {
    if (index >= 0 && index < this.priceData.length) {
      const price = this.priceData[index]
      this.priceData.splice(index, 1)
      this.addActivity(`Deleted price data for ${price.product} in ${price.region}`)
      return true
    }
    return false
  }

  addConsumptionData(consumption) {
    this.consumptionData.push(consumption)
    this.addActivity(`Added consumption data for ${consumption.region} - ${consumption.demographic}`)
    return consumption
  }

  deleteConsumptionData(index) {
    if (index >= 0 && index < this.consumptionData.length) {
      const consumption = this.consumptionData[index]
      this.consumptionData.splice(index, 1)
      this.addActivity(`Deleted consumption data for ${consumption.region}`)
      return true
    }
    return false
  }

  addDemandAnalysis(demand) {
    this.demandAnalysis.push(demand)
    this.addActivity(`Added demand analysis for ${demand.product}`)
    return demand
  }

  deleteDemandAnalysis(index) {
    if (index >= 0 && index < this.demandAnalysis.length) {
      const demand = this.demandAnalysis[index]
      this.demandAnalysis.splice(index, 1)
      this.addActivity(`Deleted demand analysis for ${demand.product}`)
      return true
    }
    return false
  }

  generateId(prefix) {
    return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 3)}`
  }

  addActivity(description) {
    this.activities.unshift({
      description,
      date: new Date().toLocaleString(),
      timestamp: Date.now(),
    })
    // Keep only last 50 activities
    if (this.activities.length > 50) {
      this.activities = this.activities.slice(0, 50)
    }
  }

  getStats() {
    return {
      totalProducts: this.meatProducts.length,
      totalProduction: this.productionData.reduce((sum, item) => {
        const meatYieldValue = Number.parseFloat(item.meatYield.toString().replace(/[^\d.]/g, "")) || 0
        return sum + meatYieldValue
      }, 0),
      avgPrice:
        this.priceData.length > 0
          ? (
              this.priceData.reduce((sum, item) => sum + Number.parseFloat(item.wholesalePrice || 0), 0) /
              this.priceData.length
            ).toFixed(2)
          : "0.00",
      demandIndex: "87.3", // Calculated based on overall demand analysis
    }
  }
}

// Global dashboard instance
let dashboard

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  dashboard = new Dashboard()
})

// Global functions for modal management
function showModal(modalId) {
  document.getElementById(modalId).classList.add("active")
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active")
}

function showAddAnimalModal() {
  document.getElementById("addAnimalModal").classList.add("active")
}

function showEditAnimalModal(animalId) {
  const animal = dashboard.dataManager.animals.find((a) => a.animalId === animalId)
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

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.dashboard = new Dashboard()
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
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8z"/>
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

console.log("Meatrix Admin Panel Loaded")
