# LactaLink Delivery System Documentation

## Overview

The LactaLink delivery system facilitates the transfer of breast milk donations from donors to requesters through three delivery modes: **Pickup**, **Delivery**, and **Meetup**. This document outlines the complete workflow from initial posting to successful delivery completion.

## Delivery Modes

### 🚗 **PICKUP**
- Requester travels to donor's location to collect the milk
- Donor provides pickup address and availability
- Suitable for local transfers and flexible requesters

### 🚚 **DELIVERY** 
- Donor travels to requester's location to deliver the milk
- Requester provides delivery address
- Ideal when donor has transportation and requester has limited mobility

### 🤝 **MEETUP**
- Both parties meet at a mutually agreed neutral location
- Requires negotiation and confirmation from both sides
- Good compromise when neither party can travel far

## Complete Workflow

### Phase 1: Initial Creation

#### **Step 1: Donation Posted**
```
Donor creates donation → Status: AVAILABLE
```
**What happens:**
- Donor sets milk details (amount, storage type, collection mode)
- Donor sets delivery preferences:
  - Preferred delivery modes (PICKUP, DELIVERY, MEETUP)
  - Available addresses for each mode
  - Available days for coordination
- Donation becomes searchable for matching

#### **Step 2: Request Posted**  
```
Requester creates request → Status: PENDING
```
**What happens:**
- Requester sets milk needs (amount, urgency, storage preference)
- Requester sets delivery preferences:
  - Preferred delivery modes
  - Available addresses for each mode  
  - Available days for coordination
- Request becomes searchable for matching

### Phase 2: Matching Process

#### **Step 3: Compatibility Check**
**System checks for:**
- ✅ **Amount compatibility**: `donation.remainingAmount ≥ request.amount`
- ✅ **Storage compatibility**: Compatible storage types (FRESH/FROZEN/EITHER)
- ✅ **Delivery mode compatibility**: Overlapping preferred modes
- ✅ **Geographic feasibility**: Reasonable distance between parties

#### **Step 4: Manual Matching (Frontend)**
```
Admin/User identifies compatible donation + request
↓
Request updated → matchedDonation: [donation_id]
Request status → MATCHED
Donation status → PARTIALLY_ALLOCATED or FULLY_ALLOCATED
```

### Phase 3: Delivery Creation & Confirmation

#### **Step 5: Delivery Record Created (Frontend)**
```
User creates delivery record with:
- Selected delivery mode (from compatible options)
- Selected address (based on mode and user preferences)  
- Initial status: PENDING or PENDING_CONFIRMATION
```

#### **Step 6: Delivery Confirmation Process**

##### **For PICKUP Mode:**
```
PENDING → CONFIRMED
```
**Process:**
1. Delivery created with donor's pickup address
2. Requester reviews pickup location and instructions
3. Requester confirms they can pick up from that location
4. Status becomes **CONFIRMED**

##### **For DELIVERY Mode:**
```
PENDING → CONFIRMED
```
**Process:**
1. Delivery created with requester's delivery address
2. Donor reviews delivery location and instructions
3. Donor confirms they can deliver to that location
4. Status becomes **CONFIRMED**

##### **For MEETUP Mode:**
```
PENDING → PENDING_CONFIRMATION → CONFIRMED
```
**Process:**
1. Initial proposal with suggested meetup location & time slots
2. Counter-proposals exchanged if needed
3. Both parties negotiate and agree on final location
4. Status becomes **CONFIRMED**

### Phase 4: Scheduling

#### **Step 7: Schedule Specific Time**
```
CONFIRMED → SCHEDULED
```
**What happens:**
- Specific date and time slot selected
- Both parties commit to the schedule
- Calendar notifications sent
- All logistical details finalized

### Phase 5: Execution

#### **Step 8A: Pickup Execution**
```
SCHEDULED → READY_FOR_PICKUP → DELIVERED
```
**Process:**
1. **SCHEDULED**: Pickup time confirmed
2. **READY_FOR_PICKUP**: Donor prepares milk and confirms ready
3. **DELIVERED**: Requester successfully picks up at scheduled time

