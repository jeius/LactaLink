# Payload CMS Implementation

This document provides an overview of the Payload CMS integration within the LactaLink application. Payload CMS is used as the content management system for the web admin panel, enabling administrators to manage various entities and workflows efficiently.

## Overview

Payload CMS is integrated into the LactaLink web application to handle content and data management. It provides a flexible and extensible framework for defining collections, hooks, and endpoints, which are used to manage entities such as users, donations, requests, and more. The CMS is configured to work seamlessly with Supabase for data storage and authentication.

## Collections

Below is a list of all the collections implemented in Payload CMS:

- **Addresses**: This collection manages user addresses, including default addresses and regional information. Hooks are implemented to ensure unique default addresses, generate display names, and derive island group and region data.
- **Avatars**: This collection manages user profile avatars. Hooks are used to generate alternative text for accessibility.
- **Delivery Preferences**: This collection stores user preferences for delivery options.
- **Donations**: This collection manages donation records, including volumes and notifications. Hooks are used to calculate volumes, generate titles, initialize donation records, and handle notifications. Endpoints are provided to handle matched requests for donations.
- **Hospitals**: This collection manages hospital records.
- **Identities**: This collection manages user identity verification data. Hooks are implemented to update identity records and verify identities after creation.
- **Identity Images**: This collection stores images related to identity verification.
- **Images**: This collection manages general image assets.
- **Individuals**: This collection manages individual user profiles.
- **Inventory**: This collection manages inventory records for milk banks and hospitals. Hooks are used to initialize inventory and update inventory status.
- **Milk Bags**: This collection manages milk bag records, including ownership history. Hooks are implemented to generate, initialize, and update milk bag records.
- **Milk Banks**: This collection manages milk bank records.
- **Notifications**: This collection manages notification categories, channels, and templates.
- **PSGC (Philippine Standard Geographic Code)**: This collection manages geographic data, including barangays, cities, municipalities, provinces, and regions.
- **Requests**: This collection manages requests for donations, including volumes and notifications. Hooks are used to calculate volumes, generate titles, initialize requests, and handle notifications. Endpoints are provided to handle matched donations for requests.
- **Transactions**: This collection manages transaction records, including delivery agreements and tracking. Hooks are implemented to calculate volumes, generate transaction numbers, and process delivery agreements.
- **Users**: This collection manages user accounts and profiles. Hooks are used to update user profiles after creation and handle avatar updates.

## Custom Endpoints

Custom API endpoints are implemented in Payload CMS to handle specific business logic and workflows. The endpoints are designed to be secure and efficient, ensuring that they integrate seamlessly with the frontend applications.

- **`api/['donations' or 'requests']/near`**: Provides nearby donations or requests based on geographic location.
- **`/api/verify-identity`**: Handles identity verification using the **face-api.js** library to detect faces and do comparison.
- **`/api/seed/notifications`**: Seeds notification categories, channels, and types into the database.
- **`/api/seed/psgc`**: Seeds Philippine Standard Geographic Code data, including barangays, cities, municipalities, provinces, and regions.

## Additional Notes

- The Payload CMS integration is designed to be modular and extensible, allowing for future enhancements and additional collections as needed.
