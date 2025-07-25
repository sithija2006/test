// Enhanced Firebase imports and configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  doc,
  setDoc,
  getDoc,
  where,
  serverTimestamp,
  updateDoc,
  getDocs,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js"
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js"

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBP-3uuExD9_zmOHyBdamjCNOaxXkhQKNo",
  authDomain: "whatsapp-8a128.firebaseapp.com",
  projectId: "whatsapp-8a128",
  storageBucket: "whatsapp-8a128.firebasestorage.app",
  messagingSenderId: "276452175533",
  appId: "1:276452175533:web:3c93881ca04fd19504e024",
  measurementId: "G-JXFZ6H435V",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
const storage = getStorage(app)

// Global state
let currentUser = null
let selectedUser = null
let usersUnsubscribe = null
let messagesUnsubscribe = null
let isSignupMode = false
let typingTimeout = null
let isDarkMode = localStorage.getItem("darkMode") === "true"
let localStream = null
let remoteStream = null
let peerConnection = null
let isCallActive = false
let isVideoEnabled = true
let isAudioEnabled = true
let callUnsubscribe = null
let controlsTimeout = null
let isControlsVisible = true

// Enhanced mobile detection
const isMobile =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768

// Emoji data
const emojiData = {
  smileys: [
    "😀",
    "😃",
    "😄",
    "😁",
    "😆",
    "😅",
    "😂",
    "🤣",
    "😊",
    "😇",
    "🙂",
    "🙃",
    "😉",
    "😌",
    "😍",
    "🥰",
    "😘",
    "😗",
    "😙",
    "😚",
    "😋",
    "😛",
    "😝",
    "😜",
    "🤪",
    "🤨",
    "🧐",
    "🤓",
    "😎",
    "🤩",
    "🥳",
    "😏",
  ],
  people: [
    "👋",
    "🤚",
    "🖐️",
    "✋",
    "🖖",
    "👌",
    "🤏",
    "✌️",
    "🤞",
    "🤟",
    "🤘",
    "🤙",
    "👈",
    "👉",
    "👆",
    "🖕",
    "👇",
    "☝️",
    "👍",
    "👎",
    "👊",
    "✊",
    "🤛",
    "🤜",
    "👏",
    "🙌",
    "👐",
    "🤲",
    "🤝",
    "🙏",
    "✍️",
    "💅",
  ],
  nature: [
    "🌸",
    "💮",
    "🏵️",
    "🌹",
    "🥀",
    "🌺",
    "🌻",
    "🌼",
    "🌷",
    "🌱",
    "🪴",
    "🌲",
    "🌳",
    "🌴",
    "🌵",
    "🌶️",
    "🍄",
    "🌾",
    "💐",
    "🌿",
    "🍀",
    "🍃",
    "🍂",
    "🍁",
    "🌊",
    "🌀",
    "🌈",
    "🌂",
    "☂️",
    "☔",
    "⛱️",
    "⚡",
  ],
  food: [
    "🍎",
    "🍐",
    "🍊",
    "🍋",
    "🍌",
    "🍉",
    "🍇",
    "🍓",
    "🫐",
    "🍈",
    "🍒",
    "🍑",
    "🥭",
    "🍍",
    "🥥",
    "🥝",
    "🍅",
    "🍆",
    "🥑",
    "🥦",
    "🥬",
    "🥒",
    "🌶️",
    "🫑",
    "🌽",
    "🥕",
    "🫒",
    "🧄",
    "🧅",
    "🥔",
    "🍠",
    "🥐",
  ],
  activities: [
    "⚽",
    "🏀",
    "🏈",
    "⚾",
    "🥎",
    "🎾",
    "🏐",
    "🏉",
    "🥏",
    "🎱",
    "🪀",
    "🏓",
    "🏸",
    "🏒",
    "🏑",
    "🥍",
    "🏏",
    "🪃",
    "🥅",
    "⛳",
    "🪁",
    "🏹",
    "🎣",
    "🤿",
    "🥊",
    "🥋",
    "🎽",
    "🛹",
    "🛷",
    "⛸️",
    "🥌",
    "🎿",
  ],
  travel: [
    "🚗",
    "🚕",
    "🚙",
    "🚌",
    "🚎",
    "🏎️",
    "🚓",
    "🚑",
    "🚒",
    "🚐",
    "🛻",
    "🚚",
    "🚛",
    "🚜",
    "🏍️",
    "🛵",
    "🚲",
    "🛴",
    "🛺",
    "🚁",
    "🛸",
    "✈️",
    "🛩️",
    "🛫",
    "🛬",
    "🪂",
    "💺",
    "🚀",
    "🛰️",
    "🚢",
    "⛵",
    "🚤",
  ],
  objects: [
    "💡",
    "🔦",
    "🏮",
    "🪔",
    "📱",
    "💻",
    "⌨️",
    "🖥️",
    "🖨️",
    "🖱️",
    "🖲️",
    "💽",
    "💾",
    "💿",
    "📀",
    "📼",
    "📷",
    "📸",
    "📹",
    "🎥",
    "📞",
    "☎️",
    "📟",
    "📠",
    "📺",
    "📻",
    "🎙️",
    "🎚️",
    "🎛️",
    "🧭",
    "⏱️",
    "⏰",
  ],
  symbols: [
    "❤️",
    "🧡",
    "💛",
    "💚",
    "💙",
    "💜",
    "🖤",
    "🤍",
    "🤎",
    "💔",
    "❣️",
    "💕",
    "💞",
    "💓",
    "💗",
    "💖",
    "💘",
    "💝",
    "💟",
    "☮️",
    "✝️",
    "☪️",
    "🕉️",
    "☸️",
    "✡️",
    "🔯",
    "🕎",
    "☯️",
    "☦️",
    "🛐",
    "⛎",
    "♈",
  ],
}

