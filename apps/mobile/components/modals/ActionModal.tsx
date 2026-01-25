import { LucideIcon, LucideProps } from 'lucide-react-native';
import React, { ComponentProps, FC, ReactNode, useState } from 'react';
import { GestureResponderEvent } from 'react-native';
import { Button, ButtonIcon, ButtonSpinner, ButtonText } from '../ui/button';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '../ui/modal';
import { Text } from '../ui/text';

type ButtonProps = ComponentProps<typeof Button>;

interface ActionModalProps extends ButtonProps {
  onConfirm?: () => void;
  onCancel?: () => void;
  triggerLabel?: string;
  triggerIcon?: LucideIcon | FC<LucideProps>;
  iconOnly?: boolean;
  enableSpinner?: boolean;
  onTriggerPress?: (event: GestureResponderEvent) => Promise<void>;
  confirmLabel?: string;
  confirmAction?: ButtonProps['action'];
  cancelLabel?: string;
  title?: string;
  description?: string | ReactNode;
  modalSize?: ComponentProps<typeof Modal>['size'];
}

export function ActionModal({
  onCancel,
  onConfirm,
  triggerIcon,
  iconOnly = false,
  triggerLabel = 'Action',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed with this action? This action cannot be undone.',
  confirmAction,
  onTriggerPress,
  modalSize = 'md',
  enableSpinner = false,
  ...props
}: ActionModalProps) {
  const [open, setOpen] = useState(false);

  function toggleModal() {
    setOpen((prev) => !prev);
  }

  async function handleTriggerPress(e: GestureResponderEvent) {
    if (onTriggerPress) {
      // If onTriggerPress throws an error, we stop the modal from opening.
      // This is useful if the trigger is a form submit button that might fail validation.
      onTriggerPress(e).catch().then(toggleModal);
    } else {
      toggleModal();
    }
  }

  function handleConfirm() {
    onConfirm?.();
    toggleModal();
  }

  function handleCancel() {
    onCancel?.();
    toggleModal();
  }

  return (
    <>
      <Button {...props} onPress={handleTriggerPress}>
        {enableSpinner ? <ButtonSpinner /> : triggerIcon && <ButtonIcon as={triggerIcon} />}
        {!iconOnly && <ButtonText>{triggerLabel}</ButtonText>}
      </Button>
      <Modal size={modalSize} isOpen={open} onClose={toggleModal}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Text bold size="lg">
              {title}
            </Text>
          </ModalHeader>
          <ModalBody>
            {typeof description === 'string' ? <Text>{description}</Text> : description}
          </ModalBody>
          <ModalFooter>
            <Button action="default" variant="outline" onPress={handleCancel}>
              <ButtonText>{cancelLabel}</ButtonText>
            </Button>
            <Button action={confirmAction || props.action} onPress={handleConfirm}>
              <ButtonText>{confirmLabel}</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
