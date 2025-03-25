# LactaLink 🍼💙👶

## Overview

LactaLink, built with **React Native (Expo)**, facilitates the donation and distribution of breast milk. The app provides a platform for **donors** and **recipients** to connect while ensuring medical approval, safety, and convenience.

## Features 📲

### Donor Features 📩

- **Create an Account**
  - 📝 Register with personal details.
  - 🆔 Provide donor-specific information (e.g., ID, contact number, address, age, birthdate, gender, marital status, number of dependents, and donor type).
  - 🏥 Answer medical history (lifestyle) questions.
  - ⏳ Pending approval from healthcare providers.
- **Approval Process**
  - ✅ Healthcare providers (hospitals, professionals) approve or reject donor applications.
- **Milk Donation Process**
  - 📅 Enter details about milk collection (date, type of storage, mode of collection, ML amount, delivery mode).
  - 🎯 Select a recipient based on urgency and proximity.
  - 🎁 Confirm donation.
- **Donor Profile Management**
  - 🔔 View notifications.
  - 💬 Send and receive messages.
  - 📜 View donation and receiving history.
  - 🏅 Earn badges for contributions.
  - ⚖️ Manage donation requests (accept or reject with reason).
- **List of Donors**
  - 📍 Display donor names and addresses.
  - 🚫 Remove availability if milk exceeds the storage time limit.

### Recipient Features 🤱

- **Requesting Milk**
  - 🍼 Browse a list of available donors with milk details (name, ML available, location, and donor information).
  - 🔎 Search for specific donors based on name, location, or badge.
  - 📩 Request milk from a donor.
- **Recipient Profile Management**
  - 🏠 View personal profile and notifications.
  - 📅 Track approved requests and scheduled meet-ups.
  - 📜 View transaction history.
  - 💬 Send and receive messages.
- **GIS Integration**
  - 🗺️ Clickable maps for locating nearby donors.

### General Features 📢

- **Forums & Announcements**
  - 🗣️ A community space for discussions and updates.

## Tech Stack 🛠️

- **Frontend:** ⚛️ React Native (Expo)
- **Backend:** 🛠️ Payload CMS / Supabase
- **Monorepo:** 🏗️ Turborepo
- **Database:** 🗄️ Supabase (PostgreSQL)
- **Authentication:** 🔐 Supabase Auth / OAuth
- **Maps & Location:** 🗺️ Google Maps API / OpenStreetMap (GIS integration)
- **Package Manager:** 📦 pnpm

## Installation & Setup ⚙️📦

### Prerequisites

- 🖥️ Node.js & pnpm installed
- 📲 Expo CLI installed globally (`npm install -g expo-cli`)
- 🏛️ Supabase project setup (if using Supabase backend)

### Steps to Run

1. 📂 Clone the repository:
   ```sh
   git clone https://github.com/Jeius/LactaLink.git
   cd lactalink
   ```
2. 📦 Install dependencies:
   ```sh
   pnpm install
   ```
3. ▶️ Start the Expo app:
   ```sh
   pnpm dev
   ```
4. 📲 Scan the QR code using the Expo Go app or run on an emulator.

## Contributing 🤝💡📈

- 🍴 Fork the repository
- 🌱 Create a new branch (`git checkout -b feature-branch`)
- 📝 Commit changes and push (`git push origin feature-branch`)
- 🔄 Open a Pull Request

## License 📜⚖️🔓

MIT License
