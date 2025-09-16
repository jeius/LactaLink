# LactaLink Features Documentation

This document provides a detailed overview of the features available in the LactaLink platform, categorized by user roles and functionalities. It serves as a guide for users to understand how to navigate and utilize the platform effectively.

## User Roles

- **Admin**:
  - Manages users, donations, requests, and other system features.
  - Handles confirmation of failed automated user identity verification.
  - Handles platform settings and monitors activity.

- **Authenticated**:
  - Submit and track donation or request activities.
  - View and manage their own profile.
  - Send and receive messages.
  - View and participate in community posts and discussions.

## Profile Types

- **Individual**: A person who can donate breast milk to those in need or request milk for personal use. This profile is tailored for parents or caregivers seeking to contribute or receive support within the community.

- **Hospital**: A healthcare organization that facilitates the collection and distribution of breast milk from donors to recipients. Hospitals play a key role in ensuring the safety and proper handling of milk donations.

- **Milkbank**: A specialized organization dedicated to the storage, processing, and distribution of breast milk. Milkbanks often work closely with hospitals and donors to meet the needs of recipients, with additional features planned for future updates.

## User Features

### Account Creation

All users must create an account to access the platform's features. The account creation process includes:

- **Sign up**
  1. Create an account using a secure email and password or sign up quickly via Google.
  2. Verify email address through a One-Time Password (OTP) for added security (required for email and password sign-up only).

- **Profile Setup**
  1. The user choose a profile type that best represents their role (e.g., Individual, Hospital, or Milkbank).
  2. Complete the required fields with accurate personal or organizational details.
  3. Optionally, upload a profile picture to personalize their account.

Detailed documentation of this feature can be found in [Account Creation](./ACCOUNT_CREATION.md).

### Identity Verification (Optional)

This feature is optional but recommended for enhanced trust and security within the community. Verified users will be able to access additional features, such as donor screening and milk donation.

- **Identity Verification Process:**
  1. Choose the type of government-issued ID (e.g., passport, driver's license, national ID).
  2. Fill out personal information that exists in the ID (full name, date of birth, address).
  3. Upload a picture of the ID and a picture of the user's face.
  4. The system will automatically verify the ID using [face-api.js](https://www.npmjs.com/package/face-api.js) library.
  5. If automatic verification fails, the system notifies the admins via email to manually review and approve or reject the verification.

Detailed documentation of this feature can be found in [ID Verification](./ID_VERIFICATION.md).

### Account Management

- View notifications.
- Send and receive messages.
- Add addresses and delivery preferences.
- View donations and receiving history.
- Earn badges for contributions.
- Manage incoming milk donations/requests (accept or reject with reason).

- **Feed**
  - 🗣️ A community space for discussions and postings.

### Donor Features 📩

This section is for **Individual** profile type only. Before an individual can donate milk, they must be a **verified user** and complete the online donor screening.

> Note: Only donor screening from hospitals/milkbanks can mark the user as "Verified Donor".

- **Online Donor Screening**
  - 🏥 Answer medical history (lifestyle) questions.
  - 📄 Upload necessary documents (ID, medical reports).

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

### Donation Process

- **Milk Donation Process**
  - 📅 Enter details about milk collection (date, type of storage, mode of collection, ML amount, delivery mode).
  - 🎯 Select a recipient based on urgency and proximity.
  - 🎁 Confirm donation.
