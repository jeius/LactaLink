import { LucideIcon, LucideProps } from 'lucide-react-native';
import React, { ComponentProps, FC, useState } from 'react';
import { Button, ButtonIcon, ButtonText } from '../ui/button';
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
  confirmLabel?: string;
  confirmAction?: ButtonProps['action'];
  cancelLabel?: string;
  title?: string;
  description?: string;
}

export default function ActionModal({
  onCancel,
  onConfirm,
  triggerIcon,
  triggerLabel = 'Action',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed with this action? This action cannot be undone.',
  confirmAction,
  ...props
}: ActionModalProps) {
  const [open, setOpen] = useState(false);

  function toggleModal() {
    setOpen((prev) => !prev);
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
      <Button {...props} onPress={() => setOpen(true)}>
        {triggerIcon && <ButtonIcon as={triggerIcon} />}
        <ButtonText>{triggerLabel}</ButtonText>
      </Button>
      <Modal isOpen={open} onClose={toggleModal}>
        <ModalBackdrop />
        <ModalContent>
          <ModalHeader>
            <Text bold size="lg">
              {title}
            </Text>
          </ModalHeader>
          <ModalBody>{<Text>{description}</Text>}</ModalBody>
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
