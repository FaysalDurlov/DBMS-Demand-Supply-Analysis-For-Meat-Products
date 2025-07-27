class CustomerDataManager {
  constructor() {
    this.orders = JSON.parse(localStorage.getItem("customerOrders") || "[]")
    this.products = this.initializeProducts()
    this.vendors = this.initializeVendors()
    this.nutritionData = this.initializeNutritionData()
  }

  initializeProducts() {
    return [
      {
        id: "beef001",
        name: "Premium Beef Steak",
        type: "beef",
        vendor: "Green Valley Farm",
        price: 28.99,
        unit: "kg",
        description: "Premium grass-fed beef steak, perfect for grilling",
        inStock: true,
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: "chicken001",
        name: "Free Range Chicken Breast",
        type: "chicken",
        vendor: "Sunny Side Poultry",
        price: 15.99,
        unit: "kg",
        description: "Fresh free-range chicken breast, hormone-free",
        inStock: true,
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: "pork001",
        name: "Organic Pork Chops",
        type: "pork",
        vendor: "Heritage Farms",
        price: 22.5,
        unit: "kg",
        description: "Organic pork chops from heritage breed pigs",
        inStock: true,
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: "lamb001",
        name: "Fresh Lamb Leg",
        type: "lamb",
        vendor: "Mountain View Ranch",
        price: 32.99,
        unit: "kg",
        description: "Fresh lamb leg, perfect for roasting",
        inStock: true,
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: "goat001",
        name: "Goat Meat Curry Cut",
        type: "goat",
        vendor: "Desert Winds Farm",
        price: 26.75,
        unit: "kg",
        description: "Fresh goat meat cut for curry, lean and flavorful",
        inStock: true,
        image: "/placeholder.svg?height=200&width=300",
      },
      {
        id: "beef002",
        name: "Ground Beef",
        type: "beef",
        vendor: "Green Valley Farm",
        price: 18.99,
        unit: "kg",
        description: "Fresh ground beef, 85% lean",
        inStock: true,
        image: "/placeholder.svg?height=200&width=300",
      },
    ]
  }

  initializeVendors() {
    return [
      {
        id: "vendor001",
        name: "Green Valley Farm",
        location: "Valley Springs, CA",
        specialties: ["Beef", "Lamb"],
        rating: 4.8,
        description: "Family-owned farm specializing in grass-fed beef and lamb",
        contact: "(555) 123-4567",
      },
      {
        id: "vendor002",
        name: "Sunny Side Poultry",
        location: "Riverside, CA",
        specialties: ["Chicken", "Turkey"],
        rating: 4.6,
        description: "Free-range poultry farm with organic certification",
        contact: "(555) 234-5678",
      },
      {
        id: "vendor003",
        name: "Heritage Farms",
        location: "Oak Hill, CA",
        specialties: ["Pork", "Beef"],
        rating: 4.7,
        description: "Heritage breed livestock with sustainable farming practices",
        contact: "(555) 345-6789",
      },
      {
        id: "vendor004",
        name: "Mountain View Ranch",
        location: "Pine Ridge, CA",
        specialties: ["Lamb", "Goat"],
        rating: 4.9,
        description: "High-altitude ranch producing premium lamb and goat meat",
        contact: "(555) 456-7890",
      },
      {
        id: "vendor005",
        name: "Desert Winds Farm",
        location: "Cactus Valley, CA",
        specialties: ["Goat", "Lamb"],
        rating: 4.5,
        description: "Specialized goat and lamb farm with traditional methods",
        contact: "(555) 567-8901",
      },
    ]
  }

  initializeNutritionData() {
    return {
      beef: { calories: 250, protein: 26, fat: 15, iron: 2.6, zinc: 4.8 },
      chicken: { calories: 165, protein: 31, fat: 3.6, iron: 0.7, zinc: 1.0 },
      pork: { calories: 242, protein: 27, fat: 14, iron: 0.9, zinc: 2.9 },
      lamb: { calories: 294, protein: 25, fat: 21, iron: 1.9, zinc: 4.5 },
      goat: { calories: 143, protein: 27, fat: 3.0, iron: 3.8, zinc: 4.3 },
    }
  }

  saveData() {
    localStorage.setItem("customerOrders", JSON.stringify(this.orders))
  }

  addOrder(orderData) {
    const order = {
      id: this.generateOrderId(),
      ...orderData,
      orderDate: new Date().toISOString().split("T")[0],
      status: "Pending",
      estimatedDelivery: this.calculateDeliveryDate(),
    }
    this.orders.unshift(order)
    this.saveData()
    return order
  }

  generateOrderId() {
    return `ORD${Date.now()}${Math.random().toString(36).substr(2, 5)}`
  }

  calculateDeliveryDate() {
    const today = new Date()
    today.setDate(today.getDate() + Math.floor(Math.random() * 3) + 2) // 2-4 days
    return today.toISOString().split("T")[0]
  }

  getOrderById(orderId) {
    return this.orders.find((order) => order.id === orderId)
  }

  getStats() {
    const totalOrders = this.orders.length
    const totalSpent = this.orders.reduce((sum, order) => sum + Number.parseFloat(order.total || 0), 0)
    const pendingOrders = this.orders.filter((order) => order.status === "Pending").length
    const favoriteVendor = this.getFavoriteVendor()

    return {
      totalOrders,
      totalSpent: totalSpent.toFixed(2),
      pendingOrders,
      favoriteVendor,
    }
  }

  getFavoriteVendor() {
    if (this.orders.length === 0) return "-"

    const vendorCounts = {}
    this.orders.forEach((order) => {
      vendorCounts[order.vendor] = (vendorCounts[order.vendor] || 0) + 1
    })

    return Object.keys(vendorCounts).reduce((a, b) => (vendorCounts[a] > vendorCounts[b] ? a : b))
  }

  calculateNutrition(meatType, weight) {
    const nutrition = this.nutritionData[meatType]
    if (!nutrition || !weight) return null

    const multiplier = weight / 100 // nutrition data is per 100g
    return {
      calories: Math.round(nutrition.calories * multiplier),
      protein: Math.round(nutrition.protein * multiplier * 10) / 10,
      fat: Math.round(nutrition.fat * multiplier * 10) / 10,
      iron: Math.round(nutrition.iron * multiplier * 10) / 10,
      zinc: Math.round(nutrition.zinc * multiplier * 10) / 10,
    }
  }
}

