import { USER_TYPES } from "../../dammy data/UserType.js";
import { users } from "../../dammy data/UserInfo.js";




// Application State
let currentStep = "login"
let isLoading = false
let currentUser = null

// DOM Elements
const elements = {
  // Steps
  loginStep: document.getElementById("loginStep"),
  signupStep: document.getElementById("signupStep"),

  // Forms
  loginForm: document.getElementById("loginForm"),
  signupForm: document.getElementById("signupForm"),

  // Login inputs
  loginId: document.getElementById("loginId"),
  password: document.getElementById("password"),

  // Signup inputs - removed userName
  userEmail: document.getElementById("userEmail"),
  userType: document.getElementById("userType"),
  userPassword: document.getElementById("userPassword"),
  confirmPassword: document.getElementById("confirmPassword"),

  // Buttons
  loginBtn: document.getElementById("loginBtn"),
  switchToSignup: document.getElementById("switchToSignup"),
  passwordToggle: document.getElementById("passwordToggle"),
  backBtn: document.getElementById("backBtn"),
  createAccountBtn: document.getElementById("createAccountBtn"),
  copyDetailsBtn: document.getElementById("copyDetailsBtn"),
  proceedToLoginBtn: document.getElementById("proceedToLoginBtn"),

  // Messages
  errorMessage: document.getElementById("errorMessage"),
  successMessage: document.getElementById("successMessage"),
  errorText: document.getElementById("errorText"),
  successText: document.getElementById("successText"),

  // Popup elements
  successPopup: document.getElementById("successPopup"),
  popupUserId: document.getElementById("popupUserId"),
  popupUserEmail: document.getElementById("popupUserEmail"),
  popupUserType: document.getElementById("popupUserType"),

  // Loading
  loadingOverlay: document.getElementById("loadingOverlay"),
  loadingTitle: document.getElementById("loadingTitle"),
  loadingSubtitle: document.getElementById("loadingSubtitle"),

  // Icons
  eyeIcon: document.getElementById("eyeIcon"),
}

// Initialize application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  setupEventListeners()
  generateParticles()
})

function initializeApp() {
  // Add fade-in animation to content wrapper
  const contentWrapper = document.querySelector(".content-wrapper")
  contentWrapper.classList.add("fade-in")

  // Set initial step
  showStep("login")
}

function setupEventListeners() {
  // Form submissions
  elements.loginForm.addEventListener("submit", handleLogin)

  // Button clicks
  elements.switchToSignup.addEventListener("click", () => showStep("signup"))
  elements.passwordToggle.addEventListener("click", togglePassword)
  elements.backBtn.addEventListener("click", goBackToLogin)
  elements.createAccountBtn.addEventListener("click", handleCreateAccount)
  elements.copyDetailsBtn.addEventListener("click", copyLoginDetails)
  elements.proceedToLoginBtn.addEventListener("click", proceedToLogin)

  // Input events for clearing messages
  elements.loginId.addEventListener("input", clearMessages)
  elements.password.addEventListener("input", clearMessages)
  elements.userEmail.addEventListener("input", clearMessages)
  elements.userPassword.addEventListener("input", clearMessages)
  elements.confirmPassword.addEventListener("input", clearMessages)

  // Close popup when clicking outside
  elements.successPopup.addEventListener("click", (e) => {
    if (e.target === elements.successPopup) {
      closeSuccessPopup()
    }
  })
}

function generateParticles() {
  const particlesContainer = document.querySelector(".particles-container")
  const particleCount = 20

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("div")
    particle.className = "particle"
    particle.style.left = Math.random() * 100 + "%"
    particle.style.top = Math.random() * 100 + "%"
    particle.style.animationDelay = Math.random() * 2 + "s"
    particlesContainer.appendChild(particle)
  }
}

function showStep(step) {
  // Hide all steps
  document.querySelectorAll(".step-container").forEach((container) => {
    container.classList.remove("active")
    container.classList.add("prev")
  })

  // Show target step
  setTimeout(() => {
    const targetStep = document.getElementById(step + "Step")
    if (targetStep) {
      targetStep.classList.remove("prev")
      targetStep.classList.add("active")
    }
    currentStep = step
  }, 100)
}

