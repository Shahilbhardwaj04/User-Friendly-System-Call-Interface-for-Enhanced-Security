// Login functionality
const loginForm = document.getElementById('loginForm');
const loginContainer = document.getElementById('loginContainer');
const systemInterface = document.getElementById('systemInterface');
const logoutBtn = document.getElementById('logoutBtn');
const roleButtons = document.querySelectorAll('.role-btn');
const currentUserSpan = document.getElementById('currentUser');
const userRoleSpan = document.getElementById('userRole');
const adminSection = document.getElementById('adminSection');

// Add these new variables at the top of the file
const commandSearch = document.getElementById('commandSearch');
const commandSuggestions = document.getElementById('commandSuggestions');
const quickCommands = document.getElementById('quickCommands');

// User roles and permissions
const roles = {
    admin: {
        commands: ['ls', 'pwd', 'ps', 'netstat', 'top', 'users', 'useradd', 'userdel', 'chmod'],
        canManageUsers: true,
        canModifySystem: true
    },
    user: {
        commands: ['ls', 'pwd', 'ps', 'netstat', 'top', 'users'],
        canManageUsers: false,
        canModifySystem: false
    },
    guest: {
        commands: ['ls', 'pwd', 'ps'],
        canManageUsers: false,
        canModifySystem: false
    }
};

// User database with command permissions
let users = {
    'admin': {
        password: 'admin123',
        role: 'admin',
        email: 'shahilbhardwaj04@gmail.com',
        permissions: ['read', 'write', 'execute'],
        commandPermissions: {
            processControl: true,
            directoryManagement: true,
            ipc: true,
            deviceManagement: true,
            infoMaintenance: true,
            memoryManagement: true
        }
    },
    'user1': {
        password: 'user123',
        role: 'user',
        email: 'shahilbhardwaj04@gmail.com',
        permissions: ['read'],
        commandPermissions: {
            processControl: false,
            directoryManagement: true,
            ipc: false,
            deviceManagement: false,
            infoMaintenance: true,
            memoryManagement: false
        }
    },
    'user2': {
        password: 'user456',
        role: 'user',
        email: 'shahilbhardwaj04@gmail.com', // Another user email
        permissions: ['read', 'write']
    }
};

// Basic commands that all users should have access to
const basicCommands = ['ls', 'pwd', 'ps', 'netstat', 'top', 'users'];

// Command categories
const commandCategories = {
    basic: basicCommands,
    processControl: ['fork', 'exec', 'wait', 'exit', 'getpid', 'getppid', 'nice'],
    directoryManagement: ['mkdir', 'rmdir', 'chdir', 'getcwd', 'opendir', 'readdir', 'closedir'],
    ipc: ['pipe', 'shmget', 'shmat', 'shmdt', 'msgget', 'msgsnd', 'msgrcv', 'semget', 'semop', 'socket', 'bind', 'connect', 'send', 'recv', 'listen', 'accept'],
    deviceManagement: ['ioctl', 'mknod', 'read', 'write'],
    infoMaintenance: ['gettimeofday', 'time', 'uname', 'getrlimit', 'setrlimit', 'sysinfo'],
    memoryManagement: ['brk', 'sbrk', 'mmap', 'munmap', 'mprotect', 'mlock', 'munlock']
};

let currentRole = 'user';
let currentUser = null;

// Role selection
roleButtons.forEach(button => {
    button.addEventListener('click', () => {
        roleButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentRole = button.dataset.role;
    });
});

// EmailJS Configuration
const EMAILJS_CONFIG = {
    serviceId: 'service_srpjong', // Your EmailJS service ID
    templateId: 'template_9gi99ps', // Your EmailJS template ID
    publicKey: '-vRSLmDmf-X8-mkDd' // Your EmailJS public key
};

// Function to send OTP via EmailJS
async function sendOTP(email) {
    try {
        const otp = generateOTP();
        storedOtp = otp;
        
        const templateParams = {
            to_email: email,
            from_name: 'OS System',
            otp_code: otp,
            message: `Your verification code is: ${otp}\nThis code will expire in 5 minutes.`
        };

        // Send email using EmailJS
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            EMAILJS_CONFIG.templateId,
            templateParams,
            EMAILJS_CONFIG.publicKey
        );
        
        console.log('Email sent successfully:', response);
        return true;
    } catch (error) {
        console.error('Error sending OTP:', error);
        // Log specific error details
        if (error.text) {
            console.error('EmailJS Error:', error.text);
        }
        return false;
    }
}

