class CustomerDataManager {
  constructor() {
    this.orders = this.initializeOrders()
    this.products = this.initializeProducts()
    this.vendors = this.initializeVendors()
    this.nutritionData = this.initializeNutritionData()
    this.loadData()
  }

  initializeProducts() {
    return [
      {
        id: "PROD-BF-001",
        name: "Premium Beef Steak",
        type: "beef",
        vendor: "Green Valley Farm",
        price: 28.99,
        unit: "kg",
        description:
          "Premium grass-fed beef steak, perfect for grilling. Aged for 21 days for maximum tenderness and flavor.",
        stock: 15,
      },
      {
        id: "PROD-CH-001",
        name: "Free Range Chicken Breast",
        type: "chicken",
        vendor: "Sunny Side Poultry",
        price: 15.99,
        unit: "kg",
        description: "Fresh free-range chicken breast, hormone-free. Raised on natural pastures with no antibiotics.",
        stock: 20,
      },
      {
        id: "PROD-PK-001",
        name: "Organic Pork Chops",
        type: "pork",
        vendor: "Heritage Farms",
        price: 22.5,
        unit: "kg",
        description: "Organic pork chops from heritage breed pigs. Raised without hormones or antibiotics.",
        stock: 8,
      },
      {
        id: "PROD-LB-001",
        name: "Fresh Lamb Leg",
        type: "lamb",
        vendor: "Mountain View Ranch",
        price: 32.99,
        unit: "kg",
        description: "Fresh lamb leg, perfect for roasting. Grass-fed and locally sourced from mountain pastures.",
        stock: 5,
      },
      {
        id: "PROD-GT-001",
        name: "Goat Meat Curry Cut",
        type: "goat",
        vendor: "Desert Winds Farm",
        price: 26.75,
        unit: "kg",
        description: "Fresh goat meat cut for curry, lean and flavorful. Raised on natural desert vegetation.",
        stock: 12,
      },
      {
        id: "PROD-BF-002",
        name: "Ground Beef",
        type: "beef",
        vendor: "Green Valley Farm",
        price: 18.99,
        unit: "kg",
        description: "Fresh ground beef, 85% lean. Perfect for burgers, meatballs, and everyday cooking.",
        stock: 25,
      },
      {
        id: "PROD-CH-002",
        name: "Whole Chicken",
        type: "chicken",
        vendor: "Sunny Side Poultry",
        price: 12.99,
        unit: "kg",
        description: "Fresh whole chicken, free-range and organic. Perfect for roasting or breaking down into parts.",
        stock: 18,
      },
      {
        id: "PROD-PK-002",
        name: "Pork Shoulder",
        type: "pork",
        vendor: "Heritage Farms",
        price: 19.99,
        unit: "kg",
        description: "Pork shoulder perfect for slow cooking, pulled pork, or braising. Well-marbled for flavor.",
        stock: 10,
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
        description: "Family-owned farm specializing in grass-fed beef and lamb with sustainable farming practices",
        contact: "(555) 123-4567",
        email: "info@greenvalleyfarm.com",
        address: "1234 Valley Road, Valley Springs, CA 95252",
        businessHours: "Mon-Fri: 8AM-6PM, Sat: 9AM-4PM",
        active: true,
      },
      {
        id: "vendor002",
        name: "Sunny Side Poultry",
        location: "Riverside, CA",
        specialties: ["Chicken", "Turkey"],
        description: "Free-range poultry farm with organic certification and humane animal treatment",
        contact: "(555) 234-5678",
        email: "orders@sunnysidepoultry.com",
        address: "5678 Farm Lane, Riverside, CA 92501",
        businessHours: "Mon-Sat: 7AM-7PM, Sun: 10AM-3PM",
        active: true,
      },
      {
        id: "vendor003",
        name: "Heritage Farms",
        location: "Oak Hill, CA",
        specialties: ["Pork", "Beef"],
        description: "Heritage breed livestock with sustainable farming practices and traditional methods",
        contact: "(555) 345-6789",
        email: "contact@heritagefarms.com",
        address: "9012 Heritage Way, Oak Hill, CA 93456",
        businessHours: "Tue-Sat: 9AM-5PM",
        active: true,
      },
      {
        id: "vendor004",
        name: "Mountain View Ranch",
        location: "Pine Ridge, CA",
        specialties: ["Lamb", "Goat"],
        description: "High-altitude ranch producing premium lamb and goat meat with natural grazing",
        contact: "(555) 456-7890",
        email: "sales@mountainviewranch.com",
        address: "3456 Mountain Road, Pine Ridge, CA 94567",
        businessHours: "Mon-Fri: 8AM-5PM, Sat: 9AM-2PM",
        active: true,
      },
      {
        id: "vendor005",
        name: "Desert Winds Farm",
        location: "Cactus Valley, CA",
        specialties: ["Goat", "Lamb"],
        description: "Specialized goat and lamb farm with traditional methods and desert-adapted livestock",
        contact: "(555) 567-8901",
        email: "info@desertwindsfarm.com",
        address: "7890 Desert Road, Cactus Valley, CA 95678",
        businessHours: "Wed-Sun: 10AM-6PM",
        active: false,
      },
    ]
  }

