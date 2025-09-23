# Fulbito - Frontend

Modern React frontend for the Fulbito football field reservation application.

## 🚀 Features

- **Modern Welcome Page**: Clean, responsive design with Spanish UI text
- **Brand Colors**: Primary brand color #1b9c3f integrated throughout
- **Responsive Design**: Mobile-first approach with Flexbox/Grid layouts
- **Reusable Components**: Modular component architecture
- **Accessibility**: Proper semantic HTML and focus management
- **Modern CSS**: CSS custom properties, animations, and modern features

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Button.jsx       # Modern button component with variants
│   ├── Button.css       # Button styles with ripple effects
│   └── index.js         # Component exports
├── pages/               # Page components
│   ├── WelcomePage.jsx  # Main welcome/landing page
│   ├── WelcomePage.css  # Welcome page styles
│   └── index.js         # Page exports
├── hooks/               # Custom React hooks (for future use)
├── assets/              # Static assets
├── App.jsx              # Main app component
├── App.css              # App-level styles
├── index.css            # Global styles and CSS variables
└── main.jsx             # App entry point
```

## 🎨 Design System

### Brand Colors

- **Primary**: #1b9c3f (Fulbito green)
- **Primary Dark**: #168a37 (Hover states)
- **Primary Light**: #e8f5e8 (Backgrounds)

### Typography

- **Font Family**: System font stack for optimal performance
- **Headings**: Various weights from 600-900
- **Body Text**: Regular weight with good contrast ratios

### Components

#### Button Component

- **Variants**: Primary, Secondary, Outline
- **Sizes**: Small, Medium, Large
- **Features**: Hover effects, ripple animation, focus states
- **Accessibility**: Proper ARIA support and keyboard navigation

#### FormField Component

- **Validation**: Built-in error handling and display
- **Accessibility**: Proper labeling and ARIA attributes
- **Types**: Support for all HTML input types
- **Features**: Required field indicators, placeholder support

#### UserTypeToggle Component

- **User Types**: Player (Jugador) and Company (Empresa) selection
- **Design**: Card-based selection with icons and descriptions
- **Accessibility**: Proper ARIA states and keyboard navigation

#### Welcome Page

- **Hero Section**: Brand logo, title, and description
- **Action Buttons**: Login and Register CTAs
- **Responsive**: Optimized for all screen sizes

#### Registration Page

- **Dual Forms**: Separate forms for players and companies
- **Validation**: Comprehensive client-side validation
- **User Experience**: Progressive disclosure based on user type
- **Security**: Password confirmation and proper input types

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start development server:

   ```bash
   npm run dev
   ```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## 📱 Responsive Breakpoints

- **Mobile**: < 480px
- **Tablet**: 481px - 768px
- **Desktop**: > 768px

## ♿ Accessibility

- Semantic HTML structure
- Proper heading hierarchy
- Focus management
- High contrast mode support
- Reduced motion preferences
- Screen reader friendly

## 🔮 Future Enhancements

- React Router for navigation
- Authentication pages (Login/Register)
- Field search and booking components
- User dashboard
- Payment integration
- Progressive Web App features

## 🤝 Contributing

Follow React best practices:

- Use functional components with hooks
- Implement proper prop validation
- Write descriptive comments in English
- Use Spanish for user-facing text
- Follow the established folder structure
- Maintain responsive design principles

---

## Tech Stack

This project uses:

- **React 19** with functional components and hooks
- **Vite 7** for fast development and building
- **ESLint** for code quality
- **Modern CSS** with custom properties and Grid/Flexbox
