// AgentDashBoardScript.js
const API_BASE_URL = "http://localhost:3001/api";

// Application State
let currentSection = "dashboard";
const isLoading = false;
let sidebarExpanded = false;

// DataManager class for handling data storage and retrieval
class AgentDataManager {
  constructor() {
    this.purchases = [];
    this.warehouseInventory = [];
    this.sales = [];
    this.vendorOrders = [];
    this.activities = JSON.parse(localStorage.getItem("agent_activities") || "[]");
  }

  async initialize() {
    try {
      await this.loadPurchases();
      await this.loadWarehouse();
      await this.loadSales();
      await this.loadVendorOrders();
    } catch (error) {
      console.error("Error initializing data:", error);
    }
  }

  async loadPurchases() {
    try {
      const response = await fetch(`${API_BASE_URL}/agent-purchases`);
      this.purchases = await response.json();
    } catch (error) {
      console.error("Error loading purchases:", error);
    }
  }

  async loadWarehouse() {
    try {
      const response = await fetch(`${API_BASE_URL}/warehouse-inventory`);
      this.warehouseInventory = await response.json();
    } catch (error) {
      console.error("Error loading warehouse:", error);
    }
  }

  async loadSales() {
    try {
      const response = await fetch(`${API_BASE_URL}/sales-records`);
      this.sales = await response.json();
    } catch (error) {
      console.error("Error loading sales:", error);
    }
  }