class CustomerDashboard {
  constructor() {
    this.isExpanded = false
    this.hoverTimeout = null
    this.dataManager = new CustomerDataManager()
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
    // Order Form
    const orderForm = document.getElementById("orderForm")
    if (orderForm) {
      orderForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.handlePlaceOrder(new FormData(orderForm))
      })
    }

    // Quantity change handler
    const quantityInput = document.getElementById("orderQuantity")
    if (quantityInput) {
      quantityInput.addEventListener("input", () => {
        this.updateOrderTotal()
      })
    }
  }

  setupSearchAndFilters() {
    // Product Search
    const productSearch = document.getElementById("productSearch")
    if (productSearch) {
      productSearch.addEventListener("input", (e) => {
        this.filterProducts(e.target.value, "search")
      })
    }

    // Meat Type Filter
    const meatTypeFilter = document.getElementById("meatTypeFilter")
    if (meatTypeFilter) {
      meatTypeFilter.addEventListener("change", (e) => {
        this.filterProducts(e.target.value, "type")
      })
    }

    // Price Range Filter
    const priceRangeFilter = document.getElementById("priceRangeFilter")
    if (priceRangeFilter) {
      priceRangeFilter.addEventListener("change", (e) => {
        this.filterProducts(e.target.value, "price")
      })
    }
  }

  handlePlaceOrder(formData) {
    const orderData = {
      productId: formData.get("orderProductId"),
      productName: formData.get("orderProductName"),
      vendor: formData.get("orderVendor"),
      quantity: Number.parseFloat(formData.get("orderQuantity")),
      pricePerUnit: Number.parseFloat(formData.get("orderPrice")),
      total: Number.parseFloat(formData.get("orderTotal")),
      deliveryAddress: formData.get("deliveryAddress"),
    }

    const order = this.dataManager.addOrder(orderData)
    this.updateDashboard()
    this.updateOrdersTable()
    closeModal("orderModal")
    document.getElementById("orderForm").reset()

    alert(`Order placed successfully! Order ID: ${order.id}`)
  }

  updateOrderTotal() {
    const quantity = Number.parseFloat(document.getElementById("orderQuantity").value) || 0
    const pricePerUnit = Number.parseFloat(document.getElementById("orderPrice").value.replace("$", "")) || 0
    const total = quantity * pricePerUnit
    document.getElementById("orderTotal").value = `$${total.toFixed(2)}`
  }

  updateDashboard() {
    const stats = this.dataManager.getStats()
    document.getElementById("totalOrders").textContent = stats.totalOrders
    document.getElementById("totalSpent").textContent = `$${stats.totalSpent}`
    document.getElementById("pendingOrders").textContent = stats.pendingOrders
    document.getElementById("favoriteVendor").textContent = stats.favoriteVendor
    this.updateRecentOrders()
  }

  updateRecentOrders() {
    const ordersContainer = document.getElementById("recentOrders")
    const recentOrders = this.dataManager.orders.slice(0, 5)

    if (recentOrders.length === 0) {
      ordersContainer.innerHTML = '<div class="activity-item empty-state"><p>No recent orders</p></div>'
      return
    }

    ordersContainer.innerHTML = recentOrders
      .map(
        (order) => `
        <div class="activity-item">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${order.productName} from ${order.vendor}</span>
            <small style="color: var(--text-secondary);">${order.orderDate}</small>
          </div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">
            ${order.quantity}kg - $${order.total} - ${order.status}
          </div>
        </div>
      `,
      )
      .join("")
  }

  updateProductsGrid() {
    const productsGrid = document.getElementById("productsGrid")
    const products = this.dataManager.products

    productsGrid.innerHTML = products
      .map(
        (product) => `
        <div class="product-card" data-type="${product.type}" data-price="${product.price}">
          <div class="product-image">
            <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div style="display: none; width: 100%; height: 100%; align-items: center; justify-content: center; background: #f3f4f6; color: var(--text-secondary);">
              ${product.name}
            </div>
          </div>
          <div class="product-info">
            <div class="product-name">${product.name}</div>
            <div class="product-vendor">by ${product.vendor}</div>
            <div class="product-price">$${product.price}/${product.unit}</div>
            <div class="product-actions">
              <button class="btn-outline" onclick="showProductDetails('${product.id}')">View Details</button>
              <button class="btn-primary" onclick="showOrderModal('${product.id}')">Order Now</button>
            </div>
          </div>
        </div>
      `,
      )
      .join("")
  }

  updateVendorsGrid() {
    const vendorsGrid = document.getElementById("vendorsGrid")
    const vendors = this.dataManager.vendors

    vendorsGrid.innerHTML = vendors
      .map(
        (vendor) => `
        <div class="vendor-card">
          <div class="vendor-header">
            <div class="vendor-name">${vendor.name}</div>
            <div class="vendor-location">${vendor.location}</div>
          </div>
          <div class="vendor-info">
            <div class="vendor-specialties">
              <h4>Specialties</h4>
              <div class="specialties-list">
                ${vendor.specialties.map((specialty) => `<span class="specialty-tag">${specialty}</span>`).join("")}
              </div>
            </div>
            <div class="vendor-rating">
              <div class="rating-stars">★★★★★</div>
              <span class="rating-text">${vendor.rating}/5.0</span>
            </div>
            <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 16px;">
              ${vendor.description}
            </p>
            <button class="btn-primary" onclick="contactVendor('${vendor.id}')">Contact Vendor</button>
          </div>
        </div>
      `,
      )
      .join("")
  }

  updateOrdersTable() {
    const tbody = document.getElementById("ordersTableBody")
    const orders = this.dataManager.orders

    if (orders.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="8">No orders yet. Start shopping to see your orders here.</td></tr>'
      return
    }

    tbody.innerHTML = orders
      .map(
        (order) => `
        <tr>
          <td>${order.id}</td>
          <td>${order.vendor}</td>
          <td>${order.productName}</td>
          <td>$${order.total}</td>
          <td><span class="badge badge-${this.getStatusBadgeClass(order.status)}">${order.status}</span></td>
          <td>${order.orderDate}</td>
          <td>${order.estimatedDelivery}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-icon" title="Track Order" onclick="trackOrderById('${order.id}')">
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

  getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
      case "delivered":
        return "success"
      case "pending":
        return "warning"
      case "cancelled":
        return "danger"
      default:
        return "info"
    }
  }

  filterProducts(searchTerm, filterType) {
    const productCards = document.querySelectorAll(".product-card")

    productCards.forEach((card) => {
      let shouldShow = true

      if (filterType === "search" && searchTerm) {
        const productName = card.querySelector(".product-name").textContent.toLowerCase()
        const vendorName = card.querySelector(".product-vendor").textContent.toLowerCase()
        shouldShow = productName.includes(searchTerm.toLowerCase()) || vendorName.includes(searchTerm.toLowerCase())
      } else if (filterType === "type" && searchTerm !== "all") {
        shouldShow = card.dataset.type === searchTerm
      } else if (filterType === "price" && searchTerm !== "all") {
        const price = Number.parseFloat(card.dataset.price)
        const [min, max] = searchTerm.split("-").map((p) => Number.parseFloat(p.replace("+", "")))
        if (searchTerm.includes("+")) {
          shouldShow = price >= min
        } else {
          shouldShow = price >= min && price <= max
        }
      }

      card.style.display = shouldShow ? "" : "none"
    })
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

    // Update header title based on selection
    if (this.headerTitle) {
      const titles = {
        dashboard: "Customer Dashboard",
        products: "Available Products",
        orders: "My Orders",
        nutrition: "Nutrition Calculator",
        vendors: "Vendors",
        settings: "Settings",
      }
      this.headerTitle.textContent = titles[sectionName] || "Meatrix Customer"
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
      case "products":
        sectionId = "products-section"
        this.updateProductsGrid()
        break
      case "orders":
        sectionId = "orders-section"
        this.updateOrdersTable()
        break
      case "nutrition":
        sectionId = "nutrition-section"
        break
      case "vendors":
        sectionId = "vendors-section"
        this.updateVendorsGrid()
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

// Global functions
function showProductDetails(productId) {
  const product = dashboard.dataManager.products.find((p) => p.id === productId)
  if (!product) return

  const modal = document.getElementById("productDetailsModal")
  const content = document.getElementById("productDetailsContent")

  content.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; align-items: start;">
      <div>
        <img src="${product.image}" alt="${product.name}" style="width: 100%; border-radius: 8px;" onerror="this.style.display='none';">
      </div>
      <div>
        <h3 style="margin-bottom: 12px;">${product.name}</h3>
        <p style="color: var(--text-secondary); margin-bottom: 8px;">by ${product.vendor}</p>
        <p style="font-size: 24px; font-weight: 700; color: var(--primary-color); margin-bottom: 16px;">$${product.price}/${product.unit}</p>
        <p style="margin-bottom: 16px;">${product.description}</p>
        <div style="display: flex; gap: 12px;">
          <button class="btn-primary" onclick="showOrderModal('${product.id}'); closeModal('productDetailsModal')">Order Now</button>
          <button class="btn-secondary" onclick="closeModal('productDetailsModal')">Close</button>
        </div>
      </div>
    </div>
  `

  modal.classList.add("active")
}

function showOrderModal(productId) {
  const product = dashboard.dataManager.products.find((p) => p.id === productId)
  if (!product) return

  document.getElementById("orderProductName").value = product.name
  document.getElementById("orderVendor").value = product.vendor
  document.getElementById("orderPrice").value = `$${product.price}`
  document.getElementById("orderQuantity").value = "1"
  document.getElementById("orderTotal").value = `$${product.price}`

  // Store product ID for form submission
  const form = document.getElementById("orderForm")
  form.dataset.productId = product.id

  document.getElementById("orderModal").classList.add("active")
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active")
}

function trackOrder() {
  const orderId = document.getElementById("trackOrderId").value.trim()
  if (!orderId) {
    alert("Please enter an Order ID")
    return
  }

  trackOrderById(orderId)
}

function trackOrderById(orderId) {
  const order = dashboard.dataManager.getOrderById(orderId)
  const resultDiv = document.getElementById("trackingResult")

  if (!order) {
    resultDiv.innerHTML = `
      <div style="padding: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b;">
        Order ID "${orderId}" not found. Please check the Order ID and try again.
      </div>
    `
    return
  }

  resultDiv.innerHTML = `
    <div style="padding: 16px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px;">
      <h4 style="margin-bottom: 12px; color: var(--primary-color);">Order Details</h4>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 14px;">
        <div><strong>Order ID:</strong> ${order.id}</div>
        <div><strong>Status:</strong> <span class="badge badge-${dashboard.getStatusBadgeClass(order.status)}">${order.status}</span></div>
        <div><strong>Product:</strong> ${order.productName}</div>
        <div><strong>Vendor:</strong> ${order.vendor}</div>
        <div><strong>Quantity:</strong> ${order.quantity}kg</div>
        <div><strong>Total:</strong> $${order.total}</div>
        <div><strong>Order Date:</strong> ${order.orderDate}</div>
        <div><strong>Est. Delivery:</strong> ${order.estimatedDelivery}</div>
      </div>
    </div>
  `
}

function calculateNutrition() {
  const meatType = document.getElementById("nutritionMeatType").value
  const weight = Number.parseFloat(document.getElementById("nutritionWeight").value)

  if (!meatType || !weight) {
    alert("Please select meat type and enter weight")
    return
  }

  const nutrition = dashboard.dataManager.calculateNutrition(meatType, weight)
  const resultsDiv = document.getElementById("nutritionResults")

  if (!nutrition) {
    resultsDiv.innerHTML = "<p>Unable to calculate nutrition information</p>"
    return
  }

  resultsDiv.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px;">
      <div style="text-align: center; padding: 12px; background: var(--sidebar-hover); border-radius: 8px;">
        <div style="font-size: 24px; font-weight: 700; color: var(--primary-color);">${nutrition.calories}</div>
        <div style="font-size: 12px; color: var(--text-secondary);">Calories</div>
      </div>
      <div style="text-align: center; padding: 12px; background: var(--sidebar-hover); border-radius: 8px;">
        <div style="font-size: 24px; font-weight: 700; color: var(--primary-color);">${nutrition.protein}g</div>
        <div style="font-size: 12px; color: var(--text-secondary);">Protein</div>
      </div>
      <div style="text-align: center; padding: 12px; background: var(--sidebar-hover); border-radius: 8px;">
        <div style="font-size: 24px; font-weight: 700; color: var(--primary-color);">${nutrition.fat}g</div>
        <div style="font-size: 12px; color: var(--text-secondary);">Fat</div>
      </div>
      <div style="text-align: center; padding: 12px; background: var(--sidebar-hover); border-radius: 8px;">
        <div style="font-size: 24px; font-weight: 700; color: var(--primary-color);">${nutrition.iron}mg</div>
        <div style="font-size: 12px; color: var(--text-secondary);">Iron</div>
      </div>
      <div style="text-align: center; padding: 12px; background: var(--sidebar-hover); border-radius: 8px;">
        <div style="font-size: 24px; font-weight: 700; color: var(--primary-color);">${nutrition.zinc}mg</div>
        <div style="font-size: 12px; color: var(--text-secondary);">Zinc</div>
      </div>
      <div style="text-align: center; padding: 12px; background: var(--sidebar-hover); border-radius: 8px;">
        <div style="font-size: 24px; font-weight: 700; color: var(--primary-color);">${weight}g</div>
        <div style="font-size: 12px; color: var(--text-secondary);">Weight</div>
      </div>
    </div>
  `
}

function contactVendor(vendorId) {
  const vendor = dashboard.dataManager.vendors.find((v) => v.id === vendorId)
  if (vendor) {
    alert(`Contact ${vendor.name} at ${vendor.contact}`)
  }
}

// Global dashboard instance
let dashboard

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  dashboard = new CustomerDashboard()
})

// Close modals when clicking outside
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("active")
  }
})

// Add form data to order form submission
document.addEventListener("DOMContentLoaded", () => {
  const orderForm = document.getElementById("orderForm")
  if (orderForm) {
    orderForm.addEventListener("submit", (e) => {
      const formData = new FormData(orderForm)
      formData.append("orderProductId", orderForm.dataset.productId)
    })
  }
})
