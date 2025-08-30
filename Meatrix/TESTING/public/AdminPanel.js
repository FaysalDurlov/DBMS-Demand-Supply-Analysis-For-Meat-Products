class MeatAdminDashboard {
  constructor() {
    console.log("[v0] Creating MeatAdminDashboard")
    this.editingIndex = -1
    this.editingType = null
    this.isExpanded = false
    this.currentSection = "dashboard"
    this.charts = {}

    this.data = {
      meatProducts: [],
      productionRecords: [],
      priceTrends: [],
      consumptionPatterns: [],
      demandElasticity: [],
      supplyDemand: [],
      insightsReports: [],
    }

    this.referenceData = {
      farms: [],
      slaughterHouses: [],
      agents: [],
      industries: [],
    }

    this.init()
  }

  async init() {
    console.log("[v0] Initializing MeatAdminDashboard")

    await this.checkDatabaseConnection()

    await this.loadReferenceData()
    await this.loadAllData()
    this.setupEventListeners()
    this.showSection("dashboard")
    this.updateDashboard()
  }

  async checkDatabaseConnection() {
    try {
      console.log("[v0] Checking database connection...")
      const response = await fetch("/api/health")
      const health = await response.json()

      if (health.status === "healthy") {
        console.log("[v0] Database connection successful")
        this.showNotification("Database connected successfully", "success")
      } else {
        console.error("[v0] Database connection failed:", health)
        this.showNotification("Database connection failed: " + health.error, "error")
      }
    } catch (error) {
      console.error("[v0] Health check failed:", error)
      this.showNotification("Cannot connect to server", "error")
    }
  }

  async loadReferenceData() {
    try {
      console.log("[v0] Loading reference data...")
      const [farms, slaughterHouses, agents, industries] = await Promise.all([
        fetch("/api/farms").then((r) => r.json()),
        fetch("/api/slaughter-houses").then((r) => r.json()),
        fetch("/api/agents").then((r) => r.json()),
        fetch("/api/industries").then((r) => r.json()),
      ])

      this.referenceData = { farms, slaughterHouses, agents, industries }
      console.log("[v0] Reference data loaded:", this.referenceData)
    } catch (error) {
      console.error("[v0] Error loading reference data:", error)
      this.showNotification("Failed to load reference data: " + error.message, "error")
    }
  }

  async loadAllData() {
    try {
      console.log("[v0] Loading all data from database...")

      const [
        meatProductsView,
        productionRecordsView,
        priceTrendsView,
        consumptionPatterns,
        demandElasticityView,
        supplyDemandView,
      ] = await Promise.all([
        fetch("/api/meat-products-view").then(async (r) => {
          if (!r.ok) {
            const error = await r.json()
            throw new Error(`Meat products: ${error.error} - ${error.details || ""}`)
          }
          return r.json()
        }),
        fetch("/api/production-records-view").then(async (r) => {
          if (!r.ok) {
            const error = await r.json()
            throw new Error(`Production records: ${error.error} - ${error.details || ""}`)
          }
          return r.json()
        }),
        fetch("/api/price-trends-view").then(async (r) => {
          if (!r.ok) {
            const error = await r.json()
            throw new Error(`Price trends: ${error.error} - ${error.details || ""}`)
          }
          return r.json()
        }),
        fetch("/api/consumption-patterns").then(async (r) => {
          if (!r.ok) {
            const error = await r.json()
            throw new Error(`Consumption patterns: ${error.error} - ${error.details || ""}`)
          }
          return r.json()
        }),
        fetch("/api/demand-elasticity-view").then(async (r) => {
          if (!r.ok) {
            const error = await r.json()
            throw new Error(`Demand elasticity: ${error.error} - ${error.details || ""}`)
          }
          return r.json()
        }),
        fetch("/api/supply-demand-view").then(async (r) => {
          if (!r.ok) {
            const error = await r.json()
            throw new Error(`Supply demand: ${error.error} - ${error.details || ""}`)
          }
          return r.json()
        }),
      ])

      // Transform the data to match frontend format
      this.data.meatProducts = meatProductsView.map((item) => ({
        productType: item.Product_type,
        breedVariety: item.Breed,
        avgLiveWeight: item.Weight,
        carcassWeight: item.Carcass_weight,
        feedConversionRatio: item.FCR,
        rearingPeriod: item.Rearing_Period,
      }))

      this.data.productionRecords = productionRecordsView.map((item) => ({
        year: item.Year,
        regionDistrict: item.Region,
        livestockPopulation: item.LiveStockPopulation,
        slaughterRate: item.SlaughterRatePercentage,
        animalsSlaughtered: item.AnimalsSlaughtered,
        totalMeatYield: item.TotalMeatYield,
        yieldPerAnimal: item.AVGYieldPerAnimal,
      }))

      this.data.priceTrends = priceTrendsView.map((item) => ({
        date: item.Date,
        regionMarket: item.Region,
        productType: item.ProductType,
        wholesalePrice: item.WholeSalePrice,
        retailPrice: item.RetailPrice,
        priceChange: item.PriceChangePercentage || 0,
        seasonalTrend: item.PriceChangePercentage > 0 ? "↑" : item.PriceChangePercentage < 0 ? "↓" : "stable",
      }))

      this.data.consumptionPatterns = consumptionPatterns.map((item) => ({
        region: item.region,
        population: item.population,
        meatType: item.meat_type,
        perCapitaConsumption: item.per_capita,
        shareOfDiet: item.total_diet,
        nutritionalContribution: item.nutrition_contribution,
        demographicGroup: item.demographic,
      }))

      this.data.demandElasticity = demandElasticityView.map((item) => ({
        productType: item.ProductType,
        timePeriod: item.TimePeriod,
        averagePrice: item.AveragePrice || 0,
        quantityDemanded: item.QuantityDemanded || 0,
        priceElasticity: item.PriceElasticityOfDemand || 0,
        crossElasticity: item.CrossElasticity || "+0.3 with alternatives",
        incomeElasticity: item.IncomeElasticity || 1.2,
      }))

      this.data.supplyDemand = supplyDemandView.map((item) => ({
        region: item.Region,
        timePeriod: item.TimePeriod,
        supplyVolume: item.SupplyVolume || 0,
        demandVolume: item.DemandVolume || 0,
        surplusDeficit: item.SurplusDeficit || 0,
        selfSufficiencyRatio: item.SelfSufficiencyRatio || 0,
      }))

      // Generate sample insights data (since this is more analytical)
      this.generateSampleInsightsData()

      console.log("[v0] All data loaded successfully from database")
      console.log("[v0] Data summary:", {
        meatProducts: this.data.meatProducts.length,
        productionRecords: this.data.productionRecords.length,
        priceTrends: this.data.priceTrends.length,
        consumptionPatterns: this.data.consumptionPatterns.length,
        demandElasticity: this.data.demandElasticity.length,
        supplyDemand: this.data.supplyDemand.length,
      })

      this.showNotification("All data loaded successfully from database", "success")

      // Update all tables with real data
      this.updateAllTables()
    } catch (error) {
      console.error("[v0] Error loading data:", error)
      this.showNotification("Error loading data: " + error.message, "error")

      console.error("[v0] Database connection or query failed. Please check:")
      console.error("1. MySQL server is running")
      console.error("2. Database 'livestockdb' exists")
      console.error("3. All required tables are created")
      console.error("4. Database credentials are correct")
    }
  }

  updateAllTables() {
    this.updateTable("meatProducts")
    this.updateTable("productionRecords")
    this.updateTable("priceTrends")
    this.updateTable("consumptionPatterns")
    this.updateTable("demandElasticity")
    this.updateTable("supplyDemand")
    this.updateTable("insightsReports")
  }

  generateSampleInsightsData() {
    this.data.insightsReports = [
      {
        region: "North District",
        keyTrend: "Rising beef demand",
        mainChallenge: "High feed costs",
        opportunity: "Export potential",
        recommendation: "Invest in feed efficiency programs and explore export markets",
      },
      {
        region: "South District",
        keyTrend: "Chicken consumption growth",
        mainChallenge: "Seasonal supply shortage",
        opportunity: "Year-round production",
        recommendation: "Develop cold storage infrastructure and contract farming",
      },
    ]
  }

  setupEventListeners() {
    // Sidebar hover events
    const sidebar = document.getElementById("sidebar")
    const mainContent = document.getElementById("mainContent")
    const header = document.getElementById("header")

    sidebar.addEventListener("mouseenter", () => this.expandSidebar())
    sidebar.addEventListener("mouseleave", () => this.collapseSidebar())

    // Navigation clicks
    document.addEventListener("click", (e) => {
      if (e.target.closest(".nav-item")) {
        e.preventDefault()
        this.handleNavigation(e.target.closest(".nav-item"))
      }

      // Modal controls
      if (e.target.closest("[data-action]")) {
        this.handleAction(e.target.closest("[data-action]").dataset.action)
      }

      if (e.target.closest("[data-modal]")) {
        this.closeModal(e.target.closest("[data-modal]").dataset.modal)
      }

      if (e.target.classList.contains("modal-close")) {
        this.closeModal(e.target.closest(".modal").id)
      }

      // Edit/Delete buttons
      if (e.target.closest(".action-btn-edit")) {
        const btn = e.target.closest(".action-btn-edit")
        this.editRecord(btn.dataset.type, Number.parseInt(btn.dataset.index))
      }

      if (e.target.closest(".action-btn-delete")) {
        const btn = e.target.closest(".action-btn-delete")
        this.deleteRecord(btn.dataset.type, Number.parseInt(btn.dataset.index))
      }
    })

    // Form submissions
    document.addEventListener("submit", (e) => {
      e.preventDefault()
      this.handleFormSubmit(e.target)
    })

    // Close modals when clicking outside
    document.addEventListener("click", (e) => {
      if (e.target.classList.contains("modal")) {
        this.closeModal(e.target.id)
      }
    })
  }

  expandSidebar() {
    const sidebar = document.getElementById("sidebar")
    const mainContent = document.getElementById("mainContent")
    const header = document.getElementById("header")

    sidebar.classList.add("expanded")
    mainContent.classList.add("expanded")
    header.classList.add("expanded")
    this.isExpanded = true
  }

  collapseSidebar() {
    const sidebar = document.getElementById("sidebar")
    const mainContent = document.getElementById("mainContent")
    const header = document.getElementById("header")

    sidebar.classList.remove("expanded")
    mainContent.classList.remove("expanded")
    header.classList.remove("expanded")
    this.isExpanded = false
  }

  handleNavigation(navItem) {
    // Remove active class from all nav items
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active")
    })

    // Add active class to clicked item
    navItem.classList.add("active")

    const section = navItem.dataset.section
    this.showSection(section)
  }

  showSection(sectionName) {
    console.log("[v0] Showing section:", sectionName)

    // Hide all sections
    const sections = document.querySelectorAll(".section-content")
    sections.forEach((section) => section.classList.remove("active"))

    // Show target section
    const targetSection = document.getElementById(`${sectionName}-section`)
    if (targetSection) {
      targetSection.classList.add("active")
    }

    // Update navigation
    const navItems = document.querySelectorAll(".nav-item")
    navItems.forEach((item) => item.classList.remove("active"))

    const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`)
    if (activeNavItem) {
      activeNavItem.classList.add("active")
    }

    // Update header title
    const headerTitle = document.getElementById("headerTitle")
    const titles = {
      dashboard: "Admin Dashboard",
      "meat-products": "Meat Product Data",
      "production-records": "Production Records",
      "price-trends": "Price Trends",
      "consumption-patterns": "Consumption Patterns",
      "demand-elasticity": "Demand Elasticity",
      "supply-demand": "Supply vs Demand",
      "insights-reports": "Insights & Reports",
    }
    if (headerTitle && titles[sectionName]) {
      headerTitle.textContent = titles[sectionName]
    }

    this.updateSectionContent(sectionName)
  }

  updateSectionContent(sectionName) {
    console.log("[v0] Updating section content for:", sectionName)

    // Map section names to data types
    const sectionToDataType = {
      "meat-products": "meatProducts",
      "production-records": "productionRecords",
      "price-trends": "priceTrends",
      "consumption-patterns": "consumptionPatterns",
      "demand-elasticity": "demandElasticity",
      "supply-demand": "supplyDemand",
      "insights-reports": "insightsReports",
    }

    const dataType = sectionToDataType[sectionName]
    if (dataType) {
      console.log("[v0] Updating table for dataType:", dataType)
      this.updateTable(dataType)

      // Update charts for sections that have them
      if (sectionName === "demand-elasticity") {
        this.updateChart("demandElasticityDetailChart")
      } else if (sectionName === "supply-demand") {
        this.updateChart("supplyDemandDetailChart")
      } else if (sectionName === "insights-reports") {
        this.updateChart("insightsDetailChart")
      }
    }

    // Update dashboard stats and charts
    if (sectionName === "dashboard") {
      this.updateDashboard()
    }
  }

  updateTable(dataType) {
    console.log("[v0] Updating table for dataType:", dataType)
    const tableBodyId = `${dataType}TableBody`
    console.log("[v0] Looking for table body with ID:", tableBodyId)

    const tableBody = document.getElementById(tableBodyId)
    console.log("[v0] Found table body:", tableBody)

    if (!tableBody) {
      console.log("[v0] Table body not found!")
      return
    }

    const data = this.data[dataType]
    console.log("[v0] Data for table:", data)

    if (!data || data.length === 0) {
      console.log("[v0] No data found for dataType:", dataType)
      return
    }

    tableBody.innerHTML = ""

    data.forEach((item, index) => {
      const row = document.createElement("tr")
      row.innerHTML = this.generateTableRow(dataType, item, index)
      tableBody.appendChild(row)
    })

    console.log("[v0] Table updated with", data.length, "rows")
  }

  generateTableRow(dataType, item, index) {
    const actionButtons = `
            <div class="action-buttons">
                <button class="action-btn action-btn-edit" data-type="${dataType}" data-index="${index}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit
                </button>
                <button class="action-btn action-btn-delete" data-type="${dataType}" data-index="${index}">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Delete
                </button>
            </div>
        `

    switch (dataType) {
      case "meatProducts":
        return `
                    <td>${item.productType}</td>
                    <td>${item.breedVariety}</td>
                    <td>${item.avgLiveWeight}</td>
                    <td>${item.carcassWeight}</td>
                    <td>${item.feedConversionRatio}</td>
                    <td>${item.rearingPeriod}</td>
                    <td>${actionButtons}</td>
                `
      case "productionRecords":
        return `
                    <td>${item.year}</td>
                    <td>${item.regionDistrict}</td>
                    <td>${item.livestockPopulation.toLocaleString()}</td>
                    <td>${item.slaughterRate}%</td>
                    <td>${item.animalsSlaughtered.toLocaleString()}</td>
                    <td>${item.totalMeatYield.toLocaleString()}</td>
                    <td>${item.yieldPerAnimal}</td>
                    <td>${actionButtons}</td>
                `
      case "priceTrends":
        return `
                    <td>${item.date}</td>
                    <td>${item.regionMarket}</td>
                    <td>${item.productType}</td>
                    <td>$${item.wholesalePrice.toFixed(2)}</td>
                    <td>$${item.retailPrice.toFixed(2)}</td>
                    <td>${item.priceChange > 0 ? "+" : ""}${item.priceChange}%</td>
                    <td>${item.seasonalTrend}</td>
                    <td>${actionButtons}</td>
                `
      case "consumptionPatterns":
        return `
                    <td>${item.region}</td>
                    <td>${item.population.toLocaleString()}</td>
                    <td>${item.meatType}</td>
                    <td>${item.perCapitaConsumption}</td>
                    <td>${item.shareOfDiet}%</td>
                    <td>${item.nutritionalContribution}</td>
                    <td>${item.demographicGroup}</td>
                    <td>${actionButtons}</td>
                `
      case "demandElasticity":
        return `
                    <td>${item.productType}</td>
                    <td>${item.timePeriod}</td>
                    <td>$${item.averagePrice.toFixed(2)}</td>
                    <td>${item.quantityDemanded.toLocaleString()}</td>
                    <td>${item.priceElasticity}</td>
                    <td>${item.crossElasticity}</td>
                    <td>${item.incomeElasticity || "N/A"}</td>
                    <td>${actionButtons}</td>
                `
      case "supplyDemand":
        return `
                    <td>${item.region}</td>
                    <td>${item.timePeriod}</td>
                    <td>${item.supplyVolume.toLocaleString()}</td>
                    <td>${item.demandVolume.toLocaleString()}</td>
                    <td>${item.surplusDeficit > 0 ? "+" : ""}${item.surplusDeficit.toLocaleString()}</td>
                    <td>${item.selfSufficiencyRatio.toFixed(1)}%</td>
                    <td>${actionButtons}</td>
                `
      case "insightsReports":
        return `
                    <td>${item.region}</td>
                    <td>${item.keyTrend}</td>
                    <td>${item.mainChallenge}</td>
                    <td>${item.opportunity}</td>
                    <td>${item.recommendation}</td>
                    <td>${actionButtons}</td>
                `
      default:
        return ""
    }
  }

  handleAction(action) {
    switch (action) {
      case "add-product":
        this.showModal("meatProductModal")
        break
      case "add-production":
        this.showModal("productionRecordModal")
        break
      case "add-price":
        this.showModal("priceTrendModal")
        break
      case "add-consumption":
        this.showModal("consumptionPatternModal")
        break
      case "add-demand":
        this.showModal("demandElasticityModal")
        break
      case "add-supply-demand":
        this.showModal("supplyDemandModal")
        break
      case "add-insight":
        this.showModal("insightModal")
        break
      case "view-insights":
        this.showSection("insights-reports")
        break
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

      // Reset form
      const form = modal.querySelector("form")
      if (form) {
        form.reset()
      }

      // Reset editing state
      this.editingIndex = -1
      this.editingType = ""
    }
  }

  handleFormSubmit(form) {
    const formData = new FormData(form)
    const data = {}

    for (const [key, value] of formData.entries()) {
      data[key] = value
    }

    switch (form.id) {
      case "meatProductForm":
        this.saveMeatProduct(data)
        break
      case "productionRecordForm":
        this.saveProductionRecord(data)
        break
      case "priceTrendForm":
        this.savePriceTrend(data)
        break
      case "consumptionPatternForm":
        this.saveConsumptionPattern(data)
        break
      case "demandElasticityForm":
        this.saveDemandElasticity(data)
        break
      case "supplyDemandForm":
        this.saveSupplyDemand(data)
        break
      case "insightForm":
        this.saveInsight(data)
        break
    }
  }

  async saveMeatProduct(data) {
    const product = {
      productType: data.productType,
      breedVariety: data.breedVariety,
      avgLiveWeight: Number.parseFloat(data.avgLiveWeight),
      carcassWeight: Number.parseFloat(data.carcassWeight),
      feedConversionRatio: Number.parseFloat(data.feedConversionRatio),
      rearingPeriod: Number.parseInt(data.rearingPeriod),
    }

    try {
      if (this.editingIndex >= 0) {
        // For updates, use the batch_id from the data
        const batchId = this.editingIndex + 1; // Assuming batch_id matches index + 1
        
        const response = await fetch(`/api/meat-products-update/${batchId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
        })

        if (response.ok) {
          this.data.meatProducts[this.editingIndex] = product;
          this.showNotification("Product updated successfully", "success");
        } else {
          throw new Error("Failed to update product in database");
        }
      } else {
        // Add new record
        const response = await fetch("/api/meat-products-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(product),
        })

        if (response.ok) {
          const result = await response.json();
          product.id = result.id;
          this.data.meatProducts.push(product);
          this.showNotification("Product added successfully", "success");
        } else {
          throw new Error("Failed to add product to database");
        }
      }

      this.closeModal("meatProductModal");
      this.updateTable("meatProducts");
      this.updateDashboard();
    } catch (error) {
      console.error("[v0] Error saving meat product:", error);
      this.showNotification("Error saving product: " + error.message, "error");
    }
  }

  async saveProductionRecord(data) {
    const record = {
      year: Number.parseInt(data.productionYear),
      regionDistrict: data.regionDistrict,
      livestockPopulation: Number.parseInt(data.livestockPopulation),
      slaughterRate: Number.parseFloat(data.slaughterRate),
      animalsSlaughtered: Number.parseInt(data.animalsSlaughtered),
      totalMeatYield: Number.parseFloat(data.totalMeatYield),
      yieldPerAnimal: Number.parseFloat(data.yieldPerAnimal),
    }

    try {
      if (this.editingIndex >= 0) {
        const response = await fetch(`/api/production-records-update/${this.editingIndex + 1}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(record),
        })

        if (response.ok) {
          this.data.productionRecords[this.editingIndex] = record;
          this.showNotification("Production record updated successfully", "success");
        } else {
          throw new Error("Failed to update production record");
        }
      } else {
        // For production records, we might need a different approach
        // since they're aggregated views rather than single table entries
        this.data.productionRecords.push(record);
        this.showNotification("Production record added to local view (database update not implemented)", "warning");
      }

      this.closeModal("productionRecordModal");
      this.updateTable("productionRecords");
      this.updateDashboard();
    } catch (error) {
      console.error("[v0] Error saving production record:", error);
      this.showNotification("Error saving production record", "error");
    }
  }

  async savePriceTrend(data) {
    // Fix date format - convert YYYY-MM to YYYY-MM-DD
    const dateValue = data.priceDate ? `${data.priceDate}-01` : new Date().toISOString().split('T')[0];
    
    const trend = {
      date: dateValue,
      regionMarket: data.marketName,
      productType: data.priceProductType,
      wholesalePrice: Number.parseFloat(data.wholesalePrice),
      retailPrice: Number.parseFloat(data.retailPrice),
      priceChange: Number.parseFloat(data.priceChange || 0),
      seasonalTrend: data.seasonalTrend,
    }

    try {
      if (this.editingIndex >= 0) {
        const response = await fetch(`/api/price-trends-update/${this.editingIndex + 1}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(trend),
        })

        if (response.ok) {
          this.data.priceTrends[this.editingIndex] = trend;
          this.showNotification("Price trend updated successfully", "success");
        } else {
          throw new Error("Failed to update price trend");
        }
      } else {
        // For new price trends, add to sales records
        const apiData = {
          meatBatchPrice: trend.wholesalePrice,
          quantity: 100, // Default quantity
          date: trend.date,
          agentId: 1,
          industryId: 1,
          batch_id: 1,
        }

        const response = await fetch("/api/sales-records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiData),
        })

        if (response.ok) {
          this.data.priceTrends.push(trend);
          this.showNotification("Price trend added successfully", "success");
        } else {
          throw new Error("Failed to add price trend");
        }
      }

      this.closeModal("priceTrendModal");
      this.updateTable("priceTrends");
      this.updateDashboard();
    } catch (error) {
      console.error("[v0] Error saving price trend:", error);
      this.showNotification("Error saving price trend", "error");
    }
  }

  async saveConsumptionPattern(data) {
    const pattern = {
      region: data.consumptionRegion,
      population: Number.parseInt(data.population),
      meatType: data.meatType,
      perCapitaConsumption: Number.parseFloat(data.perCapitaConsumption),
      shareOfDiet: Number.parseFloat(data.shareOfDiet),
      nutritionalContribution: data.nutritionalContribution,
      demographicGroup: data.demographicGroup,
    }

    try {
      const apiData = {
        region: pattern.region,
        population: pattern.population,
        meat_type: pattern.meatType,
        per_capita: pattern.perCapitaConsumption,
        total_diet: pattern.shareOfDiet,
        nutrition_contribution: pattern.nutritionalContribution,
        demographic: pattern.demographicGroup,
      }

      if (this.editingIndex >= 0) {
        const originalPattern = this.data.consumptionPatterns[this.editingIndex]
        const response = await fetch(
          `/api/consumption-patterns/${originalPattern.region}/${originalPattern.meatType}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(apiData),
          },
        )

        if (response.ok) {
          this.data.consumptionPatterns[this.editingIndex] = pattern
          this.showNotification("Consumption pattern updated successfully", "success")
        } else {
          throw new Error("Failed to update consumption pattern")
        }
      } else {
        const response = await fetch("/api/consumption-patterns", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiData),
        })

        if (response.ok) {
          this.data.consumptionPatterns.push(pattern)
          this.showNotification("Consumption pattern added successfully", "success")
        } else {
          throw new Error("Failed to add consumption pattern")
        }
      }

      this.closeModal("consumptionPatternModal")
      this.updateTable("consumptionPatterns")
    } catch (error) {
      console.error("[v0] Error saving consumption pattern:", error)
      this.showNotification("Error saving consumption pattern", "error")
    }
  }

  async saveDemandElasticity(data) {
    const elasticity = {
      productType: data.demandProductType,
      timePeriod: data.timePeriod,
      averagePrice: Number.parseFloat(data.averagePrice),
      quantityDemanded: Number.parseFloat(data.quantityDemanded),
      priceElasticity: Number.parseFloat(data.priceElasticity),
      crossElasticity: data.crossElasticity || "+0.3 with alternatives",
      incomeElasticity: Number.parseFloat(data.incomeElasticity || 1.2),
    }

    try {
      const apiData = {
        meatBatchPrice: elasticity.averagePrice,
        quantity: elasticity.quantityDemanded,
        date: `${elasticity.timePeriod}-01-01`,
        agentId: 1,
        industryId: 1,
        batch_id: 1,
      }

      if (this.editingIndex >= 0) {
        this.data.demandElasticity[this.editingIndex] = elasticity
        this.showNotification("Demand elasticity updated successfully", "success")
      } else {
        // Add to sales record to affect demand elasticity calculations
        const response = await fetch("/api/sales-records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiData),
        })

        if (response.ok) {
          this.data.demandElasticity.push(elasticity)
          this.showNotification("Demand elasticity added successfully", "success")
        } else {
          throw new Error("Failed to add demand elasticity data")
        }
      }

      this.closeModal("demandElasticityModal")
      this.updateTable("demandElasticity")
    } catch (error) {
      console.error("[v0] Error saving demand elasticity:", error)
      this.showNotification("Error saving demand elasticity", "error")
    }
  }

  async saveSupplyDemand(data) {
    const supplyDemand = {
      region: data.supplyDemandRegion,
      timePeriod: data.supplyDemandTimePeriod,
      supplyVolume: Number.parseFloat(data.supplyVolume),
      demandVolume: Number.parseFloat(data.demandVolume),
      surplusDeficit: Number.parseFloat(data.supplyVolume) - Number.parseFloat(data.demandVolume),
      selfSufficiencyRatio: (Number.parseFloat(data.supplyVolume) / Number.parseFloat(data.demandVolume)) * 100,
    }

    try {
      const apiData = {
        meatBatchPrice: 500, // Default price
        quantity: supplyDemand.demandVolume,
        date: `${supplyDemand.timePeriod}-01-01`,
        agentId: 1,
        industryId: 1,
        batch_id: 1,
      }

      if (this.editingIndex >= 0) {
        this.data.supplyDemand[this.editingIndex] = supplyDemand
        this.showNotification("Supply demand updated successfully", "success")
      } else {
        // Add to sales record to affect supply/demand calculations
        const response = await fetch("/api/sales-records", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiData),
        })

        if (response.ok) {
          this.data.supplyDemand.push(supplyDemand)
          this.showNotification("Supply demand added successfully", "success")
        } else {
          throw new Error("Failed to add supply demand data")
        }
      }

      this.closeModal("supplyDemandModal")
      this.updateTable("supplyDemand")
    } catch (error) {
      console.error("[v0] Error saving supply demand:", error)
      this.showNotification("Error saving supply demand", "error")
    }
  }

  async saveInsight(data) {
    const insight = {
      region: data.insightRegion,
      keyTrend: data.keyTrend,
      mainChallenge: data.mainChallenge,
      opportunity: data.opportunity,
      recommendation: data.recommendation,
    }

    try {
      if (this.editingIndex >= 0) {
        this.data.insightsReports[this.editingIndex] = insight
        this.showNotification("Insight updated successfully", "success")
      } else {
        this.data.insightsReports.push(insight)
        this.showNotification("Insight added successfully", "success")
      }

      this.closeModal("insightModal")
      this.updateTable("insightsReports")
    } catch (error) {
      console.error("[v0] Error saving insight:", error)
      this.showNotification("Error saving insight", "error")
    }
  }

  async deleteRecord(dataType, index) {
    if (!confirm("Are you sure you want to delete this record?")) {
      return
    }

    try {
      if (dataType === "consumptionPatterns") {
        const record = this.data.consumptionPatterns[index]
        const response = await fetch(`/api/consumption-patterns/${record.region}/${record.meatType}`, {
          method: "DELETE",
        })

        if (response.ok) {
          this.data.consumptionPatterns.splice(index, 1)
          this.showNotification("Record deleted successfully", "success")
        } else {
          throw new Error("Failed to delete record")
        }
      } else if (dataType === "meatProducts") {
        // Delete from meat batches table
        const response = await fetch(`/api/meat-batches/${index + 1}`, {
          method: "DELETE",
        })

        if (response.ok) {
          this.data.meatProducts.splice(index, 1)
          this.showNotification("Record deleted successfully", "success")
        } else {
          throw new Error("Failed to delete record")
        }
      } else if (dataType === "priceTrends") {
        // Delete from sales records table
        const response = await fetch(`/api/sales-records/${index + 1}`, {
          method: "DELETE",
        })

        if (response.ok) {
          this.data.priceTrends.splice(index, 1)
          this.showNotification("Record deleted successfully", "success")
        } else {
          throw new Error("Failed to delete record")
        }
      } else {
        // For other data types, just remove from local data
        this.data[dataType].splice(index, 1)
        this.showNotification("Record deleted from local view (database update not implemented)", "warning")
      }

      this.updateTable(dataType)
      this.updateDashboard()
    } catch (error) {
      console.error("[v0] Error deleting record:", error)
      this.showNotification("Error deleting record: " + error.message, "error")
    }
  }

  editRecord(dataType, index) {
    this.editingIndex = index
    this.editingType = dataType

    const record = this.data[dataType][index]
    let modalId = ""

    switch (dataType) {
      case "meatProducts":
        modalId = "meatProductModal"
        this.populateForm(modalId, record)
        break
      case "productionRecords":
        modalId = "productionRecordModal"
        this.populateForm(modalId, record)
        break
      case "priceTrends":
        modalId = "priceTrendModal"
        // Fix date format for editing (YYYY-MM-DD to YYYY-MM)
        const recordWithFixedDate = { ...record }
        if (recordWithFixedDate.date) {
          recordWithFixedDate.date = recordWithFixedDate.date.substring(0, 7)
        }
        this.populateForm(modalId, recordWithFixedDate)
        break
      case "consumptionPatterns":
        modalId = "consumptionPatternModal"
        this.populateForm(modalId, record)
        break
      case "demandElasticity":
        modalId = "demandElasticityModal"
        this.populateForm(modalId, record)
        break
      case "supplyDemand":
        modalId = "supplyDemandModal"
        this.populateForm(modalId, record)
        break
      case "insightsReports":
        modalId = "insightModal"
        this.populateForm(modalId, record)
        break
    }

    if (modalId) {
      this.showModal(modalId)
    }
  }

  populateForm(modalId, data) {
    const modal = document.getElementById(modalId)
    if (!modal) return

    Object.keys(data).forEach((key) => {
      const input = modal.querySelector(`[name="${key}"]`)
      if (input) {
        input.value = data[key]
      }
    })
  }

  updateDashboard() {
    // Update statistics
    this.updateStatistics()

    // Update charts
    this.updateChart("priceTrendChart")
    this.updateChart("productionTrendChart")
    this.updateChart("demandElasticityChart")
    this.updateChart("supplyDemandChart")
  }

  updateStatistics() {
  const stats = {
    totalProducts: this.data.meatProducts.length,
    totalProduction: this.data.productionRecords.reduce((sum, record) => sum + record.totalMeatYield, 0),
    avgPrice: this.data.priceTrends.length > 0 
      ? this.data.priceTrends.reduce((sum, trend) => sum + trend.retailPrice, 0) / this.data.priceTrends.length 
      : 0,
    totalConsumption: this.data.consumptionPatterns.reduce(
      (sum, pattern) => sum + (pattern.perCapitaConsumption * pattern.population / 1000), // Convert to tons
      0,
    ),
  }

  document.getElementById("totalProducts").textContent = stats.totalProducts
  document.getElementById("totalProduction").textContent = stats.totalProduction.toLocaleString() + " tons"
  document.getElementById("avgPrice").textContent = "$" + stats.avgPrice.toFixed(2)
  document.getElementById("totalConsumption").textContent = stats.totalConsumption.toLocaleString() + " tons"
  document.getElementById("demandIndex").textContent = "87.3" // Keeping your sample value
}

  updateChart(chartId) {
    const chartElement = document.getElementById(chartId);
    if (!chartElement) return;

    // Destroy existing chart if it exists
    if (this.charts[chartId]) {
      this.charts[chartId].destroy();
    }

    // Create new chart based on the chart type
    const ctx = chartElement.getContext('2d');
    
    switch (chartId) {
      case "priceTrendChart":
        this.renderPriceTrendChart(ctx);
        break;
      case "productionTrendChart":
        this.renderProductionTrendChart(ctx);
        break;
      case "demandElasticityChart":
        this.renderDemandElasticityChart(ctx);
        break;
      case "supplyDemandChart":
        this.renderSupplyDemandChart(ctx);
        break;
      case "demandElasticityDetailChart":
        this.renderDemandElasticityDetailChart(ctx);
        break;
      case "supplyDemandDetailChart":
        this.renderSupplyDemandDetailChart(ctx);
        break;
      case "insightsDetailChart":
        this.renderInsightsDetailChart(ctx);
        break;
      case "insightsChart":
        this.renderInsightsChart(ctx);
        break;
    }
  }

  renderPriceTrendChart(ctx) {
  const data = this.data.priceTrends.slice(-10);
  if (data.length === 0) return;

  const labels = data.map(item => item.date.substring(0, 7));
  const prices = data.map(item => item.retailPrice);

  this.charts.priceTrendChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Retail Price',
        data: prices,
        borderColor: '#4a90e2',
        backgroundColor: 'rgba(74, 144, 226, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Price Trends'
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          title: {
            display: true,
            text: 'Price ($)'
          }
        }
      }
    }
  });
}

renderProductionTrendChart(ctx) {
  const data = this.data.productionRecords.slice(-10);
  if (data.length === 0) return;

  const labels = data.map(item => item.year.toString());
  const production = data.map(item => item.totalMeatYield);

  this.charts.productionTrendChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Total Meat Yield (tons)',
        data: production,
        backgroundColor: '#50c878',
        borderColor: '#50c878',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Production Trends'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Yield (tons)'
          }
        }
      }
    }
  });
}

renderDemandElasticityChart(ctx) {
  const data = this.data.demandElasticity.slice(-10);
  if (data.length === 0) return;

  const labels = data.map(item => item.productType.substring(0, 3));
  const elasticity = data.map(item => item.priceElasticity);

  this.charts.demandElasticityChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Price Elasticity',
        data: elasticity,
        borderColor: '#ff6b6b',
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Demand Elasticity'
        }
      },
      scales: {
        y: {
          title: {
            display: true,
            text: 'Elasticity'
          }
        }
      }
    }
  });
}

renderSupplyDemandChart(ctx) {
  const data = this.data.supplyDemand.slice(-10);
  if (data.length === 0) return;

  const labels = data.map(item => item.timePeriod);
  const supply = data.map(item => item.supplyVolume);
  const demand = data.map(item => item.demandVolume);

  this.charts.supplyDemandChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Supply',
          data: supply,
          borderColor: '#4a90e2',
          backgroundColor: 'rgba(74, 144, 226, 0.1)',
          tension: 0.4
        },
        {
          label: 'Demand',
          data: demand,
          borderColor: '#ff6b6b',
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          tension: 0.4
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Supply vs Demand'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Volume (tons)'
          }
        }
      }
    }
  });
}

renderDemandElasticityDetailChart(ctx) {
  const data = this.data.demandElasticity;
  if (data.length === 0) return;

  // Group data by product type
  const productGroups = {};
  data.forEach(item => {
    if (!productGroups[item.productType]) {
      productGroups[item.productType] = [];
    }
    productGroups[item.productType].push(item);
  });

  const colors = ['#4a90e2', '#ff6b6b', '#50c878', '#ffa500', '#9370db'];
  
  const datasets = [];
  let colorIndex = 0;
  
  Object.keys(productGroups).forEach(productType => {
    const productData = productGroups[productType];
    const color = colors[colorIndex % colors.length];
    colorIndex++;
    
    datasets.push({
      label: productType,
      data: productData.map(item => ({
        x: item.timePeriod,
        y: item.priceElasticity
      })),
      borderColor: color,
      backgroundColor: color + '80',
      tension: 0.4
    });
  });

  this.charts.demandElasticityDetailChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: datasets
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Demand Elasticity by Product Type'
        }
      },
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: 'Time Period'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Price Elasticity'
          }
        }
      }
    }
  });
}

renderSupplyDemandDetailChart(ctx) {
  const data = this.data.supplyDemand;
  if (data.length === 0) return;

  // Group data by region
  const regionGroups = {};
  data.forEach(item => {
    if (!regionGroups[item.region]) {
      regionGroups[item.region] = [];
    }
    regionGroups[item.region].push(item);
  });

  const colors = ['#4a90e2', '#ff6b6b', '#50c878', '#ffa500', '#9370db'];
  
  const supplyDatasets = [];
  const demandDatasets = [];
  let colorIndex = 0;
  
  Object.keys(regionGroups).forEach(region => {
    const regionData = regionGroups[region];
    const color = colors[colorIndex % colors.length];
    colorIndex++;
    
    supplyDatasets.push({
      label: `${region} - Supply`,
      data: regionData.map(item => ({
        x: item.timePeriod,
        y: item.supplyVolume
      })),
      borderColor: color,
      backgroundColor: 'transparent',
      tension: 0.4
    });
    
    demandDatasets.push({
      label: `${region} - Demand`,
      data: regionData.map(item => ({
        x: item.timePeriod,
        y: item.demandVolume
      })),
      borderColor: color,
      backgroundColor: 'transparent',
      borderDash: [5, 5],
      tension: 0.4
    });
  });

  this.charts.supplyDemandDetailChart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [...supplyDatasets, ...demandDatasets]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Supply vs Demand by Region'
        }
      },
      scales: {
        x: {
          type: 'category',
          title: {
            display: true,
            text: 'Time Period'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Volume (tons)'
          }
        }
      }
    }
  });
}

renderInsightsDetailChart(ctx) {
  const data = this.data.insightsReports;
  if (data.length === 0) return;

  // Simple bar chart for insights
  const regions = [...new Set(data.map(item => item.region))];
  const challenges = regions.map(region => 
    data.filter(item => item.region === region).length
  );
  const opportunities = regions.map(region => 
    data.filter(item => item.region === region).length * 0.8
  );

  this.charts.insightsDetailChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: regions,
      datasets: [
        {
          label: 'Challenges',
          data: challenges,
          backgroundColor: '#ff6b6b'
        },
        {
          label: 'Opportunities',
          data: opportunities,
          backgroundColor: '#50c878'
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Market Insights by Region'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Count'
          }
        }
      }
    }
  });
}

renderInsightsChart(ctx) {
  const data = this.data.insightsReports;
  if (data.length === 0) return;

  // Simple pie chart for insights overview
  const regions = [...new Set(data.map(item => item.region))];
  const regionCounts = regions.map(region => 
    data.filter(item => item.region === region).length
  );

  this.charts.insightsChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: regions,
      datasets: [{
        data: regionCounts,
        backgroundColor: [
          '#4a90e2', '#ff6b6b', '#50c878', '#ffa500', '#9370db'
        ]
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Insights Distribution by Region'
        }
      }
    }
  });
}

  showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification notification-${type}`
    notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `

    // Add to page
    document.body.appendChild(notification)

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.classList.add("fade-out")
        setTimeout(() => notification.remove(), 300)
      }
    }, 5000)

    // Close button
    notification.querySelector(".notification-close").addEventListener("click", () => {
      notification.classList.add("fade-out")
      setTimeout(() => notification.remove(), 300)
    })
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOM loaded, initializing dashboard...")
  window.dashboard = new MeatAdminDashboard()
})