// Enhanced DOM elements
const loadingScreen = document.getElementById("loading")
const loginScreen = document.getElementById("loginScreen")
const chatScreen = document.getElementById("chatScreen")
const authForm = document.getElementById("authForm")
const emailInput = document.getElementById("email")
const passwordInput = document.getElementById("password")
const authButton = document.getElementById("authButton")
const authButtonText = document.getElementById("authButtonText")
const authButtonSpinner = document.getElementById("authButtonSpinner")
const switchAuth = document.getElementById("switchAuth")
const loginTitle = document.getElementById("loginTitle")
const loginSubtitle = document.getElementById("loginSubtitle")
const errorMessage = document.getElementById("errorMessage")
const errorText = document.getElementById("errorText")
const currentUserEmail = document.getElementById("currentUserEmail")
const logoutButton = document.getElementById("logoutButton")
const darkModeToggle = document.getElementById("darkModeToggle")
const searchInput = document.getElementById("searchInput")
const usersList = document.getElementById("usersList")
const userCount = document.getElementById("userCount")
const welcomeMessage = document.getElementById("welcomeMessage")
const chatWindow = document.getElementById("chatWindow")
const chatUserName = document.getElementById("chatUserName")
const chatUserStatus = document.getElementById("chatUserStatus")
const typingIndicator = document.getElementById("typingIndicator")
const messagesContainer = document.getElementById("messagesContainer")
const messagesLoading = document.getElementById("messagesLoading")
const messagesList = document.getElementById("messagesList")
const messageForm = document.getElementById("messageForm")
const messageInput = document.getElementById("messageInput")
const sendButton = document.getElementById("sendButton")
const backButton = document.getElementById("backButton")
const sidebar = document.getElementById("sidebar")
const mobileOverlay = document.getElementById("mobileOverlay")
const fileInput = document.getElementById("fileInput")
const attachButton = document.getElementById("attachButton")
const emojiButton = document.getElementById("emojiButton")
const emojiPicker = document.getElementById("emojiPicker")
const emojiGrid = document.getElementById("emojiGrid")
const searchMessagesBtn = document.getElementById("searchMessagesBtn")
const messageSearchContainer = document.getElementById("messageSearchContainer")
const messageSearchInput = document.getElementById("messageSearchInput")
const closeSearchBtn = document.getElementById("closeSearchBtn")
const searchResults = document.getElementById("searchResults")
const notification = document.getElementById("notification")

// Enhanced mobile elements
const mobileHeader = document.getElementById("mobileHeader")
const mobileMenuBtn = document.getElementById("mobileMenuBtn")
const mobileLogoutBtn = document.getElementById("mobileLogoutBtn")

// Video call elements
const videoCallModal = document.getElementById("videoCallModal")
const incomingCallModal = document.getElementById("incomingCallModal")
const incomingCallNotification = document.getElementById("incomingCallNotification")
const videoCallBtn = document.getElementById("videoCallBtn")
const acceptCallBtn = document.getElementById("acceptCallBtn")
const declineCallBtn = document.getElementById("declineCallBtn")
const endCallBtn = document.getElementById("endCallBtn")
const toggleMicBtn = document.getElementById("toggleMicBtn")
const toggleVideoBtn = document.getElementById("toggleVideoBtn")
const minimizeCallBtn = document.getElementById("minimizeCallBtn")
const localVideo = document.getElementById("localVideo")
const remoteVideo = document.getElementById("remoteVideo")
const callUserName = document.getElementById("callUserName")
const callStatus = document.getElementById("callStatus")
const incomingCallerName = document.getElementById("incomingCallerName")
const notificationCallerName = document.getElementById("notificationCallerName")
const notificationAcceptBtn = document.getElementById("notificationAcceptBtn")
const notificationDeclineBtn = document.getElementById("notificationDeclineBtn")
const remoteUserName = document.getElementById("remoteUserName")
const localVideoPlaceholder = document.getElementById("localVideoPlaceholder")
const remoteVideoPlaceholder = document.getElementById("remoteVideoPlaceholder")

// Initialize dark mode
if (isDarkMode) {
  document.documentElement.setAttribute("data-theme", "dark")
  updateDarkModeIcon()
}

// Enhanced utility functions
function showScreen(screenElement) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.add("hidden")
  })
  loadingScreen.classList.add("hidden")
  screenElement.classList.remove("hidden")
}

function showError(message) {
  errorText.textContent = message
  errorMessage.classList.remove("hidden")
}

function hideError() {
  errorMessage.classList.add("hidden")
}

function setLoading(isLoading) {
  authButton.disabled = isLoading
  if (isLoading) {
    authButtonText.classList.add("hidden")
    authButtonSpinner.classList.remove("hidden")
  } else {
    authButtonText.classList.remove("hidden")
    authButtonSpinner.classList.add("hidden")
  }
}

function toggleAuthMode() {
  isSignupMode = !isSignupMode
  if (isSignupMode) {
    loginTitle.textContent = "Create Account"
    loginSubtitle.textContent = "Sign up to start chatting"
    authButtonText.textContent = "Create Account"
    switchAuth.textContent = "Already have an account? Sign in"
  } else {
    loginTitle.textContent = "Welcome Back"
    loginSubtitle.textContent = "Sign in to your account"
    authButtonText.textContent = "Sign In"
    switchAuth.textContent = "Don't have an account? Sign up"
  }
  hideError()
}

function toggleDarkMode() {
  isDarkMode = !isDarkMode
  localStorage.setItem("darkMode", isDarkMode)

  if (isDarkMode) {
    document.documentElement.setAttribute("data-theme", "dark")
  } else {
    document.documentElement.removeAttribute("data-theme")
  }

  updateDarkModeIcon()
}

