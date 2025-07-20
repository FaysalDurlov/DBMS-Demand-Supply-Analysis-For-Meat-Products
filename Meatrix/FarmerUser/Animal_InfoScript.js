// Sample data
let animals = [
    {
        id: "MTX001",
        breed: "Holstein",
        type: "Cattle",
        dateAdded: "2024-01-15",
        records: [
            {
                id: "1",
                date: "2024-01-20",
                feedType: "Hay & Grain Mix",
                feedCostPerUnit: 25.5,
                dailyFeedQuantity: 15,
                monthlyWeight: 450,
                vaccinationNotes: "Annual vaccination completed",
            },
        ],
    },
    {
        id: "MTX002",
        breed: "Yorkshire",
        type: "Pig",
        dateAdded: "2024-02-01",
        records: [],
    },
];

let selectedAnimal = null;
let filteredAnimals = [...animals];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    updateAnimalCount();
    populateBreedFilter();
    renderAnimals();
    updateNextId();
});

// Update animal count in header
function updateAnimalCount() {
    document.getElementById('animalCount').textContent = `${animals.length} Animals Registered`;
}

// Generate next animal ID
function generateAnimalId() {
    const nextNumber = animals.length + 1;
    return `MTX${nextNumber.toString().padStart(3, '0')}`;
}

// Update next ID display
function updateNextId() {
    document.getElementById('nextId').textContent = generateAnimalId();
}

// Populate breed filter dropdown
function populateBreedFilter() {
    const breedFilter = document.getElementById('filterBreed');
    const breeds = [...new Set(animals.map(animal => animal.breed))].sort();
    
    // Clear existing options except "All Breeds"
    breedFilter.innerHTML = '<option value="all">All Breeds</option>';
    
    breeds.forEach(breed => {
        const option = document.createElement('option');
        option.value = breed;
        option.textContent = breed;
        breedFilter.appendChild(option);
    });
}

// Apply filters
function applyFilters() {
    const typeFilter = document.getElementById('filterType').value;
    const breedFilter = document.getElementById('filterBreed').value;
    
    filteredAnimals = animals.filter(animal => {
        const typeMatch = typeFilter === 'all' || animal.type === typeFilter;
        const breedMatch = breedFilter === 'all' || animal.breed === breedFilter;
        return typeMatch && breedMatch;
    });
    
    renderAnimals();
    updateFilterStats();
}

// Update filter statistics
function updateFilterStats() {
    document.getElementById('filterStats').textContent = 
        `Showing ${filteredAnimals.length} of ${animals.length} animals`;
}

