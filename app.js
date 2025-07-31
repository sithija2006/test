// Firebase imports
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
let isVideoCall = false
let isVoiceCall = false
let isVideoEnabled = true
let isAudioEnabled = true
let callUnsubscribe = null
let callTimer = null
let callStartTime = null

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

// DOM elements
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

// Call-related DOM elements
const voiceCallBtn = document.getElementById("voiceCallBtn")
const videoCallBtn = document.getElementById("videoCallBtn")
const voiceCallModal = document.getElementById("voiceCallModal")
const videoCallModal = document.getElementById("videoCallModal")
const incomingCallModal = document.getElementById("incomingCallModal")

// Initialize dark mode
if (isDarkMode) {
  document.documentElement.setAttribute("data-theme", "dark")
  updateDarkModeIcon()
}

// Enhanced mobile video call functionality
let controlsTimeout = null
let isControlsVisible = true

// Utility functions
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

function formatCallDuration(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

function scrollToBottom() {
  messagesContainer.scrollTop = messagesContainer.scrollHeight
}

function closeMobileSidebar() {
  sidebar.classList.remove("mobile-open")
  mobileOverlay.classList.add("hidden")
}

function openMobileSidebar() {
  sidebar.classList.add("mobile-open")
  mobileOverlay.classList.remove("hidden")
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

// Enhanced WebRTC configuration for better mobile support
const rtcConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
  ],
  iceCandidatePoolSize: 10,
}

// Enhanced mobile video call functionality
function showVideoCallModal() {
  const modal = document.getElementById("videoCallModal")
  const callUserName = document.getElementById("callUserName")
  const remoteUserName = document.getElementById("remoteUserName")
  const container = modal.querySelector(".video-call-container")

  callUserName.textContent = selectedUser.displayName
  remoteUserName.textContent = selectedUser.displayName

  modal.classList.remove("hidden")
  isVideoCall = true

  // Auto-hide controls after 3 seconds of inactivity
  resetControlsTimeout()

  // Add touch/click handlers for showing controls with passive listeners
  container.addEventListener("click", showControls)
  container.addEventListener("touchstart", showControls, { passive: true })

  // Prevent screen from sleeping during call
  if ("wakeLock" in navigator) {
    navigator.wakeLock.request("screen").catch((err) => {
      console.log("Wake lock failed:", err)
    })
  }
}

function showVoiceCallModal() {
  const modal = document.getElementById("voiceCallModal")
  const voiceCallUserName = document.getElementById("voiceCallUserName")
  const voiceCallStatus = document.getElementById("voiceCallStatus")

  voiceCallUserName.textContent = selectedUser.displayName
  voiceCallStatus.textContent = "Calling..."

  modal.classList.remove("hidden")
  isVoiceCall = true

  // Prevent screen from sleeping during call
  if ("wakeLock" in navigator) {
    navigator.wakeLock.request("screen").catch((err) => {
      console.log("Wake lock failed:", err)
    })
  }
}

function showControls() {
  if (!isVideoCall) return

  const container = document.querySelector(".video-call-container")
  const header = document.querySelector(".video-call-header")
  const controls = document.querySelector(".video-call-controls")

  if (container) container.classList.remove("controls-hidden")
  if (header) header.classList.remove("hidden")
  if (controls) controls.classList.remove("hidden")

  isControlsVisible = true
  resetControlsTimeout()
}

function hideControls() {
  if (!isVideoCall) return

  const container = document.querySelector(".video-call-container")
  const header = document.querySelector(".video-call-header")
  const controls = document.querySelector(".video-call-controls")

  if (container) container.classList.add("controls-hidden")
  if (header) header.classList.add("hidden")
  if (controls) controls.classList.add("hidden")

  isControlsVisible = false
}

function resetControlsTimeout() {
  if (controlsTimeout) {
    clearTimeout(controlsTimeout)
  }

  controlsTimeout = setTimeout(() => {
    if (isCallActive && isControlsVisible && isVideoCall) {
      hideControls()
    }
  }, 3000)
}

