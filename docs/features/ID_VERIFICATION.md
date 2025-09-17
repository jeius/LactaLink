# Identity Verification

This document details the identity verification process in LactaLink, explaining the procedures, benefits, and technical implementation.

## Overview

Identity verification is an optional but recommended security feature that enhances trust within the LactaLink community. Verified users gain access to additional features, particularly those related to donation and screening processes.

## Verification Process

The identity verification process consists of several steps designed to ensure the authenticity of users:

### 1. ID Selection

Users must select a valid government-issued identification document from the following options:

- Passport
- Driver's License
- National ID
- Other government-issued photo ID

### 2. Personal Information Entry

Users must provide the following information matching their selected ID:

- Full legal name
- Date of birth
- Address
- ID number

### 3. Document Submission

Users must upload clear, legible images of:

- Front side of the selected ID
- Back side of the ID (if applicable)
- A selfie photo of the user holding the ID

### 4. Facial Verification

To ensure the ID belongs to the user:

- User takes a selfie through the application
- User submits a record in the [Identities](#4-facial-verification) collection with the uploaded documents.
- Hooks are implement to queue the verfication process job upon creation of the record.
- The system uses face-api.js to compare the selfie with the photo on the ID.
- Multiple facial landmarks are analyzed for verification
- The record's status is updated based on the verification result.

### 5. Verification Processing

The verification process may follow two paths:

#### Automatic Verification

- System compares facial features between selfie and ID photo
- System validates personal information against ID details
- If confidence threshold is met, verification is automatically approved

#### Manual Verification

- If automatic verification fails or is inconclusive
- System flags the verification for manual review
- Administrators receive notification of pending verification
- Administrator reviews submitted documents and approves or rejects verification
- User is notified of the verification decision

## Verification Status

Users can have one of the following verification statuses:

- **Pending**: Verification submitted and awaiting results
- **Action Required**: Manual review needed due to failed automatic verification
- **Verified**: Identity successfully verified
- **Rejected**: Verification rejected with reason provided

## Benefits of Verification

Verified users enjoy several benefits:

- **Trust Indicator**: Verified badge visible on profile
- **Feature Access**: Ability to donate milk and participate in donor screening
- **Visibility**: Higher visibility in search results and matching algorithms
- **Priority**: Preference in certain matching scenarios

## Security and Privacy Considerations

- All identification documents are encrypted in transit and at rest
- Facial recognition data is processed locally when possible
- Identification documents are accessible only to authorized administrators
- Verification status is public, but verification details remain private
- Users can request removal of their verification documents at any time

## Technical Implementation

The identity verification system is implemented using:

- **face-api.js**: For facial detection and comparison
- **Supabase Storage**: For secure document storage
- **Payload CMS**: For verification workflow management
- **Background Jobs**: For processing verification requests asynchronously

## Troubleshooting

Common issues users may encounter during verification:

- Poor image quality: Ensure good lighting and clear focus
- Facial recognition failures: Try different angle or lighting
- Expired identification: Use a valid, unexpired ID

Users experiencing persistent verification issues should contact support for assistance.