function showLoading(title = "Processing...", subtitle = "Please wait while we process your request") {
  elements.loadingTitle.textContent = title
  elements.loadingSubtitle.textContent = subtitle
  elements.loadingOverlay.classList.remove("hidden")
  isLoading = true

  // Update button states
  updateButtonStates()
}

function hideLoading() {
  elements.loadingOverlay.classList.add("hidden")
  isLoading = false

  // Update button states
  updateButtonStates()
}

function updateButtonStates() {
  const buttons = [elements.loginBtn, elements.createAccountBtn]

  buttons.forEach((btn) => {
    if (btn) {
      if (isLoading) {
        btn.classList.add("loading")
        btn.disabled = true

        // Update button text
        const btnText = btn.querySelector(".btn-text")
        if (btnText) {
          if (btn === elements.loginBtn) btnText.textContent = "Signing In..."
          else if (btn === elements.createAccountBtn) btnText.textContent = "Creating Account..."
        }
      } else {
        btn.classList.remove("loading")
        btn.disabled = false

        // Restore button text
        const btnText = btn.querySelector(".btn-text")
        if (btnText) {
          if (btn === elements.loginBtn) btnText.textContent = "Sign In"
          else if (btn === elements.createAccountBtn) btnText.textContent = "Sign Up"
        }
      }
    }
  })
}

function showError(message) {
  elements.errorText.textContent = message
  elements.errorMessage.classList.remove("hidden")
  elements.successMessage.classList.add("hidden")

  // Auto-hide after 4 seconds
  setTimeout(() => {
    elements.errorMessage.classList.add("hidden")
  }, 4000)
}

function showSuccess(message) {
  elements.successText.textContent = message
  elements.successMessage.classList.remove("hidden")
  elements.errorMessage.classList.add("hidden")

  // Auto-hide after 3 seconds
  setTimeout(() => {
    elements.successMessage.classList.add("hidden")
  }, 3000)
}

function clearMessages() {
  elements.errorMessage.classList.add("hidden")
  elements.successMessage.classList.add("hidden")
}

// Generate unique user ID from email
function generateUniqueId(email) {
  const emailPrefix = email.split("@")[0].toLowerCase()
  let number = Math.floor(Math.random() * 999) + 1
  let newId = emailPrefix + number

  // Ensure ID is unique by checking against existing users
  while (users.find((u) => u.id === newId)) {
    number = Math.floor(Math.random() * 999) + 1
    newId = emailPrefix + number
  }

  return newId
}

// Check if email already exists
function emailExists(email) {
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase())
}

async function handleLogin(e) {
  e.preventDefault()
  clearMessages()

  const loginId = elements.loginId.value.trim()
  const password = elements.password.value

  if (!loginId || !password) {
    showError("Please fill in all fields")
    return
  }

  showLoading("Authenticating...", "Please wait while we verify your credentials")

  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // Find user by ID or email
  const user = users.find(
    (u) => u.id.toLowerCase() === loginId.toLowerCase() || u.email.toLowerCase() === loginId.toLowerCase(),
  )

  if (!user) {
    hideLoading()
    showError("User not found. Please check your credentials or create a new account.")
    return
  }

  if (user.password !== password) {
    hideLoading()
    showError("Incorrect password. Please try again.")
    return
  }

  // Successful login
  currentUser = user
  hideLoading()
  showSuccess("Login successful!")

  // to load page of user add the funtion here
  
  setTimeout(() => {
    localStorage.setItem("currentUser", JSON.stringify(user))
    // In a real app, redirect to dashboard
    alert(`Welcome back, ${user.name}! Redirecting to dashboard...`)
  }, 2000)
}

