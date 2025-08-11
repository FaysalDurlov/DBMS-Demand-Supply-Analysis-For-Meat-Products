// Admin Dashboard JavaScript with comprehensive features based on farmer dashboard
class AdminDashboard {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentTab = {};
        this.isExpanded = false;
        this.hoverTimeout = null;
        this.data = {
            animals: [],
            products: [],
            orders: [],
            salesRecords: [],
            purchaseRecords: [],
            slaughterRecords: [],
            warehouseStorage: [],
            meatPurchases: [],
            agentProducts: []
        };
        this.init();
    }

    init() {
        this.sidebar = document.getElementById('sidebar');
        this.mainContent = document.getElementById('mainContent');
        this.header = document.getElementById('header');
        this.headerTitle = document.getElementById('headerTitle');
        this.content = document.getElementById('content');
        this.setupEventListeners();
        this.loadDashboardData();
        this.populateAllTables();
        console.log('Admin Dashboard initialized successfully');
    }

    setupEventListeners() {
        // Sidebar hover events (like farmer dashboard)
        this.sidebar.addEventListener('mouseenter', () => this.handleSidebarMouseEnter());
        this.sidebar.addEventListener('mouseleave', () => this.handleSidebarMouseLeave());

        // Main content click event
        this.content.addEventListener('click', () => this.handleMainContentClick());

        // Prevent sidebar clicks from bubbling to main content
        this.sidebar.addEventListener('click', (e) => e.stopPropagation());

        // Navigation items
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavItemClick(item);
            });
        });

        // Tab buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('tab-btn')) {
                const tabName = e.target.getAttribute('data-tab');
                const parentContainer = e.target.closest('.tabs-container');
                this.showTab(parentContainer, tabName);
            }
        });

        // Form submissions
        this.setupFormListeners();

        // Logout button
        const logoutBtn = document.querySelector('.logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                console.log('Logged out');
            });
        }
    }

    setupFormListeners() {
        // Add Animal Form
        const addAnimalForm = document.getElementById('addAnimalForm');
        if (addAnimalForm) {
            addAnimalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddAnimal(new FormData(addAnimalForm));
            });
        }

        // Edit Animal Form
        const editAnimalForm = document.getElementById('editAnimalForm');
        if (editAnimalForm) {
            editAnimalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditAnimal(new FormData(editAnimalForm));
            });
        }

        // Add Sale Form
        const addSaleForm = document.getElementById('addSaleForm');
        if (addSaleForm) {
            addSaleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddSale(new FormData(addSaleForm));
            });
        }

        // Edit Sale Form
        const editSaleForm = document.getElementById('editSaleForm');
        if (editSaleForm) {
            editSaleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditSale(new FormData(editSaleForm));
            });
        }

        // Add Purchase Form
        const addPurchaseForm = document.getElementById('addPurchaseForm');
        if (addPurchaseForm) {
            addPurchaseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddPurchase(new FormData(addPurchaseForm));
            });
        }

        // Edit Purchase Form
        const editPurchaseForm = document.getElementById('editPurchaseForm');
        if (editPurchaseForm) {
            editPurchaseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditPurchase(new FormData(editPurchaseForm));
            });
        }

        // Add Product Form
        const addProductForm = document.getElementById('addProductForm');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddProduct(new FormData(addProductForm));
            });
        }

        // Edit Product Form
        const editProductForm = document.getElementById('editProductForm');
        if (editProductForm) {
            editProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditProduct(new FormData(editProductForm));
            });
        }

        // Order Product Form
        const orderProductForm = document.getElementById('orderProductForm');
        if (orderProductForm) {
            orderProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleOrderProduct(new FormData(orderProductForm));
            });
        }

        // Add Slaughter Form
        const addSlaughterForm = document.getElementById('addSlaughterForm');
        if (addSlaughterForm) {
            addSlaughterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddSlaughter(new FormData(addSlaughterForm));
            });
        }

        // Edit Slaughter Form
        const editSlaughterForm = document.getElementById('editSlaughterForm');
        if (editSlaughterForm) {
            editSlaughterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditSlaughter(new FormData(editSlaughterForm));
            });
        }

        // Add Storage Form
        const addStorageForm = document.getElementById('addStorageForm');
        if (addStorageForm) {
            addStorageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddStorage(new FormData(addStorageForm));
            });
        }

        // Edit Storage Form
        const editStorageForm = document.getElementById('editStorageForm');
        if (editStorageForm) {
            editStorageForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditStorage(new FormData(editStorageForm));
            });
        }

        // Meat Purchase Form
        const meatPurchaseForm = document.getElementById('meatPurchaseForm');
        if (meatPurchaseForm) {
            meatPurchaseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleMeatPurchase(new FormData(meatPurchaseForm));
            });
        }

        // Edit Meat Purchase Form
        const editMeatPurchaseForm = document.getElementById('editMeatPurchaseForm');
        if (editMeatPurchaseForm) {
            editMeatPurchaseForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditMeatPurchase(new FormData(editMeatPurchaseForm));
            });
        }

        // Agent Product Form
        const agentProductForm = document.getElementById('agentProductForm');
        if (agentProductForm) {
            agentProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAgentProduct(new FormData(agentProductForm));
            });
        }

        // Edit Agent Product Form
        const editAgentProductForm = document.getElementById('editAgentProductForm');
        if (editAgentProductForm) {
            editAgentProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditAgentProduct(new FormData(editAgentProductForm));
            });
        }
    }

    // Sidebar animation methods (like farmer dashboard)
    handleSidebarMouseEnter() {
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }
        this.expandSidebar();
    }

    handleSidebarMouseLeave() {
        this.hoverTimeout = setTimeout(() => {
            this.collapseSidebar();
        }, 300);
    }

    handleMainContentClick() {
        if (this.isExpanded) {
            this.collapseSidebar();
        }
    }

    expandSidebar() {
        this.isExpanded = true;
        this.sidebar.classList.add('expanded');
        this.mainContent.classList.add('expanded');
        this.header.classList.add('expanded');
        this.headerTitle.classList.add('hidden');
    }

    collapseSidebar() {
        this.isExpanded = false;
        this.sidebar.classList.remove('expanded');
        this.mainContent.classList.remove('expanded');
        this.header.classList.remove('expanded');
        this.headerTitle.classList.remove('hidden');
    }

    handleNavItemClick(item) {
        // Remove active class from all nav items
        document.querySelectorAll('.nav-item').forEach(navItem => {
            navItem.classList.remove('active');
        });

        // Add active class to clicked item
        item.classList.add('active');

        const sectionName = item.dataset.section;

        // Update header title based on selection
        if (this.headerTitle) {
            const titles = {
                'dashboard': 'Admin Dashboard',
                'customers': 'Customer Management',
                'farmers': 'Farmer Management',
                'vendors': 'Vendor Management',
                'butchers': 'Butcher Management',
                'agents': 'Agent Management',
                'analytics': 'Analytics & Reports',
                'settings': 'System Settings'
            };
            this.headerTitle.textContent = titles[sectionName] || 'Admin Dashboard';
        }

        this.showSection(sectionName);
    }

    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section-content').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        this.currentSection = sectionName;
        this.loadSectionData(sectionName);
    }

    showTab(container, tabName) {
        if (!container) return;

        // Hide all tab contents in this container
        container.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Show selected tab content
        const targetTab = container.querySelector(`#${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // Update tab buttons
        container.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const activeTabBtn = container.querySelector(`[data-tab="${tabName}"]`);
        if (activeTabBtn) {
            activeTabBtn.classList.add('active');
        }

        this.currentTab[this.currentSection] = tabName;
    }

    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'customers':
                this.populateCustomerTables();
                break;
            case 'farmers':
                this.populateFarmerTables();
                break;
            case 'vendors':
                this.populateVendorTables();
                break;
            case 'butchers':
                this.populateButcherTables();
                break;
            case 'agents':
                this.populateAgentTables();
                break;
            case 'analytics':
                this.loadAnalyticsData();
                break;
        }
    }

    loadDashboardData() {
        // Update dashboard stats based on actual data
        const totalUsers = this.data.animals.length + this.data.products.length;
        const totalRevenue = this.calculateTotalRevenue();
        const activeOrders = this.data.orders.filter(order => order.status === 'pending').length;

        document.getElementById('totalUsers').textContent = totalUsers;
        document.getElementById('totalRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('activeOrders').textContent = activeOrders;
        document.getElementById('activeProducts').textContent = this.data.products.length;
    }

    calculateTotalRevenue() {
        return this.data.orders.reduce((total, order) => total + (parseFloat(order.totalAmount) || 0), 0);
    }

    populateAllTables() {
        this.populateCustomerTables();
        this.populateFarmerTables();
        this.populateVendorTables();
        this.populateButcherTables();
        this.populateAgentTables();
    }

    // Customer Management Tables
    populateCustomerTables() {
        this.populateCustomerProductsTable();
        this.populateCustomerOrdersTable();
    }

    populateCustomerProductsTable() {
        const tbody = document.getElementById('customerProductsTableBody');
        if (!tbody) return;

        if (this.data.products.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="6">No products available</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.products.map(product => `
            <tr>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${product.price}</td>
                <td>${product.stock} kg</td>
                <td>${product.vendor || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-primary" onclick="orderProduct('${product.id}')">Order</button>
                        <button class="btn-secondary" onclick="viewProductDetails('${product.id}')">View Details</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    populateCustomerOrdersTable() {
        const tbody = document.getElementById('customerOrdersTableBody');
        if (!tbody) return;

        if (this.data.orders.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="8">No orders found</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.customerName}</td>
                <td>${order.productName}</td>
                <td>${order.quantity} kg</td>
                <td>$${order.totalAmount}</td>
                <td>${order.orderDate}</td>
                <td><span class="badge badge-${this.getStatusBadgeClass(order.status)}">${order.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="trackOrder('${order.id}')" title="Track Order">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
                                <path d="M15 18H9"/>
                                <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
                                <circle cx="17" cy="18" r="2"/>
                                <circle cx="7" cy="18" r="2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Farmer Management Tables
    populateFarmerTables() {
        this.populateAnimalRecordsTable();
        this.populateSalesRecordsTable();
        this.populatePurchaseRecordsTable();
    }

    populateAnimalRecordsTable() {
        const tbody = document.getElementById('animalRecordsTableBody');
        if (!tbody) return;

        if (this.data.animals.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="8">No animal records found</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.animals.map(animal => `
            <tr>
                <td>${animal.id}</td>
                <td>${animal.type}</td>
                <td>${animal.breed}</td>
                <td>${animal.age}</td>
                <td>${animal.weight}</td>
                <td><span class="badge badge-${animal.healthStatus === 'healthy' ? 'success' : 'warning'}">${animal.healthStatus}</span></td>
                <td>${animal.dateAdded}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="editAnimal('${animal.id}')" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteAnimal('${animal.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    populateSalesRecordsTable() {
        const tbody = document.getElementById('salesRecordsTableBody');
        if (!tbody) return;

        if (this.data.salesRecords.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="6">No sales records found</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.salesRecords.map(sale => `
            <tr>
                <td>${sale.id}</td>
                <td>${sale.animalId}</td>
                <td>${sale.buyer}</td>
                <td>$${sale.salePrice}</td>
                <td>${sale.saleDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="editSale('${sale.id}')" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteSale('${sale.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    populatePurchaseRecordsTable() {
        const tbody = document.getElementById('purchaseRecordsTableBody');
        if (!tbody) return;

        if (this.data.purchaseRecords.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="6">No purchase records found</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.purchaseRecords.map(purchase => `
            <tr>
                <td>${purchase.id}</td>
                <td>${purchase.animalId}</td>
                <td>${purchase.seller}</td>
                <td>$${purchase.purchasePrice}</td>
                <td>${purchase.purchaseDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="editPurchase('${purchase.id}')" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deletePurchase('${purchase.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Vendor Management Tables
    populateVendorTables() {
        this.populateVendorProductsTable();
        this.populateVendorOrdersTable();
    }

    populateVendorProductsTable() {
        const tbody = document.getElementById('vendorProductsTableBody');
        if (!tbody) return;

        if (this.data.products.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="7">No products found</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>$${product.price}</td>
                <td>${product.stock} kg</td>
                <td>${product.dateAdded}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="editProduct('${product.id}')" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteProduct('${product.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    populateVendorOrdersTable() {
        const tbody = document.getElementById('vendorOrdersTableBody');
        if (!tbody) return;

        if (this.data.orders.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="8">No orders found</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.orders.map(order => `
            <tr>
                <td>${order.id}</td>
                <td>${order.customerName}</td>
                <td>${order.productName}</td>
                <td>${order.quantity} kg</td>
                <td>$${order.totalAmount}</td>
                <td>${order.orderDate}</td>
                <td><span class="badge badge-${this.getStatusBadgeClass(order.status)}">${order.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-primary" onclick="confirmOrder('${order.id}')">Confirm</button>
                        <button class="btn-secondary" onclick="rejectOrder('${order.id}')">Reject</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Butcher Management Tables
    populateButcherTables() {
        this.populateSlaughterRecordsTable();
        this.populateWarehouseStorageTable();
    }

    populateSlaughterRecordsTable() {
        const tbody = document.getElementById('slaughterRecordsTableBody');
        if (!tbody) return;

        if (this.data.slaughterRecords.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="7">No slaughter records found</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.slaughterRecords.map(record => `
            <tr>
                <td>${record.batchId}</td>
                <td>${record.animalId}</td>
                <td>${record.animalType}</td>
                <td>${record.weight}</td>
                <td>${record.meatYield}</td>
                <td>${record.slaughterDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="editSlaughterRecord('${record.id}')" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteSlaughterRecord('${record.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    populateWarehouseStorageTable() {
        const tbody = document.getElementById('warehouseStorageTableBody');
        if (!tbody) return;

        if (this.data.warehouseStorage.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="8">No storage records found</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.warehouseStorage.map(storage => `
            <tr>
                <td>${storage.id}</td>
                <td>${storage.batchId}</td>
                <td>${storage.meatType}</td>
                <td>${storage.quantity}</td>
                <td>${storage.location}</td>
                <td>${storage.temperature}</td>
                <td>${storage.storageDate}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="editStorage('${storage.id}')" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteStorage('${storage.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Agent Management Tables
    populateAgentTables() {
        this.populateMeatPurchasesTable();
        this.populateAgentProductsTable();
    }

    populateMeatPurchasesTable() {
        const tbody = document.getElementById('meatPurchasesTableBody');
        if (!tbody) return;

        if (this.data.meatPurchases.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="9">No purchase records found</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.meatPurchases.map(purchase => `
            <tr>
                <td>${purchase.id}</td>
                <td>${purchase.butcher}</td>
                <td>${purchase.meatType}</td>
                <td>${purchase.quantity}</td>
                <td>$${purchase.pricePerKg}</td>
                <td>$${purchase.totalCost}</td>
                <td>${purchase.orderDate}</td>
                <td><span class="badge badge-${this.getStatusBadgeClass(purchase.status)}">${purchase.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="editMeatPurchase('${purchase.id}')" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteMeatPurchase('${purchase.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    populateAgentProductsTable() {
        const tbody = document.getElementById('agentProductsTableBody');
        if (!tbody) return;

        if (this.data.agentProducts.length === 0) {
            tbody.innerHTML = '<tr class="empty-state"><td colspan="7">No products found</td></tr>';
            return;
        }

        tbody.innerHTML = this.data.agentProducts.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.meatType}</td>
                <td>${product.quantity}</td>
                <td>$${product.salePrice}</td>
                <td>${product.dateAdded}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon" onclick="editAgentProduct('${product.id}')" title="Edit">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button class="btn-icon btn-danger" onclick="deleteAgentProduct('${product.id}')" title="Delete">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Form Handlers
    handleAddAnimal(formData) {
        const animalData = {
            id: this.generateUniqueId('ANM'),
            type: formData.get('animalType'),
            breed: formData.get('animalBreed'),
            age: formData.get('animalAge'),
            weight: formData.get('animalWeight'),
            healthStatus: formData.get('healthStatus'),
            vaccinationStatus: formData.get('vaccinationStatus'),
            dateAdded: new Date().toISOString().split('T')[0]
        };

        this.data.animals.push(animalData);
        this.populateAnimalRecordsTable();
        this.closeModal('addAnimalModal');
        this.showNotification('Animal added successfully!', 'success');
        this.loadDashboardData();
        document.getElementById('addAnimalForm').reset();
    }

    handleEditAnimal(formData) {
        const animalId = formData.get('editAnimalId');
        const index = this.data.animals.findIndex(animal => animal.id === animalId);
        
        if (index !== -1) {
            this.data.animals[index] = {
                ...this.data.animals[index],
                type: formData.get('editAnimalType'),
                breed: formData.get('editAnimalBreed'),
                age: formData.get('editAnimalAge'),
                weight: formData.get('editAnimalWeight'),
                healthStatus: formData.get('editHealthStatus'),
                vaccinationStatus: formData.get('editVaccinationStatus')
            };

            this.populateAnimalRecordsTable();
            this.closeModal('editAnimalModal');
            this.showNotification('Animal updated successfully!', 'success');
            document.getElementById('editAnimalForm').reset();
        }
    }

    handleAddSale(formData) {
        const saleData = {
            id: this.generateUniqueId('SALE'),
            animalId: formData.get('saleAnimalId'),
            buyer: formData.get('saleBuyer'),
            salePrice: formData.get('salePrice'),
            saleDate: formData.get('saleDate')
        };

        this.data.salesRecords.push(saleData);
        this.populateSalesRecordsTable();
        this.closeModal('addSaleModal');
        this.showNotification('Sale record added successfully!', 'success');
        this.loadDashboardData();
        document.getElementById('addSaleForm').reset();
    }

    handleEditSale(formData) {
        const saleId = formData.get('editSaleId');
        const index = this.data.salesRecords.findIndex(sale => sale.id === saleId);
        
        if (index !== -1) {
            this.data.salesRecords[index] = {
                ...this.data.salesRecords[index],
                animalId: formData.get('editSaleAnimalId'),
                buyer: formData.get('editSaleBuyer'),
                salePrice: formData.get('editSalePrice'),
                saleDate: formData.get('editSaleDate')
            };

            this.populateSalesRecordsTable();
            this.closeModal('editSaleModal');
            this.showNotification('Sale record updated successfully!', 'success');
            document.getElementById('editSaleForm').reset();
        }
    }

    handleAddPurchase(formData) {
        const purchaseData = {
            id: this.generateUniqueId('PUR'),
            animalId: formData.get('purchaseAnimalId'),
            seller: formData.get('purchaseSeller'),
            purchasePrice: formData.get('purchasePrice'),
            purchaseDate: formData.get('purchaseDate')
        };

        this.data.purchaseRecords.push(purchaseData);
        this.populatePurchaseRecordsTable();
        this.closeModal('addPurchaseModal');
        this.showNotification('Purchase record added successfully!', 'success');
        this.loadDashboardData();
        document.getElementById('addPurchaseForm').reset();
    }

    handleEditPurchase(formData) {
        const purchaseId = formData.get('editPurchaseId');
        const index = this.data.purchaseRecords.findIndex(purchase => purchase.id === purchaseId);
        
        if (index !== -1) {
            this.data.purchaseRecords[index] = {
                ...this.data.purchaseRecords[index],
                animalId: formData.get('editPurchaseAnimalId'),
                seller: formData.get('editPurchaseSeller'),
                purchasePrice: formData.get('editPurchasePrice'),
                purchaseDate: formData.get('editPurchaseDate')
            };

            this.populatePurchaseRecordsTable();
            this.closeModal('editPurchaseModal');
            this.showNotification('Purchase record updated successfully!', 'success');
            document.getElementById('editPurchaseForm').reset();
        }
    }

    handleAddProduct(formData) {
        const productData = {
            id: this.generateUniqueId('PROD'),
            name: formData.get('productName'),
            category: formData.get('productCategory'),
            price: parseFloat(formData.get('productPrice')),
            stock: parseFloat(formData.get('productStock')),
            dateAdded: new Date().toISOString().split('T')[0]
        };

        this.data.products.push(productData);
        this.populateVendorProductsTable();
        this.populateCustomerProductsTable();
        this.closeModal('addProductModal');
        this.showNotification('Product added successfully!', 'success');
        this.loadDashboardData();
        document.getElementById('addProductForm').reset();
    }

    handleEditProduct(formData) {
        const productId = formData.get('editProductId');
        const index = this.data.products.findIndex(product => product.id === productId);
        
        if (index !== -1) {
            this.data.products[index] = {
                ...this.data.products[index],
                name: formData.get('editProductName'),
                category: formData.get('editProductCategory'),
                price: parseFloat(formData.get('editProductPrice')),
                stock: parseFloat(formData.get('editProductStock'))
            };

            this.populateVendorProductsTable();
            this.populateCustomerProductsTable();
            this.closeModal('editProductModal');
            this.showNotification('Product updated successfully!', 'success');
            document.getElementById('editProductForm').reset();
        }
    }

    handleOrderProduct(formData) {
        const orderData = {
            id: this.generateUniqueId('ORD'),
            productId: formData.get('orderProductId'),
            customerName: formData.get('customerName'),
            customerEmail: formData.get('customerEmail'),
            productName: this.currentOrderProduct?.name || 'Unknown Product',
            quantity: parseFloat(formData.get('orderQuantity')),
            totalAmount: (parseFloat(formData.get('orderQuantity')) * (this.currentOrderProduct?.price || 0)).toFixed(2),
            deliveryAddress: formData.get('deliveryAddress'),
            orderDate: new Date().toISOString().split('T')[0],
            status: 'pending'
        };

        this.data.orders.push(orderData);
        this.populateCustomerOrdersTable();
        this.populateVendorOrdersTable();
        this.closeModal('orderProductModal');
        this.showNotification(`Order placed successfully! Order ID: ${orderData.id}`, 'success');
        this.loadDashboardData();
        document.getElementById('orderProductForm').reset();
    }

    handleAddSlaughter(formData) {
        const slaughterData = {
            id: this.generateUniqueId('SLAU'),
            batchId: this.generateUniqueId('BATCH'),
            animalId: formData.get('slaughterAnimalId'),
            animalType: formData.get('slaughterAnimalType'),
            weight: formData.get('slaughterWeight'),
            meatYield: formData.get('meatYield'),
            slaughterDate: formData.get('slaughterDate')
        };

        this.data.slaughterRecords.push(slaughterData);
        this.populateSlaughterRecordsTable();
        this.closeModal('addSlaughterModal');
        this.showNotification('Slaughter record added successfully!', 'success');
        this.loadDashboardData();
        document.getElementById('addSlaughterForm').reset();
    }

    handleEditSlaughter(formData) {
        const slaughterId = formData.get('editSlaughterId');
        const index = this.data.slaughterRecords.findIndex(record => record.id === slaughterId);
        
        if (index !== -1) {
            this.data.slaughterRecords[index] = {
                ...this.data.slaughterRecords[index],
                animalId: formData.get('editSlaughterAnimalId'),
                animalType: formData.get('editSlaughterAnimalType'),
                weight: formData.get('editSlaughterWeight'),
                meatYield: formData.get('editMeatYield'),
                slaughterDate: formData.get('editSlaughterDate')
            };

            this.populateSlaughterRecordsTable();
            this.closeModal('editSlaughterModal');
            this.showNotification('Slaughter record updated successfully!', 'success');
            document.getElementById('editSlaughterForm').reset();
        }
    }

    handleAddStorage(formData) {
        const storageData = {
            id: this.generateUniqueId('STOR'),
            batchId: formData.get('storageBatchId'),
            meatType: formData.get('storageMeatType'),
            quantity: formData.get('storageQuantity'),
            location: formData.get('storageLocation'),
            temperature: formData.get('storageTemperature'),
            storageDate: formData.get('storageDate')
        };

        this.data.warehouseStorage.push(storageData);
        this.populateWarehouseStorageTable();
        this.closeModal('addStorageModal');
        this.showNotification('Storage record added successfully!', 'success');
        this.loadDashboardData();
        document.getElementById('addStorageForm').reset();
    }

    handleEditStorage(formData) {
        const storageId = formData.get('editStorageId');
        const index = this.data.warehouseStorage.findIndex(storage => storage.id === storageId);
        
        if (index !== -1) {
            this.data.warehouseStorage[index] = {
                ...this.data.warehouseStorage[index],
                batchId: formData.get('editStorageBatchId'),
                meatType: formData.get('editStorageMeatType'),
                quantity: formData.get('editStorageQuantity'),
                location: formData.get('editStorageLocation'),
                temperature: formData.get('editStorageTemperature'),
                storageDate: formData.get('editStorageDate')
            };

            this.populateWarehouseStorageTable();
            this.closeModal('editStorageModal');
            this.showNotification('Storage record updated successfully!', 'success');
            document.getElementById('editStorageForm').reset();
        }
    }

    handleMeatPurchase(formData) {
        const purchaseData = {
            id: this.generateUniqueId('MPUR'),
            butcher: formData.get('butcherName'),
            meatType: formData.get('meatType'),
            quantity: parseFloat(formData.get('purchaseQuantity')),
            pricePerKg: parseFloat(formData.get('purchasePricePerKg')),
            totalCost: (parseFloat(formData.get('purchaseQuantity')) * parseFloat(formData.get('purchasePricePerKg'))).toFixed(2),
            orderDate: new Date().toISOString().split('T')[0],
            status: 'pending'
        };

        this.data.meatPurchases.push(purchaseData);
        this.populateMeatPurchasesTable();
        this.closeModal('meatPurchaseModal');
        this.showNotification('Meat purchase order placed successfully!', 'success');
        this.loadDashboardData();
        document.getElementById('meatPurchaseForm').reset();
    }

    handleEditMeatPurchase(formData) {
        const purchaseId = formData.get('editMeatPurchaseId');
        const index = this.data.meatPurchases.findIndex(purchase => purchase.id === purchaseId);
        
        if (index !== -1) {
            const quantity = parseFloat(formData.get('editPurchaseQuantity'));
            const pricePerKg = parseFloat(formData.get('editPurchasePricePerKg'));
            
            this.data.meatPurchases[index] = {
                ...this.data.meatPurchases[index],
                butcher: formData.get('editButcherName'),
                meatType: formData.get('editMeatType'),
                quantity: quantity,
                pricePerKg: pricePerKg,
                totalCost: (quantity * pricePerKg).toFixed(2)
            };

            this.populateMeatPurchasesTable();
            this.closeModal('editMeatPurchaseModal');
            this.showNotification('Meat purchase updated successfully!', 'success');
            document.getElementById('editMeatPurchaseForm').reset();
        }
    }

    handleAgentProduct(formData) {
        const productData = {
            id: this.generateUniqueId('APROD'),
            name: formData.get('agentProductName'),
            meatType: formData.get('agentMeatType'),
            quantity: formData.get('agentProductQuantity'),
            salePrice: formData.get('agentSalePrice'),
            dateAdded: new Date().toISOString().split('T')[0]
        };

        this.data.agentProducts.push(productData);
        this.populateAgentProductsTable();
        this.closeModal('agentProductModal');
        this.showNotification('Product added successfully!', 'success');
        this.loadDashboardData();
        document.getElementById('agentProductForm').reset();
    }

    handleEditAgentProduct(formData) {
        const productId = formData.get('editAgentProductId');
        const index = this.data.agentProducts.findIndex(product => product.id === productId);
        
        if (index !== -1) {
            this.data.agentProducts[index] = {
                ...this.data.agentProducts[index],
                name: formData.get('editAgentProductName'),
                meatType: formData.get('editAgentMeatType'),
                quantity: formData.get('editAgentProductQuantity'),
                salePrice: formData.get('editAgentSalePrice')
            };

            this.populateAgentProductsTable();
            this.closeModal('editAgentProductModal');
            this.showNotification('Product updated successfully!', 'success');
            document.getElementById('editAgentProductForm').reset();
        }
    }

    // Utility Functions
    generateUniqueId(prefix) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000);
        return `${prefix}${timestamp}${random}`;
    }

    getStatusBadgeClass(status) {
        const statusMap = {
            'pending': 'warning',
            'confirmed': 'info',
            'completed': 'success',
            'delivered': 'success',
            'cancelled': 'danger',
            'rejected': 'danger'
        };
        return statusMap[status] || 'info';
    }

    loadAnalyticsData() {
        // Update analytics data
        const totalAnimalsProcessed = this.data.slaughterRecords.length;
        const totalMeatProduction = this.data.slaughterRecords.reduce((total, record) => total + (parseFloat(record.meatYield) || 0), 0);
        const activeOrders = this.data.orders.filter(order => order.status === 'pending').length;
        const totalRevenue = this.calculateTotalRevenue();
        const totalPurchases = this.data.meatPurchases.reduce((total, purchase) => total + (parseFloat(purchase.totalCost) || 0), 0);
        const netProfit = totalRevenue - totalPurchases;

        document.getElementById('totalAnimalsProcessed').textContent = totalAnimalsProcessed;
        document.getElementById('totalMeatProduction').textContent = totalMeatProduction.toFixed(1);
        document.getElementById('analyticsActiveOrders').textContent = activeOrders;
        document.getElementById('analyticsRevenue').textContent = `$${totalRevenue.toFixed(2)}`;
        document.getElementById('analyticsPurchases').textContent = `$${totalPurchases.toFixed(2)}`;
        document.getElementById('analyticsProfit').textContent = `$${netProfit.toFixed(2)}`;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${type === 'success' ? '#059669' : type === 'danger' ? '#dc2626' : '#2563eb'};
            color: white;
            border-radius: 6px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }
}

// Global Functions
function showAddAnimalModal() {
    const modal = document.getElementById('addAnimalModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function showAddSaleModal() {
    const modal = document.getElementById('addSaleModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function showAddPurchaseModal() {
    const modal = document.getElementById('addPurchaseModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function showAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function showAddSlaughterModal() {
    const modal = document.getElementById('addSlaughterModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function showAddStorageModal() {
    const modal = document.getElementById('addStorageModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function showMeatPurchaseModal() {
    const modal = document.getElementById('meatPurchaseModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function showAgentProductModal() {
    const modal = document.getElementById('agentProductModal');
    if (modal) {
        modal.classList.add('active');
    }
}

function orderProduct(productId) {
    const product = window.adminDashboard.data.products.find(p => p.id === productId);
    if (product) {
        window.adminDashboard.currentOrderProduct = product;
        document.getElementById('orderProductId').value = productId;
        const modal = document.getElementById('orderProductModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
}

function viewProductDetails(productId) {
    const product = window.adminDashboard.data.products.find(p => p.id === productId);
    if (product) {
        alert(`Product Details:\nName: ${product.name}\nCategory: ${product.category}\nPrice: $${product.price}/kg\nStock: ${product.stock}kg`);
    }
}

function calculateNutrition() {
    const meatType = document.getElementById('meatType').value;
    const quantity = parseFloat(document.getElementById('quantity').value);

    if (!meatType || !quantity) {
        alert('Please select meat type and enter quantity');
        return;
    }

    // Nutrition data per 100g
    const nutritionData = {
        beef: { calories: 250, protein: 26, fat: 15, carbs: 0 },
        chicken: { calories: 165, protein: 31, fat: 3.6, carbs: 0 },
        lamb: { calories: 294, protein: 25, fat: 21, carbs: 0 },
        pork: { calories: 242, protein: 27, fat: 14, carbs: 0 }
    };

    const nutrition = nutritionData[meatType];
    const multiplier = quantity / 100;

    document.getElementById('calories').textContent = Math.round(nutrition.calories * multiplier);
    document.getElementById('protein').textContent = (nutrition.protein * multiplier).toFixed(1) + 'g';
    document.getElementById('fat').textContent = (nutrition.fat * multiplier).toFixed(1) + 'g';
    document.getElementById('carbs').textContent = (nutrition.carbs * multiplier).toFixed(1) + 'g';

    document.getElementById('nutritionResults').style.display = 'block';
}

function trackOrder(orderId) {
    const order = window.adminDashboard.data.orders.find(o => o.id === orderId);
    if (order) {
        alert(`Order Tracking:\nOrder ID: ${order.id}\nStatus: ${order.status}\nCustomer: ${order.customerName}\nProduct: ${order.productName}\nQuantity: ${order.quantity}kg`);
    }
}

function confirmOrder(orderId) {
    const order = window.adminDashboard.data.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'confirmed';
        window.adminDashboard.populateVendorOrdersTable();
        window.adminDashboard.populateCustomerOrdersTable();
        window.adminDashboard.showNotification('Order confirmed successfully!', 'success');
    }
}

function rejectOrder(orderId) {
    const order = window.adminDashboard.data.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'rejected';
        window.adminDashboard.populateVendorOrdersTable();
        window.adminDashboard.populateCustomerOrdersTable();
        window.adminDashboard.showNotification('Order rejected', 'danger');
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
}

function saveSettings() {
    window.adminDashboard.showNotification('Settings saved successfully!', 'success');
}

// Edit Functions
function editAnimal(id) {
    const animal = window.adminDashboard.data.animals.find(a => a.id === id);
    if (animal) {
        document.getElementById('editAnimalId').value = animal.id;
        document.getElementById('editAnimalType').value = animal.type;
        document.getElementById('editAnimalBreed').value = animal.breed;
        document.getElementById('editAnimalAge').value = animal.age;
        document.getElementById('editAnimalWeight').value = animal.weight;
        document.getElementById('editHealthStatus').value = animal.healthStatus;
        document.getElementById('editVaccinationStatus').value = animal.vaccinationStatus;
        
        const modal = document.getElementById('editAnimalModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
}

function editSale(id) {
    const sale = window.adminDashboard.data.salesRecords.find(s => s.id === id);
    if (sale) {
        document.getElementById('editSaleId').value = sale.id;
        document.getElementById('editSaleAnimalId').value = sale.animalId;
        document.getElementById('editSaleBuyer').value = sale.buyer;
        document.getElementById('editSalePrice').value = sale.salePrice;
        document.getElementById('editSaleDate').value = sale.saleDate;
        
        const modal = document.getElementById('editSaleModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
}

function editPurchase(id) {
    const purchase = window.adminDashboard.data.purchaseRecords.find(p => p.id === id);
    if (purchase) {
        document.getElementById('editPurchaseId').value = purchase.id;
        document.getElementById('editPurchaseAnimalId').value = purchase.animalId;
        document.getElementById('editPurchaseSeller').value = purchase.seller;
        document.getElementById('editPurchasePrice').value = purchase.purchasePrice;
        document.getElementById('editPurchaseDate').value = purchase.purchaseDate;
        
        const modal = document.getElementById('editPurchaseModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
}

function editProduct(id) {
    const product = window.adminDashboard.data.products.find(p => p.id === id);
    if (product) {
        document.getElementById('editProductId').value = product.id;
        document.getElementById('editProductName').value = product.name;
        document.getElementById('editProductCategory').value = product.category;
        document.getElementById('editProductPrice').value = product.price;
        document.getElementById('editProductStock').value = product.stock;
        
        const modal = document.getElementById('editProductModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
}

function editSlaughterRecord(id) {
    const record = window.adminDashboard.data.slaughterRecords.find(r => r.id === id);
    if (record) {
        document.getElementById('editSlaughterId').value = record.id;
        document.getElementById('editSlaughterAnimalId').value = record.animalId;
        document.getElementById('editSlaughterAnimalType').value = record.animalType;
        document.getElementById('editSlaughterWeight').value = record.weight;
        document.getElementById('editMeatYield').value = record.meatYield;
        document.getElementById('editSlaughterDate').value = record.slaughterDate;
        
        const modal = document.getElementById('editSlaughterModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
}

function editStorage(id) {
    const storage = window.adminDashboard.data.warehouseStorage.find(s => s.id === id);
    if (storage) {
        document.getElementById('editStorageId').value = storage.id;
        document.getElementById('editStorageBatchId').value = storage.batchId;
        document.getElementById('editStorageMeatType').value = storage.meatType;
        document.getElementById('editStorageQuantity').value = storage.quantity;
        document.getElementById('editStorageLocation').value = storage.location;
        document.getElementById('editStorageTemperature').value = storage.temperature;
        document.getElementById('editStorageDate').value = storage.storageDate;
        
        const modal = document.getElementById('editStorageModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
}

function editMeatPurchase(id) {
    const purchase = window.adminDashboard.data.meatPurchases.find(p => p.id === id);
    if (purchase) {
        document.getElementById('editMeatPurchaseId').value = purchase.id;
        document.getElementById('editButcherName').value = purchase.butcher;
        document.getElementById('editMeatType').value = purchase.meatType;
        document.getElementById('editPurchaseQuantity').value = purchase.quantity;
        document.getElementById('editPurchasePricePerKg').value = purchase.pricePerKg;
        
        const modal = document.getElementById('editMeatPurchaseModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
}

function editAgentProduct(id) {
    const product = window.adminDashboard.data.agentProducts.find(p => p.id === id);
    if (product) {
        document.getElementById('editAgentProductId').value = product.id;
        document.getElementById('editAgentProductName').value = product.name;
        document.getElementById('editAgentMeatType').value = product.meatType;
        document.getElementById('editAgentProductQuantity').value = product.quantity;
        document.getElementById('editAgentSalePrice').value = product.salePrice;
        
        const modal = document.getElementById('editAgentProductModal');
        if (modal) {
            modal.classList.add('active');
        }
    }
}

// Delete Functions
function deleteAnimal(id) {
    if (confirm('Are you sure you want to delete this animal?')) {
        window.adminDashboard.data.animals = window.adminDashboard.data.animals.filter(a => a.id !== id);
        window.adminDashboard.populateAnimalRecordsTable();
        window.adminDashboard.showNotification('Animal deleted successfully!', 'success');
        window.adminDashboard.loadDashboardData();
    }
}

function deleteSale(id) {
    if (confirm('Are you sure you want to delete this sale record?')) {
        window.adminDashboard.data.salesRecords = window.adminDashboard.data.salesRecords.filter(s => s.id !== id);
        window.adminDashboard.populateSalesRecordsTable();
        window.adminDashboard.showNotification('Sale record deleted successfully!', 'success');
        window.adminDashboard.loadDashboardData();
    }
}

function deletePurchase(id) {
    if (confirm('Are you sure you want to delete this purchase record?')) {
        window.adminDashboard.data.purchaseRecords = window.adminDashboard.data.purchaseRecords.filter(p => p.id !== id);
        window.adminDashboard.populatePurchaseRecordsTable();
        window.adminDashboard.showNotification('Purchase record deleted successfully!', 'success');
        window.adminDashboard.loadDashboardData();
    }
}

function deleteProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        window.adminDashboard.data.products = window.adminDashboard.data.products.filter(p => p.id !== id);
        window.adminDashboard.populateVendorProductsTable();
        window.adminDashboard.populateCustomerProductsTable();
        window.adminDashboard.showNotification('Product deleted successfully!', 'success');
        window.adminDashboard.loadDashboardData();
    }
}

function deleteSlaughterRecord(id) {
    if (confirm('Are you sure you want to delete this slaughter record?')) {
        window.adminDashboard.data.slaughterRecords = window.adminDashboard.data.slaughterRecords.filter(r => r.id !== id);
        window.adminDashboard.populateSlaughterRecordsTable();
        window.adminDashboard.showNotification('Slaughter record deleted successfully!', 'success');
        window.adminDashboard.loadDashboardData();
    }
}

function deleteStorage(id) {
    if (confirm('Are you sure you want to delete this storage record?')) {
        window.adminDashboard.data.warehouseStorage = window.adminDashboard.data.warehouseStorage.filter(s => s.id !== id);
        window.adminDashboard.populateWarehouseStorageTable();
        window.adminDashboard.showNotification('Storage record deleted successfully!', 'success');
        window.adminDashboard.loadDashboardData();
    }
}

function deleteMeatPurchase(id) {
    if (confirm('Are you sure you want to delete this meat purchase?')) {
        window.adminDashboard.data.meatPurchases = window.adminDashboard.data.meatPurchases.filter(p => p.id !== id);
        window.adminDashboard.populateMeatPurchasesTable();
        window.adminDashboard.showNotification('Meat purchase deleted successfully!', 'success');
        window.adminDashboard.loadDashboardData();
    }
}

function deleteAgentProduct(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        window.adminDashboard.data.agentProducts = window.adminDashboard.data.agentProducts.filter(p => p.id !== id);
        window.adminDash.populateAgentProductsTable();
        window.adminDashboard.showNotification('Product deleted successfully!', 'success');
        window.adminDashboard.loadDashboardData();
    }
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
    console.log('Meatrix Admin Panel loaded successfully');
});