function updateDarkModeIcon() {
  const icon = darkModeToggle.querySelector("svg")
  if (isDarkMode) {
    icon.innerHTML = `
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    `
  } else {
    icon.innerHTML = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`
  }
}

// Enhanced mobile functions
function closeMobileSidebar() {
  sidebar.classList.remove("mobile-open")
  mobileOverlay.classList.add("hidden")
  document.body.style.overflow = ""
}

function openMobileSidebar() {
  sidebar.classList.add("mobile-open")
  mobileOverlay.classList.remove("hidden")
  document.body.style.overflow = "hidden"
}

function getChatRoomId(uid1, uid2) {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`
}

function formatTime(timestamp) {
  if (!timestamp) return ""
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function formatLastSeen(timestamp) {
  if (!timestamp) return "Never"
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight
}

function showNotification(title, message) {
  const titleEl = notification.querySelector(".notification-title")
  const messageEl = notification.querySelector(".notification-message")

  titleEl.textContent = title
  messageEl.textContent = message

  notification.classList.remove("hidden")

  setTimeout(() => {
    notification.classList.add("hidden")
  }, 5000)
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

function getFileIcon(fileName) {
  const extension = fileName.split(".").pop().toLowerCase()
  const iconMap = {
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    txt: "📄",
    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
    gif: "🖼️",
    mp4: "🎥",
    avi: "🎥",
    mov: "🎥",
    mp3: "🎵",
    wav: "🎵",
    zip: "📦",
    rar: "📦",
  }
  return iconMap[extension] || "📎"
}

// Enhanced Video Call Functions with Mobile Support and WhatsApp-like notifications
const rtcConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
  iceCandidatePoolSize: 10,
}

async function initializeVideoCall() {
  try {
    const constraints = {
      video: {
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 },
        frameRate: { ideal: 30, max: 30 },
        facingMode: "user",
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    }

    console.log("Requesting media with constraints:", constraints)
    localStream = await navigator.mediaDevices.getUserMedia(constraints)
    console.log(
      "Got local stream with tracks:",
      localStream.getTracks().map((t) => `${t.kind}: ${t.enabled}`),
    )

    if (localVideo) {
      localVideo.srcObject = localStream
      localVideoPlaceholder.style.display = "none"

      localVideo.playsInline = true
      localVideo.muted = true
      localVideo.setAttribute("webkit-playsinline", "true")
      localVideo.autoplay = true

      // Ensure local video plays
      try {
        await localVideo.play()
        console.log("Local video started playing")
      } catch (playError) {
        console.error("Local video play error:", playError)
      }
    }

    return true
  } catch (error) {
    console.error("Error accessing media devices:", error)

    let errorMessage = "Could not access camera and microphone"
    if (error.name === "NotAllowedError") {
      errorMessage = "Camera and microphone access denied. Please allow permissions and try again."
    } else if (error.name === "NotFoundError") {
      errorMessage = "No camera or microphone found on this device."
    } else if (error.name === "NotReadableError") {
      errorMessage = "Camera is being used by another application."
    } else if (error.name === "OverconstrainedError") {
      errorMessage = "Camera constraints not supported by your device."
    }

    showNotification("Camera Error", errorMessage)
    return false
  }
}

async function createPeerConnection() {
  peerConnection = new RTCPeerConnection(rtcConfiguration)

  // Add local stream tracks first
  if (localStream) {
    localStream.getTracks().forEach((track) => {
      console.log("Adding local track:", track.kind, track.enabled)
      peerConnection.addTrack(track, localStream)
    })
  }

  peerConnection.onconnectionstatechange = () => {
    const state = peerConnection.connectionState
    console.log("Connection state:", state)

    switch (state) {
      case "connecting":
        showConnectionStatus("Connecting...")
        callStatus.textContent = "Connecting..."
        break
      case "connected":
        showConnectionStatus("Connected")
        callStatus.textContent = "Connected"
        setTimeout(() => hideConnectionStatus(), 2000)
        break
      case "disconnected":
        showConnectionStatus("Connection lost, reconnecting...")
        callStatus.textContent = "Reconnecting..."
        break
      case "failed":
        showConnectionStatus("Connection failed")
        callStatus.textContent = "Connection failed"
        setTimeout(() => endVideoCall(), 3000)
        break
    }
  }

  peerConnection.ontrack = (event) => {
    console.log("Received remote track:", event.track.kind, event.track.enabled)
    console.log("Remote streams:", event.streams.length)

    if (event.streams && event.streams[0]) {
      console.log("Setting remote stream")
      remoteStream = event.streams[0]

      // Ensure remote video element exists and is ready
      if (remoteVideo) {
        remoteVideo.srcObject = remoteStream
        remoteVideo.playsInline = true
        remoteVideo.setAttribute("webkit-playsinline", "true")
        remoteVideo.autoplay = true

        // Force play and handle the promise
        const playPromise = remoteVideo.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Remote video started playing")
              remoteVideoPlaceholder.style.display = "none"
            })
            .catch((error) => {
              console.error("Remote video play failed:", error)
              // Try again after a short delay
              setTimeout(() => {
                remoteVideo.play().catch((e) => console.log("Retry failed:", e))
              }, 1000)
            })
        }

        // Additional event listeners for debugging
        remoteVideo.onloadedmetadata = () => {
          console.log("Remote video metadata loaded:", remoteVideo.videoWidth, "x", remoteVideo.videoHeight)
          remoteVideoPlaceholder.style.display = "none"
        }

        remoteVideo.onplaying = () => {
          console.log("Remote video is playing")
          remoteVideoPlaceholder.style.display = "none"
        }

        remoteVideo.onerror = (e) => {
          console.error("Remote video error:", e)
        }
      }
    }
  }

  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      console.log("Sending ICE candidate:", event.candidate.type)
      sendCallSignal("ice-candidate", event.candidate)
    } else {
      console.log("ICE gathering complete")
    }
  }

  peerConnection.onicecandidateerror = (event) => {
    console.error("ICE candidate error:", event)
  }

  peerConnection.oniceconnectionstatechange = () => {
    console.log("ICE connection state:", peerConnection.iceConnectionState)

    switch (peerConnection.iceConnectionState) {
      case "connected":
      case "completed":
        showConnectionStatus("Media connected")
        callStatus.textContent = "Connected"
        setTimeout(() => hideConnectionStatus(), 2000)
        break
      case "disconnected":
        showConnectionStatus("Media disconnected")
        callStatus.textContent = "Reconnecting..."
        break
      case "failed":
        showConnectionStatus("Connection failed")
        callStatus.textContent = "Connection failed"
        break
    }
  }

  peerConnection.onsignalingstatechange = () => {
    console.log("Signaling state:", peerConnection.signalingState)
  }

  return peerConnection
}

function showVideoCallModal() {
  callUserName.textContent = selectedUser.displayName
  remoteUserName.textContent = selectedUser.displayName

  videoCallModal.classList.remove("hidden")
  document.body.style.overflow = "hidden"

  resetControlsTimeout()

  const container = videoCallModal.querySelector(".video-call-container")
  container.addEventListener("click", showControls)
  container.addEventListener("touchstart", showControls)

  if ("wakeLock" in navigator) {
    navigator.wakeLock.request("screen").catch((err) => {
      console.log("Wake lock failed:", err)
    })
  }
}

function hideVideoCallModal() {
  videoCallModal.classList.add("hidden")
  document.body.style.overflow = ""
}

// Enhanced WhatsApp-like incoming call notification
function showIncomingCallNotification(callData) {
  if (notificationCallerName) {
    notificationCallerName.textContent = callData.data.callerName
  }

  if (incomingCallNotification) {
    incomingCallNotification.dataset.offer = JSON.stringify(callData.data.offer)
    incomingCallNotification.dataset.callerUser = JSON.stringify(callData.data.callerUser)
    incomingCallNotification.classList.remove("hidden")

    // Auto-hide after 30 seconds
    setTimeout(() => {
      if (!incomingCallNotification.classList.contains("hidden")) {
        hideIncomingCallNotification()
        sendCallSignal("call-end", {})
      }
    }, 30000)
  }

  // Show browser notification if permission granted
  if ("Notification" in window && Notification.permission === "granted") {
    const notification = new Notification("Incoming Call", {
      body: `${callData.data.callerName} is calling you`,
      icon: "/placeholder.svg?height=64&width=64",
      tag: "incoming-call",
      requireInteraction: true,
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    // Auto-close notification after 30 seconds
    setTimeout(() => {
      notification.close()
    }, 30000)
  }

  // Play ringtone sound (if available)
  playRingtone()
}

function hideIncomingCallNotification() {
  if (incomingCallNotification) {
    incomingCallNotification.classList.add("hidden")
  }
  stopRingtone()
}

function showIncomingCallModal(callData) {
  if (incomingCallerName) {
    incomingCallerName.textContent = callData.data.callerName
  }
  if (incomingCallModal) {
    incomingCallModal.dataset.offer = JSON.stringify(callData.data.offer)
    incomingCallModal.dataset.callerUser = JSON.stringify(callData.data.callerUser)
    incomingCallModal.classList.remove("hidden")
  }
  document.body.style.overflow = "hidden"
}

function hideIncomingCallModal() {
  if (incomingCallModal) {
    incomingCallModal.classList.add("hidden")
  }
  document.body.style.overflow = ""
}

// Ringtone functions - DISABLED
const ringtoneAudio = null

function playRingtone() {
  // Ringtone disabled per user request
  console.log("Ringtone disabled")
}

function stopRingtone() {
  // Ringtone disabled per user request
  console.log("Ringtone stopped")
}

function showControls() {
  const container = videoCallModal.querySelector(".video-call-container")
  const header = videoCallModal.querySelector(".video-call-header")
  const controls = videoCallModal.querySelector(".video-call-controls")

  container.classList.remove("controls-hidden")
  header.classList.remove("hidden")
  controls.classList.remove("hidden")

  isControlsVisible = true
  resetControlsTimeout()
}

function hideControls() {
  const container = videoCallModal.querySelector(".video-call-container")
  const header = videoCallModal.querySelector(".video-call-header")
  const controls = videoCallModal.querySelector(".video-call-controls")

  container.classList.add("controls-hidden")
  header.classList.add("hidden")
  controls.classList.add("hidden")

  isControlsVisible = false
}

function resetControlsTimeout() {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout)
  }

  controlsTimeout = setTimeout(() => {
    if (isCallActive && isControlsVisible) {
      hideControls()
    }
  }, 3000)
}