  initializeOrders() {
    return [
      {
        id: "ORD-2024-001",
        productId: "PROD-BF-001",
        productName: "Premium Beef Steak",
        vendor: "Green Valley Farm",
        quantity: 2.5,
        pricePerUnit: 28.99,
        total: 72.48,
        orderDate: "2024-01-15",
        status: "Delivered",
        estimatedDelivery: "2024-01-18",
        actualDelivery: "2024-01-17",
        deliveryAddress: "123 Main St, Anytown, CA 90210",
        trackingNumber: "TRK001234567",
      },
      {
        id: "ORD-2024-002",
        productId: "PROD-CH-001",
        productName: "Free Range Chicken Breast",
        vendor: "Sunny Side Poultry",
        quantity: 3.0,
        pricePerUnit: 15.99,
        total: 47.97,
        orderDate: "2024-01-12",
        status: "In Transit",
        estimatedDelivery: "2024-01-16",
        deliveryAddress: "456 Oak Ave, Riverside, CA 92501",
        trackingNumber: "TRK001234568",
      },
      {
        id: "ORD-2024-003",
        productId: "PROD-PK-001",
        productName: "Organic Pork Chops",
        vendor: "Heritage Farms",
        quantity: 1.5,
        pricePerUnit: 22.5,
        total: 33.75,
        orderDate: "2024-01-10",
        status: "Processing",
        estimatedDelivery: "2024-01-14",
        deliveryAddress: "789 Pine St, Oak Hill, CA 93456",
        trackingNumber: "TRK001234569",
      },
      {
        id: "ORD-2024-004",
        productId: "PROD-LB-001",
        productName: "Fresh Lamb Leg",
        vendor: "Mountain View Ranch",
        quantity: 4.0,
        pricePerUnit: 32.99,
        total: 131.96,
        orderDate: "2024-01-08",
        status: "Delivered",
        estimatedDelivery: "2024-01-12",
        actualDelivery: "2024-01-11",
        deliveryAddress: "321 Mountain View Dr, Pine Ridge, CA 94567",
        trackingNumber: "TRK001234570",
      },
      {
        id: "ORD-2024-005",
        productId: "PROD-GT-001",
        productName: "Goat Meat Curry Cut",
        vendor: "Desert Winds Farm",
        quantity: 2.0,
        pricePerUnit: 26.75,
        total: 53.5,
        orderDate: "2024-01-05",
        status: "Cancelled",
        estimatedDelivery: "2024-01-09",
        deliveryAddress: "654 Desert Road, Cactus Valley, CA 95678",
        trackingNumber: "TRK001234571",
      },
      {
        id: "ORD-2024-006",
        productId: "PROD-BF-002",
        productName: "Ground Beef",
        vendor: "Green Valley Farm",
        quantity: 5.0,
        pricePerUnit: 18.99,
        total: 94.95,
        orderDate: "2024-01-20",
        status: "Pending",
        estimatedDelivery: "2024-01-24",
        deliveryAddress: "987 Valley View Ln, Valley Springs, CA 95252",
        trackingNumber: "TRK001234572",
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

  loadData() {
    // Load data from localStorage or use initialized data
    const savedOrders = localStorage.getItem("customerOrders")
    if (savedOrders) {
      this.orders = JSON.parse(savedOrders)
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
      trackingNumber: this.generateTrackingNumber(),
    }
    this.orders.unshift(order)
    this.saveData()
    return order
  }

  generateOrderId() {
    const year = new Date().getFullYear()
    const orderNumber = String(this.orders.length + 1).padStart(3, "0")
    return `ORD-${year}-${orderNumber}`
  }

  generateTrackingNumber() {
    return `TRK${Date.now().toString().slice(-9)}`
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
    const pendingOrders = this.orders.filter(
      (order) => order.status === "Pending" || order.status === "Processing" || order.status === "In Transit",
    ).length
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
    this.dataManager = new CustomerDataManager()
    this.isExpanded = false
    this.hoverTimeout = null
    this.currentFilters = {
      search: "",
      type: "all",
      price: "all",
    }
  }

  init() {
    this.sidebar = document.getElementById("sidebar")
    this.mainContent = document.getElementById("mainContent")
    this.header = document.getElementById("header")
    this.headerTitle = document.getElementById("headerTitle")
    this.content = document.getElementById("content")

    this.setupEventListeners()
    this.updateDashboard()
    this.loadProducts()
    this.loadVendors()
    this.updateOrdersTable()
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
        this.currentFilters.search = e.target.value
        this.filterProducts()
      })
    }

    // Meat Type Filter
    const meatTypeFilter = document.getElementById("meatTypeFilter")
    if (meatTypeFilter) {
      meatTypeFilter.addEventListener("change", (e) => {
        this.currentFilters.type = e.target.value
        this.filterProducts()
      })
    }

    // Price Range Filter
    const priceRangeFilter = document.getElementById("priceRangeFilter")
    if (priceRangeFilter) {
      priceRangeFilter.addEventListener("change", (e) => {
        this.currentFilters.price = e.target.value
        this.filterProducts()
      })
    }
  }

