// Application State
let currentStep = 'login';
let isLoading = false;
let tempGoogleUser = null;
let currentUser = null;

// Sample user database
let users = [
    {
        id: "john123",
        email: "john@example.com",
        password: "password123",
        name: "John Doe",
        farmName: "Green Valley Farm",
        location: "Texas, USA",
        avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjMTZhMzRhIi8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCI+SkQ8L3RleHQ+Cjwvc3ZnPgo="
    }
];

// DOM Elements
const elements = {
    // Steps
    loginStep: document.getElementById('loginStep'),
    profileStep: document.getElementById('profileStep'),
    successStep: document.getElementById('successStep'),
    
    // Forms
    loginForm: document.getElementById('loginForm'),
    profileForm: document.getElementById('profileForm'),
    
    // Inputs
    loginId: document.getElementById('loginId'),
    password: document.getElementById('password'),
    generatedId: document.getElementById('generatedId'),
    userPassword: document.getElementById('userPassword'),
    confirmPassword: document.getElementById('confirmPassword'),
    farmName: document.getElementById('farmName'),
    location: document.getElementById('location'),
    
    // Buttons
    loginBtn: document.getElementById('loginBtn'),
    googleSignInBtn: document.getElementById('googleSignInBtn'),
    passwordToggle: document.getElementById('passwordToggle'),
    regenerateBtn: document.getElementById('regenerateBtn'),
    backBtn: document.getElementById('backBtn'),
    createAccountBtn: document.getElementById('createAccountBtn'),
    proceedBtn: document.getElementById('proceedBtn'),
    
    // Messages
    errorMessage: document.getElementById('errorMessage'),
    successMessage: document.getElementById('successMessage'),
    errorText: document.getElementById('errorText'),
    successText: document.getElementById('successText'),
    
    // Google user info
    googleUserInfo: document.getElementById('googleUserInfo'),
    googleUserAvatar: document.getElementById('googleUserAvatar'),
    googleUserName: document.getElementById('googleUserName'),
    googleUserEmail: document.getElementById('googleUserEmail'),
    
    // Success display
    displayUserId: document.getElementById('displayUserId'),
    
    // Loading
    loadingOverlay: document.getElementById('loadingOverlay'),
    loadingTitle: document.getElementById('loadingTitle'),
    loadingSubtitle: document.getElementById('loadingSubtitle'),
    
    // Icons
    eyeIcon: document.getElementById('eyeIcon')
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    generateParticles();
});

function initializeApp() {
    // Add fade-in animation to content wrapper
    const contentWrapper = document.querySelector('.content-wrapper');
    contentWrapper.classList.add('fade-in');
    
    // Set initial step
    showStep('login');
}

function setupEventListeners() {
    // Form submissions
    elements.loginForm.addEventListener('submit', handleLogin);
    
    // Button clicks
    elements.googleSignInBtn.addEventListener('click', handleGoogleSignIn);
    elements.passwordToggle.addEventListener('click', togglePassword);
    elements.regenerateBtn.addEventListener('click', regenerateId);
    elements.backBtn.addEventListener('click', goBackToLogin);
    elements.createAccountBtn.addEventListener('click', handleCreateProfile);
    elements.proceedBtn.addEventListener('click', proceedToApp);
    
    // Input events
    elements.loginId.addEventListener('input', clearMessages);
    elements.password.addEventListener('input', clearMessages);
    elements.userPassword.addEventListener('input', clearMessages);
    elements.confirmPassword.addEventListener('input', clearMessages);
}

function generateParticles() {
    const particlesContainer = document.querySelector('.particles-container');
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 2 + 's';
        particlesContainer.appendChild(particle);
    }
}

function showStep(step) {
    // Hide all steps
    document.querySelectorAll('.step-container').forEach(container => {
        container.classList.remove('active');
        container.classList.add('prev');
    });
    
    // Show target step
    setTimeout(() => {
        const targetStep = document.getElementById(step + 'Step');
        if (targetStep) {
            targetStep.classList.remove('prev');
            targetStep.classList.add('active');
        }
        currentStep = step;
    }, 100);
}

function showLoading(title = 'Loading...', subtitle = 'Please wait...') {
    elements.loadingTitle.textContent = title;
    elements.loadingSubtitle.textContent = subtitle;
    elements.loadingOverlay.classList.remove('hidden');
    isLoading = true;
    
    // Update button states
    updateButtonStates();
}

function hideLoading() {
    elements.loadingOverlay.classList.add('hidden');
    isLoading = false;
    
    // Update button states
    updateButtonStates();
}

function updateButtonStates() {
    const buttons = [elements.loginBtn, elements.googleSignInBtn, elements.createAccountBtn];
    
    buttons.forEach(btn => {
        if (btn) {
            if (isLoading) {
                btn.classList.add('loading');
                btn.disabled = true;
                
                // Update button text and icon
                const btnText = btn.querySelector('.btn-text');
                const btnIcon = btn.querySelector('.btn-icon');
                
                if (btnText) {
                    if (btn === elements.loginBtn) btnText.textContent = 'Signing In...';
                    else if (btn === elements.createAccountBtn) btnText.textContent = 'Creating...';
                }
                
                if (btnIcon) {
                    btnIcon.innerHTML = '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>';
                }
            } else {
                btn.classList.remove('loading');
                btn.disabled = false;
                
                // Restore button text and icon
                const btnText = btn.querySelector('.btn-text');
                const btnIcon = btn.querySelector('.btn-icon');
                
                if (btnText) {
                    if (btn === elements.loginBtn) btnText.textContent = 'Sign In';
                    else if (btn === elements.createAccountBtn) btnText.textContent = 'Create Account';
                }
                
                if (btnIcon && btn === elements.loginBtn) {
                    btnIcon.innerHTML = '<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>';
                }
            }
        }
    });
}

