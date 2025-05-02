import {
  CheckCircle2Icon,
  ChevronsRightIcon,
  EditIcon,
  HeartIcon,
  LockIcon,
  LucideMailbox,
  LucideProps,
  SearchIcon,
} from 'lucide-react-native';
import { FC } from 'react';

import { ONBOARDING_IMAGES } from '@/lib/constants/images';
import { ListProps } from './_components/list';

export type OnboardingData = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  Image: FC<LucideProps>;
  footer?: ListProps['items'];
};

export const onboardingData: OnboardingData[] = [
  {
    id: '1',
    title: 'Welcome to LacktaLink!',
    subtitle: 'Connecting Milk Donors & Recipients',
    Image: ONBOARDING_IMAGES.onboarding1,
    description:
      'Every drop counts! LactaLink helps mothers donate and receive breast milk safely and conveniently.',
    footer: [
      {
        icon: ChevronsRightIcon,
        iconPosition: 'right',
        content: 'Swipe to learn more!',
        variant: 'muted',
      },
    ],
  },
  {
    id: '2',
    title: 'Become a Donor',
    subtitle: 'Give the Gift of Nourishment',
    description: 'Help babies thrive by donating your excess breast milk.',
    Image: ONBOARDING_IMAGES.onboarding2,
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
      {
        icon: HeartIcon,
        iconPosition: 'left',
        content: 'Make a difference in a baby’s life today!',
        variant: 'primary',
      },
    ],
  },
  {
    id: '3',
    title: 'Receive with Ease',
    subtitle: 'Find a Trusted Donor',
    description: 'Need breast milk for your little one? We’ve got you covered.',
    Image: ONBOARDING_IMAGES.onboarding3,
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
      {
        icon: LockIcon,
        iconPosition: 'left',
        content: 'Ensure safe and healthy nourishment for your baby.',
        variant: 'primary',
      },
    ],
  },
  {
    id: '4',
    title: 'Let’s get started',
    subtitle: 'Sign up now and start nourishing!',
    description: "Let's nourish together! 🍼",
    Image: ONBOARDING_IMAGES.onboarding4,
  },
];