// Enhanced connection status
function showConnectionStatus(message) {
  let statusEl = document.querySelector(".connection-status")

  if (!statusEl) {
    statusEl = document.createElement("div")
    statusEl.className = "connection-status"
    const videoContent = document.querySelector(".video-call-content")
    if (isVideoCall && videoContent) {
      videoContent.appendChild(statusEl)
    }
  }

  statusEl.textContent = message
  statusEl.classList.remove("hidden")

  // Auto-hide after 3 seconds
  setTimeout(() => {
    statusEl.classList.add("hidden")
  }, 3000)
}

// Enhanced WebRTC with better mobile support
async function initializeCall(videoEnabled = true) {
  try {
    // Request permissions with mobile-optimized constraints
    const constraints = {
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    }

    if (videoEnabled) {
      constraints.video = {
        width: { ideal: 640, max: 1280 },
        height: { ideal: 480, max: 720 },
        frameRate: { ideal: 30, max: 30 },
        facingMode: "user",
      }
    }

    localStream = await navigator.mediaDevices.getUserMedia(constraints)

    if (videoEnabled) {
      const localVideo = document.getElementById("localVideo")
      const localVideoPlaceholder = document.getElementById("localVideoPlaceholder")

      if (localVideo) {
        localVideo.srcObject = localStream
        localVideo.playsInline = true
        localVideo.muted = true
      }

      if (localVideoPlaceholder) {
        localVideoPlaceholder.style.display = "none"
      }
    }

    return true
  } catch (error) {
    console.error("Error accessing media devices:", error)

    let errorMessage = "Could not access camera and microphone"
    if (error.name === "NotAllowedError") {
      errorMessage = videoEnabled
        ? "Camera and microphone access denied. Please allow permissions and try again."
        : "Microphone access denied. Please allow permissions and try again."
    } else if (error.name === "NotFoundError") {
      errorMessage = videoEnabled
        ? "No camera or microphone found on this device."
        : "No microphone found on this device."
    }

    showNotification("Media Error", errorMessage)
    return false
  }
}

// Enhanced peer connection with mobile optimizations
async function createPeerConnection() {
  peerConnection = new RTCPeerConnection(rtcConfiguration)

  // Enhanced connection state monitoring
  peerConnection.onconnectionstatechange = () => {
    const state = peerConnection.connectionState
    console.log("Connection state:", state)

    const statusElement = isVideoCall
      ? document.getElementById("callStatus")
      : document.getElementById("voiceCallStatus")

    switch (state) {
      case "connecting":
        showConnectionStatus("Connecting...")
        if (statusElement) statusElement.textContent = "Connecting..."
        break
      case "connected":
        showConnectionStatus("Connected")
        if (statusElement) statusElement.textContent = "Connected"
        startCallTimer()
        break
      case "disconnected":
        showConnectionStatus("Connection lost, reconnecting...")
        if (statusElement) statusElement.textContent = "Reconnecting..."
        break
      case "failed":
        showConnectionStatus("Connection failed")
        if (statusElement) statusElement.textContent = "Connection failed"
        setTimeout(() => endCall(), 3000)
        break
    }
  }

  // Handle remote stream with mobile optimizations
  peerConnection.ontrack = (event) => {
    remoteStream = event.streams[0]

    if (isVideoCall) {
      const remoteVideo = document.getElementById("remoteVideo")
      const remoteVideoPlaceholder = document.getElementById("remoteVideoPlaceholder")

      if (remoteVideo) {
        remoteVideo.srcObject = remoteStream
        remoteVideo.playsInline = true
      }

      if (remoteVideoPlaceholder) {
        remoteVideoPlaceholder.style.display = "none"
      }
    }
  }

  // Handle ICE candidates
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      sendCallSignal("ice-candidate", event.candidate)
    }
  }

  return peerConnection
}

// Enhanced start video call
async function startVideoCall() {
  if (!selectedUser || isCallActive) return

  const hasMedia = await initializeCall(true)
  if (!hasMedia) return

  try {
    showConnectionStatus("Initiating video call...")

    // Create peer connection
    await createPeerConnection()

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
      })
    }

    // Create offer with mobile-optimized settings
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    })

    await peerConnection.setLocalDescription(offer)

    // Send call invitation
    await sendCallSignal("video-call-offer", {
      offer: offer,
      callerName: currentUser.email.split("@")[0],
    })

    // Show video call modal
    showVideoCallModal()
    isCallActive = true

    // Listen for call responses
    listenForCallSignals()

    showConnectionStatus("Calling...")
  } catch (error) {
    console.error("Error starting video call:", error)
    showNotification("Call Error", "Failed to start video call")
    endCall()
  }
}