// Login form submission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (currentRole === 'guest') {
        currentUser = 'guest';
        loginContainer.style.display = 'none';
        systemInterface.style.display = 'block';
        systemInterface.classList.add('guest-mode');
        
        currentUserSpan.textContent = 'guest';
        userRoleSpan.textContent = 'guest';
        
        adminSection.style.display = 'none';
        
        updateQuickCommands();
        startSystemMonitoring();
        return;
    }

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Validate credentials
    if (users[username] && users[username].password === password) {
        // Check if the provided email matches the stored email
        if (users[username].email === email) {
            currentUser = username;
            currentRole = users[username].role;
            
            try {
                // Show loading state
                const loginBtn = loginForm.querySelector('button[type="submit"]');
                loginBtn.disabled = true;
                loginBtn.textContent = 'Sending OTP...';
                
                // Send OTP and show verification modal
                const success = await sendOTP(email);
                
                // Reset button state
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
                
                if (success) {
                    showOTPModal(email);
                } else {
                    alert('Failed to send OTP. Please check your internet connection and try again. If the problem persists, contact support.');
                }
            } catch (error) {
                console.error('Error in OTP process:', error);
                alert('An error occurred while sending the OTP. Please try again later.');
            }
        } else {
            alert('Email does not match the registered email for this user.');
        }
    } else {
        alert('Invalid username or password. Please try again.');
    }
});

// Logout functionality
logoutBtn.addEventListener('click', () => {
    systemInterface.style.display = 'none';
    loginContainer.style.display = 'flex';
    loginForm.reset();
    currentUser = null;
    stopSystemMonitoring();
});

// Command execution
const commandInput = document.getElementById('commandInput');
const executeBtn = document.getElementById('executeBtn');
const commandOutput = document.getElementById('commandOutput');

executeBtn.addEventListener('click', () => {
    const command = commandInput.value.trim();
    if (command) {
        executeCommand(command);
        commandInput.value = '';
    }
});

commandInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const command = commandInput.value.trim();
        if (command) {
            executeCommand(command);
            commandInput.value = '';
        }
    }
});

// System monitoring
let monitoringInterval;

function startSystemMonitoring() {
    updateSystemInfo();
    monitoringInterval = setInterval(updateSystemInfo, 2000);
}

function stopSystemMonitoring() {
    clearInterval(monitoringInterval);
}

function updateSystemInfo() {
    // CPU Usage
    const cpuProgress = document.getElementById('cpuProgress');
    const cpuValue = document.getElementById('cpuValue');
    const cpuUsage = Math.floor(Math.random() * 100); // Replace with actual CPU usage
    cpuProgress.style.width = `${cpuUsage}%`;
    cpuValue.textContent = `${cpuUsage}%`;

    // Memory Usage
    const memoryProgress = document.getElementById('memoryProgress');
    const memoryValue = document.getElementById('memoryValue');
    const memoryUsage = Math.floor(Math.random() * 100); // Replace with actual memory usage
    memoryProgress.style.width = `${memoryUsage}%`;
    memoryValue.textContent = `${memoryUsage}%`;

    // Disk Usage
    const diskProgress = document.getElementById('diskProgress');
    const diskValue = document.getElementById('diskValue');
    const diskUsage = Math.floor(Math.random() * 100); // Replace with actual disk usage
    diskProgress.style.width = `${diskUsage}%`;
    diskValue.textContent = `${diskUsage}%`;
}

// Function to check if user has permission for a command
function hasCommandPermission(user, command) {
    if (user.role === 'admin') return true;
    
    // Check basic commands first
    if (basicCommands.includes(command)) return true;
    
    // Check other command categories
    for (const [category, commands] of Object.entries(commandCategories)) {
        if (category !== 'basic' && commands.includes(command) && user.commandPermissions[category]) {
            return true;
        }
    }
    return false;
}

