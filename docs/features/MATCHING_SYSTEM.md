# LactaLink Matching System Documentation

## Overview

The LactaLink matching system is designed to efficiently connect breast milk donations with requests, ensuring that available milk is distributed to those in need through a structured process. This document outlines the complete matching workflow from creation of donations and requests to the initiation of the transaction delivery process.

## Matching Types

The system supports three types of matches that correspond to the transaction types:

- **P2P (Peer to Peer)**: Matching individual donors with individual requesters
- **P2O (Peer to Organization)**: Matching individual donors with milk banks or hospitals
- **O2P (Organization to Peer)**: Matching milk banks or hospitals with individual recipients

## Matching Workflow

### Phase 1: Creation and Availability

#### **Step 1: Donation Creation**

```
User creates donation → System validates milk bags → Donation status: AVAILABLE
```

**What happens:**

- Individual selects milk bags to donate
- System calculates total volume and verifies milk bag ownership
- Donation is marked as AVAILABLE or PENDING based on recipient specification
- If directed donation (specific recipient), status starts as PENDING requiring approval
- Donation shows up in search results for potential matching

#### **Step 2: Request Creation**

```
User creates request → System validates requirements → Request status: AVAILABLE
```

**What happens:**

- Individual specifies volume needed, urgency, and other preferences
- If directed request (specific donor/organization), status starts as PENDING
- Request becomes visible in search results for potential matching
- System begins evaluating matching opportunities

### Phase 2: Search and Discovery

#### **Step 3: Match Discovery**

Matches can be discovered through three methods:

1. **Manual Search**: Users actively search for complementary donations/requests
2. **System Suggestions**: Algorithm suggests potential matches based on criteria
3. **Directed Donations/Requests**: Pre-specified recipients receive notifications

**Matching criteria include:**

- Geographic proximity
- Volume requirements
- Storage type compatibility
- Urgency/priority levels
- Delivery preference compatibility
- Expiration dates

### Phase 3: Match Initiation

#### **Step 4A: Donor-Initiated Matching**

```
Donor selects request → Confirms milk bags to donate → Transaction created → Status: MATCHED
```

**What happens:**

- Donor reviews request details and confirms ability to fulfill
- Donor selects specific milk bags for the match
- System confirms volume and eligibility
- Transaction is created linking donation to request
- Both parties are notified of the match

#### **Step 4B: Requester-Initiated Matching**

```
Requester selects donation → Confirms acceptance → Transaction created → Status: MATCHED
```

**What happens:**

- Requester reviews donation details
- Requester confirms acceptance of the offered milk
- Transaction is created linking request to donation
- Both parties are notified of the match

#### **Step 4C: Organization-Initiated Matching (O2P)**

```
Organization selects request → Allocates inventory → Transaction created → Status: MATCHED
```

**What happens:**

- Organization reviews request
- Organization selects specific milk bags from inventory to fulfill request
- System creates transaction
- Requester is notified

### Phase 4: Transaction Creation

#### **Step 5: Transaction Record Generation**

```
Match confirmed → Transaction record created
```

**What happens:**

- System generates unique transaction number (TXN-XXXXXXXX-XXXX)
- Selected milk bags are linked to the transaction
- Transaction volume is calculated from the selected milk bags
- Transaction type (P2P, P2O, O2P) is determined based on the parties involved
- Status is set to MATCHED
- Both parties receive notifications about the new transaction

### Phase 5: Delivery Initialization

#### **Step 6: Transition to Delivery Process**

```
MATCHED → [PENDING_DELIVERY_CONFIRMATION or DELIVERY_SCHEDULED]
```

**What happens:**

- System checks for delivery preferences of both parties
- For compatible preferences, status moves directly to DELIVERY_SCHEDULED
- For incompatible or undefined preferences, status changes to PENDING_DELIVERY_CONFIRMATION
- Delivery negotiation process begins (as described in the Delivery System Documentation)

## Special Matching Scenarios

### 1. Directed Donations

When a donor specifies a recipient during donation creation:

1. Donation status begins as PENDING
2. Recipient receives notification about directed donation
3. Upon approval, system creates transaction automatically
4. Status changes to MATCHED
5. Delivery process begins

### 2. Direct Organizational Donations (P2O)

When a donor donates directly to an organization:

1. Donation is created with organization as recipient
2. System creates a transaction with fixed delivery settings
   - Delivery mode is automatically set to DELIVERY (donor delivers to organization)
   - No delivery negotiation is required
