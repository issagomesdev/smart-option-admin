# 📊 Smart Option — Admin Panel for Telegram Finance Bot

![Next.js](https://img.shields.io/badge/Next.js-13.x-black?style=for-the-badge&logo=next.js&logoColor=white) 
![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react&logoColor=white) 
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-%23007ACC?style=for-the-badge&logo=typescript&logoColor=white) 
![MUI](https://img.shields.io/badge/MUI-5.x-007FFF?style=for-the-badge&logo=mui&logoColor=white) 
![JWT](https://img.shields.io/badge/JWT-Auth-%2300A7E1?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

<p align="center">
  <a href="#about">About</a> •
  <a href="#features">Features</a> •
  <a href="#technologies">Technologies</a> •
  <a href="#structure">Structure</a> •
  <a href="#routes">Routes</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#related-projects">Related Projects</a>
</p>

Admin dashboard for **Smart Option**, a Telegram finance bot platform. Built with **Next.js**, **React**, and **Material UI**, it enables full management of users, financial balances, affiliate networks, and support requests.

Features include user registration and editing, balance transfers, detailed financial transaction history, affiliate network visualization with multiple levels, and request management (withdrawals, deposits, etc).

This panel connects via RESTful API to the backend Node.js services powering the Telegram bot and financial operations.

💻 Try the Telegram Bot live demo: [Smart Option Bot on Telegram](https://web.telegram.org/k/#@smartoptionea_bot)

> ⚠️ **Important Notice:**  
> This is a demonstration version intended for testing and preview purposes only.  
> **Do not perform real transactions or payments.**  
> The creator is **not responsible** for any real financial operations made using this demo.

<h2 id="about">📌 About</h2>

**Smart Option Admin Panel** is a comprehensive management dashboard built with **Next.js + React + TypeScript** and **Material UI**. It enables administrators to efficiently manage users, monitor financial transactions, handle withdrawal and deposit requests, and oversee the affiliate network of the **Smart Option** Telegram finance bot platform.

This panel works seamlessly with the backend API that powers the Telegram bot, providing a powerful interface to control and analyze platform activity.

The main Telegram Bot repository is available at [Smart Option Telegram Bot](https://github.com/issagomesdev/smart-option).

<h2 id="features">✨ Features</h2>

- Display real-time metrics on users, transactions, and balances  
- Manage users: view, edit, delete, and transfer balances  
- Track transactions and withdrawal requests in detail  
- Visualize affiliate network with multi-level hierarchy  
- Filter and paginate user and transaction data  
- Offer a responsive UI built with Material UI  
- Integrate with backend API for real-time data sync  
- Manage support tickets and user communications

<h2 id="technologies">🛠️ Technologies</h2>

- **Next.js** — React framework for server-side rendering and static site generation  
- **TypeScript** — Typed JavaScript for safer and more maintainable code  
- **Material UI (MUI)** — React component library for consistent and responsive UI  
- **React Context API** — State management across the application  
- **Axios** — HTTP client for API requests  

<h2 id="structure">📁 Structure</h2>

Overview of the main folders and files in the Admin Panel project:

```txt
📁 public/                       # Public assets accessible directly by the browser
 ┗ 📁 images/                    

📁 src/                          # Main source directory
 ┣ 📁 @core/                     # Core reusable components, hooks, context and layouts
 ┃ ┣ 📁 components/              # UI components grouped by feature or type
 ┃ ┃ ┣ 📁 card-statistics/      
 ┃ ┃ ┃ ┣ 📄 types.ts            
 ┃ ┃ ┃ ┗ 📁 card-stats-vertical/ 
 ┃ ┃ ┃     ┗ 📄 index.tsx        
 ┃ ┃ ┣ 📁 react-apexcharts/      
 ┃ ┃ ┃ ┗ 📄 index.tsx            
 ┃ ┃ ┗ 📁 scroll-to-top/         
 ┃ ┃   ┗ 📄 index.tsx            
 ┃ ┣ 📁 context/                 # React Contexts for global state
 ┃ ┃ ┗ 📄 settingsContext.tsx    
 ┃ ┣ 📁 hooks/                   # Custom React hooks
 ┃ ┃ ┗ 📄 useSettings.ts         
 ┃ ┣ 📁 layouts/                 # Layout components for different pages
 ┃ ┃ ┣ 📄 BlankLayout.tsx        
 ┃ ┃ ┣ 📄 VerticalLayout.tsx    
 ┃ ┃ ┣ 📄 types.ts               
 ┃ ┃ ┣ 📄 utils.ts              
 ┃ ┃ ┗ 📁 components/            # Layout-specific components
 ┃ ┃   ┣ 📁 shared-components/   # Shared UI elements like toggler, notifications
 ┃ ┃   ┃ ┣ 📄 ModeToggler.tsx    
 ┃ ┃   ┃ ┣ 📄 NotificationDropdown.tsx  
 ┃ ┃   ┃ ┗ 📄 UserDropdown.tsx   
 ┃ ┃   ┃ ┗ 📁 footer/             # Footer components
 ┃ ┃   ┃   ┣ 📄 FooterContent.tsx
 ┃ ┃   ┃   ┗ 📄 index.tsx
 ┃ ┃   ┗ 📁 vertical/            # Components specific to vertical layout
 ┃ ┃     ┣ 📁 appBar/            
 ┃ ┃     ┃ ┗ 📄 index.tsx        
 ┃ ┃     ┗ 📁 navigation/        # Sidebar navigation components
 ┃ ┃       ┣ 📄 Drawer.tsx       
 ┃ ┃       ┣ 📄 VerticalNavHeader.tsx
 ┃ ┃       ┣ 📄 VerticalNavItems.tsx
 ┃ ┃       ┣ 📄 VerticalNavLink.tsx
 ┃ ┃       ┗ 📄 VerticalNavSectionTitle.tsx

 ┣ 📁 styles/                    # Global CSS and style libraries
 ┃ ┗ 📁 libs/
 ┃   ┣ 📁 react-apexcharts/      # Styles for charts
 ┃   ┃ ┗ 📄 index.ts            
 ┃   ┗ 📁 react-datepicker/      # Styles for datepicker component
 ┃     ┗ 📄 index.ts            

 ┣ 📁 theme/                     # Theme definitions and overrides for MUI
 ┃ ┣ 📄 globalStyles.ts          
 ┃ ┣ 📄 ThemeComponent.tsx       
 ┃ ┣ 📄 ThemeOptions.ts          
 ┃ ┣ 📄 types.ts                
 ┃ ┣ 📁 breakpoints/             # Breakpoint definitions
 ┃ ┣ 📁 overrides/               # Component style overrides (accordion, alerts, buttons, etc)
 ┃ ┣ 📁 palette/                 # Color palette
 ┃ ┣ 📁 shadows/                 # Shadow definitions
 ┃ ┣ 📁 spacing/                 # Spacing scale
 ┃ ┗ 📁 typography/              # Typography settings

 ┣ 📁 utils/                     # Utility functions/helpers
 ┃ ┣ 📄 create-emotion-cache.ts 
 ┃ ┗ 📄 hex-to-rgba.ts           

 ┣ 📁 configs/                   # Configuration files
 ┃ ┗ 📄 themeConfig.ts           

 ┣ 📁 layouts/                   # Page layout components (UserLayout etc)
 ┃ ┣ 📄 UserLayout.tsx           
 ┃ ┗ 📁 components/             
 ┃   ┗ 📄 UserIcon.tsx           

 ┣ 📁 navigation/                # Navigation logic and components
 ┃ ┗ 📁 vertical/                
 ┃   ┗ 📄 index.ts              

 ┣ 📁 pages/                     
 ┃ ┣ 📄 401.tsx                  
 ┃ ┣ 📄 404.tsx                  
 ┃ ┣ 📄 500.tsx                  
 ┃ ┣ 📄 index.tsx               
 ┃ ┣ 📄 _app.tsx                 
 ┃ ┣ 📄 _document.tsx           
 ┃ ┣ 📁 account-settings/        # User account settings pages
 ┃ ┣ 📁 requests/                # Requests pages (deposit, withdrawal, support, etc)
 ┃ ┗ 📁 users/                   # User management pages (list, create, update, view)

 ┣ 📁 providers/                 # Providers folder
 ┃ ┗ 📄 AuthContext.tsx          

 ┣ 📁 services/                  # Services for API requests and business logic
 ┃ ┣ 📄 dashboard.service.ts    
 ┃ ┣ 📄 network.service.ts      
 ┃ ┣ 📄 products.service.ts     
 ┃ ┣ 📄 requests.service.ts     
 ┃ ┗ 📄 users.service.ts         

 ┗ 📁 views/                     # Reusable view components for pages
   ┣ 📁 account-settings/       
   ┣ 📁 cards/                 
   ┣ 📁 dashboard/             
   ┣ 📁 form-layouts/          
   ┣ 📁 pages/                 
   ┣ 📁 tables/                
   ┗ 📁 typography/            
┗ 📁 styles/                     
   📄 globals.css                # Global CSS file

📄 .env                          # Environment variable definitions
📄 .env.copy                     # Sample environment variables file
           
```

<h2 id="routes">📍 Application Routes</h2>

| URI                  | Description                                      |
| -------------------- | ------------------------------------------------ |
| `/`                  | Main dashboard with key user and financial stats |
| `/users`             | List and manage all registered users             |
| `/users/create`      | Register a new user manually                     |
| `/users/update/[id]` | Edit user details (by user ID)                   |
| `/users/view/[id]`   | View user profile and activity (by user ID)      |
| `/requests`          | View and filter all user requests                |
| `/account-settings`  | Admin profile and account configuration          |

<h2 id="getting-started">▶️ Getting Started</h2>

Follow the steps below to set up and run the admin panel locally:

### Prerequisites

- Node.js ≥ 18
- Yarn or npm
- Backend API up and running (linked to the bot system)

### Installation

```bash
# Clone the repository
git clone https://github.com/issagomesdev/smart-option-admin.git

cd smart-option-admin

# Install dependencies
npm install
# or
yarn install

# Create a .env.local file based on .env.copy, and set your API URL:
# NEXT_PUBLIC_BASE_URL=https://your-backend-api.com

# run in development mode
yarn dev
# or
npm run dev
```
<h2 id="related-projects">🔗 Related Projects</h2>

🤖 Telegram bot + Backend API repository [here](https://github.com/issagomesdev/smart-option)


