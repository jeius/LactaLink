import { ActionModal, ActionModalProps } from '@/components/modals';
import { Button, ButtonIcon, ButtonProps, ButtonText } from '@/components/ui/button';
import { ActionSheet } from '@/components/ui/sheet/action-sheet';
import { useMeUser } from '@/hooks/auth/useAuth';
import { Donation, Request } from '@lactalink/types/payload-generated-types';
import { isDonation } from '@lactalink/utilities/type-guards';
import { useRouter } from 'expo-router';
import { EditIcon, LucideIcon, Trash2Icon, XCircleIcon } from 'lucide-react-native';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import { GestureResponderEvent } from 'react-native';
import { useCancelDonation } from '../hooks/mutations/donation';
import { isCancellableListing, isDeletableListing, isEditableListing } from '../lib/utils';

type IAction = Pick<ButtonProps, 'action' | 'variant' | 'disablePressAnimation' | 'onPress'> &
  Pick<
    ActionModalProps,
    'onConfirm' | 'title' | 'description' | 'confirmButtonProps' | 'cancelButtonProps'
  > & {
    label: string;
    icon: LucideIcon;
    isModal?: boolean;
  };

interface Methods {
  open: (doc: Donation | Request) => void;
  close: () => void;
}

interface Props {
  doc?: Donation | Request | null;
  onEdit?: (e: GestureResponderEvent) => void;
  onDelete?: (e: GestureResponderEvent) => void;
  onCancel?: (e: GestureResponderEvent) => void;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const ListingOwnerActionsheet = forwardRef<Methods, Props>(function ListingOwnerActionSheet(
  { doc: docProp, trigger, isOpen, onOpenChange },
  ref
) {
  const router = useRouter();
  const { data: meUser } = useMeUser();

  const [doc, setDocument] = useState(docProp);

  const handleOpen = useCallback(() => {
    onOpenChange?.(true);
  }, [onOpenChange]);

  const handleClose = useCallback(() => {
    onOpenChange?.(false);
  }, [onOpenChange]);

  useImperativeHandle(ref, () => ({
    open: (doc) => {
      setDocument(doc);
      handleOpen();
    },
    close: handleClose,
  }));

  const { mutateAsync: cancelDonation, isPending: isCancellingDonation } = useCancelDonation(
    doc && isDonation(doc) ? doc : null
  );

  const actions = useMemo(() => {
    const actions: IAction[] = [];
    if (!doc) return actions;

    const isEditable = isEditableListing(doc, meUser);
    const isCancellable = isCancellableListing(doc, meUser);
    const isDeletable = isDeletableListing(doc, meUser);

    if (isEditable || true) {
      actions.push({
        label: isDonation(doc) ? 'Edit Donation' : 'Edit Request',
        icon: EditIcon,
        action: 'default',
        variant: 'ghost',
        disablePressAnimation: true,
        onPress: () => {
          onOpenChange?.(false); // Close the sheet before navigating
          router.push(`/donations/${doc.id}/edit`);
        },
      });
    }

    if (isCancellable || true) {
      actions.push({
        label: isDonation(doc) ? 'Cancel Donation' : 'Cancel Request',
        icon: XCircleIcon,
        action: 'negative',
        variant: 'ghost',
        disablePressAnimation: true,
        isModal: true,
        title: 'Confirm Cancellation',
        description: 'Are you sure you want to cancel this donation?',
        confirmButtonProps: {
          label: 'Yes, Cancel',
          action: 'default',
          isLoading: isCancellingDonation,
          isDisabled: isCancellingDonation,
        },
        cancelButtonProps: { label: 'No' },
        onConfirm: async () => {
          if (isDonation(doc)) await cancelDonation();
        },
      });
    }

    if (isDeletable || true) {
      actions.push({
        label: isDonation(doc) ? 'Delete Donation' : 'Delete Request',
        icon: Trash2Icon,
        action: 'negative',
        variant: 'solid',
        isModal: true,
        title: 'Confirm Deletion',
        description: 'Are you sure you want to delete this donation? This action cannot be undone.',
        confirmButtonProps: { label: 'Delete' },
        onConfirm: () => console.log('Delete Donation'),
      });
    }

    return actions;
  }, [cancelDonation, doc, isCancellingDonation, meUser, onOpenChange, router]);

  useEffect(() => {
    setDocument(docProp);
  }, [docProp]);

  return (
    <ActionSheet open={isOpen} setOpen={onOpenChange}>
      {trigger && <ActionSheet.Trigger asChild>{trigger}</ActionSheet.Trigger>}

      <ActionSheet.Content className="gap-2 px-4">
        {actions.map(({ icon, label, isModal, ...rest }, idx) => {
          if (isModal) {
            return <ActionModal {...rest} key={idx} triggerButtonProps={{ icon, label }} />;
          }

          return (
            <Button
              key={idx}
              variant={rest.variant}
              action={rest.action}
              onPress={rest.onPress}
              disablePressAnimation={rest.disablePressAnimation}
            >
              <ButtonIcon as={icon} />
              <ButtonText>{label}</ButtonText>
            </Button>
          );
        })}
      </ActionSheet.Content>
    </ActionSheet>
  );
});

ListingOwnerActionsheet.displayName = 'ListingOwnerActionsheet';

export type { Methods as ListingOwnerActionsheetRef };
export default ListingOwnerActionsheet;