async function handleCreateAccount() {
  clearMessages()

  const email = elements.userEmail.value.trim()
  const userType = elements.userType.value
  const password = elements.userPassword.value
  const confirmPassword = elements.confirmPassword.value

  // Validation
  if (!email || !userType || !password || !confirmPassword) {
    showError("Please fill in all fields")
    return
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    showError("Please enter a valid email address")
    return
  }

  // Check if email already exists
  if (emailExists(email)) {
    showError("An account with this email already exists")
    return
  }

  if (password.length < 6) {
    showError("Password must be at least 6 characters long")
    return
  }

  if (password !== confirmPassword) {
    showError("Passwords do not match")
    return
  }

  showLoading("Creating Account...", "Generating your unique ID and setting up your profile")

  // Simulate account creation delay
  await new Promise((resolve) => setTimeout(resolve, 2000))

  // Generate unique ID from email
  const generatedId = generateUniqueId(email)

  // Create new user
  const newUser = {
    id: generatedId,
    email: email,
    password: password,
    userType: userType,
    createdAt: new Date().toISOString(),
  }

  // Add to users array
  users.push(newUser)
  currentUser = newUser

  hideLoading()

  // Show success popup with login details
  showSuccessPopup(newUser)

  // Save to localStorage for persistence
  localStorage.setItem("users", JSON.stringify(users))
}

function showSuccessPopup(user) {
  const userTypeLabel = USER_TYPES.find((type) => type.value === user.userType)?.label || user.userType

  // Populate popup with user details
  elements.popupUserId.textContent = user.id
  elements.popupUserEmail.textContent = user.email
  elements.popupUserType.textContent = userTypeLabel

  // Show popup
  elements.successPopup.classList.remove("hidden")
}

function closeSuccessPopup() {
  elements.successPopup.classList.add("hidden")
}

function copyLoginDetails() {
  const details = `
Meatrix Login Details:
User ID: ${elements.popupUserId.textContent}
Email: ${elements.popupUserEmail.textContent}
Role: ${elements.popupUserType.textContent}

You can login using either your User ID or Email Address.
  `.trim()

  // Copy to clipboard
  navigator.clipboard
    .writeText(details)
    .then(() => {
      // Update button text temporarily
      const originalText = elements.copyDetailsBtn.innerHTML
      elements.copyDetailsBtn.innerHTML = `
        <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        Copied!
      `

      setTimeout(() => {
        elements.copyDetailsBtn.innerHTML = originalText
      }, 2000)
    })
    .catch(() => {
      alert("Details copied to clipboard!")
    })
}

function proceedToLogin() {
  closeSuccessPopup()
  showStep("login")

  // Pre-fill login form with the new user's ID
  if (currentUser) {
    elements.loginId.value = currentUser.id
    elements.loginId.focus()
  }

  // Clear signup form
  elements.userEmail.value = ""
  elements.userType.value = ""
  elements.userPassword.value = ""
  elements.confirmPassword.value = ""
}

function togglePassword() {
  const passwordInput = elements.password
  const eyeIcon = elements.eyeIcon

  if (passwordInput.type === "password") {
    passwordInput.type = "text"
    eyeIcon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        `
  } else {
    passwordInput.type = "password"
    eyeIcon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        `
  }
}

function goBackToLogin() {
  showStep("login")
  clearMessages()

  // Clear signup form
  elements.userEmail.value = ""
  elements.userType.value = ""
  elements.userPassword.value = ""
  elements.confirmPassword.value = ""
}

// Load users from localStorage on page load
window.addEventListener("load", () => {
  const savedUsers = localStorage.getItem("users")
  if (savedUsers) {
    users = JSON.parse(savedUsers)
  }
})

// Handle window resize for responsive design
window.addEventListener("resize", () => {
  // Regenerate particles on resize
  const particlesContainer = document.querySelector(".particles-container")
  particlesContainer.innerHTML = ""
  generateParticles()
})

// Prevent form submission on Enter key in signup form
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && currentStep === "signup") {
    e.preventDefault()
    handleCreateAccount()
  }
})

// Close popup with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !elements.successPopup.classList.contains("hidden")) {
    closeSuccessPopup()
  }
})

// Console log for debugging
console.log("Meatrix Authentication System Loaded")
console.log("Available User Types:", USER_TYPES)
console.log("Current Users:", users)


// Genarate User Type selector HTMl
UpdateUserTypeComboBox();
function UpdateUserTypeComboBox(){
  let ComboBoxHtml = `<option value="">Select your role</option>`;
  USER_TYPES.forEach((eachUserType)=>{
    ComboBoxHtml+= `<option value="${eachUserType.value}">${eachUserType.label}</option>`
  })
  elements.userType.innerHTML = ComboBoxHtml;
}