// Update the executeCommand function
function executeCommand(command) {
    const userRole = currentRole;
    const user = users[currentUser];
    
    if (!user || !hasCommandPermission(user, command)) {
        commandOutput.querySelector('pre').textContent = `Error: Command '${command}' not allowed for ${userRole} role.`;
        return;
    }

    let output = '';
    
    switch(command) {
        case 'ls':
            output = 'Directory Contents:\n' +
                    'drwxr-xr-x 2 user user 4096 Mar 20 10:30 Documents\n' +
                    'drwxr-xr-x 2 user user 4096 Mar 20 09:15 Downloads\n' +
                    '-rw-r--r-- 1 user user  512 Mar 20 08:30 file.txt';
            break;
        case 'pwd':
            output = '/home/' + (currentUser || 'guest');
            break;
        case 'ps':
            output = 'Process List:\n' +
                    'PID\tUSER\t\tCOMMAND\n' +
                    '1234\t' + (currentUser || 'guest') + '\t\tchrome\n' +
                    '5678\t' + (currentUser || 'guest') + '\t\tnode\n' +
                    '9012\t' + (currentUser || 'guest') + '\t\tbash';
            break;
        case 'netstat':
            output = 'Network Connections:\n' +
                    'Proto\tLocal Address\t\tForeign Address\t\tState\n' +
                    'tcp\t0.0.0.0:80\t\t0.0.0.0:0\t\tLISTEN\n' +
                    'tcp\t192.168.1.100:443\t\t1.1.1.1:443\t\tESTABLISHED';
            break;
        case 'top':
            output = 'System Resources:\n' +
                    'CPU: 25% used\n' +
                    'Memory: 4.2GB/8GB used\n' +
                    'Swap: 0B/2GB used';
            break;
        case 'users':
            output = 'Active Users:\n' +
                    'USER\tTTY\t\tFROM\t\tLOGIN@\n' +
                    (currentUser || 'guest') + '\ttty1\t\t:0\t\t10:30\n' +
                    'user1\ttty2\t\t:1\t\t09:15';
            break;
        case 'useradd':
            if (userRole === 'admin') {
                output = 'User added successfully.';
            } else {
                output = 'Error: Permission denied. Only admin can add users.';
            }
            break;
        case 'userdel':
            if (userRole === 'admin') {
                output = 'User deleted successfully.';
            } else {
                output = 'Error: Permission denied. Only admin can delete users.';
            }
            break;
        case 'chmod':
            if (userRole === 'admin') {
                output = 'Permissions changed successfully.';
            } else {
                output = 'Error: Permission denied. Only admin can change permissions.';
            }
            break;
        case 'fork':
            output = 'Process forked successfully. New PID: 1234';
            break;
        case 'exec':
            output = 'Process executed successfully.';
            break;
        case 'wait':
            output = 'Process waited successfully.';
            break;
        case 'exit':
            output = 'Process exited successfully.';
            break;
        case 'getpid':
            output = `Current process ID: ${Math.floor(Math.random() * 10000)}`;
            break;
        case 'getppid':
            output = `Parent process ID: ${Math.floor(Math.random() * 10000)}`;
            break;
        case 'nice':
            output = 'Process priority changed successfully.';
            break;
        default:
            output = `Command not found: ${command}`;
    }

    commandOutput.querySelector('pre').textContent = output;
}

// Quick command buttons
const commandButtons = document.querySelectorAll('.command-btn');
commandButtons.forEach(button => {
    button.addEventListener('click', () => {
        const command = button.dataset.command;
        executeCommand(command);
    });
});

// Admin command buttons
const adminButtons = document.querySelectorAll('.admin-btn');
adminButtons.forEach(button => {
    button.addEventListener('click', () => {
        const command = button.dataset.command;
        executeCommand(command);
    });
});

// Security features
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && systemInterface.style.display !== 'none') {
        logoutBtn.click();
    }
});

// Prevent right-click
document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// Auto-logout after 5 minutes of inactivity
let inactivityTimer;
const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (systemInterface.style.display !== 'none') {
            logoutBtn.click();
            alert('Session expired due to inactivity.');
        }
    }, INACTIVITY_TIMEOUT);
}

document.addEventListener('mousemove', resetInactivityTimer);
document.addEventListener('keydown', resetInactivityTimer);
document.addEventListener('click', resetInactivityTimer);

// Command database with descriptions
const commandDatabase = {
    ls: {
        description: 'List directory contents',
        shortcut: 'ls',
        roles: ['guest', 'user', 'admin']
    },
    pwd: {
        description: 'Print working directory',
        shortcut: 'pwd',
        roles: ['guest', 'user', 'admin']
    },
    ps: {
        description: 'Display process status',
        shortcut: 'ps',
        roles: ['guest', 'user', 'admin']
    },
    netstat: {
        description: 'Network statistics',
        shortcut: 'netstat',
        roles: ['user', 'admin']
    },
    top: {
        description: 'Display system resources',
        shortcut: 'top',
        roles: ['user', 'admin']
    },
    users: {
        description: 'Show logged in users',
        shortcut: 'users',
        roles: ['user', 'admin']
    },
    useradd: {
        description: 'Add a new user',
        shortcut: 'useradd',
        roles: ['admin']
    },
    userdel: {
        description: 'Delete a user',
        shortcut: 'userdel',
        roles: ['admin']
    },
    chmod: {
        description: 'Change file permissions',
        shortcut: 'chmod',
        roles: ['admin']
    }
};

