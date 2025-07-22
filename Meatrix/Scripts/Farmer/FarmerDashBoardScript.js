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
    this.currentTab = "records"
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
    this.showSection("Dashboard")
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

    // Tab navigation
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

    // Initialize tab-specific functionality
    if (tabName === "market") {
      this.updateCharts()
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

    const navText = item.querySelector(".nav-text").textContent
    console.log("Navigating to:", navText)

    // Update header title based on selection
    if (this.headerTitle) {
      this.headerTitle.textContent = `Meatrix - ${navText}`
    }

    // Show appropriate section
    this.showSection(navText)
  }

  showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll(".section-content").forEach((section) => {
      section.style.display = "none"
      section.classList.remove("active")
    })

    // Show selected section
    let sectionId = "dashboard-section" // default

    switch (sectionName.toLowerCase()) {
      case "dashboard":
        sectionId = "dashboard-section"
        this.updateDashboard()
        break
      case "animals":
        sectionId = "animals-section"
        this.initializeAnimalsSection()
        break
      case "sales & purchases":
        sectionId = "sales-section"
        break
      case "market prices":
        sectionId = "market-section"
        break
      case "traders":
        sectionId = "traders-section"
        break
      case "notifications":
        sectionId = "notifications-section"
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
  }

  initializeAnimalsSection() {
    this.updateAnimalTable()
    this.updateSalesTable()
    this.updatePurchaseTable()
    this.populateAnimalSelects()

    // Initialize charts if market tab
    if (this.currentTab === "market") {
      this.updateCharts()
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

// Global functions for modal management
function showAddAnimalModal() {
  document.getElementById("addAnimalModal").classList.add("active")
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
  console.log("Editing animal:", animalId)
  alert(`Edit functionality for animal ${animalId} will be implemented here`)
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
})

// Close modals when clicking outside
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("active")
  }
})