#### **Step 8B: Delivery Execution**
```
SCHEDULED → IN_TRANSIT → DELIVERED  
```
**Process:**
1. **SCHEDULED**: Delivery time confirmed
2. **IN_TRANSIT**: Donor starts delivery journey
3. **DELIVERED**: Milk successfully delivered to requester's address

#### **Step 8C: Meetup Execution**
```
SCHEDULED → DELIVERED
```
**Process:**
1. **SCHEDULED**: Meetup time and location confirmed
2. **DELIVERED**: Both parties meet and exchange milk successfully

### Phase 6: Completion

#### **Step 9: Final Updates**
```
Delivery status → DELIVERED
Request status → FULFILLED
Donation remainingAmount updated
If donation fully used → Donation status: COMPLETED
```

## Status Reference

### Delivery Status Flow by Mode

| **Pickup** | **Delivery** | **Meetup** |
|------------|--------------|------------|
| PENDING | PENDING | PENDING |
| CONFIRMED | CONFIRMED | PENDING_CONFIRMATION |
| SCHEDULED | SCHEDULED | CONFIRMED |
| READY_FOR_PICKUP | IN_TRANSIT | SCHEDULED |
| DELIVERED | DELIVERED | DELIVERED |

### Complete Status Definitions

| Status | Description | Used In |
|--------|-------------|---------|
| **PENDING** | Initial state, awaiting confirmation | All modes |
| **PENDING_CONFIRMATION** | Awaiting mutual agreement on details | Meetup only |
| **CONFIRMED** | Both parties agreed on logistics | All modes |
| **SCHEDULED** | Specific date/time set | All modes |
| **IN_TRANSIT** | Donor en route to delivery | Delivery only |
| **READY_FOR_PICKUP** | Milk prepared, awaiting pickup | Pickup only |
| **DELIVERED** | Successfully completed | All modes |
| **FAILED** | Delivery attempt unsuccessful | All modes |
| **CANCELLED** | Delivery cancelled by either party | All modes |

## Key Features

### Time Slot Management
- **Preset slots**: Common 2-hour windows (8AM-10AM, 10AM-12PM, etc.)
- **Custom time**: User-defined start and end times
- **Flexible scheduling**: Accommodates various user preferences

### Address Management  
- Mode-specific addresses (pickup, delivery, meetup locations)
- Conditional field display based on selected delivery mode
- Address validation and selection based on compatibility

### Tracking & History
- Complete status history with timestamps
- Failure reason tracking for unsuccessful deliveries
- Notes and instructions for each delivery step

## Frontend Integration Points

### Critical User Actions
1. **Matching Interface**: Allow users to search and match donations/requests
2. **Delivery Creation Form**: Mode selection with filtered options
3. **Confirmation Interface**: Mode-specific confirmation flows
4. **Scheduling Interface**: Time slot selection with preset/custom options
5. **Status Updates**: Real-time status progression tracking

### Notification Triggers
- Delivery created → Notify both parties
- Confirmation required → Notify relevant party
- Schedule confirmed → Send calendar invites
- Status changes → Update both parties
- Delivery completed → Final confirmation notifications

## Error Handling

### Common Failure Scenarios
- **Geographic incompatibility**: Parties too far apart
- **Schedule conflicts**: No overlapping available times
- **Address issues**: Invalid or inaccessible locations
- **Communication failures**: Parties unable to coordinate
- **No-shows**: Party doesn't appear at scheduled time

### Recovery Actions
- Status rollback to previous confirmed state
- Alternative delivery mode suggestions
- Rescheduling options
- Automatic re-matching for failed deliveries

---

## Technical Implementation Notes

### Database Schema
- Deliveries collection with mode-specific conditional fields
- Relationship links to Requests, Donations, and Addresses
- Status tracking with history array
- Flexible time slot storage (preset vs custom)

### Access Control
- Delivery creators can update their deliveries
- Admin users have full access
- Read access for authenticated users involved in the delivery

### Validation Rules
- Delivery mode must be compatible with both parties' preferences
- Address selection must match the chosen delivery mode
- Time slots must follow valid format (HH:MM)
- Status transitions must follow logical progression

This system ensures secure, trackable, and user-friendly milk donation deliveries while maintaining flexibility for different user needs and preferences.