# Donation Management

This document details the donation management system in LactaLink, outlining the processes, components, and workflows involved in creating, tracking, and managing breast milk donations.

## Overview

The donation management system enables individuals to donate breast milk to recipients or organizations. The system ensures proper tracking, verification, and allocation of donated milk through a structured workflow and comprehensive data management.

## Core Components

### Milk Bags

Milk bags are the fundamental units of donation in LactaLink. Each milk bag represents a container of breast milk with the following properties:

- **Volume**: Amount of milk in milliliters (mL)
- **Collection Date**: When the milk was expressed
- **Storage Type**: Fresh or frozen
- **Unique Code**: System-generated identifier for tracking
- **Status**: Current state in the lifecycle (DRAFT, AVAILABLE, ALLOCATED, CONSUMED, EXPIRED, DISCARDED)
- **Expiration Date**: Calculated based on collection date and storage type

### Donations

A donation consists of one or more milk bags grouped together for distribution. Donations include:

- **Donor Information**: User who is donating the milk
- **Volume Details**: Total volume and remaining available volume
- **Status**: Current state (AVAILABLE, PARTIALLY_ALLOCATED, FULLY_ALLOCATED, COMPLETED)
- **Recipient**: Target recipient (if specified) or null for general donations
- **Delivery Preferences**: Options for how the donation can be received

### Transactions

Transactions manage the delivery and exchange process of donations. Each transaction includes:

- **Status**: Status of the transaction (e.g., PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
- **Involved Parties**: Sender (donor or organization) and receiver (recipient or organization)
- **Involved Donations**: References to the donations being transferred
- **Involved Requests**: References to the requests being fulfilled
- **Matched Milk Bags**: Specific milk bags involved in the transaction
- **Delivery Mode**: Method of delivery (e.g., PICKUP, DELIVERY)
- **Delivery Address**: Location for delivery or pickup

## Milk Bag Lifecycle

Individual milk bags follow a defined status progression:

```
DRAFT → AVAILABLE → ALLOCATED → CONSUMED
```

Each milk bag follows this progression as it moves through the system:

1. **DRAFT**: Initial state during creation (Until verified)
2. **AVAILABLE**: Ready for donation (Verified and code affixed)
3. **ALLOCATED**: Assigned to a specific request
4. **CONSUMED**: Received and used by recipient

Additional statuses include:

- **EXPIRED**: Past usable date
- **DISCARDED**: Removed from circulation due to quality concerns

## Donation Lifecycle

### Status Transitions

Donations follow a defined status flow:

1. **AVAILABLE**: Initial state when donation is created and ready for matching
2. **PARTIALLY_ALLOCATED**: Some milk bags have been allocated to requests
3. **FULLY_ALLOCATED**: All milk bags have been allocated
4. **COMPLETED**: All milk bags have been consumed by recipients

## Donation Creation Process

The donation creation process is designed to ensure accurate tracking of breast milk from collection to delivery.

### Phase 1: Creating Milk Bags

#### Step 1: Milk Bag Information Entry

```
User logs milk bag details → System generates unique code → Status: DRAFT
```

Users begin by recording details for each milk bag:

- Volume in milliliters (minimum 20ml)
- Collection date
- Storage type (fresh or frozen)
- Collection method

The system automatically:

- Generates a unique 6-character code for tracking
- Sets initial status as DRAFT
- Calculates expiration date based on collection date and storage type
- Associates the bag with the current user as owner

#### Step 2: Code Application and Verification

```
User prints/writes code on physical milk bag → User photographs bag with visible code → Status verification
```

To ensure proper tracking:

- User receives the generated code for each milk bag
- User physically marks each milk bag with its corresponding code
- User uploads a photo of the milk bag with visible code
- System verifies that each milk bag has been properly labeled
- Note: Photos are optional during initial creation but required before donation submission

### Phase 2: Creating the Donation

#### Step 3: Donation Information Entry

```
User creates donation → Selects milk bags to include → Provides donation details
```

Users specify donation parameters:

- Selection of DRAFT milk bags to include in the donation
- Recipient selection (specific individual/organization or general donation)
- Storage type confirmation
- Delivery preferences
- Additional notes or instructions
- System validates that milk bags belong to the user and are in DRAFT status

#### Step 4: Submission and Validation

```
User submits donation → System validates → Donation created → Milk bags status: AVAILABLE
```

Upon submission:

- User confirms donation details and that codes are affixed to physical milk bags
- System validates all required information
- System creates the donation record with status based on recipient:
  - If general donation: Status = AVAILABLE
  - If directed to specific recipient: Status = PENDING (requires approval)
- Milk bags are updated from DRAFT to AVAILABLE
- Total donation volume is calculated based on included milk bags
- Donation record is created with appropriate status

### Phase 3: Post-Creation

#### Step 5: Notification and Next Steps

```
Donation created → Notifications sent → Appears in relevant searches
```

After successful creation:

- User receives confirmation that donation was successfully created
- If directed donation, recipient receives notification
- Donation appears in search results for potential recipients
- Matching process can begin

## Special Cases

### Directed Donation to Individual

When creating a donation for a specific individual:

1. User selects individual recipient during donation creation
2. Donation status is set to PENDING
3. Recipient must approve the donation
4. Upon approval, system creates a [Transaction](#directed-donation-to-individual) record
5. [Transaction](#directed-donation-to-individual) manages the delivery process

### Directed Donation to Organization

When donating directly to a hospital or milk bank:

1. User selects organization as recipient
2. Donation status is set to PENDING
3. Organization approves the donation (status changes to MATCHED)
4. System creates a [Transaction](#directed-donation-to-organization) with DELIVERY mode
5. When transaction is completed, milk bags are added to organization's inventory

## Donation Management

### Tracking and Notifications

The system provides:

- Real-time status updates on donations
- Notification when recipients respond to donation offers
- Alerts when milk bags are nearing expiration
- Statistics on donation history and impact

### Partial Allocation

Donations can be partially allocated:

- Individual milk bags can be assigned to different requests
- Donation status reflects partial allocation
- Remaining volume is available for other requests
- Each allocation creates a separate transaction

## Technical Implementation

### Database Structure

The donation system uses these primary collections:

- **MilkBags**: Stores individual milk bag records
- **Donations**: Manages donation metadata and relationships
- **Transactions**: Handles the delivery and exchange process

### Key Services and Hooks

The system implements several hooks to manage donation workflow:

- **initializeDonation**: Prepares new donation records
- **calculateVolumes**: Updates volume calculations based on milk bag status
- **generateTitle**: Creates standardized titles for donations
- **notifications**: Handles notification generation for donation events
- **processDonationToOrganization**: Special processing for organization recipients

### API Endpoints

Custom endpoints support donation functionality:

- **/donations/:id/matched-requests**: Retrieves potential matching requests
- **/donations/near**: Finds nearby donations based on location

### Code Generation

The system uses a cryptographically secure random generator to create unique 6-character codes:

```typescript
// Generate a unique 6-character code
data.code = randomBytes(3).toString('hex').toUpperCase();
```

### Milk Bag to Donation Association

Milk bags are linked to donations through a many-to-many relationship:

```typescript
{
  name: 'bags',
  label: 'Milk Bags',
  type: 'relationship',
  relationTo: 'milkBags',
  required: true,
  hasMany: true,
}
```

### Volume Calculation

The system automatically calculates donation volume by summing the volumes of all included milk bags:

```typescript
// Calculate total donation volume
data.volume = bags.reduce((sum, bag) => sum + (bag.volume || 0), 0);
```

### Status Transitions

The system manages status transitions through hooks that execute during creation and update operations.

## Validation Rules

The system enforces validation to ensure data integrity:

1. **Milk Bag Requirements**:
   - Volume must be at least 20mL
   - Collection date must be provided
   - Physical code must be confirmed as affixed
   - Photo of milk bag with visible code must be uploaded before donation submission
     (This is enforced by the UI, not the database schema)

2. **Donation Requirements**:
   - At least one milk bag must be included
   - Donor must be specified (defaults to current user)
   - Total donation volume must be greater than zero

3. **Code Affixing Verification**:
   - User must upload a clear photo showing the code affixed to each physical milk bag before finalizing donation
   - UI blocks final submission until these photos are provided
   - Photos serve as proof that codes have been properly applied

## Best Practices for Donors

1. **Accurate Information**: Enter precise collection dates and volumes
2. **Immediate Coding**: Affix codes to milk bags immediately after receiving them
3. **Consistent Labeling**: Use waterproof markers or labels for durability
4. **Photo Documentation**: Consider adding milk sample photos for quality assurance
5. **Notes Addition**: Include any relevant information about diet or medications
6. **Prompt Response**: Respond quickly to recipient communications
7. **Storage Guidelines**: Store milk according to recommended guidelines
