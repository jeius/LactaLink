# LactaLink Matching & Lifecycle Management

This document outlines how the LactaLink system manages the matching process between donations and requests, and how it handles the lifecycle of these entities throughout the donation process.

## Matching Workflows

LactaLink supports three primary matching workflows:

### 1. P2P (Peer-to-Peer)

**Scenario**: Individual donor matches with individual requester

**Process**:

1. System finds available donations and requests
2. Donor or requester initiates matching process
3. Milk bags are selected (automatically or manually)
4. Match is created, generating a transaction
5. Donation status changes to PARTIALLY_ALLOCATED or FULLY_ALLOCATED
6. Request status changes to MATCHED or COMPLETED (if fully fulfilled)
7. Delivery details are negotiated through the transaction
8. When transaction completes, milk bags change to CONSUMED status

### 2. P2O (Peer-to-Organization)

**Scenario**: Individual donates to organization (hospital or milk bank)

**Process**:

1. Donor selects organization as recipient
2. Donation status starts as PENDING
3. Organization approves donation
4. System automatically creates transaction with DELIVERY mode
5. Donor delivers milk to organization
6. When transaction completes, milk bags are added to organization's inventory
7. Donation is marked COMPLETED

### 3. O2P (Organization-to-Peer)

**Scenario**: Organization fulfills request from individual

**Process**:

1. Requester directs request to organization
2. Request status starts as PENDING
3. Organization approves request
4. Organization selects milk bags from inventory to fulfill request
5. System creates transaction with PICKUP mode
6. Requester picks up milk from organization
7. When transaction completes, request is marked COMPLETED

## Entity Lifecycle Management

### Donation Lifecycle