// Add command search functionality
commandSearch.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const suggestions = Object.entries(commandDatabase)
        .filter(([cmd, info]) => 
            cmd.includes(searchTerm) && 
            info.roles.includes(currentRole)
        )
        .map(([cmd, info]) => `
            <div class="suggestion-item" data-command="${cmd}">
                <div class="command-name">${cmd}</div>
                <div class="command-desc">${info.description}</div>
            </div>
        `)
        .join('');

    commandSuggestions.innerHTML = suggestions;
    commandSuggestions.classList.toggle('active', suggestions.length > 0);
});

commandSuggestions.addEventListener('click', (e) => {
    const suggestionItem = e.target.closest('.suggestion-item');
    if (suggestionItem) {
        const command = suggestionItem.dataset.command;
        commandInput.value = command;
        commandSuggestions.classList.remove('active');
    }
});

// Add function to update quick commands based on role
function updateQuickCommands() {
    const allowedCommands = roles[currentRole].commands;
    const commandsHTML = allowedCommands
        .map(cmd => {
            const info = commandDatabase[cmd];
            return `
                <button class="command-btn" data-command="${cmd}">
                    ${cmd}
                    <span class="command-shortcut">${info.shortcut}</span>
                </button>
            `;
        })
        .join('');
    
    quickCommands.innerHTML = commandsHTML;
    
    // Add event listeners to new command buttons
    quickCommands.querySelectorAll('.command-btn').forEach(button => {
        button.addEventListener('click', () => {
            const command = button.dataset.command;
            executeCommand(command);
        });
    });
}

// Add event listener to close suggestions when clicking outside
document.addEventListener('click', (e) => {
    if (!commandSearch.contains(e.target) && !commandSuggestions.contains(e.target)) {
        commandSuggestions.classList.remove('active');
    }
});

// Add User Modal Functionality
const addUserBtn = document.getElementById('addUserBtn');
const addUserModal = document.getElementById('addUserModal');
const closeModal = document.querySelector('.close-modal');
const addUserForm = document.getElementById('addUserForm');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const passwordStrength = document.getElementById('passwordStrength');

// Open modal when Add User button is clicked
addUserBtn.addEventListener('click', () => {
    addUserModal.classList.add('active');
});

// Close modal when close button is clicked
closeModal.addEventListener('click', () => {
    addUserModal.classList.remove('active');
});

// Close modal when clicking outside the modal content
addUserModal.addEventListener('click', (e) => {
    if (e.target === addUserModal) {
        addUserModal.classList.remove('active');
    }
});

// Close modal when cancel button is clicked
document.querySelector('.cancel-btn').addEventListener('click', () => {
    addUserModal.classList.remove('active');
});

// Password strength indicator
newPasswordInput.addEventListener('input', () => {
    const password = newPasswordInput.value;
    let strength = 'weak';
    
    if (password.length >= 8) {
        if (password.match(/[a-z]/) && password.match(/[A-Z]/) && password.match(/[0-9]/) && password.match(/[^a-zA-Z0-9]/)) {
            strength = 'strong';
        } else if (password.match(/[a-z]/) && password.match(/[A-Z]/) && password.match(/[0-9]/)) {
            strength = 'medium';
        }
    }
    
    passwordStrength.className = 'password-strength ' + strength;
});

// Update the add user form submission
addUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('newUsername').value;
    const password = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('userRole').value;
    const email = document.getElementById('newEmail').value;
    const permissions = Array.from(document.querySelectorAll('input[name="permissions"]:checked'))
        .map(checkbox => checkbox.value);
    
    // Get command permissions
    const commandPermissions = {};
    Object.keys(commandCategories).forEach(category => {
        if (category !== 'basic') { // Skip basic commands as they're always allowed
            commandPermissions[category] = document.getElementById(`command_${category}`).checked;
        }
    });

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (users[username]) {
        alert('Username already exists!');
        return;
    }

    users[username] = {
        password,
        role,
        email,
        permissions,
        commandPermissions
    };

    alert('User added successfully!');
    addUserModal.classList.remove('active');
    updateUsersList();
});

