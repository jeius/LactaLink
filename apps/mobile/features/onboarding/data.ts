import { CheckCircle2Icon, EditIcon, LucideMailbox, SearchIcon } from 'lucide-react-native';

import { getImageAsset } from '@/lib/stores';
import { ImageSource } from 'expo-image';
import { ListProps } from './list';

export type OnboardingData = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: { alt: string; source: ImageSource };
  footer?: ListProps['items'];
};

export const onboardingData: OnboardingData[] = [
  {
    id: '1',
    title: 'Welcome to LacktaLink!',
    subtitle: 'Connecting Milk Donors & Recipients',
    image: { alt: 'Connectivity', source: getImageAsset('onboarding1') },
    description:
      'Every drop counts! LactaLink helps mothers donate and receive breast milk safely and conveniently.',
  },
  {
    id: '2',
    title: 'Become a Donor',
    subtitle: 'Give the Gift of Nourishment',
    description: 'Help babies thrive by donating your excess breast milk.',
    image: { alt: 'Mother Donor', source: getImageAsset('onboarding2') },
    footer: [
      {
        icon: CheckCircle2Icon,
        iconPosition: 'left',
        content: 'Register and get approved by healthcare professionals.',
        variant: 'primary',
      },
      {
        icon: EditIcon,
        iconPosition: 'left',
        content: 'Track your donations and connect with recipients.',
        variant: 'primary',
      },
      // {
      //   icon: HeartIcon,
      //   iconPosition: 'left',
      //   content: 'Make a difference in a baby’s life today!',
      //   variant: 'primary',
      // },
    ],
  },
  {
    id: '3',
    title: 'Receive with Ease',
    subtitle: 'Find a Trusted Donor',
    description: 'Need breast milk for your little one? We’ve got you covered.',
    image: { alt: 'Delivery Man', source: getImageAsset('onboarding3') },
    footer: [
      {
        icon: SearchIcon,
        iconPosition: 'left',
        content: 'Browse approved donors near you.',
        variant: 'primary',
      },
      {
        icon: LucideMailbox,
        iconPosition: 'left',
        content: 'Request and schedule a pickup or delivery.',
        variant: 'primary',
      },
      // {
      //   icon: LockIcon,
      //   iconPosition: 'left',
      //   content: 'Ensure safe and healthy nourishment for your baby.',
      //   variant: 'primary',
      // },
    ],
  },
  {
    id: '4',
    title: 'Let’s get started',
    subtitle: 'Sign up now and start nourishing!',
    description: "Let's nourish together! 🍼",
    image: { alt: 'Mom Nourishing', source: getImageAsset('onboarding4') },
  },
];
