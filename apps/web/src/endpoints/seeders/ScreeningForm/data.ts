import { DonorScreeningForm } from '@lactalink/types/payload-generated-types';

type Question = NonNullable<DonorScreeningForm['fields']>[number] & {
  order: number;
  placeholder?: string;
  description?: string;
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
    name: ' deliveryDate',
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
    width: 0.33,
  },
  {
    name: 'breastfeedingDurationMonths',
    label: 'How long have you been breastfeeding your current child? (in months)',
    blockType: 'number',
    placeholder: 'Enter the number of months you have been breastfeeding',
    order: 2,
    required: true,
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
];