  handlePlaceOrder(formData) {
    const orderData = {
      productId: formData.get("orderProductId") || document.getElementById("orderForm").dataset.productId,
      productName: formData.get("orderProductName"),
      vendor: formData.get("orderVendor"),
      quantity: Number.parseFloat(formData.get("orderQuantity")) || 0,
      pricePerUnit: Number.parseFloat(formData.get("orderPrice").replace("$", "")) || 0,
      total: Number.parseFloat(formData.get("orderTotal").replace("$", "")) || 0,
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

  loadProducts() {
    const productsTableBody = document.getElementById("productsTableBody")
    if (!productsTableBody) return

    const productsHTML = this.dataManager.products
      .map(
        (product) => `
        <tr class="products-table-row" data-type="${product.type}" data-price="${product.price}" data-name="${product.name.toLowerCase()}" data-vendor="${product.vendor.toLowerCase()}">
          <td>
            <strong>${product.name}</strong>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">ID: ${product.id}</div>
          </td>
          <td>${product.vendor}</td>
          <td>${product.type.charAt(0).toUpperCase() + product.type.slice(1)}</td>
          <td><strong>$${product.price}</strong></td>
          <td>${product.unit}</td>
          <td>
            <span class="status-badge ${product.stock > 0 ? (product.stock < 10 ? "status-limited" : "status-available") : "status-out-of-stock"}">
              ${product.stock > 0 ? (product.stock < 10 ? "Limited Stock" : "Available") : "Out of Stock"}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn-outline" onclick="showProductDetails('${product.id}')">View Details</button>
              <button class="btn-primary" onclick="showOrderModal('${product.id}')" ${product.stock === 0 ? "disabled" : ""}>Order</button>
            </div>
          </td>
        </tr>
      `,
      )
      .join("")

    productsTableBody.innerHTML =
      productsHTML || '<tr class="empty-state"><td colspan="7">No products available</td></tr>'
  }

  loadVendors() {
    const vendorsTableBody = document.getElementById("vendorsTableBody")
    if (!vendorsTableBody) return

    const vendorsHTML = this.dataManager.vendors
      .map(
        (vendor) => `
        <tr>
          <td><strong>${vendor.name}</strong></td>
          <td>${vendor.location}</td>
          <td>
            <div class="specialty-tags">
              ${vendor.specialties.map((specialty) => `<span class="specialty-tag">${specialty}</span>`).join("")}
            </div>
          </td>
          <td>
            <span class="status-badge ${vendor.active ? "status-active" : "status-inactive"}">
              ${vendor.active ? "Active" : "Inactive"}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <button class="btn-secondary" onclick="showVendorContactModal('${vendor.id}')">
                Contact
              </button>
              <button class="btn-primary" onclick="viewVendorProducts('${vendor.id}')">
                View Products
              </button>
            </div>
          </td>
        </tr>
      `,
      )
      .join("")

    vendorsTableBody.innerHTML = vendorsHTML || '<tr class="empty-state"><td colspan="5">No vendors available</td></tr>'
  }

  filterProducts() {
    const productRows = document.querySelectorAll("#productsTableBody tr:not(.empty-state)")

    productRows.forEach((row) => {
      let shouldShow = true

      // Search filter
      if (this.currentFilters.search) {
        const searchTerm = this.currentFilters.search.toLowerCase()
        const productName = row.dataset.name || ""
        const vendorName = row.dataset.vendor || ""
        shouldShow = shouldShow && (productName.includes(searchTerm) || vendorName.includes(searchTerm))
      }

      // Type filter
      if (this.currentFilters.type !== "all") {
        shouldShow = shouldShow && row.dataset.type === this.currentFilters.type
      }

      // Price filter
      if (this.currentFilters.price !== "all") {
        const price = Number.parseFloat(row.dataset.price)
        const [min, max] = this.currentFilters.price.split("-").map((p) => Number.parseFloat(p.replace("+", "")))
        if (this.currentFilters.price.includes("+")) {
          shouldShow = shouldShow && price >= min
        } else {
          shouldShow = shouldShow && price >= min && price <= max
        }
      }

      row.style.display = shouldShow ? "" : "none"
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
        this.loadProducts()
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
        this.loadVendors()
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

  updateOrdersTable() {
    const ordersTableBody = document.getElementById("ordersTableBody")
    if (!ordersTableBody) return

    if (this.dataManager.orders.length === 0) {
      ordersTableBody.innerHTML =
        '<tr class="empty-state"><td colspan="8">No orders yet. Start shopping to see your orders here.</td></tr>'
      return
    }

    const ordersHTML = this.dataManager.orders
      .map(
        (order) => `
        <tr>
          <td><strong>${order.id}</strong></td>
          <td>${order.vendor}</td>
          <td>${order.productName} (${order.quantity} kg)</td>
          <td>$${order.total.toFixed(2)}</td>
          <td>
            <span class="status-badge status-${order.status.toLowerCase().replace(" ", "-")}">
              ${order.status}
            </span>
          </td>
          <td>${order.orderDate}</td>
          <td>${order.estimatedDelivery}</td>
          <td>
            <div class="action-buttons">
              <button class="btn-secondary" onclick="trackSpecificOrder('${order.id}')">
                Track
              </button>
              <button class="btn-primary" onclick="viewOrderDetails('${order.id}')">
                Details
              </button>
            </div>
          </td>
        </tr>
      `,
      )
      .join("")

    ordersTableBody.innerHTML = ordersHTML
  }
}

// Global functions
function showProductDetails(productId) {
  const product = dashboard.dataManager.products.find((p) => p.id === productId)
  if (!product) return

  const modal = document.getElementById("productDetailsModal")
  const content = document.getElementById("productDetailsContent")

  content.innerHTML = `
    <div class="product-details-grid">
      <div class="product-details-info">
        <h3>${product.name}</h3>
        <p class="product-details-vendor">by ${product.vendor}</p>
        <p class="product-details-price">$${product.price}/${product.unit}</p>
        <p class="product-details-description">${product.description}</p>
        <div style="margin-bottom: 16px;">
          <strong>Product ID:</strong> ${product.id}<br>
          <strong>Type:</strong> ${product.type.charAt(0).toUpperCase() + product.type.slice(1)}<br>
          <strong>Stock:</strong> ${product.stock > 0 ? `${product.stock} ${product.unit}s available` : "Out of stock"}
        </div>
        <div class="product-details-actions">
          <button class="btn-primary" onclick="showOrderModal('${product.id}'); closeModal('productDetailsModal')" ${product.stock === 0 ? "disabled" : ""}>Order Now</button>
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

function trackSpecificOrder(orderId) {
  const order = dashboard.dataManager.getOrderById(orderId)
  if (!order) {
    alert("Order not found!")
    return
  }

  const orderDetailsContent = `
    <div class="order-tracking-details">
      <div class="tracking-header">
        <h4>Order Tracking Information</h4>
        <div class="order-status">
          <span class="status-badge status-${order.status.toLowerCase().replace(" ", "-")}">${order.status}</span>
        </div>
      </div>
      
      <div class="tracking-info-grid">
        <div class="info-section">
          <h5>Order Information</h5>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
          <p><strong>Product:</strong> ${order.productName}</p>
          <p><strong>Vendor:</strong> ${order.vendor}</p>
          <p><strong>Quantity:</strong> ${order.quantity} kg</p>
          <p><strong>Total:</strong> $${order.total.toFixed(2)}</p>
        </div>
        
        <div class="info-section">
          <h5>Delivery Information</h5>
          <p><strong>Order Date:</strong> ${order.orderDate}</p>
          <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery}</p>
          ${order.actualDelivery ? `<p><strong>Actual Delivery:</strong> ${order.actualDelivery}</p>` : ""}
          <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
        </div>
      </div>
      
      <div class="modal-actions">
        <button class="btn-secondary" onclick="closeModal('orderDetailsModal')">Close</button>
      </div>
    </div>
  `

  document.getElementById("orderDetailsContent").innerHTML = orderDetailsContent
  document.getElementById("orderDetailsModal").classList.add("active")
}

function viewOrderDetails(orderId) {
  const order = dashboard.dataManager.getOrderById(orderId)
  if (!order) {
    alert("Order not found!")
    return
  }

  const modal = document.getElementById("orderDetailsModal")
  const content = document.getElementById("orderDetailsContent")

  content.innerHTML = `
    <div class="order-details-grid" style="display: grid; gap: 20px;">
      <div class="order-info-section">
        <h4>Order Information</h4>
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
          <p><strong>Order Date:</strong> ${order.orderDate}</p>
          <p><strong>Status:</strong> <span class="status-badge status-${order.status.toLowerCase().replace(" ", "-")}">${order.status}</span></p>
        </div>
      </div>
      
      <div class="product-info-section">
        <h4>Product Details</h4>
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <p><strong>Product:</strong> ${order.productName}</p>
          <p><strong>Vendor:</strong> ${order.vendor}</p>
          <p><strong>Quantity:</strong> ${order.quantity} kg</p>
          <p><strong>Price per kg:</strong> $${order.pricePerUnit.toFixed(2)}</p>
          <p><strong>Total Amount:</strong> $${order.total.toFixed(2)}</p>
        </div>
      </div>
      
      <div class="delivery-info-section">
        <h4>Delivery Information</h4>
        <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <p><strong>Delivery Address:</strong> ${order.deliveryAddress}</p>
          <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery}</p>
          ${order.actualDelivery ? `<p><strong>Actual Delivery:</strong> ${order.actualDelivery}</p>` : ""}
        </div>
      </div>
    </div>
    <div class="modal-actions" style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--card-border);">
      <button class="btn-secondary" onclick="closeModal('orderDetailsModal')">Close</button>
      <button class="btn-primary" onclick="trackSpecificOrder('${order.id}')">Track Order</button>
    </div>
  `

  modal.classList.add("active")
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

function viewVendorProducts(vendorId) {
  const vendor = dashboard.dataManager.vendors.find((v) => v.id === vendorId)
  if (vendor) {
    // Switch to products section and filter by vendor
    dashboard.showSection("products")
    const productSearch = document.getElementById("productSearch")
    if (productSearch) {
      productSearch.value = vendor.name
      dashboard.currentFilters.search = vendor.name
      dashboard.filterProducts()
    }
  }
}

function showVendorContactModal(vendorId) {
  const vendor = dashboard.dataManager.vendors.find((v) => v.id === vendorId)
  if (!vendor) return

  document.getElementById("vendorContactName").textContent = vendor.name
  document.getElementById("vendorContactLocation").textContent = vendor.location
  document.getElementById("vendorContactSpecialties").textContent = vendor.specialties.join(", ")
  document.getElementById("vendorContactStatus").textContent = vendor.active ? "Active" : "Inactive"
  document.getElementById("vendorContactPhone").textContent = vendor.contact
  document.getElementById("vendorContactEmail").textContent = vendor.email
  document.getElementById("vendorContactAddress").textContent = vendor.address
  document.getElementById("vendorContactHours").textContent = vendor.businessHours
  document.getElementById("vendorContactDescription").textContent = vendor.description

  document.getElementById("vendorContactModal").classList.add("active")
}

function trackOrder() {
  const orderId = document.getElementById("trackOrderId").value.trim()
  const resultDiv = document.getElementById("trackingResult")

  if (!orderId) {
    resultDiv.innerHTML = '<p style="color: #dc2626;">Please enter an Order ID</p>'
    return
  }

  const order = dashboard.dataManager.getOrderById(orderId)
  if (!order) {
    resultDiv.innerHTML = '<p style="color: #dc2626;">Order not found. Please check the Order ID and try again.</p>'
    return
  }

  resultDiv.innerHTML = `
    <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 16px; margin-top: 12px;">
      <h4 style="margin-bottom: 12px; color: #0369a1;">Order Found!</h4>
      <p><strong>Order ID:</strong> ${order.id}</p>
      <p><strong>Status:</strong> <span class="status-badge status-${order.status.toLowerCase().replace(" ", "-")}">${order.status}</span></p>
      <p><strong>Product:</strong> ${order.productName}</p>
      <p><strong>Estimated Delivery:</strong> ${order.estimatedDelivery}</p>
      ${order.trackingNumber ? `<p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>` : ""}
    </div>
  `
}

// Global dashboard instance
let dashboard

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  dashboard = new CustomerDashboard()
  dashboard.init()
})

// Close modals when clicking outside
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay")) {
    e.target.classList.remove("active")
  }
})
