const fs = require('fs');
const path = require('path');

// Storage file path
const STORAGE_FILE = path.join(__dirname, '../data/requests.json');
const DATA_DIR = path.join(__dirname, '../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize storage file if it doesn't exist
if (!fs.existsSync(STORAGE_FILE)) {
  fs.writeFileSync(STORAGE_FILE, JSON.stringify({
    requests: {},
    users: {},
    wallets: {}
  }, null, 2));
}

// Load data from storage
function loadData() {
  try {
    const data = fs.readFileSync(STORAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading storage:', error);
    return { requests: {}, users: {}, wallets: {} };
  }
}

// Save data to storage
function saveData(data) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving storage:', error);
  }
}

// Check if user has already requested tokens
function hasUserRequested(userId) {
  const data = loadData();
  return data.users[userId] !== undefined;
}

// Check if wallet has already been used
function hasWalletBeenUsed(walletAddress) {
  const data = loadData();
  return data.wallets[walletAddress.toLowerCase()] !== undefined;
}

// Record a new token request
function recordRequest(userId, username, firstName, walletAddress) {
  const data = loadData();
  const timestamp = new Date().toISOString();
  const requestId = `req_${Date.now()}_${userId}`;
  
  // Record user request
  data.users[userId] = {
    requestId,
    username,
    firstName,
    walletAddress,
    timestamp,
    status: 'pending'
  };
  
  // Record wallet usage
  data.wallets[walletAddress.toLowerCase()] = {
    requestId,
    userId,
    username,
    firstName,
    timestamp,
    status: 'pending'
  };
  
  // Record full request details
  data.requests[requestId] = {
    userId,
    username,
    firstName,
    walletAddress,
    timestamp,
    status: 'pending'
  };
  
  saveData(data);
  return requestId;
}

// Update request status
function updateRequestStatus(requestId, status) {
  const data = loadData();
  
  if (data.requests[requestId]) {
    data.requests[requestId].status = status;
    
    // Update user and wallet records
    const request = data.requests[requestId];
    if (data.users[request.userId]) {
      data.users[request.userId].status = status;
    }
    if (data.wallets[request.walletAddress.toLowerCase()]) {
      data.wallets[request.walletAddress.toLowerCase()].status = status;
    }
    
    saveData(data);
    return true;
  }
  
  return false;
}

// Get pending requests
function getPendingRequests() {
  const data = loadData();
  return Object.values(data.requests).filter(req => req.status === 'pending');
}

// Get request statistics
function getStats() {
  const data = loadData();
  const total = Object.keys(data.requests).length;
  const pending = Object.values(data.requests).filter(req => req.status === 'pending').length;
  const completed = Object.values(data.requests).filter(req => req.status === 'completed').length;
  
  return {
    total,
    pending,
    completed
  };
}

module.exports = {
  hasUserRequested,
  hasWalletBeenUsed,
  recordRequest,
  updateRequestStatus,
  getPendingRequests,
  getStats
}; 