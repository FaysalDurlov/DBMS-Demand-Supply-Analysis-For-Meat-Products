class MeatAdminDashboard {
  constructor() {
    this.isExpanded = false
    this.currentSection = "dashboard"
    this.editingIndex = -1
    this.editingType = ""
    this.charts = {}

    this.data = {
      meatProducts: [
        {
          productType: "Beef",
          breedVariety: "Holstein",
          avgLiveWeight: 450,
          carcassWeight: 270,
          feedConversionRatio: 6.5,
          rearingPeriod: 720,
        },
        {
          productType: "Chicken",
          breedVariety: "Broiler",
          avgLiveWeight: 2.5,
          carcassWeight: 1.8,
          feedConversionRatio: 1.8,
          rearingPeriod: 42,
        },
        {
          productType: "Mutton",
          breedVariety: "Merino",
          avgLiveWeight: 65,
          carcassWeight: 32,
          feedConversionRatio: 4.2,
          rearingPeriod: 365,
        },
        {
          productType: "Goat",
          breedVariety: "Boer",
          avgLiveWeight: 45,
          carcassWeight: 22,
          feedConversionRatio: 3.8,
          rearingPeriod: 180,
        },
        {
          productType: "Pork",
          breedVariety: "Yorkshire",
          avgLiveWeight: 110,
          carcassWeight: 75,
          feedConversionRatio: 2.8,
          rearingPeriod: 180,
        },
        {
          productType: "Beef",
          breedVariety: "Angus",
          avgLiveWeight: 520,
          carcassWeight: 320,
          feedConversionRatio: 7.2,
          rearingPeriod: 750,
        },
        {
          productType: "Chicken",
          breedVariety: "Layer",
          avgLiveWeight: 1.8,
          carcassWeight: 1.2,
          feedConversionRatio: 2.2,
          rearingPeriod: 365,
        },
        {
          productType: "Mutton",
          breedVariety: "Suffolk",
          avgLiveWeight: 80,
          carcassWeight: 40,
          feedConversionRatio: 4.5,
          rearingPeriod: 400,
        },
        {
          productType: "Goat",
          breedVariety: "Nubian",
          avgLiveWeight: 55,
          carcassWeight: 28,
          feedConversionRatio: 4.0,
          rearingPeriod: 200,
        },
        {
          productType: "Pork",
          breedVariety: "Duroc",
          avgLiveWeight: 125,
          carcassWeight: 85,
          feedConversionRatio: 3.2,
          rearingPeriod: 200,
        },
      ],
      productionRecords: [
        {
          year: 2024,
          regionDistrict: "North District",
          livestockPopulation: 15847,
          slaughterRate: 12.5,
          animalsSlaughtered: 1981,
          totalMeatYield: 2847,
          yieldPerAnimal: 180,
        },
        {
          year: 2024,
          regionDistrict: "South District",
          livestockPopulation: 22340,
          slaughterRate: 15.2,
          animalsSlaughtered: 3396,
          totalMeatYield: 4250,
          yieldPerAnimal: 190,
        },
        {
          year: 2024,
          regionDistrict: "East District",
          livestockPopulation: 18920,
          slaughterRate: 11.8,
          animalsSlaughtered: 2233,
          totalMeatYield: 3100,
          yieldPerAnimal: 164,
        },
        {
          year: 2024,
          regionDistrict: "West District",
          livestockPopulation: 13450,
          slaughterRate: 14.3,
          animalsSlaughtered: 1923,
          totalMeatYield: 2680,
          yieldPerAnimal: 199,
        },
        {
          year: 2023,
          regionDistrict: "North District",
          livestockPopulation: 14200,
          slaughterRate: 13.1,
          animalsSlaughtered: 1860,
          totalMeatYield: 2590,
          yieldPerAnimal: 182,
        },
        {
          year: 2023,
          regionDistrict: "South District",
          livestockPopulation: 21800,
          slaughterRate: 14.8,
          animalsSlaughtered: 3226,
          totalMeatYield: 4020,
          yieldPerAnimal: 184,
        },
        {
          year: 2023,
          regionDistrict: "East District",
          livestockPopulation: 17650,
          slaughterRate: 12.2,
          animalsSlaughtered: 2153,
          totalMeatYield: 2890,
          yieldPerAnimal: 164,
        },
        {
          year: 2023,
          regionDistrict: "West District",
          livestockPopulation: 12890,
          slaughterRate: 13.9,
          animalsSlaughtered: 1792,
          totalMeatYield: 2450,
          yieldPerAnimal: 190,
        },
        {
          year: 2024,
          regionDistrict: "Central District",
          livestockPopulation: 16780,
          slaughterRate: 13.7,
          animalsSlaughtered: 2299,
          totalMeatYield: 3200,
          yieldPerAnimal: 191,
        },
        {
          year: 2023,
          regionDistrict: "Central District",
          livestockPopulation: 15920,
          slaughterRate: 12.9,
          animalsSlaughtered: 2054,
          totalMeatYield: 2890,
          yieldPerAnimal: 182,
        },
      ],
      priceTrends: [
        {
          date: "2024-01",
          regionMarket: "North Market",
          productType: "Beef",
          wholesalePrice: 8.5,
          retailPrice: 12.75,
          priceChange: 5.2,
          seasonalTrend: "↑",
        },
        {
          date: "2024-01",
          regionMarket: "South Market",
          productType: "Chicken",
          wholesalePrice: 3.2,
          retailPrice: 4.8,
          priceChange: -2.1,
          seasonalTrend: "↓",
        },
        {
          date: "2024-01",
          regionMarket: "East Market",
          productType: "Mutton",
          wholesalePrice: 9.8,
          retailPrice: 14.5,
          priceChange: 3.8,
          seasonalTrend: "↑",
        },
        {
          date: "2024-01",
          regionMarket: "West Market",
          productType: "Goat",
          wholesalePrice: 7.6,
          retailPrice: 11.2,
          priceChange: 1.5,
          seasonalTrend: "stable",
        },
        {
          date: "2024-01",
          regionMarket: "Central Market",
          productType: "Pork",
          wholesalePrice: 6.4,
          retailPrice: 9.6,
          priceChange: -1.2,
          seasonalTrend: "↓",
        },
        {
          date: "2023-12",
          regionMarket: "North Market",
          productType: "Beef",
          wholesalePrice: 8.08,
          retailPrice: 12.1,
          priceChange: 2.3,
          seasonalTrend: "↑",
        },
        {
          date: "2023-12",
          regionMarket: "South Market",
          productType: "Chicken",
          wholesalePrice: 3.27,
          retailPrice: 4.9,
          priceChange: 0.8,
          seasonalTrend: "stable",
        },
        {
          date: "2023-12",
          regionMarket: "East Market",
          productType: "Mutton",
          wholesalePrice: 9.44,
          retailPrice: 14.0,
          priceChange: 4.2,
          seasonalTrend: "↑",
        },
        {
          date: "2023-12",
          regionMarket: "West Market",
          productType: "Goat",
          wholesalePrice: 7.49,
          retailPrice: 11.0,
          priceChange: 2.1,
          seasonalTrend: "↑",
        },
        {
          date: "2023-12",
          regionMarket: "Central Market",
          productType: "Pork",
          wholesalePrice: 6.48,
          retailPrice: 9.72,
          priceChange: 0.5,
          seasonalTrend: "stable",
        },
      ],
      consumptionPatterns: [
        {
          region: "North District",
          population: 450000,
          meatType: "Beef",
          perCapitaConsumption: 45.2,
          shareOfDiet: 18.5,
          nutritionalContribution: "Protein 25g/day, Iron 3mg/day",
          demographicGroup: "Urban/High Income",
        },
        {
          region: "South District",
          population: 620000,
          meatType: "Chicken",
          perCapitaConsumption: 38.7,
          shareOfDiet: 22.3,
          nutritionalContribution: "Protein 22g/day, Iron 1.5mg/day",
          demographicGroup: "Urban/Middle Income",
        },
        {
          region: "East District",
          population: 380000,
          meatType: "Mutton",
          perCapitaConsumption: 28.4,
          shareOfDiet: 15.2,
          nutritionalContribution: "Protein 20g/day, Iron 2.8mg/day",
          demographicGroup: "Rural/High Income",
        },
        {
          region: "West District",
          population: 290000,
          meatType: "Goat",
          perCapitaConsumption: 22.1,
          shareOfDiet: 12.8,
          nutritionalContribution: "Protein 18g/day, Iron 2.2mg/day",
          demographicGroup: "Rural/Middle Income",
        },
        {
          region: "Central District",
          population: 520000,
          meatType: "Pork",
          perCapitaConsumption: 31.5,
          shareOfDiet: 16.7,
          nutritionalContribution: "Protein 21g/day, Iron 1.8mg/day",
          demographicGroup: "Urban/Middle Income",
        },
        {
          region: "North District",
          population: 450000,
          meatType: "Chicken",
          perCapitaConsumption: 42.8,
          shareOfDiet: 24.1,
          nutritionalContribution: "Protein 24g/day, Iron 1.6mg/day",
          demographicGroup: "Urban/Low Income",
        },
        {
          region: "South District",
          population: 620000,
          meatType: "Beef",
          perCapitaConsumption: 35.6,
          shareOfDiet: 16.9,
          nutritionalContribution: "Protein 22g/day, Iron 2.5mg/day",
          demographicGroup: "Urban/High Income",
        },
        {
          region: "East District",
          population: 380000,
          meatType: "Goat",
          perCapitaConsumption: 19.3,
          shareOfDiet: 11.4,
          nutritionalContribution: "Protein 16g/day, Iron 2.0mg/day",
          demographicGroup: "Rural/Low Income",
        },
        {
          region: "West District",
          population: 290000,
          meatType: "Chicken",
          perCapitaConsumption: 26.7,
          shareOfDiet: 19.8,
          nutritionalContribution: "Protein 19g/day, Iron 1.3mg/day",
          demographicGroup: "Rural/Middle Income",
        },
        {
          region: "Central District",
          population: 520000,
          meatType: "Mutton",
          perCapitaConsumption: 33.2,
          shareOfDiet: 17.5,
          nutritionalContribution: "Protein 23g/day, Iron 3.1mg/day",
          demographicGroup: "Urban/High Income",
        },
      ],
      demandElasticity: [
        {
          productType: "Beef",
          timePeriod: "2024-Q1",
          averagePrice: 12.45,
          quantityDemanded: 2847,
          priceElasticity: -0.85,
          crossElasticity: "+0.42 with Chicken",
          incomeElasticity: 1.2,
        },
        {
          productType: "Chicken",
          timePeriod: "2024-Q1",
          averagePrice: 4.5,
          quantityDemanded: 4250,
          priceElasticity: -1.25,
          crossElasticity: "+0.38 with Beef",
          incomeElasticity: 0.8,
        },
        {
          productType: "Mutton",
          timePeriod: "2024-Q1",
          averagePrice: 14.25,
          quantityDemanded: 1890,
          priceElasticity: -0.72,
          crossElasticity: "+0.25 with Goat",
          incomeElasticity: 1.5,
        },
        {
          productType: "Goat",
          timePeriod: "2024-Q1",
          averagePrice: 11.4,
          quantityDemanded: 1450,
          priceElasticity: -0.95,
          crossElasticity: "+0.31 with Mutton",
          incomeElasticity: 1.1,
        },
        {
          productType: "Pork",
          timePeriod: "2024-Q1",
          averagePrice: 9.0,
          quantityDemanded: 2100,
          priceElasticity: -1.15,
          crossElasticity: "+0.28 with Chicken",
          incomeElasticity: 0.9,
        },
        {
          productType: "Beef",
          timePeriod: "2023-Q4",
          averagePrice: 11.85,
          quantityDemanded: 3020,
          priceElasticity: -0.78,
          crossElasticity: "+0.35 with Chicken",
          incomeElasticity: 1.3,
        },
        {
          productType: "Chicken",
          timePeriod: "2023-Q4",
          averagePrice: 4.25,
          quantityDemanded: 4580,
          priceElasticity: -1.32,
          crossElasticity: "+0.41 with Beef",
          incomeElasticity: 0.7,
        },
        {
          productType: "Mutton",
          timePeriod: "2023-Q4",
          averagePrice: 13.8,
          quantityDemanded: 2050,
          priceElasticity: -0.68,
          crossElasticity: "+0.22 with Goat",
          incomeElasticity: 1.6,
        },
        {
          productType: "Goat",
          timePeriod: "2023-Q4",
          averagePrice: 10.95,
          quantityDemanded: 1620,
          priceElasticity: -0.88,
          crossElasticity: "+0.29 with Mutton",
          incomeElasticity: 1.0,
        },
        {
          productType: "Pork",
          timePeriod: "2023-Q4",
          averagePrice: 8.75,
          quantityDemanded: 2280,
          priceElasticity: -1.08,
          crossElasticity: "+0.24 with Chicken",
          incomeElasticity: 0.8,
        },
      ],
      supplyDemand: [
        {
          region: "North District",
          timePeriod: "2024-01",
          supplyVolume: 2847,
          demandVolume: 2650,
          surplusDeficit: 197,
          selfSufficiencyRatio: 107.4,
        },
        {
          region: "South District",
          timePeriod: "2024-01",
          supplyVolume: 4250,
          demandVolume: 4580,
          surplusDeficit: -330,
          selfSufficiencyRatio: 92.8,
        },
        {
          region: "East District",
          timePeriod: "2024-01",
          supplyVolume: 3100,
          demandVolume: 2890,
          surplusDeficit: 210,
          selfSufficiencyRatio: 107.3,
        },
        {
          region: "West District",
          timePeriod: "2024-01",
          supplyVolume: 2680,
          demandVolume: 2920,
          surplusDeficit: -240,
          selfSufficiencyRatio: 91.8,
        },
        {
          region: "Central District",
          timePeriod: "2024-01",
          supplyVolume: 3200,
          demandVolume: 3450,
          surplusDeficit: -250,
          selfSufficiencyRatio: 92.8,
        },
        {
          region: "North District",
          timePeriod: "2023-12",
          supplyVolume: 2590,
          demandVolume: 2480,
          surplusDeficit: 110,
          selfSufficiencyRatio: 104.4,
        },
        {
          region: "South District",
          timePeriod: "2023-12",
          supplyVolume: 4020,
          demandVolume: 4320,
          surplusDeficit: -300,
          selfSufficiencyRatio: 93.1,
        },
        {
          region: "East District",
          timePeriod: "2023-12",
          supplyVolume: 2890,
          demandVolume: 2750,
          surplusDeficit: 140,
          selfSufficiencyRatio: 105.1,
        },
        {
          region: "West District",
          timePeriod: "2023-12",
          supplyVolume: 2450,
          demandVolume: 2680,
          surplusDeficit: -230,
          selfSufficiencyRatio: 91.4,
        },
        {
          region: "Central District",
          timePeriod: "2023-12",
          supplyVolume: 2890,
          demandVolume: 3180,
          surplusDeficit: -290,
          selfSufficiencyRatio: 90.9,
        },
      ],
      insightsReports: [
        {
          regionMarket: "North District",
          keyTrend: "Rising beef demand",
          mainChallenge: "High feed costs",
          opportunity: "Export potential to neighboring regions",
          recommendation: "Invest in feed efficiency programs and explore export markets",
        },
        {
          regionMarket: "South District",
          keyTrend: "Chicken consumption growth",
          mainChallenge: "Supply shortage",
          opportunity: "Vertical integration opportunities",
          recommendation: "Expand poultry production capacity and improve supply chain",
        },
        {
          regionMarket: "East District",
          keyTrend: "Stable mutton prices",
          mainChallenge: "Seasonal variations",
          opportunity: "Premium organic market",
          recommendation: "Develop organic certification and premium branding",
        },
        {
          regionMarket: "West District",
          keyTrend: "Declining goat prices",
          mainChallenge: "Market oversupply",
          opportunity: "Value-added processing",
          recommendation: "Establish processing facilities and develop new products",
        },
        {
          regionMarket: "Central District",
          keyTrend: "Pork demand stability",
          mainChallenge: "Competition from alternatives",
          opportunity: "Health-conscious segments",
          recommendation: "Focus on lean cuts and health benefits marketing",
        },
        {
          regionMarket: "Regional Average",
          keyTrend: "Protein diversification",
          mainChallenge: "Price volatility",
          opportunity: "Alternative protein integration",
          recommendation: "Develop mixed protein portfolios and price hedging strategies",
        },
        {
          regionMarket: "Urban Markets",
          keyTrend: "Premium product demand",
          mainChallenge: "Quality consistency",
          opportunity: "Brand development",
          recommendation: "Implement quality standards and build consumer brands",
        },
        {
          regionMarket: "Rural Markets",
          keyTrend: "Traditional preferences",
          mainChallenge: "Limited cold chain",
          opportunity: "Local processing",
          recommendation: "Invest in rural cold storage and local processing facilities",
        },
        {
          regionMarket: "Wholesale Sector",
          keyTrend: "Consolidation trend",
          mainChallenge: "Margin pressure",
          opportunity: "Technology adoption",
          recommendation: "Implement digital platforms and improve operational efficiency",
        },
        {
          regionMarket: "Retail Sector",
          keyTrend: "Consumer awareness",
          mainChallenge: "Traceability demands",
          opportunity: "Transparency systems",
          recommendation: "Develop blockchain-based traceability and transparency initiatives",
        },
      ],
    }

    this.init()
  }

  init() {
    console.log("[v0] Initializing MeatAdminDashboard")
    this.setupEventListeners()
    this.initializeCharts()
    this.updateDashboard()
    this.showSection("dashboard")
    console.log("[v0] Dashboard initialized")
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
                    <td>${item.regionMarket}</td>
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

  saveMeatProduct(data) {
    const product = {
      productType: data.productType,
      breedVariety: data.breedVariety,
      avgLiveWeight: Number.parseFloat(data.avgLiveWeight),
      carcassWeight: Number.parseFloat(data.carcassWeight),
      feedConversionRatio: Number.parseFloat(data.feedConversionRatio),
      rearingPeriod: Number.parseInt(data.rearingPeriod),
    }

    if (this.editingIndex >= 0) {
      this.data.meatProducts[this.editingIndex] = product
    } else {
      this.data.meatProducts.push(product)
    }

    this.closeModal("meatProductModal")
    this.updateTable("meatProducts")
    this.updateDashboard()
  }

  saveProductionRecord(data) {
    const record = {
      year: Number.parseInt(data.productionYear),
      regionDistrict: data.regionDistrict,
      livestockPopulation: Number.parseInt(data.livestockPopulation),
      slaughterRate: Number.parseFloat(data.slaughterRate),
      animalsSlaughtered: Number.parseInt(data.animalsSlaughtered),
      totalMeatYield: Number.parseFloat(data.totalMeatYield),
      yieldPerAnimal: Number.parseFloat(data.yieldPerAnimal),
    }

    if (this.editingIndex >= 0) {
      this.data.productionRecords[this.editingIndex] = record
    } else {
      this.data.productionRecords.push(record)
    }

    this.closeModal("productionRecordModal")
    this.updateTable("productionRecords")
    this.updateDashboard()
  }

  savePriceTrend(data) {
    const trend = {
      date: data.priceDate,
      regionMarket: data.marketName,
      productType: data.priceProductType,
      wholesalePrice: Number.parseFloat(data.wholesalePrice),
      retailPrice: Number.parseFloat(data.retailPrice),
      priceChange: Number.parseFloat(data.priceChange) || 0,
      seasonalTrend: data.seasonalTrend,
    }

    if (this.editingIndex >= 0) {
      this.data.priceTrends[this.editingIndex] = trend
    } else {
      this.data.priceTrends.push(trend)
    }

    this.closeModal("priceTrendModal")
    this.updateTable("priceTrends")
    this.updateDashboard()
  }

  saveConsumptionPattern(data) {
    const pattern = {
      region: data.consumptionRegion,
      population: Number.parseInt(data.population),
      meatType: data.meatType,
      perCapitaConsumption: Number.parseFloat(data.perCapitaConsumption),
      shareOfDiet: Number.parseFloat(data.shareOfDiet),
      nutritionalContribution: data.nutritionalContribution,
      demographicGroup: data.demographicGroup,
    }

    if (this.editingIndex >= 0) {
      this.data.consumptionPatterns[this.editingIndex] = pattern
    } else {
      this.data.consumptionPatterns.push(pattern)
    }

    this.closeModal("consumptionPatternModal")
    this.updateTable("consumptionPatterns")
  }

  saveDemandElasticity(data) {
    const elasticity = {
      productType: data.demandProductType,
      timePeriod: data.timePeriod,
      averagePrice: Number.parseFloat(data.averagePrice),
      quantityDemanded: Number.parseFloat(data.quantityDemanded),
      priceElasticity: Number.parseFloat(data.priceElasticity),
      crossElasticity: data.crossElasticity,
      incomeElasticity: data.incomeElasticity ? Number.parseFloat(data.incomeElasticity) : null,
    }

    if (this.editingIndex >= 0) {
      this.data.demandElasticity[this.editingIndex] = elasticity
    } else {
      this.data.demandElasticity.push(elasticity)
    }

    this.closeModal("demandElasticityModal")
    this.updateTable("demandElasticity")
    this.updateChart("demandElasticityDetailChart")
  }

  saveSupplyDemand(data) {
    const supplyVolume = Number.parseFloat(data.supplyVolume)
    const demandVolume = Number.parseFloat(data.demandVolume)

    const record = {
      region: data.supplyDemandRegion,
      timePeriod: data.supplyDemandTimePeriod,
      supplyVolume: supplyVolume,
      demandVolume: demandVolume,
      surplusDeficit: supplyVolume - demandVolume,
      selfSufficiencyRatio: (supplyVolume / demandVolume) * 100,
    }

    if (this.editingIndex >= 0) {
      this.data.supplyDemand[this.editingIndex] = record
    } else {
      this.data.supplyDemand.push(record)
    }

    this.closeModal("supplyDemandModal")
    this.updateTable("supplyDemand")
    this.updateChart("supplyDemandDetailChart")
  }

  saveInsight(data) {
    const insight = {
      regionMarket: data.insightRegion,
      keyTrend: data.keyTrend,
      mainChallenge: data.mainChallenge,
      opportunity: data.opportunity,
      recommendation: data.recommendation,
    }

    if (this.editingIndex >= 0) {
      this.data.insightsReports[this.editingIndex] = insight
    } else {
      this.data.insightsReports.push(insight)
    }

    this.closeModal("insightModal")
    this.updateTable("insightsReports")
    this.updateChart("insightsDetailChart")
  }

  editRecord(dataType, index) {
    this.editingIndex = index
    this.editingType = dataType

    const record = this.data[dataType][index]

    switch (dataType) {
      case "meatProducts":
        this.populateMeatProductForm(record)
        this.showModal("meatProductModal")
        break
      case "productionRecords":
        this.populateProductionRecordForm(record)
        this.showModal("productionRecordModal")
        break
      case "priceTrends":
        this.populatePriceTrendForm(record)
        this.showModal("priceTrendModal")
        break
      case "consumptionPatterns":
        this.populateConsumptionPatternForm(record)
        this.showModal("consumptionPatternModal")
        break
      case "demandElasticity":
        this.populateDemandElasticityForm(record)
        this.showModal("demandElasticityModal")
        break
      case "supplyDemand":
        this.populateSupplyDemandForm(record)
        this.showModal("supplyDemandModal")
        break
      case "insightsReports":
        this.populateInsightForm(record)
        this.showModal("insightModal")
        break
    }
  }

  deleteRecord(dataType, index) {
    if (confirm("Are you sure you want to delete this record?")) {
      this.data[dataType].splice(index, 1)
      this.updateTable(dataType)

      // Update dashboard if needed
      if (["meatProducts", "productionRecords", "priceTrends"].includes(dataType)) {
        this.updateDashboard()
      }

      // Update charts if needed
      if (["demandElasticity", "supplyDemand", "insightsReports"].includes(dataType)) {
        this.updateChart(`${this.camelToKebab(dataType)}DetailChart`)
      }
    }
  }

  // Form population methods for editing
  populateMeatProductForm(record) {
    document.getElementById("productType").value = record.productType
    document.getElementById("breedVariety").value = record.breedVariety
    document.getElementById("avgLiveWeight").value = record.avgLiveWeight
    document.getElementById("carcassWeight").value = record.carcassWeight
    document.getElementById("feedConversionRatio").value = record.feedConversionRatio
    document.getElementById("rearingPeriod").value = record.rearingPeriod
    document.getElementById("meatProductModalTitle").textContent = "Edit Meat Product"
  }

  populateProductionRecordForm(record) {
    document.getElementById("productionYear").value = record.year
    document.getElementById("regionDistrict").value = record.regionDistrict
    document.getElementById("livestockPopulation").value = record.livestockPopulation
    document.getElementById("slaughterRate").value = record.slaughterRate
    document.getElementById("animalsSlaughtered").value = record.animalsSlaughtered
    document.getElementById("totalMeatYield").value = record.totalMeatYield
    document.getElementById("yieldPerAnimal").value = record.yieldPerAnimal
    document.getElementById("productionRecordModalTitle").textContent = "Edit Production Record"
  }

  populatePriceTrendForm(record) {
    document.getElementById("priceDate").value = record.date
    document.getElementById("marketName").value = record.regionMarket
    document.getElementById("priceProductType").value = record.productType
    document.getElementById("wholesalePrice").value = record.wholesalePrice
    document.getElementById("retailPrice").value = record.retailPrice
    document.getElementById("priceChange").value = record.priceChange
    document.getElementById("seasonalTrend").value = record.seasonalTrend
    document.getElementById("priceTrendModalTitle").textContent = "Edit Price Data"
  }

  populateConsumptionPatternForm(record) {
    document.getElementById("consumptionRegion").value = record.region
    document.getElementById("population").value = record.population
    document.getElementById("meatType").value = record.meatType
    document.getElementById("perCapitaConsumption").value = record.perCapitaConsumption
    document.getElementById("shareOfDiet").value = record.shareOfDiet
    document.getElementById("nutritionalContribution").value = record.nutritionalContribution
    document.getElementById("demographicGroup").value = record.demographicGroup
    document.getElementById("consumptionPatternModalTitle").textContent = "Edit Consumption Data"
  }

  populateDemandElasticityForm(record) {
    document.getElementById("demandProductType").value = record.productType
    document.getElementById("timePeriod").value = record.timePeriod
    document.getElementById("averagePrice").value = record.averagePrice
    document.getElementById("quantityDemanded").value = record.quantityDemanded
    document.getElementById("priceElasticity").value = record.priceElasticity
    document.getElementById("crossElasticity").value = record.crossElasticity
    document.getElementById("incomeElasticity").value = record.incomeElasticity || ""
    document.getElementById("demandElasticityModalTitle").textContent = "Edit Demand Elasticity Data"
  }

  populateSupplyDemandForm(record) {
    document.getElementById("supplyDemandRegion").value = record.region
    document.getElementById("supplyDemandTimePeriod").value = record.timePeriod
    document.getElementById("supplyVolume").value = record.supplyVolume
    document.getElementById("demandVolume").value = record.demandVolume
    document.getElementById("supplyDemandModalTitle").textContent = "Edit Supply/Demand Data"
  }

  populateInsightForm(record) {
    document.getElementById("insightRegion").value = record.regionMarket
    document.getElementById("keyTrend").value = record.keyTrend
    document.getElementById("mainChallenge").value = record.mainChallenge
    document.getElementById("opportunity").value = record.opportunity
    document.getElementById("recommendation").value = record.recommendation
    document.getElementById("insightModalTitle").textContent = "Edit Market Insight"
  }

  initializeCharts() {
    // Initialize dashboard charts
    this.initChart("demandElasticityChart", "line")
    this.initChart("supplyDemandChart", "bar")
    this.initChart("insightsChart", "doughnut")

    // Initialize detail charts
    this.initChart("demandElasticityDetailChart", "line")
    this.initChart("supplyDemandDetailChart", "bar")
    this.initChart("insightsDetailChart", "radar")
  }

  initChart(chartId, type) {
    const canvas = document.getElementById(chartId)
    if (!canvas) return

    const ctx = canvas.getContext("2d")

    this.charts[chartId] = new window.Chart(ctx, {
      type: type,
      data: this.getChartData(chartId, type),
      options: this.getChartOptions(type),
    })
  }

  getChartData(chartId, type) {
    switch (chartId) {
      case "demandElasticityChart":
      case "demandElasticityDetailChart":
        return {
          labels: this.data.demandElasticity.map((item) => item.productType),
          datasets: [
            {
              label: "Price Elasticity",
              data: this.data.demandElasticity.map((item) => Math.abs(item.priceElasticity)),
              borderColor: "rgb(59, 130, 246)",
              backgroundColor: "rgba(59, 130, 246, 0.1)",
              tension: 0.4,
            },
          ],
        }

      case "supplyDemandChart":
      case "supplyDemandDetailChart":
        return {
          labels: this.data.supplyDemand.map((item) => item.region),
          datasets: [
            {
              label: "Supply Volume",
              data: this.data.supplyDemand.map((item) => item.supplyVolume),
              backgroundColor: "rgba(34, 197, 94, 0.8)",
            },
            {
              label: "Demand Volume",
              data: this.data.supplyDemand.map((item) => item.demandVolume),
              backgroundColor: "rgba(239, 68, 68, 0.8)",
            },
          ],
        }

      case "insightsChart":
        const trendCounts = {}
        this.data.insightsReports.forEach((item) => {
          const trend = item.keyTrend.split(" ")[0]
          trendCounts[trend] = (trendCounts[trend] || 0) + 1
        })

        return {
          labels: Object.keys(trendCounts),
          datasets: [
            {
              data: Object.values(trendCounts),
              backgroundColor: [
                "rgba(59, 130, 246, 0.8)",
                "rgba(34, 197, 94, 0.8)",
                "rgba(239, 68, 68, 0.8)",
                "rgba(245, 158, 11, 0.8)",
                "rgba(168, 85, 247, 0.8)",
              ],
            },
          ],
        }

      case "insightsDetailChart":
        const challengeCounts = {}
        this.data.insightsReports.forEach((item) => {
          const challenge = item.mainChallenge.split(" ")[0]
          challengeCounts[challenge] = (challengeCounts[challenge] || 0) + 1
        })

        return {
          labels: Object.keys(challengeCounts),
          datasets: [
            {
              label: "Challenge Frequency",
              data: Object.values(challengeCounts),
              backgroundColor: "rgba(59, 130, 246, 0.2)",
              borderColor: "rgb(59, 130, 246)",
              pointBackgroundColor: "rgb(59, 130, 246)",
            },
          ],
        }

      default:
        return { labels: [], datasets: [] }
    }
  }

  getChartOptions(type) {
    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
        },
      },
    }

    if (type === "line" || type === "bar") {
      baseOptions.scales = {
        y: {
          beginAtZero: true,
        },
      }
    }

    return baseOptions
  }

  updateChart(chartId) {
    if (this.charts[chartId]) {
      const type = this.charts[chartId].config.type
      this.charts[chartId].data = this.getChartData(chartId, type)
      this.charts[chartId].update()
    }
  }

  updateDashboard() {
    // Update stats
    document.getElementById("totalProducts").textContent = this.data.meatProducts.length

    const totalProduction = this.data.productionRecords.reduce((sum, record) => sum + record.totalMeatYield, 0)
    document.getElementById("totalProduction").textContent = totalProduction.toLocaleString()

    const avgPrice =
      this.data.priceTrends.reduce((sum, price) => sum + price.retailPrice, 0) / this.data.priceTrends.length
    document.getElementById("avgPrice").textContent = `$${avgPrice.toFixed(2)}`

    const avgElasticity =
      this.data.demandElasticity.reduce((sum, demand) => sum + Math.abs(demand.priceElasticity), 0) /
      this.data.demandElasticity.length
    document.getElementById("demandIndex").textContent = (avgElasticity * 100).toFixed(1)

    // Update dashboard charts
    this.updateChart("demandElasticityChart")
    this.updateChart("supplyDemandChart")
    this.updateChart("insightsChart")
  }

  // Utility methods
  camelToKebab(str) {
    console.log("[v0] Converting camelCase to kebab-case:", str)
    const result = str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase()
    console.log("[v0] Result:", result)
    return result
  }
}

document.addEventListener("DOMContentLoaded", () => {
  new MeatAdminDashboard()
})