function showConnectionStatus(message) {
  let statusEl = document.querySelector(".connection-status")

  if (!statusEl) {
    statusEl = document.createElement("div")
    statusEl.className = "connection-status"
    videoCallModal.querySelector(".video-call-content").appendChild(statusEl)
  }

  statusEl.textContent = message
  statusEl.classList.remove("hidden")
}

function hideConnectionStatus() {
  const statusEl = document.querySelector(".connection-status")
  if (statusEl) {
    statusEl.classList.add("hidden")
  }
}

async function startVideoCall() {
  if (!selectedUser || isCallActive) return

  console.log("Starting video call with:", selectedUser.displayName)

  const hasMedia = await initializeVideoCall()
  if (!hasMedia) return

  try {
    showConnectionStatus("Initiating call...")

    await createPeerConnection()

    // Create offer with proper constraints
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    })

    console.log("Created offer:", offer.type)
    await peerConnection.setLocalDescription(offer)
    console.log("Set local description (offer)")

    // Send the offer
    await sendCallSignal("call-offer", {
      offer: offer,
      callerName: currentUser.email.split("@")[0],
      callerUser: {
        uid: currentUser.uid,
        displayName: currentUser.email.split("@")[0],
        email: currentUser.email,
      },
    })

    showVideoCallModal()
    isCallActive = true

    listenForCallSignals()

    showConnectionStatus("Calling...")
    callStatus.textContent = "Calling..."
  } catch (error) {
    console.error("Error starting video call:", error)
    showNotification("Call Error", "Failed to start video call: " + error.message)
    endVideoCall()
  }
}

async function answerVideoCall(offer) {
  console.log("Answering video call with offer:", offer.type)

  const hasMedia = await initializeVideoCall()
  if (!hasMedia) return

  try {
    showConnectionStatus("Accepting call...")

    await createPeerConnection()

    console.log("Setting remote description (offer)")
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer))

    console.log("Creating answer")
    const answer = await peerConnection.createAnswer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    })

    console.log("Created answer:", answer.type)
    await peerConnection.setLocalDescription(answer)
    console.log("Set local description (answer)")

    console.log("Sending answer")
    await sendCallSignal("call-answer", answer)

    showVideoCallModal()
    isCallActive = true

    showConnectionStatus("Connecting...")
    callStatus.textContent = "Connecting..."
  } catch (error) {
    console.error("Error answering video call:", error)
    showNotification("Call Error", "Failed to answer video call: " + error.message)
    endVideoCall()
  }
}

async function endVideoCall() {
  try {
    if (isCallActive) {
      await sendCallSignal("call-end", {})
    }

    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
      controlsTimeout = null
    }

    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      localStream = null
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop())
      remoteStream = null
    }

    if (peerConnection) {
      peerConnection.close()
      peerConnection = null
    }

    if (callUnsubscribe) {
      callUnsubscribe()
      callUnsubscribe = null
    }

    hideVideoCallModal()
    hideIncomingCallModal()
    hideIncomingCallNotification()

    if (localVideo) localVideo.srcObject = null
    if (remoteVideo) remoteVideo.srcObject = null
    if (localVideoPlaceholder) localVideoPlaceholder.style.display = "flex"
    if (remoteVideoPlaceholder) remoteVideoPlaceholder.style.display = "flex"

    const statusEl = document.querySelector(".connection-status")
    if (statusEl) {
      statusEl.remove()
    }

    if ("wakeLock" in navigator && document.wakeLock) {
      document.wakeLock.release()
    }

    isCallActive = false
    isVideoEnabled = true
    isAudioEnabled = true
    isControlsVisible = true

    toggleMicBtn.classList.add("active")
    toggleVideoBtn.classList.add("active")
  } catch (error) {
    console.error("Error ending video call:", error)
  }
}

function toggleMicrophone() {
  if (localStream) {
    const audioTrack = localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      isAudioEnabled = audioTrack.enabled

      toggleMicBtn.classList.toggle("active", isAudioEnabled)

      const icon = toggleMicBtn.querySelector("svg")
      if (isAudioEnabled) {
        icon.innerHTML = `
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        `
      } else {
        icon.innerHTML = `
          <line x1="1" y1="1" x2="23" y2="23"/>
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12l1.27-1.27A3 3 0 0 0 15 12V4a3 3 0 0 0-3-3 3 3 
          <path d="M9 9v3a3 3 0 0 0 5.12 2.12l1.27-1.27A3 3 0 0 0 15 12V4a3 3 0 0 0-3-3 3 3
0 0 0-3 3v5"/>
          <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        `
      }

      showConnectionStatus(isAudioEnabled ? "Microphone on" : "Microphone off")
      setTimeout(() => hideConnectionStatus(), 1500)
    }
  }
}

function toggleCamera() {
  if (localStream) {
    const videoTrack = localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      isVideoEnabled = videoTrack.enabled

      toggleVideoBtn.classList.toggle("active", isVideoEnabled)
      localVideoPlaceholder.style.display = isVideoEnabled ? "none" : "flex"

      const icon = toggleVideoBtn.querySelector("svg")
      if (isVideoEnabled) {
        icon.innerHTML = `
          <polygon points="23 7 16 12 23 17 23 7"/>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
        `
      } else {
        icon.innerHTML = `
          <line x1="1" y1="1" x2="23" y2="23"/>
          <path d="M10.5 8.67l1.5 1.5V7a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3"/>
          <path d="M16 12l5-3v6"/>
        `
      }

      showConnectionStatus(isVideoEnabled ? "Camera on" : "Camera off")
      setTimeout(() => hideConnectionStatus(), 1500)
    }
  }
}

