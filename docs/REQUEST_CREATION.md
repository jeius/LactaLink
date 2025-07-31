# LactaLink Request Creation Process

## Overview

The request creation process in LactaLink enables individuals to specify their breast milk needs and connect with potential donors. This document outlines the complete workflow for creating requests, which is a critical component of the milk donation matching system.

## Request Lifecycle

Requests follow a specific lifecycle in the system:

```
AVAILABLE → MATCHED (partial fulfillment) → COMPLETED (full fulfillment)
```

Each request progresses through these statuses:

1. **AVAILABLE**: Initial state when a request is created and open for fulfillment
2. **MATCHED**: Request has been partially fulfilled but still needs more milk
3. **COMPLETED**: Request has been fully fulfilled with the required volume

Additional statuses include:

- **PENDING**: Request directed to a specific donor/organization awaiting approval
- **EXPIRED**: Request has passed its needed-by date
- **CANCELLED**: Request was cancelled by the requester
- **REJECTED**: Request was rejected by the specified recipient

## Request Creation Process

### Phase 1: Initial Request Information

#### Step 1: Basic Request Details Entry

```
User specifies volume needed → Sets urgency and dates → Request created
```

**What happens:**

- User enters essential request information:
  - Volume needed (in milliliters)
  - Date when milk is needed by
  - Urgency level (Standard, Urgent, Very Urgent, Emergency)
  - Storage preference (Fresh, Frozen, Either)
  - Optional recipient image and reason for request

- System automatically:
  - Sets initial status as AVAILABLE (or PENDING if directed to a donor/organization)
  - Calculates expiration date based on the needed-by date
  - Associates the request with the current user as requester

#### Step 2: Recipient and Delivery Information

```
User specifies recipient → Sets delivery preferences → Provides additional details
```

**What happens:**

- User specifies recipient (if directed request)
- User provides delivery preferences:
  - Preferred delivery modes (Pickup, Delivery, Meet-up)
  - Available days
  - Preferred address for exchange
- User adds any additional notes or special requirements

### Phase 2: Request Submission

#### Step 3: Request Submission and Availability

```
User submits request → System validates → Request becomes available for matching
```

**What happens:**

- System validates all required information is provided
- Request record is created with appropriate status:
  - If general request: Status = AVAILABLE
  - If directed to specific donor/organization: Status = PENDING (requires approval)
- Request becomes visible in search results for potential donors
- Matching algorithm begins evaluating potential matches

### Phase 3: Post-Creation

#### Step 4: Notification and Next Steps

```
Request created → Notifications sent → Appears in relevant searches
```

**What happens:**

- User receives confirmation that request was successfully created
- If directed request, specified recipient receives notification
- Request appears in search results for potential donors
- Matching process can begin (see [Matching System Documentation](./MATCHING_SYSTEM.md))

## Special Cases

### Directed Request to Individual

When creating a request for milk from a specific donor:

1. User selects individual donor during request creation
2. Request status is set to PENDING
3. Donor must approve the request
4. Upon approval, system creates a Transaction record automatically
5. Transaction follows delivery process (see [Delivery System Documentation](./DELIVERY_SYSTEM.md))

### Directed Request to Organization

When requesting milk directly from a hospital or milk bank:

1. User selects organization as recipient during request creation
2. Request status is set to PENDING
3. Organization reviews and approves the request (changes status to MATCHED)
4. System creates a Transaction with PICKUP mode automatically
5. Organization selects milk bags from inventory to fulfill request
6. User picks up milk following the transaction workflow

## Partial Fulfillment Handling

Requests can be partially fulfilled by multiple donations:

1. Initial donation fulfills part of the requested volume
2. Request status remains AVAILABLE with updated fulfillment percentage
3. Additional donations can fulfill the remaining volume
4. When total fulfillment reaches 100%, status changes to COMPLETED
5. Each partial fulfillment creates its own transaction record

## Important Validation Rules

The system enforces several validation rules during request creation:

1. **Volume Requirements**:
   - Volume needed must be specified (minimum 20ml)
   - Needed-by date must be in the future
   - Urgency level must be specified

2. **Request Requirements**:
   - Requester must be specified (defaults to current user)
   - Storage preference must be indicated
   - At least one delivery preference must be provided

3. **Fulfillment Tracking**:
   - System automatically calculates and displays fulfillment percentage
   - Remaining volume needed is tracked and updated with each partial fulfillment

## Best Practices for Requesters

1. **Be Specific**: Clearly state your needs, especially any special requirements
2. **Plan Ahead**: Create requests well before milk is needed to allow time for matching
3. **Provide Context**: Include reason for request to help donors understand the need
4. **Flexible Options**: Offer multiple delivery preferences to increase chances of matching
5. **Timely Responses**: Respond promptly to matches to facilitate quick fulfillment

## Technical Implementation Details

### Fulfillment Percentage Calculation

The system automatically calculates fulfillment percentage for tracking partial fulfillment:

```typescript
// Calculate fulfillment percentage
const fulfillmentPercentage = Math.min(100, Math.round((volumeFulfilled / volumeNeeded) * 100));

// Add fulfillmentPercentage as a virtual field
return {
  ...doc,
  fulfillmentPercentage,
  remainingNeeded: Math.max(0, volumeNeeded - volumeFulfilled),
};
```

### Request Title Generation

Request titles are automatically generated based on requester name and volume needed:

```typescript
const name = doc.displayName || `${doc.givenName || ''} ${doc.familyName || ''}`.trim();
data.title = `${name} | ${data.volumeNeeded} mL`;
```

### Status Transitions

The system manages request status transitions through hooks that execute during matching and fulfillment operations:

1. **Partial Fulfillment**: Updates volumeFulfilled but maintains AVAILABLE status
2. **Complete Fulfillment**: Updates status to COMPLETED when volumeFulfilled ≥ volumeNeeded
3. **Expiration**: Background job updates status to EXPIRED when current date > neededAt date