// Enhanced start voice call
async function startVoiceCall() {
  if (!selectedUser || isCallActive) return

  const hasMedia = await initializeCall(false)
  if (!hasMedia) return

  try {
    // Create peer connection
    await createPeerConnection()

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
      })
    }

    // Create offer for voice call
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: false,
    })

    await peerConnection.setLocalDescription(offer)

    // Send call invitation
    await sendCallSignal("voice-call-offer", {
      offer: offer,
      callerName: currentUser.email.split("@")[0],
    })

    // Show voice call modal
    showVoiceCallModal()
    isCallActive = true

    // Listen for call responses
    listenForCallSignals()
  } catch (error) {
    console.error("Error starting voice call:", error)
    showNotification("Call Error", "Failed to start voice call")
    endCall()
  }
}

// Enhanced answer call
async function answerCall(offer, isVideo = true) {
  const hasMedia = await initializeCall(isVideo)
  if (!hasMedia) return

  try {
    showConnectionStatus("Accepting call...")

    // Create peer connection
    await createPeerConnection()

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream)
      })
    }

    // Set remote description and create answer
    const offerDescription = new RTCSessionDescription(offer)
    await peerConnection.setRemoteDescription(offerDescription)
    const answer = await peerConnection.createAnswer()
    await peerConnection.setLocalDescription(answer)

    // Send answer
    await sendCallSignal("call-answer", answer)

    // Show appropriate call modal
    if (isVideo) {
      showVideoCallModal()
    } else {
      showVoiceCallModal()
    }

    isCallActive = true
    showConnectionStatus("Connecting...")
  } catch (error) {
    console.error("Error answering call:", error)
    showNotification("Call Error", "Failed to answer call")
    endCall()
  }
}

// Enhanced end call with cleanup
async function endCall() {
  try {
    // Send end call signal
    if (isCallActive) {
      await sendCallSignal("call-end", {})
    }

    // Clear timeouts and timers
    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
      controlsTimeout = null
    }

    if (callTimer) {
      clearInterval(callTimer)
      callTimer = null
    }

    // Clean up streams
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop())
      localStream = null
    }

    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop())
      remoteStream = null
    }

    // Clean up peer connection
    if (peerConnection) {
      peerConnection.close()
      peerConnection = null
    }

    // Clean up listeners
    if (callUnsubscribe) {
      callUnsubscribe()
      callUnsubscribe = null
    }

    // Reset UI
    hideVideoCallModal()
    hideVoiceCallModal()
    hideIncomingCallModal()

    // Reset video elements
    const localVideo = document.getElementById("localVideo")
    const remoteVideo = document.getElementById("remoteVideo")
    const localVideoPlaceholder = document.getElementById("localVideoPlaceholder")
    const remoteVideoPlaceholder = document.getElementById("remoteVideoPlaceholder")

    if (localVideo) localVideo.srcObject = null
    if (remoteVideo) remoteVideo.srcObject = null
    if (localVideoPlaceholder) localVideoPlaceholder.style.display = "flex"
    if (remoteVideoPlaceholder) remoteVideoPlaceholder.style.display = "flex"

    // Remove connection status
    const statusEl = document.querySelector(".connection-status")
    if (statusEl) {
      statusEl.remove()
    }

    // Release wake lock
    if ("wakeLock" in navigator && document.wakeLock) {
      document.wakeLock.release()
    }

    // Reset call states
    isCallActive = false
    isVideoCall = false
    isVoiceCall = false
    isVideoEnabled = true
    isAudioEnabled = true
    isControlsVisible = true
    callStartTime = null
  } catch (error) {
    console.error("Error ending call:", error)
  }
}