async function sendCallSignal(type, data) {
  if (!currentUser || !selectedUser) return

  try {
    const chatRoomId = getChatRoomId(currentUser.uid, selectedUser.uid)
    const callRef = doc(db, "calls", chatRoomId)

    await setDoc(
      callRef,
      {
        type: type,
        from: currentUser.uid,
        to: selectedUser.uid,
        data: data,
        timestamp: serverTimestamp(),
      },
      { merge: true },
    )
  } catch (error) {
    console.error("Error sending call signal:", error)
  }
}

function listenForCallSignals() {
  if (!currentUser || !selectedUser) return

  const chatRoomId = getChatRoomId(currentUser.uid, selectedUser.uid)
  const callRef = doc(db, "calls", chatRoomId)

  callUnsubscribe = onSnapshot(callRef, async (doc) => {
    if (doc.exists()) {
      const callData = doc.data()
      console.log("Received call signal:", callData.type, "from:", callData.from, "to:", callData.to)

      // Handle signals for the current conversation
      if (callData.to === currentUser.uid && callData.from === selectedUser.uid) {
        switch (callData.type) {
          case "call-offer":
            console.log("Received call offer")
            showIncomingCallNotification(callData)
            showIncomingCallModal(callData)
            break
          case "call-answer":
            console.log("Received call answer")
            if (peerConnection && peerConnection.signalingState === "have-local-offer") {
              try {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(callData.data))
                console.log("Set remote description (answer)")
                showConnectionStatus("Call accepted, connecting media...")
                callStatus.textContent = "Connecting media..."
              } catch (error) {
                console.error("Error setting remote description:", error)
              }
            }
            break
          case "ice-candidate":
            console.log("Received ICE candidate")
            if (peerConnection && callData.data && peerConnection.remoteDescription) {
              try {
                await peerConnection.addIceCandidate(new RTCIceCandidate(callData.data))
                console.log("Added ICE candidate")
              } catch (error) {
                console.error("Error adding ICE candidate:", error)
              }
            } else {
              console.log("Queuing ICE candidate - peer connection not ready")
            }
            break
          case "call-end":
            console.log("Call ended by remote user")
            showNotification("Call Ended", `${selectedUser.displayName} ended the call`)
            endVideoCall()
            break
        }
      }
    }
  })
}

// Global call listener - listens for incoming calls from any user
function listenForAllIncomingCalls() {
  if (!currentUser) return

  // Listen for calls directed to current user from any sender
  const callsRef = collection(db, "calls")
  const q = query(callsRef, where("to", "==", currentUser.uid))

  const unsubscribe = onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added" || change.type === "modified") {
        const callData = change.doc.data()
        const callId = change.doc.id

        // Only process recent calls (within last 30 seconds)
        const now = new Date()
        const callTime = callData.timestamp?.toDate() || now
        const timeDiff = now - callTime

        if (timeDiff > 30000) return // Ignore old calls

        console.log("Global call received:", callData.type, "from:", callData.from)

        if (callData.type === "call-offer" && callData.to === currentUser.uid) {
          // Find the caller's info
          findUserById(callData.from).then((callerUser) => {
            if (callerUser) {
              // Set the caller as selected user temporarily for the call
              const callDataWithUser = {
                ...callData,
                data: {
                  ...callData.data,
                  callerName: callerUser.displayName || callerUser.email?.split("@")[0] || "Unknown User",
                  callerUser: callerUser,
                },
              }

              // Show incoming call UI
              showIncomingCallNotification(callDataWithUser)
              showIncomingCallModal(callDataWithUser)

              // Temporarily set as selected user for call handling
              selectedUser = callerUser
            }
          })
        }
      }
    })
  })

  return unsubscribe
}

// Helper function to find user by ID
async function findUserById(userId) {
  try {
    const userRef = doc(db, "users", userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return { id: userSnap.id, ...userSnap.data() }
    }
    return null
  } catch (error) {
    console.error("Error finding user:", error)
    return null
  }
}

// Authentication functions
async function handleAuth(email, password) {
  try {
    setLoading(true)
    hideError()

    if (isSignupMode) {
      await createUserWithEmailAndPassword(auth, email, password)
    } else {
      await signInWithEmailAndPassword(auth, email, password)
    }
  } catch (error) {
    console.error("Auth error:", error)
    let errorMsg = "An error occurred. Please try again."

    switch (error.code) {
      case "auth/user-not-found":
        errorMsg = "No account found with this email."
        break
      case "auth/wrong-password":
        errorMsg = "Incorrect password."
        break
      case "auth/email-already-in-use":
        errorMsg = "An account with this email already exists."
        break
      case "auth/weak-password":
        errorMsg = "Password should be at least 6 characters."
        break
      case "auth/invalid-email":
        errorMsg = "Please enter a valid email address."
        break
      case "auth/too-many-requests":
        errorMsg = "Too many failed attempts. Please try again later."
        break
    }

    showError(errorMsg)
  } finally {
    setLoading(false)
  }
}

async function handleLogout() {
  try {
    if (currentUser) {
      const userRef = doc(db, "users", currentUser.uid)
      await setDoc(
        userRef,
        {
          online: false,
          lastSeen: serverTimestamp(),
        },
        { merge: true },
      )
    }

    if (usersUnsubscribe) usersUnsubscribe()
    if (messagesUnsubscribe) messagesUnsubscribe()

    await signOut(auth)
  } catch (error) {
    console.error("Logout error:", error)
  }
}

// User management functions
async function saveUserToFirestore(user) {
  try {
    const userRef = doc(db, "users", user.uid)
    const userSnap = await getDoc(userRef)

    const displayName = user.displayName || user.email?.split("@")[0] || "Unknown User"
    const email = user.email || ""

    const userData = {
      uid: user.uid,
      email: email,
      displayName: displayName,
      online: true,
      lastSeen: serverTimestamp(),
    }

    if (!userSnap.exists()) {
      await setDoc(userRef, userData)
    } else {
      await setDoc(
        userRef,
        {
          online: true,
          lastSeen: serverTimestamp(),
        },
        { merge: true },
      )
    }
  } catch (error) {
    console.error("Error saving user:", error)
  }
}

function loadUsers() {
  if (!currentUser) return

  const usersRef = collection(db, "users")
  const q = query(usersRef, where("uid", "!=", currentUser.uid))

  usersUnsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const users = []
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() })
      })

      renderUsers(users)
    },
    (error) => {
      console.error("Error loading users:", error)
      renderUsersError()
    },
  )
}

