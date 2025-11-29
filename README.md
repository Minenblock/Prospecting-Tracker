Prospecting Tracker App

This is a personal, utility-focused web application designed to help players efficiently track item farming goals in games that involve gathering, mining, or "prospecting" for resources with varying rarity and location dependencies.

The app uses a clean, responsive single-page design built with React and styled using Tailwind CSS.

# ✨ Features

Set Targets: Easily define a target amount for any item you are farming (e.g., 50x 'Flarebloom').

Real-Time Progress: Increment and decrement the 'Found' amount directly within the tracker cards.

Completion Status: Items are automatically marked with a green checkmark (✅ Target reached!) once the 'Found' amount meets or exceeds the 'Target' amount.

Local Persistence: All items, targets, and progress are saved locally in your browser's storage, ensuring your data remains intact even after closing and reopening the app.

# 🔎 Item Information & Prospecting Details

Rarity Display: Item names are dynamically colored with gradient effects based on their rarity (e.g., Mythic, Legendary, Epic) for quick visual identification.

Location Grouping: Items are automatically grouped by their primary farming location, helping you focus your current prospecting run (e.g., all items from "The Void" are grouped together).

Chance Details: For items with multiple potential sources, the app lists the top locations and their respective drop chances/percentages.

# 🌐 User Experience & Accessibility

Multi-Language Support: Instant switching between English (EN) and German (DE) for all UI texts and labels. The language preference is saved automatically.

Dark Mode: A dedicated toggle allows users to switch between light and dark themes, with preference persistence.

Responsive Design: The layout is fully fully responsive, ensuring a great experience on mobile phones, tablets, and desktop monitors.

# 💻 Tech Stack

Frontend Framework: React

Styling: Tailwind CSS (for rapid, utility-first styling)

State Management: React Hooks (useState, useEffect)

Data Storage: Local Storage (for client-side persistence)

(Note: The data fetching logic is currently mocked or requires a local proxy server running on port 3001 to retrieve real-time item rarity and location data.)

# ⚙️ Setup and Installation (Local Development)

## Clone the repository:

git clone [https://github.com/YOUR_USERNAME/prospecting-tracker.git](https://github.com/YOUR_USERNAME/prospecting-tracker.git)
cd prospecting-tracker



## Install dependencies:

npm install



## Run the development server:

npm run dev



## The application will typically start on http://localhost:5173.