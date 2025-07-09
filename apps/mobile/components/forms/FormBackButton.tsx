import { useFormContext } from 'react-hook-form';
import { HeaderBackButton } from '../HeaderBackButton';

export function FormBackButton({ preventBack }: { preventBack?: boolean }) {
  const message = 'You have unsaved changes. Are you sure you want to leave?';

  const form = useFormContext();
  const isDirty = form?.formState?.isDirty;
  const isPreventBack = preventBack !== undefined ? preventBack : isDirty;

  return <HeaderBackButton message={message} preventBack={isPreventBack} />;
}
