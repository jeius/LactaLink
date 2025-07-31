# LactaLink Donation Creation Process

## Overview

The donation creation process in LactaLink is designed to ensure accurate tracking of breast milk from collection to delivery. This document outlines the complete workflow for creating donations and the associated milk bags, which are the fundamental units of donated milk in the system.

## Milk Bag Lifecycle

Before understanding donation creation, it's important to understand the lifecycle of milk bags:

```
DRAFT → AVAILABLE → ALLOCATED → CONSUMED
```

Each milk bag follows this progression as it moves through the system:

1. **DRAFT**: Initial state when a milk bag is created but not yet ready for donation
2. **AVAILABLE**: Milk bag is verified and available for donation or allocation
3. **ALLOCATED**: Milk bag has been assigned to a request but not yet consumed
4. **CONSUMED**: Milk bag has been received by the recipient and used

Additional statuses include:

- **EXPIRED**: Milk bag has passed its expiration date
- **DISCARDED**: Milk bag was disposed of due to quality concerns or other issues

## Donation Creation Process

### Phase 1: Creating Milk Bags

#### Step 1: Milk Bag Information Entry

```
User logs milk bag details → System generates unique code → Status: DRAFT
```

**What happens:**

- User enters essential milk bag information:
  - Volume (in milliliters)
  - Collection date
  - Storage type (fresh or frozen)
  - Collection method
- System automatically:
  - Generates a unique 6-character code for each milk bag
  - Sets initial status as DRAFT
  - Calculates expiry date (based on collection date and storage type)
  - Associates the bag with the current user as owner

#### Step 2: Code Application and Verification

```
User prints/writes code on physical milk bag → User photographs bag with visible code → Status verification
```

**What happens:**

- User receives the generated code for each milk bag
- User physically marks each milk bag with its corresponding code
- User uploads a photo of each milk bag showing the code clearly visible
  - Note: Photos are optional during initial creation but required before donation submission
- This two-step process ensures accurate tracking while providing a smooth user experience

### Phase 2: Creating the Donation

#### Step 3: Donation Information Entry

```
User creates donation → Selects milk bags to include → Provides donation details
```

**What happens:**

- User selects DRAFT milk bags to include in the donation
- User provides donation details:
  - Recipient (if any, otherwise general donation)
  - Storage type confirmation
  - Delivery preferences
  - Notes or special instructions
- System validates that milk bags belong to the user and are in DRAFT status

#### Step 4: Donation Submission and Bag Status Update

```
User submits donation → System validates → Donation created → Milk bags status: AVAILABLE
```

**What happens:**

- User confirms donation details and that codes are affixed to physical milk bags
- System creates the donation record with status based on recipient:
  - If general donation: Status = AVAILABLE
  - If directed to specific recipient: Status = PENDING (requires approval)
- System updates all included milk bags from DRAFT to AVAILABLE
- System calculates total donation volume based on included milk bags
- Donation is now visible in the system for potential matching or recipient approval

### Phase 3: Post-Creation

#### Step 5: Notification and Next Steps

```
Donation created → Notifications sent → Appears in relevant searches
```

**What happens:**

- User receives confirmation that donation was successfully created
- If directed donation, recipient receives notification
- Donation appears in search results for potential recipients
- Matching process can begin (see [Matching System Documentation](./MATCHING_SYSTEM.md))

## Special Cases

### Directed Donation to Individual

When creating a donation for a specific individual:

1. User selects individual recipient during donation creation
2. Donation status is set to PENDING
3. Recipient must approve the donation
4. Upon approval, system creates a Transaction record automatically
5. Transaction follows delivery process (see [Delivery System Documentation](./DELIVERY_SYSTEM.md))

### Directed Donation to Organization

When donating directly to a hospital or milk bank:

1. User selects organization as recipient
2. Donation status is set to PENDING
3. Organization approves the donation (status changes to MATCHED)
4. System creates a Transaction with DELIVERY mode automatically
5. When transaction is completed, milk bags are added to organization's inventory

## Important Validation Rules

The system enforces several validation rules during donation creation:

1. **Milk Bag Requirements**:
   - Volume must be specified (minimum 20ml)
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

## Technical Implementation Details

### Milk Bag Code Generation

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

### Donation Volume Calculation

The system automatically calculates donation volume by summing the volumes of all included milk bags:

```typescript
// Calculate total donation volume
data.volume = bags.reduce((sum, bag) => sum + (bag.volume || 0), 0);
```

### Status Transitions

The system manages status transitions through hooks that execute during creation and update operations.
