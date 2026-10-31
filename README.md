# 🔐 Login System

A responsive, accessible sign-in page with real-time form validation, a live password strength meter, and a simulated authentication flow. Built with vanilla HTML, CSS, and JavaScript, with no frameworks or dependencies.

🔗 **Live Demo:** https://internlogpage.netlify.app/

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

<!-- Add a screenshot: ![Login page preview](screenshot.png) -->

## ✨ Features

### Validation
- Email validation with clear messages (`Email is required`, `Enter a valid email like name@company.com`)
- Password minimum of 8 characters with a live checklist for uppercase, lowercase, number, and symbol
- Errors appear only after a field is touched (on `blur`) or on submit, never on page load
- Submit button stays disabled until the form is valid
- First invalid field is auto-focused on a failed submit

### Password experience
- 4-level strength meter (Weak / Fair / Good / Strong), color-coded with an animated bar
- Show/hide password toggle inside the input
- Caps Lock warning under the password field

### Sign-in flow
- Simulated 1.5s API call with a loading spinner and "Signing in..." state
- Success and error banners for valid and invalid credentials
- "Remember me" stores the email in `localStorage` (the password is never stored)
- Form locks for 30 seconds after 5 failed attempts, with a live countdown
- Enter key submits the form
- "Continue with Google / GitHub" buttons with an "or continue with" divider

### Design
- Dark navy theme with optional light/dark toggle via CSS variables and `prefers-color-scheme`
- Smooth transitions, error slide/fade animations, and a subtle shake on invalid submit
- Mobile-first layout that works from 320px upward (`min-height: 100dvh`)

### Accessibility
- Proper `<label for>`, `aria-invalid`, `aria-describedby`, and `role="alert"` on errors
- Full keyboard navigation with visible `:focus-visible` rings
- 4.5:1 contrast targets and `prefers-reduced-motion` support
- Correct `autocomplete` attributes and input types

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, flexbox, animations) |
| Logic | Vanilla JavaScript (ES6+) |

## 🚀 Getting Started

No build step or installation is needed.

```bash
# Clone the repository
git clone https://github.com/zaidshaikh5301/login-system.git

# Move into the project folder
cd login-system
```

Then open `index.html` in your browser, or serve it locally with the VS Code **Live Server** extension (default: `http://localhost:5500`).

## 🧪 Demo Credentials

This project uses a mock login, so there is no real backend.

| Field | Value |
|-------|-------|
| Email | `user@company.com` |
| Password | `Password123!` |

Any other combination shows the error banner. After 5 failed attempts the form locks for 30 seconds.

## 📁 Project Structure

```
login-system/
├── index.html    # Page markup
├── style.css     # Styles, theming, and animations
├── script.js     # Validation, UI updates, and submit handling
├── favicon.svg   # Site icon
├── SPEC.md       # Design and behavior specification
└── README.md
```

## 🔒 Security Note

This is a front-end demo. Credentials are checked in the browser against mock values, so it must not be used as real authentication. For production, validate credentials on a server and never store passwords client-side.

## 🗺️ Future Improvements

- Connect to a real backend (Node/Express or PHP + MySQL) with hashed passwords
- Add Sign Up and Forgot Password pages
- Add JWT or session-based authentication

## 👤 Author

**Zaid Shaikh**
GitHub: [@zaidshaikh5301](https://github.com/zaidshaikh5301)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