function renderUsers(users) {
  const searchTerm = searchInput.value.toLowerCase()
  const filteredUsers = users.filter((user) => {
    const displayName = user.displayName || user.email?.split("@")[0] || ""
    const email = user.email || ""
    return displayName.toLowerCase().includes(searchTerm) || email.toLowerCase().includes(searchTerm)
  })

  userCount.textContent = filteredUsers.length

  if (filteredUsers.length === 0) {
    usersList.innerHTML = `
      <div class="no-users">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
        <h4>No users found</h4>
        <p>Invite friends to start chatting!</p>
      </div>
    `
    return
  }

  usersList.innerHTML = filteredUsers
    .map((user) => {
      const displayName = user.displayName || user.email?.split("@")[0] || "Unknown User"
      const email = user.email || ""
      const lastSeen = user.lastSeen || null

      return `
        <div class="user-item ${selectedUser?.uid === user.uid ? "active" : ""}" 
             data-user-id="${user.uid}" 
             data-user-name="${displayName}" 
             data-user-email="${email}"
             data-user-online="${user.online || false}"
             data-user-last-seen="${lastSeen?.seconds || 0}">
          <div class="user-item-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <div class="user-status-indicator ${user.online ? "online" : "offline"}"></div>
          </div>
          <div class="user-item-info">
            <h4>${escapeHtml(displayName)}</h4>
            <p>${user.online ? "Online" : `Last seen ${formatLastSeen(lastSeen)}`}</p>
          </div>
        </div>
      `
    })
    .join("")

  document.querySelectorAll(".user-item").forEach((item) => {
    item.addEventListener("click", () => {
      const userData = {
        uid: item.dataset.userId,
        displayName: item.dataset.userName,
        email: item.dataset.userEmail,
        online: item.dataset.userOnline === "true",
        lastSeen: new Date(Number.parseInt(item.dataset.userLastSeen) * 1000),
      }
      selectUser(userData)
    })
  })
}

function renderUsersError() {
  usersList.innerHTML = `
    <div class="no-users">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <h4>Error loading users</h4>
      <p>Please check your connection and try again.</p>
    </div>
  `
}

function selectUser(user) {
  selectedUser = user

  document.querySelectorAll(".user-item").forEach((item) => {
    item.classList.remove("active")
  })
  document.querySelector(`[data-user-id="${user.uid}"]`)?.classList.add("active")

  welcomeMessage.classList.add("hidden")
  chatWindow.classList.remove("hidden")

  chatUserName.textContent = user.displayName
  chatUserStatus.textContent = user.online ? "Online" : `Last seen ${formatLastSeen(user.lastSeen)}`

  typingIndicator.classList.add("hidden")

  loadMessages()

  setTimeout(() => {
    markAllMessagesAsRead()
  }, 1000)

  listenForCallSignals()

  closeMobileSidebar()
}

// Message functions
function loadMessages() {
  if (!currentUser || !selectedUser) return

  if (messagesUnsubscribe) messagesUnsubscribe()

  const chatRoomId = getChatRoomId(currentUser.uid, selectedUser.uid)
  const messagesRef = collection(db, "chats", chatRoomId, "messages")
  const q = query(messagesRef, orderBy("timestamp", "asc"))

  messagesLoading.classList.remove("hidden")
  messagesList.innerHTML = ""

  messagesUnsubscribe = onSnapshot(
    q,
    (snapshot) => {
      messagesLoading.classList.add("hidden")

      const messages = []
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() })
      })

      renderMessages(messages)
    },
    (error) => {
      console.error("Error loading messages:", error)
      messagesLoading.classList.add("hidden")
      renderMessagesError()
    },
  )
}

function renderMessages(messages) {
  if (messages.length === 0) {
    messagesList.innerHTML = `
      <div class="no-messages">
        <h4>No messages yet</h4>
        <p>Start the conversation!</p>
      </div>
    `
    return
  }

  messagesList.innerHTML = messages
    .map((message) => {
      const isSent = message.uid === currentUser.uid
      let messageContent = ""

      if (message.type === "file") {
        const isImage = message.fileType?.startsWith("image/")
        if (isImage) {
          messageContent = `
            <img src="${message.fileUrl}" alt="${message.fileName}" class="message-image" onclick="window.open('${message.fileUrl}', '_blank')">
          `
        } else {
          messageContent = `
            <div class="message-file" onclick="window.open('${message.fileUrl}', '_blank')">
              <div class="file-icon">${getFileIcon(message.fileName)}</div>
              <div class="file-info">
                <div class="file-name">${escapeHtml(message.fileName)}</div>
                <div class="file-size">${formatFileSize(message.fileSize || 0)}</div>
              </div>
            </div>
          `
        }
        if (message.text) {
          messageContent += `<div class="message-content">${escapeHtml(message.text)}</div>`
        }
      } else {
        messageContent = `<div class="message-content">${escapeHtml(message.text)}</div>`
      }

      const reactions = message.reactions || {}
      const reactionsHtml =
        Object.keys(reactions).length > 0
          ? `
            <div class="message-reactions">
              ${Object.entries(reactions)
                .map(
                  ([emoji, users]) => `
                    <div class="reaction ${users.includes(currentUser.uid) ? "active" : ""}" 
                         onclick="toggleReaction('${message.id}', '${emoji}')">
                      ${emoji} ${users.length}
                    </div>
                  `,
                )
                .join("")}
            </div>
          `
          : ""

      const statusIcon = isSent ? getMessageStatusIcon(message.status || "sent") : ""

      return `
        <div class="message ${isSent ? "sent" : "received"}" data-message-id="${message.id}">
          ${messageContent}
          ${reactionsHtml}
          <div class="message-meta">
            <div class="message-time">${formatTime(message.timestamp)}</div>
            ${isSent ? `<div class="message-status ${message.status || "sent"}">${statusIcon}</div>` : ""}
          </div>
        </div>
      `
    })
    .join("")

  setTimeout(scrollToBottom, 100)
}

function renderMessagesError() {
  messagesList.innerHTML = `
    <div class="no-messages">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
      <h4>Error loading messages</h4>
      <p>Please check your connection and try again.</p>
    </div>
  `
}

async function sendMessage(text, file = null) {
  if (!currentUser || !selectedUser || (!text.trim() && !file)) return

  try {
    const chatRoomId = getChatRoomId(currentUser.uid, selectedUser.uid)
    const messagesRef = collection(db, "chats", chatRoomId, "messages")

    let messageData = {
      uid: currentUser.uid,
      senderEmail: currentUser.email,
      timestamp: serverTimestamp(),
    }

    if (file) {
      const fileRef = ref(storage, `chat-files/${chatRoomId}/${Date.now()}_${file.name}`)
      const snapshot = await uploadBytes(fileRef, file)
      const fileUrl = await getDownloadURL(snapshot.ref)

      messageData = {
        ...messageData,
        type: "file",
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        text: text.trim() || "",
      }
    } else {
      messageData = {
        ...messageData,
        type: "text",
        text: text.trim(),
      }
    }

    await addDoc(messagesRef, messageData)
    messageInput.value = ""

    if (!selectedUser.online) {
      showNotification("New Message", `${currentUser.email.split("@")[0]} sent you a message`)
    }
  } catch (error) {
    console.error("Error sending message:", error)
    showNotification("Error", "Failed to send message. Please try again.")
  }
}