// Render animals grid
function renderAnimals() {
    const grid = document.getElementById('animalsGrid');
    
    if (filteredAnimals.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 3h18v18H3zM9 9h6v6H9z"/>
                </svg>
                <p>No animals found matching the selected filters</p>
                <p style="font-size: 0.875rem;">Try adjusting your filter criteria</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredAnimals.map(animal => `
        <div class="animal-card ${selectedAnimal && selectedAnimal.id === animal.id ? 'selected' : ''}" 
             onclick="selectAnimal('${animal.id}')">
            <div class="animal-info-left">
                <div class="animal-id">
                    <h4>${animal.id}</h4>
                    <span class="animal-type-badge">${animal.type}</span>
                </div>
                <p class="animal-breed">${animal.breed}</p>
                <p class="animal-date">Added: ${animal.dateAdded}</p>
            </div>
            <div class="animal-info-right">
                <span class="records-badge">${animal.records.length} records</span>
                ${animal.records.length > 0 ? 
                    `<p class="animal-weight">${animal.records[animal.records.length - 1].monthlyWeight}kg</p>` : 
                    ''
                }
            </div>
        </div>
    `).join('');
    
    updateFilterStats();
}

// Select an animal
function selectAnimal(animalId) {
    selectedAnimal = animals.find(animal => animal.id === animalId);
    renderAnimals(); // Re-render to show selection
    updateAnimalDetails();
    updateRightPanel();
    showRecordsTable();
}

// Update animal details section
function updateAnimalDetails() {
    if (!selectedAnimal) {
        document.getElementById('animalDetails').style.display = 'none';
        return;
    }
    
    document.getElementById('animalDetails').style.display = 'block';
    document.getElementById('animalId').textContent = selectedAnimal.id;
    document.getElementById('animalInfo').textContent = 
        `${selectedAnimal.breed} • ${selectedAnimal.type} • Added: ${selectedAnimal.dateAdded}`;
    
    // Update statistics
    document.getElementById('totalRecords').textContent = selectedAnimal.records.length;
    
    const currentWeight = selectedAnimal.records.length > 0 ? 
        `${selectedAnimal.records[selectedAnimal.records.length - 1].monthlyWeight}kg` : 'N/A';
    document.getElementById('currentWeight').textContent = currentWeight;
    
    const avgCost = selectedAnimal.records.length > 0 ? 
        `$${(selectedAnimal.records.reduce((sum, r) => sum + r.feedCostPerUnit, 0) / selectedAnimal.records.length).toFixed(2)}` : 'N/A';
    document.getElementById('avgFeedCost').textContent = avgCost;
    
    document.getElementById('fcrValue').textContent = calculateFCR(selectedAnimal.records);
}

// Calculate FCR
function calculateFCR(records) {
    if (records.length < 2) return "N/A";
    const totalFeed = records.reduce((sum, record) => sum + record.dailyFeedQuantity * 30, 0);
    const weightGain = records[records.length - 1].monthlyWeight - records[0].monthlyWeight;
    return weightGain > 0 ? (totalFeed / weightGain).toFixed(2) : "N/A";
}

// Update right panel
function updateRightPanel() {
    const rightPanel = document.getElementById('rightPanelContent');
    
    if (!selectedAnimal) {
        rightPanel.className = 'card no-animal-selected';
        rightPanel.innerHTML = `
            <div class="card-content">
                <div class="empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"/>
                        <path d="m21 21-4.35-4.35"/>
                    </svg>
                    <h3>No Animal Selected</h3>
                    <p>Click on an animal to view details</p>
                </div>
            </div>
        `;
    } else {
        rightPanel.className = 'card add-record-btn';
        rightPanel.innerHTML = `
            <div class="card-content">
                <div class="add-record-btn">
                    <button onclick="openAddRecordModal()" class="btn btn-primary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5v14"/>
                        </svg>
                        Add New Record
                    </button>
                    <p>Add feeding and health information</p>
                </div>
            </div>
        `;
    }
}

// Show records table
function showRecordsTable() {
    if (!selectedAnimal) {
        document.getElementById('recordsTable').style.display = 'none';
        return;
    }
    
    document.getElementById('recordsTable').style.display = 'block';
    document.getElementById('recordsTitle').textContent = `Records for ${selectedAnimal.id}`;
    
    const tbody = document.querySelector('#recordsTableContent tbody');
    const noRecords = document.getElementById('noRecords');
    
    if (selectedAnimal.records.length === 0) {
        document.querySelector('.table-container').style.display = 'none';
        noRecords.style.display = 'block';
    } else {
        document.querySelector('.table-container').style.display = 'block';
        noRecords.style.display = 'none';
        
        tbody.innerHTML = selectedAnimal.records.map(record => `
            <tr>
                <td>${record.date}</td>
                <td>${record.feedType}</td>
                <td>$${record.feedCostPerUnit}</td>
                <td>${record.dailyFeedQuantity}</td>
                <td>${record.monthlyWeight}</td>
                <td>${record.vaccinationNotes || 'None'}</td>
            </tr>
        `).join('');
    }
}

// Handle search
function handleSearch() {
    const searchId = document.getElementById('searchInput').value.trim();
    if (!searchId) return;
    
    const animal = animals.find(a => a.id.toLowerCase() === searchId.toLowerCase());
    if (animal) {
        selectAnimal(animal.id);
        // Clear search input
        document.getElementById('searchInput').value = '';
    } else {
        alert('Animal not found!');
    }
}

// Toggle add animal form
function toggleAddAnimalForm() {
    const form = document.getElementById('addAnimalForm');
    const btn = document.getElementById('addAnimalBtn');
    
    if (form.style.display === 'none') {
        form.style.display = 'block';
        btn.style.display = 'none';
    } else {
        form.style.display = 'none';
        btn.style.display = 'block';
        // Clear form
        document.getElementById('animalType').value = '';
        document.getElementById('breed').value = '';
    }
}

// Handle add animal
function handleAddAnimal() {
    const type = document.getElementById('animalType').value;
    const breed = document.getElementById('breed').value;
    
    if (!type || !breed) {
        alert('Please fill in all fields');
        return;
    }
    
    const newAnimal = {
        id: generateAnimalId(),
        breed: breed,
        type: type,
        dateAdded: new Date().toISOString().split('T')[0],
        records: []
    };
    
    animals.push(newAnimal);
    updateAnimalCount();
    populateBreedFilter();
    applyFilters();
    updateNextId();
    toggleAddAnimalForm();
    selectAnimal(newAnimal.id);
}

// Open add record modal
function openAddRecordModal() {
    document.getElementById('addRecordModal').style.display = 'flex';
}

// Close add record modal
function closeAddRecordModal() {
    document.getElementById('addRecordModal').style.display = 'none';
    // Clear form
    document.getElementById('feedType').value = '';
    document.getElementById('feedCost').value = '';
    document.getElementById('dailyFeed').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('vaccination').value = '';
}

// Handle add record
function handleAddRecord() {
    const feedType = document.getElementById('feedType').value;
    const feedCost = parseFloat(document.getElementById('feedCost').value);
    const dailyFeed = parseFloat(document.getElementById('dailyFeed').value);
    const weight = parseFloat(document.getElementById('weight').value);
    const vaccination = document.getElementById('vaccination').value;
    
    if (!feedType || !feedCost || !dailyFeed || !weight) {
        alert('Please fill in all required fields');
        return;
    }
    
    const newRecord = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        feedType: feedType,
        feedCostPerUnit: feedCost,
        dailyFeedQuantity: dailyFeed,
        monthlyWeight: weight,
        vaccinationNotes: vaccination
    };
    
    selectedAnimal.records.push(newRecord);
    
    // Update the animal in the animals array
    const animalIndex = animals.findIndex(a => a.id === selectedAnimal.id);
    animals[animalIndex] = selectedAnimal;
    
    updateAnimalDetails();
    showRecordsTable();
    renderAnimals(); // Update the animals grid to show new record count
    closeAddRecordModal();
}

// Handle Enter key in search input
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

// Close modal when clicking outside
document.getElementById('addRecordModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeAddRecordModal();
    }
});