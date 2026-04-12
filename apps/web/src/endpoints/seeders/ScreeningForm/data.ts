import { DonorScreeningForm } from '@lactalink/types/payload-generated-types';

type Question = NonNullable<DonorScreeningForm['fields']>[number] & {
  order: number;
};

const yesNoOptions = [
  { label: 'Yes', value: 'yes' },
  { label: 'No', value: 'no' },
];

const personalQuestions: Question[] = [
  {
    name: 'name',
    label: 'Name',
    blockType: 'text',
    placeholder: 'Enter your full name',
    order: 1,
    required: true,
  },
  {
    name: 'birthdate',
    label: 'Date of Birth',
    blockType: 'date',
    placeholder: 'Select your birthdate',
    order: 2,
    required: true,
  },
  {
    name: 'email',
    label: 'Email',
    blockType: 'email',
    placeholder: 'Enter your email address',
    order: 3,
    required: true,
  },
  {
    name: 'hospitalID',
    label: 'Hospital ID',
    blockType: 'text',
    placeholder: 'Enter your hospital ID (if applicable)',
    order: 4,
  },
  {
    name: 'deliveryDate',
    label: 'Date of Delivery',
    blockType: 'date',
    placeholder: 'Select the date of your delivery',
    order: 5,
    required: true,
  },
  {
    name: 'deliveryType',
    label: 'Type of Delivery',
    blockType: 'radio',
    options: [
      { label: 'Vaginal', value: 'vaginal' },
      { label: 'Cesarean', value: 'cesarean' },
    ],
    order: 6,
    required: true,
  },
];

const breastFeedingHistoryQuestions: Question[] = [
  {
    name: 'numberOfChildren',
    label: 'How many children have you given birth to?',
    blockType: 'number',
    order: 1,
    required: true,
    width: '1/4',
  },
  {
    name: 'breastfeedingDurationMonths',
    label: 'How long have you been breastfeeding your current child? (in months)',
    blockType: 'number',
    order: 2,
    required: true,
    width: '1/2',
  },
  {
    name: 'milkExpressionFrequency',
    label: 'How often do you express breast milk?',
    blockType: 'select',
    options: [
      { value: 'never', label: 'Never' },
      { value: 'occasionally', label: 'Occasionally' },
      { value: 'onceDaily', label: 'Once daily' },
      { value: 'twoToThreeDaily', label: 'Two to three times daily' },
      { value: 'fourToSixDaily', label: 'Four to six times daily' },
      { value: 'moreThanSixDaily', label: 'More than six times daily' },
    ],
    order: 3,
    required: true,
  },
  {
    name: 'hasMilkSurplus',
    label: 'Do you have a surplus of breast milk?',
    blockType: 'radio',
    options: yesNoOptions,
    order: 4,
    required: true,
  },
  {
    name: 'surplusMilkAmountOz',
    label: `If so, how much milk do you typically have left after your baby's needs are met? (in mL)`,
    blockType: 'number',
    placeholder: 'Enter the amount in mL (e.g., 150)',
    order: 5,
    required: false,
  },
  {
    name: 'hasDonatedBefore',
    label: 'Do you have any experience donating breast milk before?',
    blockType: 'radio',
    options: yesNoOptions,
    order: 6,
    required: true,
  },
  {
    name: 'breastFeedingIssues',
    label: 'Have you had any issues with breastfeeding or milk production?',
    blockType: 'multi-select',
    helperText: 'You can select multiple options',
    width: 'full',
    options: [
      { value: 'none', label: 'None' },
      { value: 'latchIssues', label: 'Latching issues' },
      { value: 'lowMilkSupply', label: 'Low milk supply' },
      { value: 'oversupply', label: 'Oversupply' },
      { value: 'mastitis', label: 'Mastitis' },
      { value: 'nipplePain', label: 'Nipple pain' },
      { value: 'engorgement', label: 'Engorgement' },
    ],
    withDynamicOption: true,
    order: 7,
    required: true,
  },
  {
    order: 8,
    name: 'currentMedications',
    label: 'Are you currently taking any medications or supplements?',
    blockType: 'multi-select',
    helperText: 'You can select multiple options',
    width: 'full',
    options: [
      { value: 'none', label: 'None' },
      { value: 'prescription', label: 'Prescription medications' },
      { value: 'prenatalVitamins', label: 'Prenatal vitamins' },
      { value: 'iron', label: 'Iron supplements' },
      { value: 'calcium', label: 'Calcium supplements' },
      { value: 'herbal', label: 'Herbal supplements' },
    ],
    withDynamicOption: true,
    required: true,
  },
  {
    order: 9,
    name: 'allergies',
    label: 'Do you have any allergies?',
    blockType: 'radio',
    options: yesNoOptions,
    required: true,
  },
];

