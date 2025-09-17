# LactaLink Transaction and Delivery System Documentation

## Overview

The LactaLink system facilitates the transfer of breast milk donations from donors to requesters through a structured transaction process. This document outlines the complete workflow from initial matching to successful transaction completion.

## Transaction Types

The system supports three types of transactions:

- **P2P (Peer to Peer)**: Direct transactions between individual donors and requesters
- **P2O (Peer to Organization)**: Donations from individuals to milk banks or organizations
- **O2P (Organization to Peer)**: Distributions from milk banks or organizations to individual recipients

## Delivery Modes

For P2P transactions, three delivery modes are supported:

### 🚗 **PICKUP**

- Requester travels to donor's location to collect the milk
- Donor provides pickup address and availability or requester can negotiate a pickup location
- Suitable for local transfers and flexible requesters

### 🚚 **DELIVERY**

- Donor travels to requester's location to deliver the milk
- Requester provides delivery address or donor can negotiate a desired delivery address
- Ideal when donor has transportation and requester has limited mobility

### 🤝 **MEETUP**

- Both parties meet at a mutually agreed neutral location
- Requires negotiation and confirmation from both sides
- Good compromise when neither party can travel far

## Complete Transaction Workflow

### Phase 1: Matching

#### **Step 1: Initial Match**

```
Donation and Request matched → Transaction created → Status: MATCHED
```

**What happens:**

- System creates a transaction linking a donation to a request
- Transaction is assigned a unique transaction number (TXN-XXXXXXXX-XXXX)
- Milk bags are selected and associated with the transaction
- Transaction volume is calculated from the selected milk bags
- Transaction type (P2P, P2O, O2P) is assigned based on the parties involved

### Phase 2: Delivery Arrangement

#### **Step 2: Delivery Selection or Proposal**

```
MATCHED → [PENDING_DELIVERY_CONFIRMATION or directly to DELIVERY_SCHEDULED]
```

**What happens:**

- System checks if the donation or request has pre-specified delivery preferences
- For PICKUP and DELIVERY modes:
  - If the matcher/fulfiller agrees with one of the existing delivery preferences:
    - They can select it directly
    - Transaction skips to DELIVERY_SCHEDULED status
    - Selected preference becomes the confirmed delivery details
  - If the matcher/fulfiller doesn't agree with any existing preferences:
    - They initiate a negotiation by proposing new delivery details
    - Status changes to PENDING_DELIVERY_CONFIRMATION
- For MEETUP mode:
  - Always requires negotiation and mutual agreement
  - Status changes to PENDING_DELIVERY_CONFIRMATION

#### **Step 3: Delivery Negotiation** (if needed)

```
PENDING_DELIVERY_CONFIRMATION → DELIVERY_SCHEDULED
```

**What happens:**

- For transactions requiring negotiation:
  - Delivery details are proposed:
    - Delivery mode (PICKUP, DELIVERY, MEETUP)
    - Proposed date and time
    - Proposed address
    - Proposing party (DONOR or REQUESTER)
  - Both sender and recipient must agree to the proposed delivery details
  - Once agreement is reached, confirmed delivery details are established

#### **Step 4: Delivery Scheduling**

```
[after selection or agreement] → DELIVERY_SCHEDULED
```

**What happens:**

- Confirmed delivery information is recorded:
  - Final delivery mode
  - Confirmed date and time
  - Confirmed address
- Delivery is now scheduled and ready for execution

### Phase 3: Execution

#### **Step 4A: Pickup Execution**

```
DELIVERY_SCHEDULED → READY_FOR_PICKUP → DELIVERED
```

**Process:**

1. **DELIVERY_SCHEDULED**: Pickup time confirmed
2. **READY_FOR_PICKUP**: Donor prepares milk and confirms it's ready
3. **DELIVERED**: Requester successfully picks up at scheduled time

#### **Step 4B: Delivery Execution**

```
DELIVERY_SCHEDULED → IN_TRANSIT → DELIVERED
```

**Process:**

1. **DELIVERY_SCHEDULED**: Delivery time confirmed
2. **IN_TRANSIT**: Donor starts delivery journey
3. **DELIVERED**: Milk successfully delivered to requester's address

#### **Step 4C: Meetup Execution**

```
DELIVERY_SCHEDULED → DELIVERED
```

**Process:**

1. **DELIVERY_SCHEDULED**: Meetup time and location confirmed
2. **DELIVERED**: Both parties meet and exchange milk successfully

### Phase 4: Completion

#### **Step 5: Transaction Completion**

```
DELIVERED → COMPLETED
```

**What happens:**

- After delivery, status changes to DELIVERED
- **Receiver verification**: Only the milk recipient can change status to COMPLETED
- Receiver confirms:
  - Milk was successfully received
  - Quality and condition are acceptable
  - Transaction can be finalized
