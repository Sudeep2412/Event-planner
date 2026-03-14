# Event Planner React Native App

A localized, mobile-first event-planning application built with React Native (Expo) and styled using NativeWind (Tailwind CSS).

This application allows users to dynamically select occasions—like Weddings, Birthdays, Corporate Events—and receive highly tailored vendor recommendations ranging from Banquet Halls and Night Clubs to Live DJs and Photographers.

## 🌟 Key Features

### 1. Custom Occasion Dynamics
The application treats every **Occasion** as a unique user flow with customized questions and filters.
- **Weddings:** Browse for Banquet Halls, Resorts, and specific categories like "Decor & Flowers".
- **Birthdays:** The UX shifts to show options for Night Clubs, Food Trucks, Bakeries, and Entertainment.

### 2. Comprehensive Vendor Marketplace
- **Dynamic Filtering:** The vendor feed dynamically updates based on the user's Location, Occasion, and Venue Type selections.
- **Rich Data:** Vendors feature high-quality image carousels, pricing models, localized distance metrics, and dedicated amenities.
- **Interactive UI:** Clickable buttons with scale transitions and active opacity feedback that connect to actual alert systems.

---

## 📸 Demo & Screenshots

Here is a recording showcasing these dynamic features in the newly designed UI:

**Dynamic UI Recording**
![Dynamic UI Recording](C:\Users\sudee\.gemini\antigravity\brain\6c85e0f1-0cc9-4cc8-8078-bdd6523b6c76\expo_custom_ui_test_1773489916305.webp)

And here are screenshots proving the categories map explicitly to the **Birthday** occasion flow:

**Customized Marketplace Tab (Birthday):**
![Marketplace Birthday View](C:\Users\sudee\.gemini\antigravity\brain\6c85e0f1-0cc9-4cc8-8078-bdd6523b6c76\marketplace_birthday_1773489954596.png)

**Dynamic Categories (Entertainment, Photography):**
![Marketplace Categories](C:\Users\sudee\.gemini\antigravity\brain\6c85e0f1-0cc9-4cc8-8078-bdd6523b6c76\marketplace_categories_verified_1773489965748.png)

---

## 🛠️ Architecture & Tech Stack

- **Framework**: React Native via [Expo](https://expo.dev/)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **Icons**: `@expo/vector-icons` (Feather Icons)
- **Language**: TypeScript for strict typing and interfaces.

## 🚀 How to Run Locally

To test the UI and logic yourself:

1. Open your terminal and navigate to the project directory:
   ```bash
   cd event-planner
   ```
2. Install dependencies (if you haven't yet):
   ```bash
   npm install
   ```
3. Run the Expo server for web or native dev client:
   ```bash
   npx expo start
   ```
   *(To force a web preview, press `w` in the terminal, or explicitly run `npx expo start --web`)*.

## 📦 Building for Android (APK)
This project is pre-configured for Expo Application Services (EAS). To generate a standalone Android `.apk`:
```bash
npx eas-cli build -p android --profile preview
```
