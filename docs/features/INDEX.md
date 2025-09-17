# LactaLink Features Documentation

This document provides a comprehensive overview of the features available in the LactaLink platform. It serves as a reference guide for understanding the platform's capabilities and functionality.

## Table of Contents

- [Introduction](#introduction)
- [User Roles](#user-roles)
- [Profile Types](#profile-types)
- [User Features](#user-features)
  - [Account Management](#account-management)
  - [Identity Verification](#identity-verification)
  - [Donation Management](#donation-management)
  - [Request Management](#request-management)
  - [Messaging and Notifications](#messaging-and-notifications)
  - [Geographic Services](#geographic-services)
- [Administrative Features](#administrative-features)
  - [User Management](#user-management)
  - [Content Management](#content-management)
  - [Verification Management](#verification-management)
- [Organization Features](#organization-features)
- [Future Features](#future-features)

## Introduction

LactaLink is a tech-driven solution for breastmilk donation and distribution. The platform connects donors, recipients, and organizations while ensuring medical approval, safety, and convenience. This documentation outlines the features available to different user types and explains the core functionality of the system.

## User Roles

- **Authenticated User**: Registered users who can access personalized features based on their profile type.
- **Administrator**: System administrators with access to management tools and monitoring capabilities.

## Profile Types

- **Individual**: Users who can donate breast milk or request milk for personal use. This profile type supports both donor and recipient roles.
- **Hospital**: Healthcare organizations that facilitate the collection, storage, and distribution of breast milk.
- **Milk Bank**: Specialized organizations dedicated to processing, storing, and distributing donated breast milk.

## User Features

### Account Management

See [Account Creation Documentation](./ACCOUNT_CREATION.md) for detailed workflows and technical implementation.

- **Registration and Authentication**
  - Create an account using email/password or Google authentication
  - Verify email address through a secure one-time password (OTP)
  - Select profile type (Individual, Hospital, or Milk Bank)
  - Complete profile with personal or organizational information

- **Profile Management (In Progress)**
  - Update personal information and contact details
  - Upload and manage profile pictures
  - Add and manage addresses with geographic information
  - Set delivery preferences for donations or requests (Individuals only)
  - View activity history including donations, requests, and transactions

- **Settings (In Progress)**
  - Manage notification preferences
  - Update account security settings
  - Control privacy settings and information sharing

### Identity Verification

Identity verification enhances trust and security within the community. This optional but recommended feature enables users to verify their identity using government-issued identification. See [Identity Verification Documentation](./ID_VERIFICATION.md) for detailed steps and technical implementation.

- **Verification Process**
  - Select government-issued ID type (passport, driver's license, national ID)
  - Upload ID image and selfie for verification
  - System automatically verifies identity using **face-api.js**
  - Manual review by administrators for failed automatic verifications

- **Verification Benefits**
  - Access to advanced features like donor screening and milk donation
  - Enhanced trust indicator for other users
  - Higher visibility in search results

### Donation Management

The donation process enables individuals to safely donate breast milk to recipients or organizations. See [Donation Management Documentation](./DONATION_MANAGEMENT.md) for detailed workflows and technical implementation.

- **Milk Bag Management**
  - Record milk collection details (volume, date, storage type)
  - Generate unique codes for tracking milk bags
  - Verify code application with photo upload
  - Track milk bag status through the donation lifecycle

- **Donation Creation**
  - Create donations with detailed information
  - Include multiple milk bags in a single donation
  - Select specific recipients or make general donations
  - Set delivery preferences and additional notes

- **Donation Tracking**
  - Monitor donation status and recipient responses
  - Track partial and complete allocations
  - View donation history and impact statistics
  - Receive notifications about donation updates

### Request Management

The request system allows individuals to seek breast milk donations based on their specific needs.

- **Request Creation**
  - Specify volume needed and urgency level
  - Set needed-by date and storage preferences
  - Include optional reason for request
  - Select specific donors or make general requests

- **Request Tracking**
  - Monitor request status and fulfillment percentage
  - Track responses from potential donors
  - View partial and complete fulfillments
  - Receive notifications about request updates

- **Fulfillment Management**
  - Accept or decline donation offers
  - Track multiple transactions for partially fulfilled requests
  - Complete receipt confirmation
  - Provide feedback on received donations

### Messaging and Notifications

- **In-App Messaging (In Progress)**
  - Communicate directly with donors, recipients, or organizations
  - Discuss donation details and arrangements
  - Receive system-generated updates about transactions

- **Notification System**
  - Receive alerts for donation matches, requests, and system updates
  - Customize notification preferences by category and channel
  - Access notification history and action items

### Geographic Services

- **Location-Based Features**
  - Search for nearby donors or recipients (In Progress)
  - View interactive maps showing available donations or requests
  - Calculate distances and estimated travel times

- **Address Management**
  - Store multiple addresses with PSGC (Philippine Standard Geographic Code) information
  - Set default address for donations or requests
  - Update geographic information as needed

## Administrative Features

### User Management

- **User Administration**
  - View and manage user accounts
  - Reset passwords and manage account access
  - Handle account suspension or deactivation

- **Role Management**
  - Assign administrative roles and permissions

### Content Management

- **System Content**
  - Manage static content and help documentation
  - Update system announcements and notifications
  - Control featured content and promotions

- **Data Management**
  - Perform database maintenance operations

### Verification Management

- **Identity Verification**
  - Review and approve manual identity verification requests
  - Audit verification records and documentation

## Organization Features (In Progress)

- **Donation Reception**
  - Receive and process direct donations
  - Manage donor relationships and communication
  - Track donation volumes and statistics

- **Distribution Management**
  - Fulfill milk requests from individuals
  - Track distribution activities and recipients
  - Manage consent and documentation

- **Milk Inventory**
  - Track available milk volume and storage locations
  - Monitor expiration dates and quality status
  - Generate inventory reports and forecasts
  - Monitor milk storage conditions and capacity
  - Manage storage facilities and equipment

## Future Features

These features are planned for future releases:

- **Advanced Analytics Dashboard**: Comprehensive data visualization and reporting tools for tracking donations, requests, and impact metrics.

- **Community Forums**: Discussion spaces for users to share experiences, advice, and support related to breastfeeding and milk donation.

- **Mobile Scanning**: Barcode/QR code scanning functionality for easier milk bag tracking and verification.

- **Donor Incentive Program**: Recognition and reward system for active donors to encourage continued participation.

- **Supply Chain Integration**: Enhanced logistics management features for hospitals and milk banks to optimize milk collection and distribution.

- **Delivery Scheduling and Negotiation**: Allow users to schedule delivery times and negotiate pickup/drop-off arrangements.

- **Delivery Tracking**: Real-time tracking of milk deliveries with status updates and estimated arrival times.

_Note: This document will be updated as new features are developed and implemented._