- System records completion timestamp in tracking history
- Donation and request statuses are updated accordingly

**Why receiver-only completion matters:**

- Ensures accountability for successful transfers
- Provides quality verification before closing the transaction
- Prevents disputes about whether delivery actually occurred
- Creates clear documentation of successful handoff

### Alternative Paths

#### **Failed Transaction**

```
Any status → FAILED
```

- Transaction cannot be completed due to issues
- Failure reason and timestamp are recorded
- System may offer options for remediation

**Examples of Failed Transactions:**

1. **Quality Issues**
   - Scenario: Recipient discovers milk bags are thawed or spoiled upon delivery
   - Process:
     - Recipient reports quality issue
     - Transaction status changes to FAILED
     - System records failure reason: "Milk compromised during transit"
     - Matched bags are marked as unusable
     - System suggests new matches for the requester

2. **Delivery Logistic Failure**
   - Scenario: After three attempts, donor unable to deliver due to access issues
   - Process:
     - Donor reports delivery issue with details
     - Transaction status changes to FAILED
     - System records reason: "Unable to access delivery location after multiple attempts"
     - Milk bags return to available inventory
     - System suggests alternative delivery methods for future attempts

3. **Transfer Verification Failure**
   - Scenario: Donor marks delivery as complete but recipient reports milk never received
   - Process:
     - Support team verifies claim
     - Transaction status changes to FAILED
     - System records reason: "Delivery verification discrepancy"
     - Support assists with resolution

#### **Cancelled Transaction**

```
Any status → CANCELLED
```

- Transaction is cancelled by either party
- Cancellation reason and timestamp are recorded
- Matched milk bags become available for new transactions

**Examples of Cancelled Transactions:**

1. **Donor Cancellation**
   - Scenario: Donor experiences emergency and can no longer fulfill the commitment
   - Process:
     - Donor initiates cancellation in system
     - Provides reason: "Family emergency, unable to meet scheduled delivery"
     - System changes status to CANCELLED
     - Requester automatically notified
     - Milk bags returned to available inventory
     - System suggests alternative matches for requester

2. **Requester Cancellation**
   - Scenario: Requester's needs change before delivery occurs
   - Process:
     - Requester initiates cancellation
     - Provides reason: "No longer need this amount of milk"
     - System changes status to CANCELLED
     - Donor automatically notified
     - Milk bags returned to available inventory
     - System flags request as cancelled for follow-up

3. **Mutual Cancellation**
   - Scenario: Both parties agree to cancel due to scheduling conflicts
   - Process:
     - Either party initiates cancellation
     - Both confirm agreement to cancel
     - System records reason: "Mutual agreement - scheduling conflict"
     - System changes status to CANCELLED
     - Milk bags returned to available inventory
     - Both parties receive confirmation of cancellation

## Status Tracking

Each transaction includes comprehensive tracking information:

- **Status History**: Complete record of all status changes with timestamps
- **Event Timestamps**: Specific timestamps for key events (delivered, completed, failed, cancelled)
- **Notes**: Optional notes associated with status changes

## Time Slot Management

Time slots for deliveries can be specified as:

- **Preset slots**: Common 2-hour windows (8AM-10AM, 10AM-12PM, etc.)
- **Custom time**: User-defined start and end times

## Key Components

### Transaction Record

- Unique transaction number
- Links to donation and request
- Transaction status
- List of matched milk bags and total volume
- Transaction type (P2P, P2O, O2P)
- Delivery details (proposed and confirmed)
- Complete tracking history

### Delivery Details

- Delivery mode
- Date and time
- Address information
- Instructions for successful delivery

## Technical Implementation

### Status Flow

The transaction passes through these statuses:

| Status                            | Description                                          |
| --------------------------------- | ---------------------------------------------------- |
| **MATCHED**                       | Initial state after donation and request are matched |
| **PENDING_DELIVERY_CONFIRMATION** | Awaiting agreement on delivery details               |
| **DELIVERY_SCHEDULED**            | Delivery details confirmed and scheduled             |
| **READY_FOR_PICKUP**              | Milk prepared for pickup (Pickup mode)               |
| **IN_TRANSIT**                    | Milk being delivered (Delivery mode)                 |
| **DELIVERED**                     | Milk successfully transferred                        |
| **COMPLETED**                     | Transaction fully completed                          |
| **FAILED**                        | Transaction unsuccessful                             |
| **CANCELLED**                     | Transaction cancelled                                |

### Tracking System

- Each status change is recorded with timestamp
- Special events (delivery, completion, failure, cancellation) have dedicated timestamps
- Status history provides a complete audit trail of the transaction
