import { Button, ButtonProps, ButtonText } from '@/components/ui/button';
import { ProposeSearchParams } from '@/features/transactions/lib/types';
import { Link } from 'expo-router';
import { useTransactionContext } from './context';

export default function ProposeButton({
  label = 'Propose',
  size = 'sm',
}: {
  label?: string;
  size?: ButtonProps['size'];
}) {
  const transaction = useTransactionContext();
  const params: ProposeSearchParams = { txnID: transaction.id };
  return (
    <Link asChild push href={{ pathname: '/transactions/propose', params }}>
      <Button size={size}>
        <ButtonText numberOfLines={1}>{label}</ButtonText>
      </Button>
    </Link>
  );
}
