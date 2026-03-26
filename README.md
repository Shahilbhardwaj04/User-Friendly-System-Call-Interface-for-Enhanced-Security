# 🖥️ OS System Call Interface

An interactive and user-friendly web-based interface that simulates an Operating System (OS) terminal with role-based login, command execution, and permission management.

## 🚀 Features

- 🔐 **Secure Login** with Username, Email, Password & OTP verification via EmailJS  
- 👤 **Role-Based Access**: Supports **Admin**, **User**, and **Guest** roles
- 💬 **Command Execution**:
  - Basic commands (`ls`, `pwd`, `ps`, etc.) available to all users
  - Advanced system call commands based on user permissions (e.g., `fork`, `exec`, `mmap`)
- ⚙️ **Admin Controls**:
  - Add or remove users
  - Change permissions (basic and command-based)
- 📊 **System Monitoring** (CPU, Memory, Disk usage - simulated)
- 💡 **Command Search with Suggestions**
- 🛡️ **Security Features**:
  - OTP-based login verification
  - Inactivity logout
  - Right-click disabled

## 📁 Project Structure

```
📁 OS-System-Call-Interface
├── index.html         # Main HTML structure
├── styles.css         # Styling with dark terminal theme
└── script.js          # Full application logic including login, command processing, and admin features
```

## ⚙️ Technologies Used

- HTML5, CSS3, JavaScript
- Font Awesome for Icons
- EmailJS for OTP Email Verification

## 🔐 Default Users

You can log in using the following default credentials:

| Username | Password  | Role  |
|----------|-----------|-------|
| admin    | admin123  | Admin |
| user1    | user123   | User  |
| user2    | user456   | User  |

## 📦 Setup Instructions

1. **Clone or Download** this repository.
2. Open `index.html` in any modern browser.
3. Use one of the default users to log in or sign up as a new user (admin-only).
4. OTP email verification will be sent via EmailJS – configure your own EmailJS account for full functionality.

### 📧 EmailJS Setup

To enable OTP email verification:
- Replace the placeholder values in `script.js`:
  ```js
  const EMAILJS_CONFIG = {
      serviceId: 'your_service_id',
      templateId: 'your_template_id',
      publicKey: 'your_public_key'
  };
  ```
- Set up the corresponding EmailJS template and service.

## 📝 Future Improvements

- Backend integration for real system call execution
- Persistent user data using database (e.g., Firebase or MongoDB)
- Multi-language support
- Mobile UI enhancements

## 👨‍💻 Author

Developed by **Shahil Bhardwaj | Sahil Ansari | Biprant**
# User-Friendly-System-Call-Interface-Enhanced-Security
# User-Friendly-System-Call-Interface-Enhanced-Security