// Start call timer
function startCallTimer() {
  callStartTime = Date.now()

  if (isVoiceCall) {
    const timerElement = document.getElementById("voiceCallTimer")
    const statusElement = document.getElementById("voiceCallStatus")

    if (timerElement) timerElement.classList.remove("hidden")
    if (statusElement) statusElement.classList.add("hidden")

    callTimer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - callStartTime) / 1000)
      if (timerElement) timerElement.textContent = formatCallDuration(elapsed)
    }, 1000)
  }
}

// Enhanced toggle functions with visual feedback
function toggleMicrophone() {
  if (localStream) {
    const audioTrack = localStream.getAudioTracks()[0]
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled
      isAudioEnabled = audioTrack.enabled

      const micBtn = isVideoCall
        ? document.getElementById("toggleMicBtn")
        : document.getElementById("toggleVoiceMicBtn")

      if (micBtn) {
        micBtn.classList.toggle("active", isAudioEnabled)

        // Update icon
        const icon = micBtn.querySelector("svg")
        if (icon) {
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
              <path d="M9 9v3a3 3 0 0 0 5.12 2.12l1.27-1.27A3 3 0 0 0 15 12V4a3 3 0 0 0-3-3 3 3 0 0 0-3 3v5"/>
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/>
              <line x1="12" y1="19" x2="12" y2="23"/>
              <line x1="8" y1="23" x2="16" y2="23"/>
            `
          }
        }

        showConnectionStatus(isAudioEnabled ? "Microphone on" : "Microphone off")
      }
    }
  }
}

function toggleCamera() {
  if (localStream && isVideoCall) {
    const videoTrack = localStream.getVideoTracks()[0]
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled
      isVideoEnabled = videoTrack.enabled

      const videoBtn = document.getElementById("toggleVideoBtn")
      const localVideoPlaceholder = document.getElementById("localVideoPlaceholder")

      if (videoBtn) {
        videoBtn.classList.toggle("active", isVideoEnabled)

        if (localVideoPlaceholder) {
          localVideoPlaceholder.style.display = isVideoEnabled ? "none" : "flex"
        }

        // Update icon
        const icon = videoBtn.querySelector("svg")
        if (icon) {
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
        }

        showConnectionStatus(isVideoEnabled ? "Camera on" : "Camera off")
      }
    }
  }
}

function hideVideoCallModal() {
  const modal = document.getElementById("videoCallModal")
  if (modal) modal.classList.add("hidden")
}

function hideVoiceCallModal() {
  const modal = document.getElementById("voiceCallModal")
  if (modal) modal.classList.add("hidden")
}

function hideIncomingCallModal() {
  const modal = document.getElementById("incomingCallModal")
  if (modal) modal.classList.add("hidden")
}

// Call signaling functions - FIXED
async function sendCallSignal(type, data) {
  if (!currentUser || !selectedUser) return

  try {
    const chatRoomId = getChatRoomId(currentUser.uid, selectedUser.uid)
    const callRef = doc(db, "calls", chatRoomId)

    // Serialize WebRTC objects for Firestore
    let serializedData = data
    if (data && typeof data === "object") {
      if (data.candidate !== undefined) {
        // This is an ICE candidate
        serializedData = {
          candidate: data.candidate,
          sdpMid: data.sdpMid,
          sdpMLineIndex: data.sdpMLineIndex,
          usernameFragment: data.usernameFragment,
        }
      } else if (data.type && data.sdp) {
        // This is an SDP offer/answer
        serializedData = {
          type: data.type,
          sdp: data.sdp,
        }
      }
    }

    await setDoc(
      callRef,
      {
        type: type,
        from: currentUser.uid,
        to: selectedUser.uid,
        data: serializedData,
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

  callUnsubscribe = onSnapshot(callRef, (doc) => {
    if (doc.exists()) {
      const callData = doc.data()

      if (callData.to === currentUser.uid) {
        switch (callData.type) {
          case "video-call-offer":
            // Show incoming video call modal
            showIncomingCallModal(callData, true)
            break
          case "voice-call-offer":
            // Show incoming voice call modal
            showIncomingCallModal(callData, false)
            break
          case "call-answer":
            // Set remote description
            if (peerConnection && callData.data) {
              const answerDescription = new RTCSessionDescription(callData.data)
              peerConnection.setRemoteDescription(answerDescription).catch((err) => {
                console.error("Error setting remote description:", err)
              })
              showConnectionStatus("Call accepted")
              const statusElement = isVideoCall
                ? document.getElementById("callStatus")
                : document.getElementById("voiceCallStatus")
              if (statusElement) statusElement.textContent = "Call accepted"
            }
            break
          case "ice-candidate":
            // Add ICE candidate - reconstruct the RTCIceCandidate object
            if (peerConnection && callData.data) {
              const candidate = new RTCIceCandidate({
                candidate: callData.data.candidate,
                sdpMid: callData.data.sdpMid,
                sdpMLineIndex: callData.data.sdpMLineIndex,
                usernameFragment: callData.data.usernameFragment,
              })
              peerConnection.addIceCandidate(candidate).catch((err) => {
                console.error("Error adding ICE candidate:", err)
              })
            }
            break
          case "call-end":
            // End call
            const callerName = selectedUser ? selectedUser.displayName : "Unknown"
            showNotification("Call Ended", `${callerName} ended the call`)
            endCall()
            break
        }
      }
    }
  })
}

function showIncomingCallModal(callData, isVideo = true) {
  const modal = document.getElementById("incomingCallModal")
  const callerName = document.getElementById("incomingCallerName")
  const callType = document.getElementById("incomingCallType")

  if (callerName) callerName.textContent = callData.data.callerName
  if (callType) callType.textContent = isVideo ? "Incoming video call..." : "Incoming voice call..."

  if (modal) {
    modal.dataset.offer = JSON.stringify(callData.data.offer)
    modal.dataset.isVideo = isVideo.toString()
    modal.classList.remove("hidden")
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
      // Set user offline
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

    // Clean up listeners
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

  if (userCount) userCount.textContent = filteredUsers.length

  if (filteredUsers.length === 0) {
    if (usersList) {
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
    }
    return
  }

  if (usersList) {
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

    // Add click listeners
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
}

function renderUsersError() {
  if (usersList) {
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
}

function selectUser(user) {
  selectedUser = user

  // Update UI
  document.querySelectorAll(".user-item").forEach((item) => {
    item.classList.remove("active")
  })
  const userElement = document.querySelector(`[data-user-id="${user.uid}"]`)
  if (userElement) userElement.classList.add("active")

  // Show chat window
  if (welcomeMessage) welcomeMessage.classList.add("hidden")
  if (chatWindow) chatWindow.classList.remove("hidden")

  // Update chat header
  if (chatUserName) chatUserName.textContent = user.displayName
  if (chatUserStatus) {
    chatUserStatus.textContent = user.online ? "Online" : `Last seen ${formatLastSeen(user.lastSeen)}`
  }

  // Hide typing indicator
  if (typingIndicator) typingIndicator.classList.add("hidden")

  // Load messages
  loadMessages()

  // Mark messages as read
  setTimeout(() => {
    markAllMessagesAsRead()
  }, 1000)

  // Listen for call signals
  listenForCallSignals()

  // Close mobile sidebar
  closeMobileSidebar()
}

// Message functions
function loadMessages() {
  if (!currentUser || !selectedUser) return

  // Clean up previous listener
  if (messagesUnsubscribe) messagesUnsubscribe()

  const chatRoomId = getChatRoomId(currentUser.uid, selectedUser.uid)
  const messagesRef = collection(db, "chats", chatRoomId, "messages")
  const q = query(messagesRef, orderBy("timestamp", "asc"))

  if (messagesLoading) messagesLoading.classList.remove("hidden")
  if (messagesList) messagesList.innerHTML = ""

  messagesUnsubscribe = onSnapshot(
    q,
    (snapshot) => {
      if (messagesLoading) messagesLoading.classList.add("hidden")

      const messages = []
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() })
      })

      renderMessages(messages)
    },
    (error) => {
      console.error("Error loading messages:", error)
      if (messagesLoading) messagesLoading.classList.add("hidden")
      renderMessagesError()
    },
  )
}

function renderMessages(messages) {
  if (messages.length === 0) {
    if (messagesList) {
      messagesList.innerHTML = `
        <div class="no-messages">
          <h4>No messages yet</h4>
          <p>Start the conversation!</p>
        </div>
      `
    }
    return
  }

  if (messagesList) {
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
}

function renderMessagesError() {
  if (messagesList) {
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
      // Upload file to Firebase Storage
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
    if (messageInput) messageInput.value = ""

    // Show notification to other user
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
        // Remove reaction
        const updatedReactions = emojiReactions.filter((uid) => uid !== currentUser.uid)
        if (updatedReactions.length === 0) {
          delete reactions[emoji]
        } else {
          reactions[emoji] = updatedReactions
        }
      } else {
        // Add reaction
        reactions[emoji] = [...emojiReactions, currentUser.uid]
      }

      await updateDoc(messageRef, { reactions })
    }
  } catch (error) {
    console.error("Error toggling reaction:", error)
  }
}

// Message status functions
async function markMessageAsDelivered(messageId, chatRoomId) {
  try {
    const messageRef = doc(db, "chats", chatRoomId, "messages", messageId)
    await updateDoc(messageRef, {
      status: "delivered",
      deliveredAt: serverTimestamp(),
    })
  } catch (error) {
    console.error("Error marking message as delivered:", error)
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
        if (typingIndicator) typingIndicator.classList.remove("hidden")
        if (chatUserStatus) chatUserStatus.classList.add("hidden")
      } else {
        if (typingIndicator) typingIndicator.classList.add("hidden")
        if (chatUserStatus) chatUserStatus.classList.remove("hidden")
      }
    }
  })
}

// File handling
function handleFileSelect(files) {
  Array.from(files).forEach((file) => {
    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
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

  // Initialize with smileys
  renderEmojiGrid("smileys")
}

function renderEmojiGrid(category) {
  const emojis = emojiData[category] || []
  if (emojiGrid) {
    emojiGrid.innerHTML = emojis
      .map(
        (emoji) => `
          <button class="emoji-item" onclick="insertEmoji('${emoji}')">${emoji}</button>
        `,
      )
      .join("")
  }
}

function insertEmoji(emoji) {
  if (messageInput) {
    const cursorPos = messageInput.selectionStart
    const textBefore = messageInput.value.substring(0, cursorPos)
    const textAfter = messageInput.value.substring(cursorPos)

    messageInput.value = textBefore + emoji + textAfter
    messageInput.focus()
    messageInput.setSelectionRange(cursorPos + emoji.length, cursorPos + emoji.length)

    if (emojiPicker) emojiPicker.classList.add("hidden")
  }
}

// Message search functions
async function searchMessages(searchTerm) {
  if (!currentUser || !selectedUser || !searchTerm.trim()) {
    if (searchResults) searchResults.innerHTML = ""
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
  if (!searchResults) return

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
  if (messageSearchContainer) messageSearchContainer.classList.add("hidden")
  if (messageSearchInput) messageSearchInput.value = ""
  if (searchResults) searchResults.innerHTML = ""
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

// Event listeners
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

if (switchAuth) switchAuth.addEventListener("click", toggleAuthMode)
if (logoutButton) logoutButton.addEventListener("click", handleLogout)
if (darkModeToggle) darkModeToggle.addEventListener("click", toggleDarkMode)

if (searchInput) {
  searchInput.addEventListener("input", (e) => {
    if (usersUnsubscribe) {
      // Re-render users with search filter
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
    if (fileInput) fileInput.click()
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
    if (emojiPicker) emojiPicker.classList.toggle("hidden")
  })
}

if (searchMessagesBtn) {
  searchMessagesBtn.addEventListener("click", () => {
    if (messageSearchContainer) {
      messageSearchContainer.classList.toggle("hidden")
      if (!messageSearchContainer.classList.contains("hidden") && messageSearchInput) {
        messageSearchInput.focus()
      }
    }
  })
}

if (messageSearchInput) {
  messageSearchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.trim()
    if (searchTerm.length > 2) {
      searchMessages(searchTerm)
    } else if (searchResults) {
      searchResults.innerHTML = ""
    }
  })
}

if (closeSearchBtn) closeSearchBtn.addEventListener("click", closeMessageSearch)

if (backButton) {
  backButton.addEventListener("click", () => {
    if (welcomeMessage) welcomeMessage.classList.remove("hidden")
    if (chatWindow) chatWindow.classList.add("hidden")
    selectedUser = null

    // Update user list active state
    document.querySelectorAll(".user-item").forEach((item) => {
      item.classList.remove("active")
    })

    // Clean up messages listener
    if (messagesUnsubscribe) messagesUnsubscribe()
  })
}

if (mobileOverlay) mobileOverlay.addEventListener("click", closeMobileSidebar)

// Close emoji picker when clicking outside
document.addEventListener("click", (e) => {
  if (emojiPicker && emojiButton && !emojiPicker.contains(e.target) && !emojiButton.contains(e.target)) {
    emojiPicker.classList.add("hidden")
  }
})

// Enhanced call event listeners
if (voiceCallBtn) voiceCallBtn.addEventListener("click", startVoiceCall)
if (videoCallBtn) videoCallBtn.addEventListener("click", startVideoCall)

const acceptCallBtn = document.getElementById("acceptCallBtn")
if (acceptCallBtn) {
  acceptCallBtn.addEventListener("click", async () => {
    const modal = document.getElementById("incomingCallModal")
    if (modal) {
      const offer = JSON.parse(modal.dataset.offer)
      const isVideo = modal.dataset.isVideo === "true"
      hideIncomingCallModal()
      await answerCall(offer, isVideo)
    }
  })
}

const declineCallBtn = document.getElementById("declineCallBtn")
if (declineCallBtn) {
  declineCallBtn.addEventListener("click", () => {
    sendCallSignal("call-end", {})
    hideIncomingCallModal()
  })
}

const endCallBtn = document.getElementById("endCallBtn")
if (endCallBtn) endCallBtn.addEventListener("click", endCall)

const endVoiceCallBtn = document.getElementById("endVoiceCallBtn")
if (endVoiceCallBtn) endVoiceCallBtn.addEventListener("click", endCall)

const toggleMicBtn = document.getElementById("toggleMicBtn")
if (toggleMicBtn) toggleMicBtn.addEventListener("click", toggleMicrophone)

const toggleVoiceMicBtn = document.getElementById("toggleVoiceMicBtn")
if (toggleVoiceMicBtn) toggleVoiceMicBtn.addEventListener("click", toggleMicrophone)

const toggleVideoBtn = document.getElementById("toggleVideoBtn")
if (toggleVideoBtn) toggleVideoBtn.addEventListener("click", toggleCamera)

const minimizeCallBtn = document.getElementById("minimizeCallBtn")
if (minimizeCallBtn) minimizeCallBtn.addEventListener("click", hideVideoCallModal)

// Auth state listener
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user
    if (currentUserEmail) currentUserEmail.textContent = user.email

    // Save user to Firestore
    await saveUserToFirestore(user)

    // Load users
    loadUsers()

    // Initialize emoji picker
    initializeEmojiPicker()

    // Show chat screen
    showScreen(chatScreen)
  } else {
    currentUser = null
    selectedUser = null

    // Clean up listeners
    if (usersUnsubscribe) usersUnsubscribe()
    if (messagesUnsubscribe) messagesUnsubscribe()

    // Show login screen
    showScreen(loginScreen)
  }
})

// Handle page visibility for online status
document.addEventListener("visibilitychange", async () => {
  if (currentUser) {
    const userRef = doc(db, "users", currentUser.uid)
    if (document.hidden) {
      // User is leaving/minimizing
      await setDoc(
        userRef,
        {
          online: false,
          lastSeen: serverTimestamp(),
        },
        { merge: true },
      )
    } else {
      // User is back
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

// Handle beforeunload for cleanup
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

// Global functions for onclick handlers
window.toggleReaction = toggleReaction
window.insertEmoji = insertEmoji
window.scrollToMessage = scrollToMessage

// Initialize app
console.log("Enhanced ChatApp initialized with mobile-responsive video and voice calls")
setTimeout(() => {
  if (loadingScreen && !loadingScreen.classList.contains("hidden")) {
    showScreen(loginScreen)
  }
}, 2000)