async function toggleReaction(messageId, emoji) {
  if (!currentUser || !selectedUser) return

  try {
    const chatRoomId = getChatRoomId(currentUser.uid, selectedUser.uid)
    const messageRef = doc(db, "chats", chatRoomId, "messages", messageId)
    const messageSnap = await getDoc(messageRef)

    if (messageSnap.exists()) {
      const messageData = messageSnap.data()
      const reactions = messageData.reactions || {}
      const emojiReactions = reactions[emoji] || []

      if (emojiReactions.includes(currentUser.uid)) {
        const updatedReactions = emojiReactions.filter((uid) => uid !== currentUser.uid)
        if (updatedReactions.length === 0) {
          delete reactions[emoji]
        } else {
          reactions[emoji] = updatedReactions
        }
      } else {
        reactions[emoji] = [...emojiReactions, currentUser.uid]
      }

      await updateDoc(messageRef, { reactions })
    }
  } catch (error) {
    console.error("Error toggling reaction:", error)
  }
}

async function markAllMessagesAsRead() {
  if (!currentUser || !selectedUser) return

  try {
    const chatRoomId = getChatRoomId(currentUser.uid, selectedUser.uid)
    const messagesRef = collection(db, "chats", chatRoomId, "messages")
    const q = query(messagesRef, where("uid", "!=", currentUser.uid), where("status", "!=", "read"))

    const snapshot = await getDocs(q)
    const batch = []

    snapshot.forEach((doc) => {
      batch.push(markMessageAsRead(doc.id, chatRoomId))
    })

    await Promise.all(batch)
  } catch (error) {
    console.error("Error marking messages as read:", error)
  }
}

async function markMessageAsRead(messageId, chatRoomId) {
  try {
    const messageRef = doc(db, "chats", chatRoomId, "messages", messageId)
    await updateDoc(messageRef, {
      status: "read",
      readAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error marking message as read:", error)
  }
}

function getMessageStatusIcon(status) {
  switch (status) {
    case "delivered":
      return `<svg class="status-tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>`
    case "read":
      return `<svg class="status-tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
                <polyline points="16 6 5 17 0 12"/>
              </svg>`
    default:
      return `<svg class="status-tick" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>`
  }
}

// Typing indicator functions
async function setTyping(isTyping) {
  if (!currentUser || !selectedUser) return

  try {
    const chatRoomId = getChatRoomId(currentUser.uid, selectedUser.uid)
    const typingRef = doc(db, "typing", chatRoomId)

    if (isTyping) {
      await setDoc(
        typingRef,
        {
          [currentUser.uid]: {
            typing: true,
            timestamp: serverTimestamp(),
          },
        },
        { merge: true },
      )
    } else {
      await updateDoc(typingRef, {
        [currentUser.uid]: {
          typing: false,
          timestamp: serverTimestamp(),
        },
      })
    }
  } catch (error) {
    console.error("Error setting typing status:", error)
  }
}

function listenForTyping() {
  if (!currentUser || !selectedUser) return

  const chatRoomId = getChatRoomId(currentUser.uid, selectedUser.uid)
  const typingRef = doc(db, "typing", chatRoomId)

  onSnapshot(typingRef, (doc) => {
    if (doc.exists()) {
      const typingData = doc.data()
      const otherUserTyping = typingData[selectedUser.uid]

      if (otherUserTyping && otherUserTyping.typing) {
        typingIndicator.classList.remove("hidden")
        chatUserStatus.classList.add("hidden")
      } else {
        typingIndicator.classList.add("hidden")
        chatUserStatus.classList.remove("hidden")
      }
    }
  })
}

// File handling
function handleFileSelect(files) {
  Array.from(files).forEach((file) => {
    if (file.size > 10 * 1024 * 1024) {
      showNotification("File too large", "Please select files smaller than 10MB")
      return
    }
    sendMessage("", file)
  })
}

// Emoji picker functions
function initializeEmojiPicker() {
  const categories = document.querySelectorAll(".emoji-category")

  categories.forEach((category) => {
    category.addEventListener("click", () => {
      categories.forEach((c) => c.classList.remove("active"))
      category.classList.add("active")

      const categoryName = category.dataset.category
      renderEmojiGrid(categoryName)
    })
  })

  renderEmojiGrid("smileys")
}

function renderEmojiGrid(category) {
  const emojis = emojiData[category] || []
  emojiGrid.innerHTML = emojis
    .map(
      (emoji) => `
        <button class="emoji-item" onclick="insertEmoji('${emoji}')">${emoji}</button>
      `,
    )
    .join("")
}

function insertEmoji(emoji) {
  const cursorPos = messageInput.selectionStart
  const textBefore = messageInput.value.substring(0, cursorPos)
  const textAfter = messageInput.value.substring(cursorPos)

  messageInput.value = textBefore + emoji + textAfter
  messageInput.focus()
  messageInput.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length)

  emojiPicker.classList.add("hidden")
}

// Message search functions
async function searchMessages(searchTerm) {
  if (!currentUser || !selectedUser || !searchTerm.trim()) {
    searchResults.innerHTML = ""
    return
  }

  try {
    const chatRoomId = getChatRoomId(currentUser.uid, selectedUser.uid)
    const messagesRef = collection(db, "chats", chatRoomId, "messages")
    const q = query(messagesRef, orderBy("timestamp", "desc"))

    const snapshot = await getDocs(q)
    const results = []

    snapshot.forEach((doc) => {
      const message = doc.data()
      if (message.text && message.text.toLowerCase().includes(searchTerm.toLowerCase())) {
        results.push({ id: doc.id, ...message })
      }
    })

    renderSearchResults(results, searchTerm)
  } catch (error) {
    console.error("Error searching messages:", error)
  }
}

function renderSearchResults(results, searchTerm) {
  if (results.length === 0) {
    searchResults.innerHTML = `
      <div class="no-messages">
        <h4>No results found</h4>
        <p>Try different keywords</p>
      </div>
    `
    return
  }

  searchResults.innerHTML = results
    .map((message) => {
      const highlightedText = message.text.replace(
        new RegExp(searchTerm, "gi"),
        (match) => `<span class="search-highlight">${match}</span>`,
      )

      return `
        <div class="search-result" onclick="scrollToMessage('${message.id}')">
          <div class="search-result-text">${highlightedText}</div>
          <div class="search-result-meta">${formatTime(message.timestamp)}</div>
        </div>
      `
    })
    .join("")
}

function scrollToMessage(messageId) {
  const messageElement = document.querySelector(`[data-message-id="${messageId}"]`)
  if (messageElement) {
    messageElement.scrollIntoView({ behavior: "smooth", block: "center" })
    messageElement.style.backgroundColor = "rgba(102, 126, 234, 0.1)"
    setTimeout(() => {
      messageElement.style.backgroundColor = ""
    }, 2000)
  }
  closeMessageSearch()
}

function closeMessageSearch() {
  messageSearchContainer.classList.add("hidden")
  messageSearchInput.value = ""
  searchResults.innerHTML = ""
}

// Enhanced Event Listeners with null checks
if (authForm) {
  authForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const email = emailInput?.value.trim()
    const password = passwordInput?.value

    if (email && password) {
      handleAuth(email, password)
    }
  })
}