3. When transaction completes (status: COMPLETED), the system creates inventory entry
4. Milk bags are transferred to the organization's inventory for future allocation

### 3. Partial Request Fulfillment

When a donation partially fulfills a request:

1. Match occurs for portion of requested volume
2. Transaction is created for matched portion
3. Request remains AVAILABLE with updated volumeFulfilled
4. Request can receive additional matches until fully fulfilled
5. Each match creates separate transaction with independent delivery process

## Integration with Delivery System

Once a match is confirmed and a transaction is created (status: MATCHED), the delivery system takes over to facilitate the physical transfer of milk. The transaction follows the delivery workflow outlined in the [Delivery System Documentation](./DELIVERY_SYSTEM.md).

The key transition points between the matching and delivery systems are:

1. **MATCHED status**: Final state of the matching process, initial state of delivery process
2. **Transaction record**: Contains all information needed for delivery including matched bags and volume
3. **Delivery preferences**: Used to determine initial delivery workflow path

## Example Use Cases

### Use Case 1: P2P - Individual Donor to Individual Recipient

**Scenario**: Jessa (donor) has 3 bags totaling 120ml available for donation. Jane needs 100ml urgently.

**Process**:

1. Jessa creates donation with 3 milk bags (120ml total), status AVAILABLE
2. Jane creates request for 100ml with HIGH urgency, status AVAILABLE
3. Jessa finds Jane's request via search, selects 2 bags (80ml) to donate
4. System creates transaction TXN-12345678-1234 linking Jessa's donation to Jane's request
5. Transaction status: MATCHED
6. System checks delivery preferences:
   - Both prefer PICKUP mode at Jessa's location
   - Transaction moves to DELIVERY_SCHEDULED
7. Jane picks up milk following the delivery workflow
8. Jane's request shows 80ml fulfilled, still needs 20ml (remains AVAILABLE)
9. Another donor can match the remaining 20ml needed

### Use Case 2: P2O - Individual Donor to Organization

**Scenario**: Michaela has excess milk (5 bags, 200ml) and wants to donate to City Hospital's NICU.

**Process**:

1. Michaela creates donation with City Hospital as recipient
2. Donation status starts as PENDING
3. City Hospital receives notification of directed donation
4. Hospital staff reviews and approves donation, changes status to MATCHED
5. System automatically creates transaction with DELIVERY mode (no negotiation needed)
6. Michaela delivers milk to the hospital according to the fixed delivery workflow
7. When transaction is marked COMPLETED, the system creates inventory entry
8. Hospital can now allocate this milk to patients or requesters as needed

### Use Case 3: O2P - Organization to Individual Recipient

**Scenario**: City Hospital receives request from Sarah who needs 150ml for her premature baby.

**Process**:

1. Sarah creates request directed to City Hospital for 150ml
2. Request status starts as PENDING
3. City Hospital reviews and approves request, changing status to MATCHED
4. System automatically creates transaction with PICKUP mode (no negotiation needed)
5. Hospital staff selects specific milk bags from inventory to fulfill request
6. Sarah picks up milk from the hospital according to the fixed delivery workflow
7. When transaction is marked COMPLETED, selected milk bags are marked as ALLOCATED
8. Sarah's request is fulfilled and marked as COMPLETED

## Matching System Technical Components

### Core Collections Involved

1. **Donations**: Track available milk donations and their status
2. **Requests**: Track milk needs and their fulfillment status
3. **Transactions**: Connect donations with requests and manage delivery
4. **MilkBags**: Individual units of milk that can be matched
5. **Inventory**: Organizational milk storage and allocation

### Key Status Flows

**Donation Status Flow**:

- PENDING → AVAILABLE → MATCHED → COMPLETED

**Request Status Flow**:

- PENDING → AVAILABLE → MATCHED → COMPLETED

**Transaction Status Flow**:

- MATCHED → (delivery statuses as per Delivery System Documentation)

### Automatic Background Processes

1. **Expiration Checking**: System regularly checks for expired milk bags and updates statuses
2. **Match Suggestions**: Algorithm periodically evaluates potential matches based on criteria
3. **Notification Generation**: System generates alerts for match opportunities and status changes

## Best Practices for Effective Matching

1. **Complete Profiles**: Donors and requesters should complete delivery preferences
2. **Accurate Information**: Precise volumes and milk bag details improve matching accuracy
3. **Timely Responses**: Quick responses to match opportunities prevent milk wastage
4. **Detailed Requirements**: Specifying storage preferences and urgency improves match quality