  async loadVendorOrders() {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor-orders`);
      this.vendorOrders = await response.json();
    } catch (error) {
      console.error("Error loading vendor orders:", error);
    }
  }

  async addPurchase(purchase) {
    try {
      const response = await fetch(`${API_BASE_URL}/agent-purchases`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(purchase),
      });
      
      const result = await response.json();
      this.addActivity(`Meat batch purchased: ${purchase.batchId} from ${purchase.slaughterhouse} - ${purchase.meatQuantity}kg`);
      await this.loadPurchases();
      return result;
    } catch (error) {
      console.error("Error adding purchase:", error);
      throw error;
    }
  }

  async addToWarehouse(warehouseItem) {
    try {
      const response = await fetch(`${API_BASE_URL}/warehouse-inventory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(warehouseItem),
      });
      
      const result = await response.json();
      this.addActivity(`Batch ${warehouseItem.batchId} stored in warehouse at ${warehouseItem.storageLocation}`);
      await this.loadWarehouse();
      return result;
    } catch (error) {
      console.error("Error adding to warehouse:", error);
      throw error;
    }
  }

  async addSale(sale) {
    try {
      const response = await fetch(`${API_BASE_URL}/sales-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sale),
      });
      
      const result = await response.json();
      this.addActivity(`Sale recorded: ${sale.quantity}kg ${sale.animalType} to ${sale.vendorName} in ${sale.region} - $${sale.sellingPrice}`);
      await this.loadSales();
      return result;
    } catch (error) {
      console.error("Error adding sale:", error);
      throw error;
    }
  }

  async addVendorOrder(order) {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(order),
      });
      
      const result = await response.json();
      this.addActivity(`New vendor order: ${order.quantity}kg ${order.meatType} from ${order.vendorName} (${order.vendorType}) in ${order.region}`);
      await this.loadVendorOrders();
      return result;
    } catch (error) {
      console.error("Error adding vendor order:", error);
      throw error;
    }
  }

  async updateOrderStatus(orderId, status) {
    try {
      const response = await fetch(`${API_BASE_URL}/vendor-orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      
      const result = await response.json();
      this.addActivity(`Order ${orderId} status updated to ${status}`);
      await this.loadVendorOrders();
      return result;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  }

  getStats() {
    const totalPurchases = this.purchases.length;
    const warehouseStock = this.warehouseInventory.reduce((sum, item) => sum + (item.available_quantity || 0), 0);
    const totalSales = this.sales.reduce((sum, sale) => sum + Number.parseFloat(sale.quantity || 0), 0);
    const pendingOrders = this.vendorOrders.filter((order) => order.status === "pending").length;

    return {
      totalPurchases,
      warehouseStock: warehouseStock.toFixed(1),
      totalSales: totalSales.toFixed(1),
      pendingOrders,
    };
  }

  getWarehouseStats() {
    const totalBatches = this.warehouseInventory.length;
    const availableStock = this.warehouseInventory.reduce((sum, item) => sum + (item.available_quantity || 0), 0);
    const reservedStock = this.warehouseInventory.reduce((sum, item) => sum + (item.reserved_quantity || 0), 0);

    return {
      totalBatches,
      availableStock: availableStock.toFixed(1),
      reservedStock: reservedStock.toFixed(1),
    };
  }

  async getAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/analytics`);
      const analytics = await response.json();
      return analytics;
    } catch (error) {
      console.error("Error fetching analytics:", error);
      return {
        totalPurchaseValue: "0",
        avgPurchasePrice: "0",
        totalMeatPurchased: "0",
        totalSalesRevenue: "0",
        avgSellingPrice: "0",
        totalProfit: "0",
        topRegion: "-",
        topMeatType: "-",
        activeVendors: 0
      };
    }
  }

  async getAvailablePurchases() {
    try {
      const response = await fetch(`${API_BASE_URL}/reference/available-batches`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching available purchases:", error);
      return [];
    }
  }

  async getAvailableWarehouseItems() {
    try {
      const response = await fetch(`${API_BASE_URL}/reference/available-warehouse-items`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching available warehouse items:", error);
      return [];
    }
  }

  addActivity(description) {
    const activity = {
      id: this.generateId("ACT"),
      description,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
    };
    this.activities.unshift(activity);

    // Keep only last 50 activities
    if (this.activities.length > 50) {
      this.activities = this.activities.slice(0, 50);
    }
    localStorage.setItem("agent_activities", JSON.stringify(this.activities));
  }

  generateId(prefix) {
    return `${prefix}${Date.now()}${Math.random().toString(36).substr(2, 5)}`;
  }
}

// Dashboard class for managing the dashboard functionality
class AgentDashboard {
  constructor() {
    this.dataManager = new AgentDataManager();
    this.init();
  }

  async init() {
    // Initialize the data manager first
    await this.dataManager.initialize();
    
    this.sidebar = document.getElementById("sidebar");
    this.mainContent = document.getElementById("mainContent");
    this.header = document.getElementById("header");
    this.headerTitle = document.getElementById("headerTitle");
    this.content = document.getElementById("content");

    this.setupEventListeners();
    this.updateDashboard();
    this.populateSelects();
    this.showSection("dashboard");
  }

  setupEventListeners() {
    // Sidebar hover events
    this.sidebar.addEventListener("mouseenter", () => this.handleSidebarMouseEnter());
    this.sidebar.addEventListener("mouseleave", () => this.handleSidebarMouseLeave());

    // Main content click event
    this.content.addEventListener("click", () => this.handleMainContentClick());

    // Prevent sidebar clicks from bubbling to main content
    this.sidebar.addEventListener("click", (e) => e.stopPropagation());

    // Navigation item clicks
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        this.handleNavItemClick(item);
      });
    });

    // Form submissions
    this.setupFormHandlers();

    // Search and filter functionality
    this.setupSearchAndFilters();

    // Table sorting
    this.setupTableSorting();

    // Logout button
    const logoutBtn = document.querySelector(".logout-btn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        console.log("Logout clicked");
        // Add logout functionality here
      });
    }
  }

  setupFormHandlers() {
    // Purchase Form
    const purchaseForm = document.getElementById("purchaseForm");
    if (purchaseForm) {
      purchaseForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handlePurchase(new FormData(purchaseForm));
      });
    }

    // Warehouse Form
    const warehouseForm = document.getElementById("warehouseForm");
    if (warehouseForm) {
      warehouseForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleWarehouse(new FormData(warehouseForm));
      });
    }

    // Sale Form
    const saleForm = document.getElementById("saleForm");
    if (saleForm) {
      saleForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleSale(new FormData(saleForm));
      });
    }

    // Vendor Order Form
    const vendorOrderForm = document.getElementById("vendorOrderForm");
    if (vendorOrderForm) {
      vendorOrderForm.addEventListener("submit", (e) => {
        e.preventDefault();
        this.handleVendorOrder(new FormData(vendorOrderForm));
      });
    }
  }

  async handlePurchase(formData) {
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
      agentId: 1, // Default agent ID
    };

    try {
      await this.dataManager.addPurchase(purchase);
      this.updatePurchasesTable();
      this.updateDashboard();
      this.populateSelects();
      closeModal("purchaseModal");
      document.getElementById("purchaseForm").reset();
    } catch (error) {
      alert("Error adding purchase: " + error.message);
    }
  }

  async handleWarehouse(formData) {
    const warehouseItem = {
      batchId: formData.get("warehouseBatchId"),
      storageLocation: formData.get("storageLocation"),
      storageTemperature: formData.get("storageTemperature"),
      storedDate: formData.get("storedDate"),
    };

    try {
      await this.dataManager.addToWarehouse(warehouseItem);
      this.updateWarehouseTable();
      this.updateDashboard();
      this.populateSelects();
      closeModal("warehouseModal");
      document.getElementById("warehouseForm").reset();
    } catch (error) {
      alert("Error adding to warehouse: " + error.message);
    }
  }

  async handleSale(formData) {
    const sale = {
      warehouseId: formData.get("saleWarehouseBatch"),
      vendorName: formData.get("vendorName"),
      vendorType: formData.get("vendorType"),
      region: formData.get("vendorRegion"),
      quantity: formData.get("saleQuantity"),
      sellingPrice: formData.get("sellingPrice"),
      saleDate: formData.get("saleDate"),
      batchId: formData.get("saleWarehouseBatch"),
      agentId: 1, // Default agent ID
    };

    try {
      await this.dataManager.addSale(sale);
      this.updateSalesTable();
      this.updateWarehouseTable();
      this.updateDashboard();
      this.populateSelects();
      closeModal("saleModal");
      document.getElementById("saleForm").reset();
    } catch (error) {
      alert("Error recording sale: " + error.message);
    }
  }

  async handleVendorOrder(formData) {
    const order = {
      vendorName: formData.get("orderVendorName"),
      vendorType: formData.get("orderVendorType"),
      region: formData.get("orderVendorRegion"),
      meatType: formData.get("orderMeatType"),
      quantity: formData.get("orderQuantity"),
      orderDate: formData.get("orderDate"),
      requiredDate: formData.get("requiredDate"),
      expectedPrice: formData.get("expectedPrice"),
    };

    try {
      await this.dataManager.addVendorOrder(order);
      this.updateVendorOrdersTable();
      this.updateDashboard();
      closeModal("vendorOrderModal");
      document.getElementById("vendorOrderForm").reset();
    } catch (error) {
      alert("Error creating vendor order: " + error.message);
    }
  }

  updateDashboard() {
    const stats = this.dataManager.getStats();
    document.getElementById("totalPurchases").textContent = stats.totalPurchases;
    document.getElementById("warehouseStock").textContent = `${stats.warehouseStock} kg`;
    document.getElementById("totalSales").textContent = `${stats.totalSales} kg`;
    document.getElementById("pendingOrders").textContent = stats.pendingOrders;

    this.updateRecentActivities();
    this.updateAnalytics();
  }

  async updateAnalytics() {
    const analytics = await this.dataManager.getAnalytics();

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
    };

    Object.keys(elements).forEach((key) => {
      if (elements[key]) {
        if (key.includes("Price") || key.includes("Value") || key.includes("Revenue") || key.includes("Profit")) {
          elements[key].textContent = `$${analytics[key] || 0}`;
        } else if (key.includes("Purchased")) {
          elements[key].textContent = `${analytics[key] || 0} kg`;
        } else {
          elements[key].textContent = analytics[key] || 0;
        }
      }
    });
  }

  updateRecentActivities() {
    const activitiesContainer = document.getElementById("recentActivities");
    const activities = this.dataManager.activities.slice(0, 5);

    if (activities.length === 0) {
      activitiesContainer.innerHTML = '<div class="activity-item empty-state"><p>No recent activities</p></div>';
      return;
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
      .join("");
  }

  updatePurchasesTable() {
    const tbody = document.getElementById("purchasesBody");
    const purchases = this.dataManager.purchases;

    if (purchases.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="9">No purchases recorded yet. Click "Purchase Meat Batch" to get started.</td></tr>';
      return;
    }

    tbody.innerHTML = purchases
      .map(
        (purchase) => `
      <tr>
        <td>${purchase.batch_id}</td>
        <td>${purchase.slaughterhouse_area}</td>
        <td>${purchase.total_weight}</td>
        <td>${purchase.meat_type}</td>
        <td>${purchase.breed || "N/A"}</td>
        <td>$${purchase.purchase_price || "N/A"}</td>
        <td>${purchase.purchase_date}</td>
        <td>${purchase.produce_date}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewPurchaseDetails('${purchase.batch_id}')">
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
      .join("");
  }

  updateWarehouseTable() {
    const tbody = document.getElementById("warehouseBody");
    const inventory = this.dataManager.warehouseInventory;

    if (inventory.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="10">No items in warehouse yet. Purchase meat batches to populate inventory.</td></tr>';
      return;
    }

    tbody.innerHTML = inventory
      .map(
        (item) => `
      <tr>
        <td>${item.batch_id}</td>
        <td>${item.batch_id}</td>
        <td>${item.meat_type}</td>
        <td>${item.total_quantity}</td>
        <td>${item.available_quantity}</td>
        <td>${item.storage_location}</td>
        <td>${item.temperature}</td>
        <td>${item.stored_date}</td>
        <td><span class="badge badge-${item.status}">${item.status}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewWarehouseDetails('${item.batch_id}')">
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
      .join("");
  }

  updateSalesTable() {
    const tbody = document.getElementById("salesBody");
    const sales = this.dataManager.sales;

    if (sales.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="9">No sales recorded yet. Click "Record Sale" to add your first sale.</td></tr>';
      return;
    }

    tbody.innerHTML = sales
      .map(
        (sale) => `
      <tr>
        <td>${sale.vendor_name}</td>
        <td>${sale.vendor_type}</td>
        <td>${sale.region}</td>
        <td>${sale.quantity}</td>
        <td>${sale.animal_type}</td>
        <td>$${sale.selling_price}</td>
        <td>${sale.sale_date}</td>
        <td>$${sale.profit || 0}</td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewSaleDetails('${sale.salesId}')">
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
      .join("");
  }

  updateVendorOrdersTable() {
    const tbody = document.getElementById("vendorOrdersBody");
    const orders = this.dataManager.vendorOrders;

    if (orders.length === 0) {
      tbody.innerHTML =
        '<tr class="empty-state"><td colspan="10">No vendor orders yet. Click "New Vendor Order" to add your first order.</td></tr>';
      return;
    }

    tbody.innerHTML = orders
      .map(
        (order) => `
      <tr>
        <td>${order.orderID}</td>
        <td>${order.vendor_name}</td>
        <td>${order.vendor_type}</td>
        <td>${order.region}</td>
        <td>${order.meat_type}</td>
        <td>${order.quantity}</td>
        <td>${order.orderDate}</td>
        <td>${order.requiredDate || "N/A"}</td>
        <td><span class="badge badge-${order.status}">${order.status}</span></td>
        <td>
          <div class="action-buttons">
            <button class="btn-icon" title="View Details" onclick="viewOrderDetails('${order.orderID}')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
            <button class="btn-icon" title="Update Status" onclick="updateOrderStatus('${order.orderID}')">
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

  async populateSelects() {
    try {
      // Populate warehouse batch select for adding to warehouse
      const warehouseBatchSelect = document.getElementById("warehouseBatchId");
      if (warehouseBatchSelect) {
        const availablePurchases = await this.dataManager.getAvailablePurchases();
        warehouseBatchSelect.innerHTML =
          '<option value="">Select Batch</option>' +
          availablePurchases
            .map(
              (purchase) =>
                `<option value="${purchase.batch_id}">Batch ${purchase.batch_id} - ${purchase.total_weight}kg ${purchase.meat_type}</option>`,
            )
            .join("");
      }

      // Populate sale warehouse batch select
      const saleWarehouseBatchSelect = document.getElementById("saleWarehouseBatch");
      if (saleWarehouseBatchSelect) {
        const availableItems = await this.dataManager.getAvailableWarehouseItems();
        saleWarehouseBatchSelect.innerHTML =
          '<option value="">Select Batch</option>' +
          availableItems
            .map(
              (item) =>
                `<option value="${item.batch_id}">Batch ${item.batch_id} - ${item.available_quantity}kg ${item.meat_type} available</option>`,
            )
            .join("");
      }
    } catch (error) {
      console.error("Error populating selects:", error);
    }
  }

  setupSearchAndFilters() {
    // Add search and filter functionality here
    // Similar to the butcher dashboard implementation
  }

  setupTableSorting() {
    const sortableHeaders = document.querySelectorAll(".sortable");
    sortableHeaders.forEach((header) => {
      header.addEventListener("click", () => {
        const table = header.closest("table");
        const column = header.dataset.sort;
        this.sortTable(table, column);
      });
    });
  }

  sortTable(table, column) {
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr:not(.empty-state)"));
    const columnIndex = Array.from(table.querySelectorAll("th")).findIndex((th) => th.dataset.sort === column);

    rows.sort((a, b) => {
      const aValue = a.cells[columnIndex].textContent.trim();
      const bValue = b.cells[columnIndex].textContent.trim();

      // Handle numeric values
      if (!isNaN(aValue) && !isNaN(bValue)) {
        return Number.parseFloat(aValue) - Number.parseFloat(bValue);
      }

      // Handle text values
      return aValue.localeCompare(bValue);
    });

    // Clear and re-append sorted rows
    const emptyState = tbody.querySelector(".empty-state");
    tbody.innerHTML = "";
    if (emptyState) tbody.appendChild(emptyState);
    rows.forEach((row) => tbody.appendChild(row));
  }

  handleSidebarMouseEnter() {
    this.expandSidebar();
  }

  handleSidebarMouseLeave() {
    setTimeout(() => {
      this.collapseSidebar();
    }, 300);
  }

  handleMainContentClick() {
    if (sidebarExpanded) {
      this.collapseSidebar();
    }
  }

  handleNavItemClick(item) {
    // Remove active class from all nav items
    document.querySelectorAll(".nav-item").forEach((navItem) => {
      navItem.classList.remove("active");
    });

    // Add active class to clicked item
    item.classList.add("active");

    const sectionName = item.dataset.section;
    console.log("Navigating to:", sectionName);

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
      };
      this.headerTitle.textContent = titles[sectionName] || "AgentPro Dashboard";
    }

    // Show appropriate section
    this.showSection(sectionName);
  }

  showSection(sectionName) {
    // Hide all sections
    document.querySelectorAll(".section-content").forEach((section) => {
      section.style.display = "none";
      section.classList.remove("active");
    });

    // Show selected section
    let sectionId = "dashboard-section"; // default
    switch (sectionName) {
      case "dashboard":
        sectionId = "dashboard-section";
        this.updateDashboard();
        break;
      case "purchases":
        sectionId = "purchases-section";
        this.updatePurchasesTable();
        break;
      case "warehouse":
        sectionId = "warehouse-section";
        this.updateWarehouseTable();
        this.updateWarehouseStats();
        break;
      case "sales":
        sectionId = "sales-section";
        this.updateSalesTable();
        break;
      case "vendor-orders":
        sectionId = "vendor-orders-section";
        this.updateVendorOrdersTable();
        break;
      case "analytics":
        sectionId = "analytics-section";
        this.updateAnalytics();
        break;
      case "settings":
        sectionId = "settings-section";
        break;
    }

    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
      targetSection.style.display = "block";
      targetSection.classList.add("active");
    }

    this.populateSelects();
    currentSection = sectionName;
  }

  updateWarehouseStats() {
    const stats = this.dataManager.getWarehouseStats();

    const totalBatchesEl = document.getElementById("totalWarehouseBatches");
    const availableStockEl = document.getElementById("availableStock");
    const reservedStockEl = document.getElementById("reservedStock");

    if (totalBatchesEl) totalBatchesEl.textContent = stats.totalBatches;
    if (availableStockEl) availableStockEl.textContent = `${stats.availableStock} kg`;
    if (reservedStockEl) reservedStockEl.textContent = `${stats.reservedStock} kg`;
  }

  expandSidebar() {
    sidebarExpanded = true;
    this.sidebar.classList.add("expanded");
    this.mainContent.classList.add("expanded");
    this.header.classList.add("expanded");
    this.headerTitle.classList.add("hidden");
  }

  collapseSidebar() {
    sidebarExpanded = false;
    this.sidebar.classList.remove("expanded");
    this.mainContent.classList.remove("expanded");
    this.header.classList.remove("expanded");
    this.headerTitle.classList.remove("hidden");
  }
}

// Global functions for modal management
function showPurchaseModal() {
  document.getElementById("purchaseModal").classList.add("active");
}

async function showWarehouseModal() {
  try {
    const availablePurchases = await dashboard.dataManager.getAvailablePurchases();
    if (availablePurchases.length === 0) {
      alert("No purchased batches available to add to warehouse. Please purchase meat batches first.");
      return;
    }
    document.getElementById("warehouseModal").classList.add("active");
  } catch (error) {
    console.error("Error showing warehouse modal:", error);
    alert("Error loading available batches");
  }
}

async function showSaleModal() {
  try {
    const availableItems = await dashboard.dataManager.getAvailableWarehouseItems();
    if (availableItems.length === 0) {
      alert("No warehouse items available for sale. Please add items to warehouse first.");
      return;
    }
    document.getElementById("saleModal").classList.add("active");
  } catch (error) {
    console.error("Error showing sale modal:", error);
    alert("Error loading available warehouse items");
  }
}

function showVendorOrderModal() {
  document.getElementById("vendorOrderModal").classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
}

// Global functions for viewing details
function viewPurchaseDetails(purchaseId) {
  const purchase = dashboard.dataManager.purchases.find((p) => p.batch_id == purchaseId);
  if (purchase) {
    alert(
      `Purchase Details:\n\nBatch ID: ${purchase.batch_id}\nSlaughterhouse: ${purchase.slaughterhouse_area}\nQuantity: ${purchase.total_weight}kg\nAnimal Type: ${purchase.meat_type}\nBreed: ${purchase.breed}\nGender: ${purchase.gender}\nPurchase Date: ${purchase.purchase_date}\nPrice: $${purchase.purchase_price}`,
    );
  }
}

function viewWarehouseDetails(warehouseId) {
  const item = dashboard.dataManager.warehouseInventory.find((w) => w.batch_id == warehouseId);
  if (item) {
    alert(
      `Warehouse Details:\n\nBatch ID: ${item.batch_id}\nMeat Type: ${item.meat_type}\nTotal Quantity: ${item.total_quantity}kg\nAvailable: ${item.available_quantity}kg\nReserved: ${item.reserved_quantity}kg\nStorage Location: ${item.storage_location}\nTemperature: ${item.temperature}\nStored Date: ${item.stored_date}\nStatus: ${item.status}`,
    );
  }
}

function viewSaleDetails(saleId) {
  const sale = dashboard.dataManager.sales.find((s) => s.salesId == saleId);
  if (sale) {
    alert(
      `Sale Details:\n\nVendor: ${sale.vendor_name} (${sale.vendor_type})\nRegion: ${sale.region}\nQuantity: ${sale.quantity}kg\nAnimal Type: ${sale.animal_type}\nSelling Price: $${sale.selling_price}\nProfit: $${sale.profit}\nSale Date: ${sale.sale_date}`,
    );
  }
}

function viewOrderDetails(orderId) {
  const order = dashboard.dataManager.vendorOrders.find((o) => o.orderID == orderId);
  if (order) {
    alert(
      `Order Details:\n\nOrder ID: ${order.orderID}\nVendor: ${order.vendor_name} (${order.vendor_type})\nRegion: ${order.region}\nMeat Type: ${order.meat_type}\nQuantity: ${order.quantity}kg\nOrder Date: ${order.orderDate}\nRequired Date: ${order.requiredDate || "N/A"}\nExpected Price: $${order.expected_price}\nStatus: ${order.status}`,
    );
  }
}

async function updateOrderStatus(orderId) {
  const newStatus = prompt("Enter new status (pending, processing, completed):");
  if (newStatus && ["pending", "processing", "completed"].includes(newStatus.toLowerCase())) {
    try {
      await dashboard.dataManager.updateOrderStatus(orderId, newStatus.toLowerCase());
      dashboard.updateVendorOrdersTable();
      dashboard.updateDashboard();
    } catch (error) {
      alert("Error updating order status: " + error.message);
    }
  } else if (newStatus) {
    alert("Invalid status. Please use: pending, processing, or completed");
  }
}

// Global dashboard instance
let dashboard;

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  dashboard = new AgentDashboard();
});

// Console log for debugging
console.log("AgentPro Dashboard System Loaded");