if (switchAuth) {
  switchAuth.addEventListener("click", toggleAuthMode)
}

if (logoutButton) {
  logoutButton.addEventListener("click", handleLogout)
}

if (mobileLogoutBtn) {
  mobileLogoutBtn.addEventListener("click", handleLogout)
}

if (darkModeToggle) {
  darkModeToggle.addEventListener("click", toggleDarkMode)
}

// Enhanced mobile menu
if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", openMobileSidebar)
}

if (mobileOverlay) {
  mobileOverlay.addEventListener("click", closeMobileSidebar)
}

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    if (usersUnsubscribe) {
      loadUsers()
    }
  })
}

if (messageForm) {
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault()
    const text = messageInput?.value.trim()
    if (text) {
      sendMessage(text)
    }
  })
}

if (messageInput) {
  messageInput.addEventListener("input", () => {
    if (typingTimeout) clearTimeout(typingTimeout)

    setTyping(true)

    typingTimeout = setTimeout(() => {
      setTyping(false)
    }, 2000)
  })

  messageInput.addEventListener("blur", () => {
    if (typingTimeout) clearTimeout(typingTimeout)
    setTyping(false)
  })
}

if (attachButton) {
  attachButton.addEventListener("click", () => {
    fileInput?.click()
  })
}

if (fileInput) {
  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files)
      e.target.value = ""
    }
  })
}

if (emojiButton) {
  emojiButton.addEventListener("click", () => {
    emojiPicker?.classList.toggle("hidden")
  })
}

if (searchMessagesBtn) {
  searchMessagesBtn.addEventListener("click", () => {
    messageSearchContainer?.classList.toggle("hidden")
    if (!messageSearchContainer?.classList.contains("hidden")) {
      messageSearchInput?.focus()
    }
  })
}

if (messageSearchInput) {
  messageSearchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.trim()
    if (searchTerm.length > 2) {
      searchMessages(searchTerm)
    } else {
      if (searchResults) {
        searchResults.innerHTML = ""
      }
    }
  })
}

if (closeSearchBtn) {
  closeSearchBtn.addEventListener("click", closeMessageSearch)
}

if (backButton) {
  backButton.addEventListener("click", () => {
    welcomeMessage?.classList.remove("hidden")
    chatWindow?.classList.add("hidden")
    selectedUser = null

    document.querySelectorAll(".user-item").forEach((item) => {
      item.classList.remove("active")
    })

    if (messagesUnsubscribe) messagesUnsubscribe()
  })
}

// Enhanced video call event listeners
if (videoCallBtn) {
  videoCallBtn.addEventListener("click", startVideoCall)
}

if (acceptCallBtn) {
  acceptCallBtn.addEventListener("click", async () => {
    const offer = JSON.parse(incomingCallModal?.dataset.offer || "{}")
    const callerData = JSON.parse(incomingCallModal?.dataset.callerUser || "{}")

    // Ensure we have the caller set as selected user
    if (callerData && callerData.uid) {
      selectedUser = callerData
    }

    hideIncomingCallModal()
    hideIncomingCallNotification()
    await answerVideoCall(offer)
  })
}

if (notificationAcceptBtn) {
  notificationAcceptBtn.addEventListener("click", async () => {
    const offer = JSON.parse(incomingCallNotification?.dataset.offer || "{}")
    const callerData = JSON.parse(incomingCallNotification?.dataset.callerUser || "{}")

    // Ensure we have the caller set as selected user
    if (callerData && callerData.uid) {
      selectedUser = callerData
    }

    hideIncomingCallNotification()
    hideIncomingCallModal()
    await answerVideoCall(offer)
  })
}

if (declineCallBtn) {
  declineCallBtn.addEventListener("click", () => {
    sendCallSignal("call-end", {})
    hideIncomingCallModal()
    hideIncomingCallNotification()
  })
}

if (notificationDeclineBtn) {
  notificationDeclineBtn.addEventListener("click", () => {
    sendCallSignal("call-end", {})
    hideIncomingCallNotification()
    hideIncomingCallModal()
  })
}

if (endCallBtn) {
  endCallBtn.addEventListener("click", endVideoCall)
}

if (toggleMicBtn) {
  toggleMicBtn.addEventListener("click", toggleMicrophone)
}

if (toggleVideoBtn) {
  toggleVideoBtn.addEventListener("click", toggleCamera)
}

if (minimizeCallBtn) {
  minimizeCallBtn.addEventListener("click", hideVideoCallModal)
}

// Close emoji picker when clicking outside
document.addEventListener("click", (e) => {
  if (emojiPicker && emojiButton && !emojiPicker.contains(e.target) && !emojiButton.contains(e.target)) {
    emojiPicker.classList.add("hidden")
  }
})

// Enhanced Auth state listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user
    if (currentUserEmail) {
      currentUserEmail.textContent = user.email
    }

    await saveUserToFirestore(user)
    loadUsers()
    initializeEmojiPicker()

    // Start listening for incoming calls globally
    listenForAllIncomingCalls()

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }

    if (chatScreen) {
      showScreen(chatScreen)
    }
  } else {
    currentUser = null
    selectedUser = null

    if (usersUnsubscribe) usersUnsubscribe()
    if (messagesUnsubscribe) messagesUnsubscribe()

    if (loginScreen) {
      showScreen(loginScreen)
    }
  }
})

// Enhanced page visibility handling
document.addEventListener("visibilitychange", async () => {
  if (currentUser) {
    const userRef = doc(db, "users", currentUser.uid)
    if (document.hidden) {
      await setDoc(
        userRef,
        {
          online: false,
          lastSeen: serverTimestamp(),
        },
        { merge: true },
      )
    } else {
      await setDoc(
        userRef,
        {
          online: true,
          lastSeen: serverTimestamp(),
        },
        { merge: true },
      )
    }
  }
})

// Enhanced beforeunload handling
window.addEventListener("beforeunload", async () => {
  if (currentUser) {
    const userRef = doc(db, "users", currentUser.uid)
    await setDoc(
      userRef,
      {
        online: false,
        lastSeen: serverTimestamp(),
      },
      { merge: true },
    )
  }
})

// Enhanced resize handling for mobile
window.addEventListener("resize", () => {
  if (window.innerWidth > 768) {
    closeMobileSidebar()
  }
})

// Global functions for onclick handlers
window.toggleReaction = toggleReaction
window.insertEmoji = insertEmoji
window.scrollToMessage = scrollToMessage

// Enhanced initialization
console.log("Enhanced Mobile ChatApp initialized")
setTimeout(() => {
  if (loadingScreen && !loadingScreen.classList.contains("hidden")) {
    if (loginScreen) {
      showScreen(loginScreen)
    }
  }
}, 2000)