// Function to update users list in admin interface
function updateUsersList() {
    const commandOutput = document.getElementById('commandOutput');
    let usersList = '\nCurrent Users:\n';
    for (const [username, userData] of Object.entries(users)) {
        usersList += `- ${username} (${userData.role}) [${userData.permissions.join(', ')}]\n`;
    }
    commandOutput.querySelector('pre').textContent += usersList;
}

// Remove User Functionality
const removeUserBtn = document.querySelector('[data-command="userdel"]');
const removeUserModal = document.getElementById('removeUserModal');
const removeUserForm = document.getElementById('removeUserForm');
const removeUsernameSelect = document.getElementById('removeUsername');
const confirmRemoveInput = document.getElementById('confirmRemove');

// Open remove user modal
removeUserBtn.addEventListener('click', () => {
    // Populate the user select dropdown
    populateRemoveUserSelect();
    removeUserModal.classList.add('active');
});

// Close remove user modal
removeUserModal.querySelector('.close-modal').addEventListener('click', () => {
    removeUserModal.classList.remove('active');
});

// Close modal when clicking outside
removeUserModal.addEventListener('click', (e) => {
    if (e.target === removeUserModal) {
        removeUserModal.classList.remove('active');
    }
});

// Close modal when cancel button is clicked
removeUserModal.querySelector('.cancel-btn').addEventListener('click', () => {
    removeUserModal.classList.remove('active');
});

// Function to populate the remove user select dropdown
function populateRemoveUserSelect() {
    // Clear existing options
    removeUsernameSelect.innerHTML = '';
    
    // Add a default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a user to remove';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    removeUsernameSelect.appendChild(defaultOption);
    
    // Add users to the dropdown (excluding the current admin user)
    for (const [username, userData] of Object.entries(users)) {
        if (username !== 'admin') { // Don't allow removing the admin user
            const option = document.createElement('option');
            option.value = username;
            // Show more details about the user
            option.textContent = `${username} (${userData.role}) - Permissions: ${userData.permissions.join(', ')}`;
            removeUsernameSelect.appendChild(option);
        }
    }
    
    // If no users to remove, show a message
    if (removeUsernameSelect.options.length === 1) {
        const noUsersOption = document.createElement('option');
        noUsersOption.value = '';
        noUsersOption.textContent = 'No users available to remove';
        noUsersOption.disabled = true;
        removeUsernameSelect.appendChild(noUsersOption);
    }
}

// Handle remove user form submission
removeUserForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = removeUsernameSelect.value;
    const confirmText = confirmRemoveInput.value.trim();
    
    // Check if a user is selected
    if (!username) {
        alert('Please select a user to remove');
        return;
    }
    
    // Validate confirmation text
    if (confirmText !== 'DELETE') {
        alert('Please type "DELETE" to confirm user removal');
        return;
    }
    
    // Prevent removing admin user
    if (username === 'admin') {
        alert('Cannot remove admin user');
        return;
    }
    
    // Get user details before removal
    const userDetails = users[username];
    
    // Remove the user
    delete users[username];
    
    // Reset form and close modal
    removeUserForm.reset();
    removeUserModal.classList.remove('active');
    
    // Show success message with details
    alert(`User "${username}" (${userDetails.role}) removed successfully!`);
    
    // Update the command output with more details
    const commandOutput = document.getElementById('commandOutput');
    commandOutput.querySelector('pre').textContent += `\nUser "${username}" removed successfully.\n` +
        `Details of removed user:\n` +
        `- Username: ${username}\n` +
        `- Role: ${userDetails.role}\n` +
        `- Permissions: ${userDetails.permissions.join(', ')}\n`;
    
    // Update the users list
    updateUsersList();
});

// Change Permissions Functionality
const changePermissionsBtn = document.querySelector('[data-command="chmod"]');
const changePermissionsModal = document.getElementById('changePermissionsModal');
const changePermissionsForm = document.getElementById('changePermissionsForm');
const permissionUsernameSelect = document.getElementById('permissionUsername');
const currentPermissionsDisplay = document.getElementById('currentPermissions');

// Open change permissions modal
changePermissionsBtn.addEventListener('click', () => {
    // Populate the user select dropdown
    populatePermissionUserSelect();
    changePermissionsModal.classList.add('active');
});

// Close change permissions modal
changePermissionsModal.querySelector('.close-modal').addEventListener('click', () => {
    changePermissionsModal.classList.remove('active');
});

