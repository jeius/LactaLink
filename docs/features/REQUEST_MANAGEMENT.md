# Request Management

This document details the request management system in LactaLink, outlining the processes, components, and workflows involved in creating, tracking, and managing breast milk requests.

## Overview

The request management system enables individuals to request breast milk donations based on their specific needs. The system facilitates matching requests with available donations, tracking fulfillment progress, and managing the delivery process through a structured workflow.

## Core Components

### Requests

Requests are the fundamental units for seeking breast milk in LactaLink. Each request includes:

- **Requester Information**: User who is requesting the milk
- **Volume Needed**: Amount of milk required in milliliters (mL)
- **Urgency Level**: Priority indicator (Standard, Urgent, Very Urgent, Emergency)
- **Storage Preference**: Preferred storage type (Fresh, Frozen, Either)
- **Status**: Current state in the lifecycle
- **Fulfillment Details**: Percentage fulfilled and remaining volume needed

### Request Details

Additional information that enhances request specificity:

- **Reason**: Optional explanation for the request
- **Needed-by Date**: Deadline by which the milk is required
- **Notes**: Additional instructions or information
- **Delivery Preferences**: Options for receiving the donation

## Request Lifecycle

Requests follow a specific lifecycle in the system:

```
AVAILABLE → MATCHED (partial fulfillment) → COMPLETED (full fulfillment)
```

### Status Transitions

Requests follow a defined status flow:

1. **PENDING**: Initial state for requests directed to specific donors/organizations
2. **AVAILABLE**: Ready for matching with donors
3. **MATCHED**: Partially or fully matched with donations
4. **COMPLETED**: Fully fulfilled with all milk received
5. **EXPIRED**: Past the needed-by date without fulfillment
6. **CANCELLED**: Withdrawn by the requester
7. **REJECTED**: Declined by the targeted donor/organization

## Request Creation Process

The request creation process is designed to enable users to specify their breast milk needs and connect with potential donors.

#### Step 1: Basic Request Details Entry

```
User specifies volume needed → Sets urgency and dates → Request created
```

Users begin by specifying fundamental request parameters:

- Volume needed in milliliters (minimum 20mL)
- Date by which milk is needed
- Urgency level (Standard, Urgent, Very Urgent, Emergency)
- Storage preference (Fresh, Frozen, Either)
- Optional reason for request and recipient image

The system automatically:

- Sets initial status as AVAILABLE (or PENDING if directed to a specific donor/organization)
- Calculates expiration date based on the needed-by date
- Associates the request with the current user as requester

#### Step 2: Recipient and Delivery Information

```
User specifies recipient → Sets delivery preferences → Provides additional details
```

Users specify additional parameters:

- Target donor selection (specific individual/organization or general request)
- Delivery preferences:
  - Preferred delivery modes (Pickup, Delivery, Meet-up)
  - Available days
  - Preferred address for exchange
- Additional notes or special instructions

#### Step 3: Request Submission and Validation

```
User submits request → System validates → Request becomes available for matching
```

Upon submission:

- System validates all required information is provided
- Request record is created with appropriate status:
  - If general request: Status = AVAILABLE
  - If directed to specific donor/organization: Status = PENDING (requires approval)
- Notifications are sent to relevant parties (if directed request)
- Request becomes visible in the matching system and search results for potential donors

#### Step 4: Notification and Next Steps

```
Request created → Notifications sent → Appears in relevant searches
```

After successful creation:

- User receives confirmation that request was successfully created
- If directed request, specified recipient receives notification
- Request appears in search results for potential donors
- Matching process can begin

## Special Cases

### Directed Request to Individual

When creating a request for a specific donor:

1. User selects individual donor during request creation
2. Request status is set to PENDING
3. Selected donor must approve the request
4. Upon approval, system creates a Transaction record automatically
5. Transaction follows delivery process

### Directed Request to Organization

When requesting from a hospital or milk bank:

1. User selects organization as target
2. Request status is set to PENDING
3. Organization approves the request (status changes to MATCHED)
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

## Request Management

### Tracking and Notifications

The system provides:

- Real-time status updates on requests
- Notification when donors respond to requests
- Alerts when requests are nearing expiration
- Statistics on request history and fulfillment rates

### Fulfillment Tracking

The system automatically:

- Calculates and displays fulfillment percentage
- Tracks remaining volume needed after partial fulfillments
- Updates request status based on fulfillment level
- Maintains history of all transactions related to the request

## Technical Implementation

### Database Structure

The request system uses these primary collections:

- **Requests**: Stores request records and metadata
- **Transactions**: Handles the delivery and exchange process
- **DeliveryPreferences**: Manages user preferences for receiving donations

### Key Services and Hooks

The system implements several hooks to manage request workflow:

- **initializeRequest**: Prepares new request records
- **calculateVolumes**: Updates volume calculations based on fulfillment
- **generateTitle**: Creates standardized titles for requests
- **notifications**: Handles notification generation for request events
- **processOrganizationRequest**: Special processing for organization recipients
- **updateVolume**: Updates volume fields when fulfillment changes

### API Endpoints

Custom endpoints support request functionality:

- **/requests/:id/matched-donations**: Retrieves potential matching donations
- **/requests/near**: Finds nearby requests based on location

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

## Validation Rules

The system enforces validation to ensure data integrity:

1. **Volume Requirements**:
   - Volume needed must be at least 20mL
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
6. **Accurate Information**: Provide accurate volume requirements
7. **Realistic Deadlines**: Set realistic needed-by dates
8. **Appropriate Urgency**: Select appropriate urgency level based on genuine need
9. **Stay Updated**: Update or cancel requests if circumstances change
