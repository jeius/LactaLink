import { Box } from '@/components/ui/box';
import { useCheckAuth } from '@/hooks/auth/useCheckAuth';
import { FC } from 'react';
import SafeArea, { SafeAreaProps } from '../SafeArea';
import { Spinner } from '../ui/spinner';

export const Protected: FC<SafeAreaProps> = (props) => {
  const { isLoading, isFetching } = useCheckAuth();

  if (isLoading) {
    return (
      <SafeArea className="items-center justify-center">
        <Spinner size={'large'} />
      </SafeArea>
    );
  }

  return (
    <SafeArea className="justify-center" {...props}>
      {props.children}
      {isFetching && (
        <Box className="absolute right-3 top-0">
          <SafeArea>
            <Spinner size={'small'} />
          </SafeArea>
        </Box>
      )}
    </SafeArea>
  );
};
