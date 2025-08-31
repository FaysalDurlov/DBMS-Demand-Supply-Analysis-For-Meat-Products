// Application State
const currentUser = null
const isLoading = false

// DataManager class for handling vendor data storage and retrieval
class VendorDataManager {
  constructor() {
    this.rawOrders = JSON.parse(localStorage.getItem("vendorRawOrders") || "[]")
    this.finishedProducts = JSON.parse(localStorage.getItem("vendorFinishedProducts") || "[]")
    this.customerOrders = JSON.parse(localStorage.getItem("vendorCustomerOrders") || "[]")
    this.activities = JSON.parse(localStorage.getItem("vendorActivities") || "[]")
  }

  saveData() {
    localStorage.setItem("vendorRawOrders", JSON.stringify(this.rawOrders))
    localStorage.setItem("vendorFinishedProducts", JSON.stringify(this.finishedProducts))
    localStorage.setItem("vendorCustomerOrders", JSON.stringify(this.customerOrders))
    localStorage.setItem("vendorActivities", JSON.stringify(this.activities))
  }

  generateId(prefix) {
    return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 5)}`
  }

  addRawOrder(order) {
    order.id = this.generateId("RO")
    order.orderId = order.id
    order.dateOrdered = new Date().toISOString()
    order.status = "pending"
    order.totalPrice = (Number.parseFloat(order.quantity) * Number.parseFloat(order.pricePerKg)).toFixed(2)
    this.rawOrders.push(order)
    this.addActivity(`Placed raw meat order: ${order.orderId} from ${order.agentName}`)
    this.saveData()
    return order
  }

  updateOrderStatus(orderId, newStatus, notes = "") {
    const orderIndex = this.rawOrders.findIndex((order) => order.orderId === orderId)
    if (orderIndex !== -1) {
      this.rawOrders[orderIndex].status = newStatus
      this.rawOrders[orderIndex].lastUpdated = new Date().toISOString()
      if (notes) {
        this.rawOrders[orderIndex].notes = notes
      }
      this.addActivity(`Updated order ${orderId} status to ${newStatus}`)
      this.saveData()
      return this.rawOrders[orderIndex]
    }
    return null
  }

  addFinishedProduct(product) {
    product.id = this.generateId("FP")
    product.productId = product.id
    product.dateCreated = new Date().toISOString()
    product.status = "available"
    this.finishedProducts.push(product)
    this.addActivity(`Added finished product: ${product.productName} (${product.productId})`)
    this.saveData()
    return product
  }

  addCustomerOrder(order) {
    order.id = this.generateId("CO")
    order.orderId = order.id
    order.dateOrdered = new Date().toISOString()
    order.status = "pending"
    this.customerOrders.push(order)
    this.addActivity(`Received customer order: ${order.orderId} from ${order.customerName}`)
    this.saveData()
    return order
  }

  updateCustomerOrderStatus(orderId, newStatus, notes = "") {
    const orderIndex = this.customerOrders.findIndex((order) => order.orderId === orderId)
    if (orderIndex !== -1) {
      this.customerOrders[orderIndex].status = newStatus
      this.customerOrders[orderIndex].lastUpdated = new Date().toISOString()
      if (notes) {
        this.customerOrders[orderIndex].notes = notes
      }
      this.addActivity(`Updated customer order ${orderId} status to ${newStatus}`)
      this.saveData()
      return this.customerOrders[orderIndex]
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
    const pendingOrders = this.rawOrders.filter((order) => order.status === "pending").length
    const productsReady = this.finishedProducts.filter((product) => product.status === "available").length
    const activeCustomerOrders = this.customerOrders.filter((order) => order.status !== "delivered").length
    const totalRevenue = this.customerOrders
      .filter((order) => order.status === "delivered")
      .reduce((sum, order) => sum + Number.parseFloat(order.totalPrice || 0), 0)

    return {
      pendingOrders,
      productsReady,
      customerOrders: activeCustomerOrders,
      totalRevenue: totalRevenue.toFixed(2),
    }
  }

  getInventoryStats() {
    const rawMeatStock = this.rawOrders
      .filter((order) => order.status === "delivered")
      .reduce((sum, order) => sum + Number.parseFloat(order.quantity || 0), 0)

    const finishedProductsStock = this.finishedProducts.filter((product) => product.status === "available").length

    const expiringSoon = this.finishedProducts.filter((product) => {
      const expiryDate = new Date(product.expiryDate)
      const sevenDaysFromNow = new Date()
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)
      return expiryDate <= sevenDaysFromNow && product.status === "available"
    }).length

    const lowStockItems = this.finishedProducts.filter(
      (product) => Number.parseFloat(product.productQuantity) < 10 && product.status === "available",
    ).length

    return {
      rawMeatStock: rawMeatStock.toFixed(1),
      finishedProductsStock,
      expiringSoon,
      lowStockItems,
    }
  }
}

// VendorDashboard class for managing the dashboard functionality
class VendorDashboard {
  constructor() {
    this.isExpanded = false
    this.hoverTimeout = null
    this.sortDirection = {}
    this.dataManager = new VendorDataManager()
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
    this.populateDropdowns()
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
    // Order Raw Meat Form
    const orderRawMeatForm = document.getElementById("orderRawMeatForm")
    if (orderRawMeatForm) {
      orderRawMeatForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleOrderRawMeat(new FormData(orderRawMeatForm))
      })
    }

    // Add Product Form
    const addProductForm = document.getElementById("addProductForm")
    if (addProductForm) {
      addProductForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleAddProduct(new FormData(addProductForm))
      })
    }

    // Update Order Status Form
    const updateOrderStatusForm = document.getElementById("updateOrderStatusForm")
    if (updateOrderStatusForm) {
      updateOrderStatusForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handleUpdateOrderStatus(new FormData(updateOrderStatusForm))
      })
    }
  }

  handleOrderRawMeat(formData) {
    const order = {
      agentName: formData.get("agentName"),
      meatType: formData.get("meatType"),
      animalType: formData.get("animalType"),
      quantity: formData.get("quantity"),
      pricePerKg: formData.get("pricePerKg"),
      expectedDelivery: formData.get("expectedDelivery"),
      specialRequirements: formData.get("specialRequirements"),
    }
    this.dataManager.addRawOrder(order)
    this.updateRawOrdersTable()
    this.updateDashboard()
    closeModal("orderRawMeatModal")
    document.getElementById("orderRawMeatForm").reset()
  }

  handleAddProduct(formData) {
    const product = {
      productName: formData.get("productName"),
      productSKU: formData.get("productSKU"),
      productType: formData.get("productType"),
      sourceBatchId: formData.get("sourceBatchId"),
      productQuantity: formData.get("productQuantity"),
      unit: formData.get("unit"),
      pricePerUnit: formData.get("pricePerUnit"),
      displayPrice: formData.get("displayPrice"),
      category: formData.get("category"),
      createdDate: formData.get("createdDate"),
      expiryDate: formData.get("expiryDate"),
      storageLocation: formData.get("storageLocation"),
      description: formData.get("description"),
    }

    this.dataManager.addFinishedProduct(product)
    this.updateProductsTable()
    this.updateProductCatalog()
    this.updateDashboard()
    this.updateInventoryTable()
    closeModal("addProductModal")
    document.getElementById("addProductForm").reset()
  }

  handleUpdateOrderStatus(formData) {
    const orderId = formData.get("orderIdStatus")
    const newStatus = formData.get("newStatus")
    const notes = formData.get("statusNotes")

    this.dataManager.updateOrderStatus(orderId, newStatus, notes)
    this.updateRawOrdersTable()
    this.updateDashboard()
    closeModal("updateOrderStatusModal")
    document.getElementById("updateOrderStatusForm").reset()
  }

  updateDashboard() {
    const stats = this.dataManager.getStats()
    document.getElementById("pendingOrders").textContent = stats.pendingOrders
    document.getElementById("productsReady").textContent = stats.productsReady
    document.getElementById("customerOrders").textContent = stats.customerOrders
    document.getElementById("totalRevenue").textContent = `$${stats.totalRevenue}`
    this.updateRecentActivities()
    this.updateInventoryStats()
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

  updateInventoryStats() {
    const stats = this.dataManager.getInventoryStats()
    const rawMeatStockEl = document.getElementById("rawMeatStock")
    const finishedProductsStockEl = document.getElementById("finishedProductsStock")
    const expiringSoonEl = document.getElementById("expiringSoon")
    const lowStockItemsEl = document.getElementById("lowStockItems")

    if (rawMeatStockEl) rawMeatStockEl.textContent = `${stats.rawMeatStock} kg`
    if (finishedProductsStockEl) finishedProductsStockEl.textContent = stats.finishedProductsStock
    if (expiringSoonEl) expiringSoonEl.textContent = stats.expiringSoon
    if (lowStockItemsEl) lowStockItemsEl.textContent = stats.lowStockItems
  }

  updateRawOrdersTable() {
    const tbody = document.getElementById("rawOrdersBody")
    const orders = this.dataManager.rawOrders
    if (orders.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="9">No raw meat orders yet. Click "New Order" to place your first order.</td></tr>'
      return
    }

    tbody.innerHTML = orders.map((order) => ``).join("")
  }

  updateProductsTable() {
    const tbody = document.getElementById("productsBody")
    const products = this.dataManager.finishedProducts
    if (products.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="9">No finished products yet. Click "Add Product" to add your first product.</td></tr>'
      return
    }

    tbody.innerHTML = products
      .map((product) => {
        const expiryDate = new Date(product.expiryDate)
        const today = new Date()
        const isExpired = expiryDate < today
        const isExpiringSoon = expiryDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

        let statusBadge = `<span class="badge status-${product.status}">${product.status}</span>`
        if (isExpired) {
          statusBadge = '<span class="badge status-expired">Expired</span>'
        } else if (isExpiringSoon) {
          statusBadge = '<span class="badge badge-warning">Expiring Soon</span>'
        }

        return ``
      })
      .join("")
  }

  updateCustomerOrdersTable() {
    const tbody = document.getElementById("customerOrdersBody")
    const orders = this.dataManager.customerOrders
    if (orders.length === 0) {
      tbody.innerHTML = '<tr class="empty-state"><td colspan="9">No customer orders yet.</td></tr>'
      return
    }

    tbody.innerHTML = orders.map((order) => ``).join("")
  }

  updateInventoryTable() {
    const tbody = document.getElementById("inventoryBody")
    const rawOrders = this.dataManager.rawOrders.filter((order) => order.status === "delivered")
    const finishedProducts = this.dataManager.finishedProducts.filter((product) => product.status === "available")

    if (rawOrders.length === 0 && finishedProducts.length === 0) {
      tbody.innerHTML = '<tr class="empty-state"><td colspan="7">No inventory items to display.</td></tr>'
      return
    }

    let inventoryHTML = ""

    // Add raw meat inventory
    rawOrders.forEach((order) => {
      inventoryHTML += ``
    })

    // Add finished products inventory
    finishedProducts.forEach((product) => {
      const expiryDate = new Date(product.expiryDate)
      const today = new Date()
      const isExpired = expiryDate < today
      const isExpiringSoon = expiryDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

      let statusBadge = '<span class="badge badge-success">Available</span>'
      if (isExpired) {
        statusBadge = '<span class="badge badge-danger">Expired</span>'
      } else if (isExpiringSoon) {
        statusBadge = '<span class="badge badge-warning">Expiring Soon</span>'
      }

      inventoryHTML += ``
    })

    tbody.innerHTML = inventoryHTML
  }

  populateDropdowns() {
    // Populate source batch dropdown with delivered raw orders
    const sourceBatchSelect = document.getElementById("sourceBatchId")
    if (sourceBatchSelect) {
      const deliveredOrders = this.dataManager.rawOrders.filter((order) => order.status === "delivered")
      sourceBatchSelect.innerHTML =
        '<option value="">Select Batch</option>' +
        deliveredOrders
          .map(
            (order) =>
              `<option value="${order.orderId}">${order.orderId} - ${order.meatType} (${order.quantity}kg)</option>`,
          )
          .join("")
    }
  }

  setupSearchAndFilters() {
    // Raw Orders Search
    const rawOrderSearch = document.getElementById("rawOrderSearch")
    if (rawOrderSearch) {
      rawOrderSearch.addEventListener("input", (e) => {
        this.filterTable("rawOrdersTable", e.target.value, "search")
      })
    }

    // Product Search
    const productSearch = document.getElementById("productSearch")
    if (productSearch) {
      productSearch.addEventListener("input", (e) => {
        this.filterTable("productsTable", e.target.value, "search")
      })
    }

    // Customer Order Search
    const customerOrderSearch = document.getElementById("customerOrderSearch")
    if (customerOrderSearch) {
      customerOrderSearch.addEventListener("input", (e) => {
        this.filterTable("customerOrdersTable", e.target.value, "search")
      })
    }

    // Status filters
    const orderStatusFilter = document.getElementById("orderStatusFilter")
    if (orderStatusFilter) {
      orderStatusFilter.addEventListener("change", (e) => {
        this.filterTable("rawOrdersTable", e.target.value, "status")
      })
    }

    const customerOrderStatusFilter = document.getElementById("customerOrderStatusFilter")
    if (customerOrderStatusFilter) {
      customerOrderStatusFilter.addEventListener("change", (e) => {
        this.filterTable("customerOrdersTable", e.target.value, "status")
      })
    }

    const catalogSearch = document.getElementById("catalogSearch")
    if (catalogSearch) {
      catalogSearch.addEventListener("input", (e) => {
        this.filterProductCatalog(e.target.value, "search")
      })
    }

    const catalogTypeFilter = document.getElementById("catalogTypeFilter")
    if (catalogTypeFilter) {
      catalogTypeFilter.addEventListener("change", (e) => {
        this.filterProductCatalog(e.target.value, "type")
      })
    }

    const catalogStatusFilter = document.getElementById("catalogStatusFilter")
    if (catalogStatusFilter) {
      catalogStatusFilter.addEventListener("change", (e) => {
        this.filterProductCatalog(e.target.value, "status")
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
      } else if (filterType === "status" && searchTerm !== "all") {
        const statusCell = cells[cells.length - 2] // Status column is second to last
        const statusText = statusCell.textContent.toLowerCase()
        shouldShow = statusText.includes(searchTerm.toLowerCase())
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
    if (header) {
      header.classList.add(isAscending ? "sort-asc" : "sort-desc")
    }
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
        dashboard: "Vendor Dashboard",
        "raw-orders": "Raw Meat Orders",
        "finished-products": "Finished Products",
        "product-catalog": "Product Catalog",
        "customer-orders": "Customer Orders",
        inventory: "Inventory Management",
        settings: "Settings",
      }
      this.headerTitle.textContent = titles[sectionName] || "Meatrix Vendor Dashboard"
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
      case "raw-orders":
        sectionId = "raw-orders-section"
        this.updateRawOrdersTable()
        break
      case "finished-products":
        sectionId = "finished-products-section"
        this.updateProductsTable()
        break
      case "product-catalog":
        sectionId = "product-catalog-section"
        this.updateProductCatalog()
        break
      case "customer-orders":
        sectionId = "customer-orders-section"
        this.updateCustomerOrdersTable()
        break
      case "inventory":
        sectionId = "inventory-section"
        this.updateInventoryTable()
        this.updateInventoryStats()
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

    this.populateDropdowns()
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

  filterProductCatalog(searchTerm, filterType) {
    const table = document.getElementById("productCatalogTable")
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
        const typeText = typeCell.textContent.toLowerCase()
        shouldShow = typeText.includes(searchTerm.toLowerCase())
      } else if (filterType === "status" && searchTerm !== "all") {
        const statusCell = cells[7] // Status column
        const statusText = statusCell.textContent.toLowerCase()
        shouldShow = statusText.includes(searchTerm.toLowerCase())
      }

      row.style.display = shouldShow ? "" : "none"
    })
  }

  updateProductCatalog() {
    const catalogBody = document.getElementById("productCatalogBody")
    const products = this.dataManager.finishedProducts

    if (products.length === 0) {
      catalogBody.innerHTML = `
        <tr class="empty-state">
          <td colspan="10">No products in catalog yet. Click "Add Product" to add your first product.</td>
        </tr>
      `
      return
    }

    catalogBody.innerHTML = products
      .map(
        (product) => `
        <tr>
          <td><span class="product-id">${product.productId}</span></td>
          <td><strong>${product.productName}</strong></td>
          <td><span class="product-sku">${product.productSKU || "N/A"}</span></td>
          <td>${product.productType}</td>
          <td><span class="badge badge-info">${product.category || "General"}</span></td>
          <td>${product.productQuantity} ${product.unit}</td>
          <td><strong>$${product.displayPrice || product.pricePerUnit}</strong></td>
          <td><span class="badge ${this.getStatusBadgeClass(product.status)}">${product.status}</span></td>
          <td>${new Date(product.expiryDate).toLocaleDateString()}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-sm btn-primary" onclick="viewProductDetails('${product.productId}')" title="View Details">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              </button>
              <button class="btn-sm btn-secondary" onclick="editProduct('${product.productId}')" title="Edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            </div>
          </td>
        </tr>
      `,
      )
      .join("")
  }

  getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
      case "pending":
        return "badge-warning"
      case "processing":
        return "badge-info"
      case "ready":
        return "badge-success"
      case "delivered":
        return "badge-success"
      case "expired":
        return "badge-danger"
      default:
        return "badge-secondary"
    }
  }
}

// Global functions for modal management
function showOrderRawMeatModal() {
  document.getElementById("orderRawMeatModal").classList.add("active")
}

function showAddProductModal() {
  document.getElementById("addProductModal").classList.add("active")
}

function showUpdateStatusModal(orderId) {
  document.getElementById("orderIdStatus").value = orderId
  document.getElementById("updateOrderStatusModal").classList.add("active")
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active")
}

// Global functions for button actions
function viewProductDetails(productId) {
  const product = vendorDashboard.dataManager.finishedProducts.find((p) => p.productId === productId)
  if (!product) return

  const modalContent = document.getElementById("productDetailsContent")
  modalContent.innerHTML = `
    <div class="product-details-grid">
      <div class="detail-section">
        <h4>Basic Information</h4>
        <div class="detail-row">
          <span class="detail-label">Product ID:</span>
          <span class="detail-value">${product.productId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Product Name:</span>
          <span class="detail-value">${product.productName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">SKU:</span>
          <span class="detail-value">${product.productSKU || "N/A"}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Type:</span>
          <span class="detail-value">${product.productType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Category:</span>
          <span class="detail-value">${product.category || "General"}</span>
        </div>
      </div>
      
      <div class="detail-section">
        <h4>Inventory & Pricing</h4>
        <div class="detail-row">
          <span class="detail-label">Quantity:</span>
          <span class="detail-value">${product.productQuantity} ${product.unit}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Price per Unit:</span>
          <span class="detail-value">$${product.pricePerUnit}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Display Price:</span>
          <span class="detail-value">$${product.displayPrice || product.pricePerUnit}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="badge ${vendorDashboard.getStatusBadgeClass(product.status)}">${product.status}</span>
        </div>
      </div>
      
      <div class="detail-section">
        <h4>Dates & Storage</h4>
        <div class="detail-row">
          <span class="detail-label">Created Date:</span>
          <span class="detail-value">${new Date(product.dateCreated).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Expiry Date:</span>
          <span class="detail-value">${new Date(product.expiryDate).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Storage Location:</span>
          <span class="detail-value">${product.storageLocation || "N/A"}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Source Batch:</span>
          <span class="detail-value">${product.sourceBatchId || "N/A"}</span>
        </div>
      </div>
      
      ${
        product.description
          ? `
      <div class="detail-section full-width">
        <h4>Description</h4>
        <p class="product-description">${product.description}</p>
      </div>
      `
          : ""
      }
    </div>
  `

  document.getElementById("productDetailsModal").classList.add("active")
}

function viewOrderDetails(orderId) {
  const order = vendorDashboard.dataManager.rawOrders.find((o) => o.orderId === orderId)
  if (!order) return

  const modalContent = document.getElementById("orderDetailsContent")
  modalContent.innerHTML = `
    <div class="order-details-grid">
      <div class="detail-section">
        <h4>Order Information</h4>
        <div class="detail-row">
          <span class="detail-label">Order ID:</span>
          <span class="detail-value">${order.orderId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Agent Name:</span>
          <span class="detail-value">${order.agentName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Order Date:</span>
          <span class="detail-value">${new Date(order.dateOrdered).toLocaleDateString()}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Status:</span>
          <span class="badge ${vendorDashboard.getStatusBadgeClass(order.status)}">${order.status}</span>
        </div>
      </div>
      
      <div class="detail-section">
        <h4>Product Details</h4>
        <div class="detail-row">
          <span class="detail-label">Meat Type:</span>
          <span class="detail-value">${order.meatType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Animal Type:</span>
          <span class="detail-value">${order.animalType}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Quantity:</span>
          <span class="detail-value">${order.quantity} kg</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Price per kg:</span>
          <span class="detail-value">$${order.pricePerKg}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Total Price:</span>
          <span class="detail-value"><strong>$${order.totalPrice}</strong></span>
        </div>
      </div>
      
      ${
        order.specialRequirements
          ? `
      <div class="detail-section full-width">
        <h4>Special Requirements</h4>
        <p class="order-notes">${order.specialRequirements}</p>
      </div>
      `
          : ""
      }
      
      ${
        order.notes
          ? `
      <div class="detail-section full-width">
        <h4>Notes</h4>
        <p class="order-notes">${order.notes}</p>
      </div>
      `
          : ""
      }
    </div>
  `

  document.getElementById("orderDetailsModal").classList.add("active")
}

function editProduct(productId) {
  const product = vendorDashboard.dataManager.finishedProducts.find((p) => p.productId === productId)
  if (!product) return

  // Populate the edit form with current product data
  document.getElementById("editProductName").value = product.productName
  document.getElementById("editProductSKU").value = product.productSKU || ""
  document.getElementById("editProductType").value = product.productType
  document.getElementById("editCategory").value = product.category || ""
  document.getElementById("editProductQuantity").value = product.productQuantity
  document.getElementById("editUnit").value = product.unit
  document.getElementById("editPricePerUnit").value = product.pricePerUnit
  document.getElementById("editDisplayPrice").value = product.displayPrice || product.pricePerUnit
  document.getElementById("editExpiryDate").value = product.expiryDate
  document.getElementById("editStatus").value = product.status
  document.getElementById("editDescription").value = product.description || ""

  // Store the product ID for form submission
  document.getElementById("editProductForm").dataset.productId = productId

  document.getElementById("editProductModal").classList.add("active")
}

// Global dashboard instance
let vendorDashboard

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  vendorDashboard = new VendorDashboard()

  // Add some sample data for demonstration
  addSampleData()
})

// Add sample data for demonstration
function addSampleData() {
  // Add sample raw orders with more variety
  const sampleOrders = [
    {
      agentName: "Premium Meat Suppliers",
      meatType: "beef",
      animalType: "Holstein",
      quantity: "50",
      pricePerKg: "8.50",
      expectedDelivery: "2024-02-15",
      specialRequirements: "Grade A quality required",
    },
    {
      agentName: "Fresh Farm Agents",
      meatType: "goat",
      animalType: "Boer",
      quantity: "25",
      pricePerKg: "15.75",
      expectedDelivery: "2024-02-20",
      specialRequirements: "Organic certification needed",
    },
    {
      agentName: "Mountain Ranch Co.",
      meatType: "lamb",
      animalType: "Merino",
      quantity: "30",
      pricePerKg: "12.25",
      expectedDelivery: "2024-02-18",
      specialRequirements: "Halal certified",
    },
    {
      agentName: "Coastal Poultry Farm",
      meatType: "chicken",
      animalType: "Broiler",
      quantity: "100",
      pricePerKg: "6.75",
      expectedDelivery: "2024-02-22",
      specialRequirements: "Free-range only",
    },
    {
      agentName: "Valley Livestock",
      meatType: "pork",
      animalType: "Yorkshire",
      quantity: "40",
      pricePerKg: "9.80",
      expectedDelivery: "2024-02-25",
      specialRequirements: "No antibiotics",
    },
  ]

  sampleOrders.forEach((order) => {
    vendorDashboard.dataManager.addRawOrder(order)
  })

  // Update order statuses to show variety
  if (vendorDashboard.dataManager.rawOrders.length > 0) {
    vendorDashboard.dataManager.updateOrderStatus(vendorDashboard.dataManager.rawOrders[0].orderId, "delivered")
    vendorDashboard.dataManager.updateOrderStatus(vendorDashboard.dataManager.rawOrders[1].orderId, "processing")
    vendorDashboard.dataManager.updateOrderStatus(vendorDashboard.dataManager.rawOrders[2].orderId, "shipped")
  }

  // Add comprehensive finished products
  const sampleProducts = [
    {
      productName: "Premium Beef Steaks",
      productSKU: "BF-001",
      productType: "packet",
      sourceBatchId: vendorDashboard.dataManager.rawOrders[0]?.orderId || "RO001",
      productQuantity: "20",
      unit: "packets",
      pricePerUnit: "25.00",
      displayPrice: "28.99",
      category: "fresh-meat",
      createdDate: "2024-01-15",
      expiryDate: "2024-02-15",
      storageLocation: "Freezer A",
      description: "Premium quality beef steaks, vacuum packed",
      imageUrl: null,
    },
    {
      productName: "Cooked Goat Curry",
      productSKU: "GT-002",
      productType: "cooked",
      sourceBatchId: vendorDashboard.dataManager.rawOrders[1]?.orderId || "RO002",
      productQuantity: "15",
      unit: "portions",
      pricePerUnit: "18.50",
      displayPrice: "21.99",
      category: "cooked-ready",
      createdDate: "2024-01-20",
      expiryDate: "2024-01-25",
      storageLocation: "Refrigerator B",
      description: "Ready-to-eat goat curry with spices",
      imageUrl: null,
    },
    {
      productName: "Lamb Chops Marinated",
      productSKU: "LM-003",
      productType: "packet",
      sourceBatchId: vendorDashboard.dataManager.rawOrders[2]?.orderId || "RO003",
      productQuantity: "12",
      unit: "packets",
      pricePerUnit: "22.75",
      displayPrice: "26.50",
      category: "marinated-meat",
      createdDate: "2024-01-22",
      expiryDate: "2024-02-22",
      storageLocation: "Freezer B",
      description: "Tender lamb chops with Mediterranean herbs",
      imageUrl: null,
    },
    {
      productName: "Chicken Wings Buffalo Style",
      productSKU: "CW-004",
      productType: "cooked",
      sourceBatchId: vendorDashboard.dataManager.rawOrders[3]?.orderId || "RO004",
      productQuantity: "25",
      unit: "portions",
      pricePerUnit: "12.99",
      displayPrice: "15.99",
      category: "cooked-ready",
      createdDate: "2024-01-25",
      expiryDate: "2024-02-02",
      storageLocation: "Hot Display",
      description: "Spicy buffalo chicken wings, ready to serve",
      imageUrl: null,
    },
    {
      productName: "Pork Sausages Artisan",
      productSKU: "PS-005",
      productType: "packet",
      sourceBatchId: vendorDashboard.dataManager.rawOrders[4]?.orderId || "RO005",
      productQuantity: "18",
      unit: "packets",
      pricePerUnit: "16.25",
      displayPrice: "19.99",
      category: "processed-meat",
      createdDate: "2024-01-28",
      expiryDate: "2024-02-28",
      storageLocation: "Refrigerator A",
      description: "Handcrafted pork sausages with herbs and spices",
      imageUrl: null,
    },
    {
      productName: "Mixed Grill Platter",
      productSKU: "MG-006",
      productType: "cooked",
      sourceBatchId: "Multiple",
      productQuantity: "10",
      unit: "platters",
      pricePerUnit: "35.00",
      displayPrice: "42.99",
      category: "cooked-ready",
      createdDate: "2024-01-30",
      expiryDate: "2024-02-02",
      storageLocation: "Hot Display",
      description: "Assorted grilled meats - beef, chicken, lamb",
      imageUrl: null,
    },
  ]

  sampleProducts.forEach((product) => {
    vendorDashboard.dataManager.addFinishedProduct(product)
  })

  // Add comprehensive customer orders
  const sampleCustomerOrders = [
    {
      customerName: "John's Restaurant",
      customerEmail: "john@johnsrestaurant.com",
      customerPhone: "+1-555-0123",
      productName: "Premium Beef Steaks",
      quantity: "5 packets",
      totalPrice: "144.95",
      deliveryDate: "2024-02-10",
      deliveryAddress: "123 Main St, Downtown",
      status: "processing",
      paymentMethod: "Credit Card",
      orderNotes: "Please ensure proper packaging for transport",
    },
    {
      customerName: "Mary's Catering",
      customerEmail: "mary@maryscatering.com",
      customerPhone: "+1-555-0456",
      productName: "Cooked Goat Curry",
      quantity: "8 portions",
      totalPrice: "175.92",
      deliveryDate: "2024-02-12",
      deliveryAddress: "456 Oak Ave, Midtown",
      status: "ready",
      paymentMethod: "Bank Transfer",
      orderNotes: "Event catering for 50 people",
    },
    {
      customerName: "Sunset Bistro",
      customerEmail: "orders@sunsetbistro.com",
      customerPhone: "+1-555-0789",
      productName: "Lamb Chops Marinated",
      quantity: "3 packets",
      totalPrice: "79.50",
      deliveryDate: "2024-02-14",
      deliveryAddress: "789 Pine St, Uptown",
      status: "confirmed",
      paymentMethod: "Cash on Delivery",
      orderNotes: "Valentine's Day special menu",
    },
    {
      customerName: "Sports Bar & Grill",
      customerEmail: "manager@sportsbar.com",
      customerPhone: "+1-555-0321",
      productName: "Chicken Wings Buffalo Style",
      quantity: "12 portions",
      totalPrice: "191.88",
      deliveryDate: "2024-02-16",
      deliveryAddress: "321 Stadium Blvd, Sports District",
      status: "pending",
      paymentMethod: "Credit Card",
      orderNotes: "Game day special order",
    },
    {
      customerName: "Family Diner",
      customerEmail: "info@familydiner.com",
      customerPhone: "+1-555-0654",
      productName: "Pork Sausages Artisan",
      quantity: "6 packets",
      totalPrice: "119.94",
      deliveryDate: "2024-02-18",
      deliveryAddress: "654 Elm St, Suburban",
      status: "delivered",
      paymentMethod: "Bank Transfer",
      orderNotes: "Weekly breakfast special supply",
    },
    {
      customerName: "Grand Hotel Restaurant",
      customerEmail: "chef@grandhotel.com",
      customerPhone: "+1-555-0987",
      productName: "Mixed Grill Platter",
      quantity: "4 platters",
      totalPrice: "171.96",
      deliveryDate: "2024-02-20",
      deliveryAddress: "987 Grand Ave, Hotel District",
      status: "processing",
      paymentMethod: "Corporate Account",
      orderNotes: "VIP banquet event - premium presentation required",
    },
  ]

  sampleCustomerOrders.forEach((order) => {
    vendorDashboard.dataManager.addCustomerOrder(order)
  })

  // Add sample activities for recent activity feed
  const additionalActivities = [
    "New customer registration: Sunset Bistro",
    "Product price updated: Premium Beef Steaks",
    "Inventory restocked: Freezer A capacity increased",
    "Quality check completed: All products passed inspection",
    "Delivery route optimized for downtown area",
    "Customer feedback received: 5-star rating from John's Restaurant",
    "New supplier contact added: Mountain Ranch Co.",
    "Seasonal menu planning: Valentine's Day specials",
    "Equipment maintenance: Freezer B serviced",
    "Staff training completed: Food safety certification",
  ]

  additionalActivities.forEach((activity) => {
    vendorDashboard.dataManager.addActivity(activity)
  })

  // Update dashboard displays
  vendorDashboard.updateDashboard()
  console.log("Comprehensive sample data added successfully!")
}

// Console log for debugging
console.log("Meatrix Vendor Dashboard System Loaded")
