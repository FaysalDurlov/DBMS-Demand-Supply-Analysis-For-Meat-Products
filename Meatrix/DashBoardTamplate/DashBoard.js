class Dashboard {
    constructor() {
      this.isExpanded = false
      this.hoverTimeout = null
      this.init()
    }
  
    init() {
      this.sidebar = document.getElementById("sidebar")
      this.mainContent = document.getElementById("mainContent")
      this.header = document.getElementById("header")
      this.headerTitle = document.getElementById("headerTitle")
      this.content = document.getElementById("content")
  
      this.setupEventListeners()
    }
  
    setupEventListeners() {
      // Sidebar hover events
      this.sidebar.addEventListener("mouseenter", () => this.handleSidebarMouseEnter())
      this.sidebar.addEventListener("mouseleave", () => this.handleSidebarMouseLeave())
  
      // Main content click event
      this.content.addEventListener("click", () => this.handleMainContentClick())
  
      // Prevent sidebar clicks from bubbling to main content
      this.sidebar.addEventListener("click", (e) => e.stopPropagation())
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
  
  // Initialize dashboard when DOM is loaded
  document.addEventListener("DOMContentLoaded", () => {
    new Dashboard()
  })
  