// Close modal when clicking outside
changePermissionsModal.addEventListener('click', (e) => {
    if (e.target === changePermissionsModal) {
        changePermissionsModal.classList.remove('active');
    }
});

// Close modal when cancel button is clicked
changePermissionsModal.querySelector('.cancel-btn').addEventListener('click', () => {
    changePermissionsModal.classList.remove('active');
});

// Update the change permissions form
function populatePermissionUserSelect() {
    const select = document.getElementById('permissionUsername');
    select.innerHTML = '<option value="">Select a user</option>';
    
    Object.keys(users).forEach(username => {
        if (username !== 'admin') {
            const option = document.createElement('option');
            option.value = username;
            option.textContent = username;
            select.appendChild(option);
        }
    });
}

// Update the change permissions form submission
changePermissionsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('permissionUsername').value;
    const permissions = Array.from(document.querySelectorAll('input[name="permissions"]:checked'))
        .map(checkbox => checkbox.value);
    
    // Get command permissions
    const commandPermissions = {};
    Object.keys(commandCategories).forEach(category => {
        if (category !== 'basic') { // Skip basic commands as they're always allowed
            commandPermissions[category] = document.getElementById(`command_${category}`).checked;
        }
    });

    if (users[username]) {
        users[username].permissions = permissions;
        users[username].commandPermissions = commandPermissions;
        alert('Permissions updated successfully!');
        changePermissionsModal.classList.remove('active');
    }
});

// Email OTP Verification
const otpModal = document.getElementById('otpModal');
const otpForm = document.getElementById('otpForm');
const otpInput = document.getElementById('otp');
const resendOtpBtn = document.getElementById('resendOtp');
const emailDisplay = document.getElementById('emailDisplay');
const countdownDisplay = document.getElementById('countdown');
let otpTimer;
let currentEmail = '';
let storedOtp = '';

// Function to generate a 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to start OTP countdown timer
function startOTPTimer() {
    let timeLeft = 60;
    resendOtpBtn.disabled = true;
    
    otpTimer = setInterval(() => {
        timeLeft--;
        countdownDisplay.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(otpTimer);
            resendOtpBtn.disabled = false;
        }
    }, 1000);
}

// Function to show OTP modal
function showOTPModal(email) {
    currentEmail = email;
    emailDisplay.textContent = email;
    otpModal.classList.add('active');
    startOTPTimer();
}

// Function to hide OTP modal
function hideOTPModal() {
    otpModal.classList.remove('active');
    clearInterval(otpTimer);
    otpInput.value = '';
}

// Add OTP input validation
otpInput.addEventListener('input', (e) => {
    // Only allow numeric input
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    // Limit to 6 digits
    if (e.target.value.length > 6) {
        e.target.value = e.target.value.slice(0, 6);
    }
});

// Update OTP form submission with better error handling
otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const enteredOtp = otpInput.value;
    
    if (enteredOtp.length !== 6) {
        alert('Please enter a valid 6-digit OTP code.');
        return;
    }
    
    if (enteredOtp === storedOtp) {
        hideOTPModal();
        // Proceed with login
        loginContainer.style.display = 'none';
        systemInterface.style.display = 'block';
        systemInterface.classList.remove('guest-mode');
        
        currentUserSpan.textContent = currentUser;
        userRoleSpan.textContent = currentRole;
        
        adminSection.style.display = currentRole === 'admin' ? 'block' : 'none';
        
        updateQuickCommands();
        startSystemMonitoring();
        
        // Clear the login form
        loginForm.reset();
    } else {
        alert('Invalid OTP. Please try again.');
        otpInput.value = '';
        otpInput.focus();
    }
});

// Add error handling for resend OTP
resendOtpBtn.addEventListener('click', async () => {
    try {
        // Show loading state
        resendOtpBtn.disabled = true;
        resendOtpBtn.textContent = 'Sending...';
        
        const success = await sendOTP(currentEmail);
        
        if (success) {
            startOTPTimer();
            alert('New OTP has been sent to your email.');
        } else {
            alert('Failed to send OTP. Please try again later.');
        }
    } catch (error) {
        console.error('Error resending OTP:', error);
        alert('An error occurred while resending the OTP. Please try again later.');
    } finally {
        // Reset button state
        resendOtpBtn.disabled = false;
        resendOtpBtn.textContent = 'Resend Code';
    }
});

// Close OTP modal
otpModal.querySelector('.close-modal').addEventListener('click', hideOTPModal);
otpModal.querySelector('.cancel-btn').addEventListener('click', hideOTPModal); 