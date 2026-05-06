import { DONATION_CREATE_STEPS } from '@/features/donation&request/lib/constants';
import { Redirect, useLocalSearchParams } from 'expo-router';

export default function CreatePageRedirect() {
  const params = useLocalSearchParams();
  const firstStep = DONATION_CREATE_STEPS.details.value;
  return <Redirect href={{ pathname: `/donations/create/${firstStep}`, params }} />;
}
