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
    const imageFile = formData.get("productImage")
    let imageUrl = null

    // Handle image upload (for demo, we'll use a placeholder)
    if (imageFile && imageFile.size > 0) {
      // In a real application, you would upload this to a server
      // For demo purposes, we'll create a placeholder URL
      imageUrl = URL.createObjectURL(imageFile)
    }

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
      imageUrl: imageUrl,
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

    tbody.innerHTML = orders
      .map(
        (order) => `
      <tr>
        <td>${order.orderId}</td>
        <td>${order.agentName}</td>
        <td>${order.meatType}</td>
        <td>${order.animalType}</td>
        <td>${order.quantity}</td>
        <td>$${order.totalPrice}</td>
        <td>${new Date(order.dateOrdered).toLocaleDateString()}</td>
        <td><span class="badge status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewOrderDetails('${order.orderId}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn-icon" title="Update Status" onclick="showUpdateStatusModal('${order.orderId}')">
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

        return `
      <tr>
        <td>${product.productId}</td>
        <td>${product.productName}</td>
        <td>${product.productType}</td>
        <td>${product.sourceBatchId || "N/A"}</td>
        <td>${product.productQuantity} ${product.unit}</td>
        <td>${new Date(product.createdDate).toLocaleDateString()}</td>
        <td>${new Date(product.expiryDate).toLocaleDateString()}</td>
        <td>${statusBadge}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewProductDetails('${product.productId}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn-icon" title="Edit" onclick="editProduct('${product.productId}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
            </button>
          </div>
        </td>
      </tr>
    `
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

    tbody.innerHTML = orders
      .map(
        (order) => `
      <tr>
        <td>${order.orderId}</td>
        <td>${order.customerName}</td>
        <td>${order.productName}</td>
        <td>${order.quantity}</td>
        <td>$${order.totalPrice}</td>
        <td>${new Date(order.dateOrdered).toLocaleDateString()}</td>
        <td>${order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString() : "TBD"}</td>
        <td><span class="badge status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewCustomerOrderDetails('${order.orderId}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn-icon" title="Update Status" onclick="updateCustomerOrderStatus('${order.orderId}')">
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
      inventoryHTML += `
        <tr>
          <td>Raw Meat</td>
          <td>${order.orderId}</td>
          <td>${order.quantity}</td>
          <td>kg</td>
          <td><span class="badge badge-info">In Stock</span></td>
          <td>N/A</td>
          <td>Cold Storage</td>
        </tr>
      `
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

      inventoryHTML += `
        <tr>
          <td>Finished Product</td>
          <td>${product.productId}</td>
          <td>${product.productQuantity}</td>
          <td>${product.unit}</td>
          <td>${statusBadge}</td>
          <td>${new Date(product.expiryDate).toLocaleDateString()}</td>
          <td>${product.storageLocation || "Main Storage"}</td>
        </tr>
      `
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
    const productCards = document.querySelectorAll(".product-card")

    productCards.forEach((card) => {
      let shouldShow = true

      if (filterType === "search" && searchTerm) {
        const productName = card.querySelector(".product-name").textContent.toLowerCase()
        const productSKU = card.querySelector(".product-sku").textContent.toLowerCase()
        shouldShow = productName.includes(searchTerm.toLowerCase()) || productSKU.includes(searchTerm.toLowerCase())
      } else if (filterType === "type" && searchTerm !== "all") {
        const productType = card.querySelector(".product-detail-item span:last-child").textContent.toLowerCase()
        shouldShow = productType.includes(searchTerm.toLowerCase())
      }

      card.style.display = shouldShow ? "" : "none"
    })
  }

  updateProductCatalog() {
    const catalogGrid = document.getElementById("productCatalogGrid")
    const products = this.dataManager.finishedProducts

    if (products.length === 0) {
      catalogGrid.innerHTML = `
        <div class="catalog-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            <polyline points="3.27,6.96 12,12.01 20.73,6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <h3>No Products Yet</h3>
          <p>Start by adding your first product to the catalog</p>
          <button class="btn-primary" onclick="showAddProductModal()">Add Product</button>
        </div>
      `
      return
    }

    catalogGrid.innerHTML = products
      .map((product) => {
        const expiryDate = new Date(product.expiryDate)
        const today = new Date()
        const isExpired = expiryDate < today
        const isExpiringSoon = expiryDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

        let statusBadge = `<span class="product-status-badge badge-success">Available</span>`
        let expiryWarning = ""

        if (isExpired) {
          statusBadge = `<span class="product-status-badge badge-danger">Expired</span>`
          expiryWarning = `<div class="product-expiry-danger">⚠️ Expired</div>`
        } else if (isExpiringSoon) {
          statusBadge = `<span class="product-status-badge badge-warning">Expiring Soon</span>`
          expiryWarning = `<div class="product-expiry-warning">⏰ Expires Soon</div>`
        }

        const imageUrl = product.imageUrl || "/placeholder.svg?height=200&width=280"

        return `
        <div class="product-card">
          <div class="product-image-container">
            ${
              product.imageUrl
                ? `<img src="${product.imageUrl}" alt="${product.productName}" class="product-image">`
                : `<div class="product-placeholder">🥩</div>`
            }
            ${statusBadge}
          </div>
          <div class="product-info">
            <div class="product-header">
              <h3 class="product-name">${product.productName}</h3>
              <span class="product-sku">${product.productSKU || product.productId}</span>
            </div>
            
            ${product.category ? `<span class="product-category-tag">${product.category}</span>` : ""}
            
            <div class="product-price">$${product.displayPrice || product.pricePerUnit}</div>
            
            <div class="product-details">
              <div class="product-detail-item">
                <span class="product-detail-label">Type:</span>
                <span>${product.productType}</span>
              </div>
              <div class="product-detail-item">
                <span class="product-detail-label">Quantity:</span>
                <span>${product.productQuantity} ${product.unit}</span>
              </div>
              <div class="product-detail-item">
                <span class="product-detail-label">Expiry:</span>
                <span>${new Date(product.expiryDate).toLocaleDateString()}</span>
              </div>
              <div class="product-detail-item">
                <span class="product-detail-label">Location:</span>
                <span>${product.storageLocation || "Main Storage"}</span>
              </div>
            </div>
            
            ${expiryWarning}
            
            <div class="product-actions">
              <button class="product-action-btn primary" onclick="viewProductDetails('${product.productId}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                View
              </button>
              <button class="product-action-btn secondary" onclick="editProduct('${product.productId}')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </button>
            </div>
          </div>
        </div>
      `
      })
      .join("")
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
function viewOrderDetails(orderId) {
  const order = vendorDashboard.dataManager.rawOrders.find((o) => o.orderId === orderId)
  if (order) {
    alert(
      `Order Details:\n\nOrder ID: ${order.orderId}\nAgent: ${order.agentName}\nMeat Type: ${order.meatType}\nQuantity: ${order.quantity}kg\nTotal Price: $${order.totalPrice}\nStatus: ${order.status}\nExpected Delivery: ${order.expectedDelivery}`,
    )
  }
}

function viewProductDetails(productId) {
  const product = vendorDashboard.dataManager.finishedProducts.find((p) => p.productId === productId)
  if (product) {
    alert(
      `Product Details:\n\nProduct ID: ${product.productId}\nName: ${product.productName}\nType: ${product.productType}\nQuantity: ${product.productQuantity} ${product.unit}\nPrice: $${product.pricePerUnit} per ${product.unit}\nExpiry Date: ${new Date(product.expiryDate).toLocaleDateString()}`,
    )
  }
}

function viewCustomerOrderDetails(orderId) {
  const order = vendorDashboard.dataManager.customerOrders.find((o) => o.orderId === orderId)
  if (order) {
    alert(
      `Customer Order Details:\n\nOrder ID: ${order.orderId}\nCustomer: ${order.customerName}\nProduct: ${order.productName}\nQuantity: ${order.quantity}\nTotal Price: $${order.totalPrice}\nStatus: ${order.status}`,
    )
  }
}

function editProduct(productId) {
  alert(`Edit product functionality for ${productId} - Coming soon!`)
}

function updateCustomerOrderStatus(orderId) {
  const newStatus = prompt("Enter new status (pending, processing, ready, delivered):")
  if (newStatus && ["pending", "processing", "ready", "delivered"].includes(newStatus.toLowerCase())) {
    vendorDashboard.dataManager.updateCustomerOrderStatus(orderId, newStatus.toLowerCase())
    vendorDashboard.updateCustomerOrdersTable()
    vendorDashboard.updateDashboard()
  }
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
  // Add sample raw orders
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
  ]

  sampleOrders.forEach((order) => {
    vendorDashboard.dataManager.addRawOrder(order)
  })

  // Update first order status to delivered
  if (vendorDashboard.dataManager.rawOrders.length > 0) {
    vendorDashboard.dataManager.updateOrderStatus(vendorDashboard.dataManager.rawOrders[0].orderId, "delivered")
  }

  // Add sample finished products
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
  ]

  sampleProducts.forEach((product) => {
    vendorDashboard.dataManager.addFinishedProduct(product)
  })

  // Add sample customer orders
  const sampleCustomerOrders = [
    {
      customerName: "John's Restaurant",
      productName: "Premium Beef Steaks",
      quantity: "5 packets",
      totalPrice: "125.00",
      deliveryDate: "2024-02-10",
      status: "processing",
    },
    {
      customerName: "Mary's Catering",
      productName: "Cooked Goat Curry",
      quantity: "8 portions",
      totalPrice: "148.00",
      deliveryDate: "2024-02-12",
      status: "ready",
    },
  ]

  sampleCustomerOrders.forEach((order) => {
    vendorDashboard.dataManager.addCustomerOrder(order)
  })

  // Update dashboard with sample data
  vendorDashboard.updateDashboard()
}

// Console log for debugging
console.log("Meatrix Vendor Dashboard System Loaded")
