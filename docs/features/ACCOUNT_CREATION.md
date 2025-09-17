# Account Creation

This document details the account creation process in LactaLink, including user registration, authentication, and profile setup.

## Overview

Account creation is the entry point to the LactaLink platform. The process is designed to be secure, straightforward, and informative, ensuring users understand the platform's purpose and their role within it.

## Authentication Methods

LactaLink offers multiple authentication methods to accommodate user preferences:

### Email and Password

1. User enters their email address and creates a secure password
2. System sends a one-time password (OTP) to the provided email
3. User verifies their email by entering the received OTP
4. Upon successful verification, the account is activated

### Google Authentication

1. User selects the "Sign in with Google" option
2. User is redirected to Google's authentication page
3. After authenticating with Google, user is returned to LactaLink
4. Email verification is automatically completed using Google's verified email

## Profile Setup

After successful authentication, users must complete their profile setup:

### Profile Type Selection

Users must select one of the following profile types:

- **Individual**: For personal users who want to donate breast milk or request milk
- **Hospital**: For healthcare organizations that facilitate milk donation and distribution
- **Milk Bank**: For specialized organizations focused on breast milk processing and distribution

### Profile Information

#### Individual Profile

Required information:

- Full name (given name, middle name, family name)
- Date of birth
- Gender
- Marital status
- Number of dependents (optional)
- Contact information (phone number)
- Address details (at least one address)
- Profile picture (optional)

#### Hospital Profile

Required information:

- Hospital name
- Description
- Hospital registration number
- Address and contact information
- Hospital logo (optional)

#### Milk Bank Profile

Required information:

- Milk bank name
- Description
- Address and contact information
- Milk bank logo (optional)

### Address Management

All users must provide at least one address with the following information:

- Street Address (optional)
- Barangay
- City/Municipality
- Province
- Postal code

## Security Considerations

- Passwords must meet minimum complexity requirements
- Email verification is mandatory for security and communication purposes
- All personal information is encrypted in transit and at rest
- Users can enable additional security features in their settings

## Post-Registration Steps

After completing registration, users are encouraged to:

1. Complete identity verification (if applicable)
2. Set up delivery preferences
3. Explore the platform features relevant to their profile type

## Technical Implementation

- Authentication is handled through Supabase Auth
- Google OAuth integration for social login
- Email verification through Supabase SMTP
- Profile data stored in PostgreSQL database
- Profile images stored in Supabase Storage