function showError(message) {
    elements.errorText.textContent = message;
    elements.errorMessage.classList.remove('hidden');
    elements.successMessage.classList.add('hidden');
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
        elements.errorMessage.classList.add('hidden');
    }, 4000);
}

function showSuccess(message) {
    elements.successText.textContent = message;
    elements.successMessage.classList.remove('hidden');
    elements.errorMessage.classList.add('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        elements.successMessage.classList.add('hidden');
    }, 3000);
}

function clearMessages() {
    elements.errorMessage.classList.add('hidden');
    elements.successMessage.classList.add('hidden');
}

async function handleLogin(e) {
    e.preventDefault();
    clearMessages();
    
    const loginId = elements.loginId.value.trim();
    const password = elements.password.value;
    
    if (!loginId || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    showLoading('Authenticating...', 'Please wait while we verify your credentials');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Find user by ID or email
    const user = users.find(u => 
        u.id.toLowerCase() === loginId.toLowerCase() || 
        u.email.toLowerCase() === loginId.toLowerCase()
    );
    
    if (!user) {
        hideLoading();
        showError('User not found. Please check your credentials or create a new account.');
        return;
    }
    
    if (user.password !== password) {
        hideLoading();
        showError('Incorrect password. Please try again.');
        return;
    }
    
    // Successful login
    currentUser = user;
    hideLoading();
    showSuccess('Login successful!');
    
    setTimeout(() => {
        localStorage.setItem('currentUser', JSON.stringify(user));
        window.location.href = 'index.html'; // Redirect to main app
    }, 2000);
}

async function handleGoogleSignIn() {
    showLoading('Connecting to Google...', 'Please wait while we authenticate with Google');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate Google user data
    const googleUser = {
        name: "Jane Smith",
        email: "jane.smith@gmail.com",
        avatar: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjNDI4NUY0Ii8+Cjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMjAiIGZvbnQtZmFtaWx5PSJBcmlhbCI+SlM8L3RleHQ+Cjwvc3ZnPgo="
    };
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === googleUser.email);
    
    if (existingUser) {
        // User exists, log them in
        currentUser = existingUser;
        hideLoading();
        showSuccess('Welcome back!');
        setTimeout(() => {
            localStorage.setItem('currentUser', JSON.stringify(existingUser));
            window.location.href = 'index.html';
        }, 2000);
    } else {
        // New user, show profile creation
        tempGoogleUser = googleUser;
        hideLoading();
        showGoogleUserInfo(googleUser);
        generateUserId(googleUser.name);
        showStep('profile');
    }
}

function showGoogleUserInfo(googleUser) {
    elements.googleUserAvatar.src = googleUser.avatar;
    elements.googleUserName.textContent = googleUser.name;
    elements.googleUserEmail.textContent = googleUser.email;
    elements.googleUserInfo.classList.remove('hidden');
}

function generateUserId(name) {
    const firstName = name.split(' ')[0].toLowerCase();
    let number = Math.floor(Math.random() * 999) + 1;
    let newId = firstName + number;
    
    // Ensure ID is unique
    while (users.find(u => u.id === newId)) {
        number = Math.floor(Math.random() * 999) + 1;
        newId = firstName + number;
    }
    
    elements.generatedId.value = newId;
    return newId;
}

function regenerateId() {
    if (tempGoogleUser) {
        generateUserId(tempGoogleUser.name);
    }
}

async function handleCreateProfile() {
    clearMessages();
    
    const password = elements.userPassword.value;
    const confirmPassword = elements.confirmPassword.value;
    const farmName = elements.farmName.value;
    const location = elements.location.value;
    
    // Validation
    if (!password) {
        showError('Please enter a password');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    showLoading('Creating Account...', 'Setting up your Meatrix profile');
    
    // Simulate account creation delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (tempGoogleUser) {
        // Create new user
        const newUser = {
            id: elements.generatedId.value,
            email: tempGoogleUser.email,
            password: password,
            name: tempGoogleUser.name,
            farmName: farmName || '',
            location: location || '',
            avatar: tempGoogleUser.avatar,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        currentUser = newUser;
        hideLoading();
        
        // Show success step
        elements.displayUserId.textContent = newUser.id;
        showStep('success');
    }
}

function togglePassword() {
    const passwordInput = elements.password;
    const eyeIcon = elements.eyeIcon;
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        `;
    } else {
        passwordInput.type = 'password';
        eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        `;
    }
}

function goBackToLogin() {
    showStep('login');
    tempGoogleUser = null;
    clearMessages();
    
    // Clear form
    elements.userPassword.value = '';
    elements.confirmPassword.value = '';
    elements.farmName.value = '';
    elements.location.value = '';
    elements.googleUserInfo.classList.add('hidden');
}

function proceedToApp() {
    if (currentUser) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        window.location.href = 'index.html'; // Redirect to main app
    }
}

// Utility functions for animations
function addBounceAnimation(element) {
    element.style.animation = 'bounceOnce 0.6s ease-out';
    setTimeout(() => {
        element.style.animation = '';
    }, 600);
}

// Handle window resize for responsive design
window.addEventListener('resize', function() {
    // Regenerate particles on resize
    const particlesContainer = document.querySelector('.particles-container');
    particlesContainer.innerHTML = '';
    generateParticles();
});

// Prevent form submission on Enter key in profile form
elements.profileForm.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        handleCreateProfile();
    }
});

// Add smooth scrolling for profile form
elements.profileStep.addEventListener('scroll', function() {
    // Add scroll indicator or handle scroll events if needed
});