const healthScreeningQuestions: Question[] = [
  {
    order: 1,
    name: 'hasMedicalConditions',
    label: 'Do you have any current medical conditions?',
    blockType: 'radio',
    options: yesNoOptions,
    required: true,
  },
  {
    order: 2,
    name: 'hadSeriousIllnesses',
    label: 'Have you ever had any serious illnesses or infections?',
    blockType: 'radio',
    options: yesNoOptions,
    required: true,
  },
  {
    order: 3,
    name: 'hadSurgeries',
    label: 'Have you ever had any surgeries?',
    blockType: 'radio',
    options: yesNoOptions,
    required: true,
  },
  {
    order: 4,
    name: 'isCurrentlyPregnant',
    label: 'Are you currently pregnant?',
    blockType: 'radio',
    options: yesNoOptions,
    required: true,
  },
  {
    order: 5,
    name: 'testedForInfectiousDiseases',
    label: 'Have you ever been tested for HIV, Hepatitis B, or Hepatitis C?',
    blockType: 'radio',
    options: yesNoOptions,
    required: true,
  },
  {
    order: 6,
    name: 'infectiousDiseasesTestResults',
    label: 'If yes, please provide the results.',
    blockType: 'textarea',
    placeholder: 'Describe your test results (e.g., HIV negative, Hepatitis B negative)',
    required: false,
  },
  {
    order: 7,
    name: 'hasFamilyGeneticHistory',
    label: 'Do you have any family history of genetic diseases?',
    blockType: 'radio',
    options: yesNoOptions,
    required: true,
  },
  {
    order: 8,
    name: 'diagnosedWithSTD',
    label: 'Have you ever been diagnosed with any sexually transmitted diseases?',
    blockType: 'radio',
    options: yesNoOptions,
    required: true,
  },
  {
    order: 9,
    name: 'smokesOrUsesDrugs',
    label: 'Do you smoke or use recreational drugs?',
    blockType: 'radio',
    options: yesNoOptions,
    required: true,
  },
  {
    order: 10,
    name: 'drinksAlcohol',
    label: 'Do you drink alcohol?',
    blockType: 'radio',
    options: yesNoOptions,
    required: true,
  },
  {
    order: 11,
    name: 'hasMentalHealthIssues',
    label: 'Have you ever had any issues with mental health?',
    blockType: 'radio',
    options: yesNoOptions,
    required: true,
  },
  {
    order: 12,
    name: 'hadRecentHealthTreatment',
    label:
      'Have you had any health treatment (including IVF and/or diagnostic tests) in the past 12 months?',
    blockType: 'radio',
    options: yesNoOptions,
    required: true,
  },
];

const donationPreferencesQuestions: Question[] = [
  {
    order: 1,
    name: 'willingToDonate',
    label: 'Are you willing to donate your surplus breast milk?',
    blockType: 'radio',
    options: yesNoOptions,
    required: true,
  },
  {
    order: 2,
    name: 'donationReasons',
    label: 'If so, what are your reasons for wanting to donate?',
    blockType: 'multi-select',
    width: 'full',
    options: [
      { value: 'helpBabies', label: 'To help babies in need' },
      { value: 'excessMilk', label: 'I have excess milk and do not want it to go to waste' },
      { value: 'communitySupport', label: 'To support my community' },
      { value: 'medicalAdvice', label: 'On medical advice' },
      { value: 'memorial', label: 'In memory of a loved one' },
    ],
    withDynamicOption: true,
    required: false,
  },
  {
    order: 3,
    name: 'donationRestrictions',
    label: 'Are there any specific situations where you would not be willing to donate?',
    blockType: 'multi-select',
    width: 'full',
    options: [
      { value: 'none', label: 'No restrictions' },
      { value: 'noIdentityDisclosure', label: 'Recipient identity is not shared with me' },
      { value: 'commercialUse', label: 'Milk is used for commercial purposes' },
      { value: 'babyNeedsMore', label: 'My baby needs more milk' },
      { value: 'onMedications', label: 'I am currently on medications' },
    ],
    withDynamicOption: true,
    required: false,
  },
  {
    order: 4,
    name: 'wantsRecipientUpdates',
    label: 'Would you like to be informed about the babies who receive your donated milk?',
    blockType: 'radio',
    options: yesNoOptions,
    required: true,
  },
  {
    order: 5,
    name: 'donationConcerns',
    label: 'Do you have any questions or concerns about donating breast milk?',
    blockType: 'textarea',
    placeholder: 'Share any questions or concerns you may have',
    required: false,
  },
];

const informedConsentQuestions: Question[] = [
  {
    order: 1,
    name: 'consentScreening',
    label: 'I understand that my breast milk will be screened for safety and suitability.',
    blockType: 'checkbox',
    required: true,
  },
  {
    order: 2,
    name: 'consentConfidentiality',
    label: 'I understand that my personal information will be kept confidential.',
    blockType: 'checkbox',
    required: true,
  },
  {
    order: 3,
    name: 'consentWithdrawal',
    label: 'I understand that I can withdraw from the donation program at any time.',
    blockType: 'checkbox',
    required: true,
  },
  {
    order: 4,
    name: 'consentParticipation',
    label: 'I agree to participate in the breast milk donation program.',
    blockType: 'checkbox',
    required: true,
  },
];

export const sections: NonNullable<DonorScreeningForm['sections']> = [
  {
    title: 'Personal Information',
    description: 'Tell us about yourself and your breastfeeding journey.',
    fields: personalQuestions
      .sort((a, b) => a.order - b.order)
      .map(({ order: _, ...rest }) => rest),
  },
  {
    title: 'Breastfeeding History',
    description: 'Share details about your breastfeeding experience and milk production.',
    fields: breastFeedingHistoryQuestions
      .sort((a, b) => a.order - b.order)
      .map(({ order: _, ...rest }) => rest),
  },
  {
    title: 'Health Screening',
    description: 'Answer questions about your health to ensure the safety of your milk.',
    fields: healthScreeningQuestions
      .sort((a, b) => a.order - b.order)
      .map(({ order: _, ...rest }) => rest),
  },
  {
    title: 'Donation Preferences',
    description: 'Let us know your preferences and motivations for donating breast milk.',
    fields: donationPreferencesQuestions
      .sort((a, b) => a.order - b.order)
      .map(({ order: _, ...rest }) => rest),
  },
  {
    title: 'Informed Consent',
    description:
      'Please read and agree to the following statements to participate in the donation program.',
    fields: informedConsentQuestions
      .sort((a, b) => a.order - b.order)
      .map(({ order: _, ...rest }) => rest),
  },
];
