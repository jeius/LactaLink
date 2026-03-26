import { LucideIcon, LucideProps } from 'lucide-react-native';
import React, { ComponentProps, FC, ReactNode, useState } from 'react';
import { GestureResponderEvent } from 'react-native';
import { Button, ButtonIcon, ButtonProps, ButtonSpinner, ButtonText } from '../ui/button';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from '../ui/modal';
import { Text } from '../ui/text';

type IButtonProps = Omit<ButtonProps, 'onPress'> & {
  /**
   * Button label
   */
  label?: string | null;
  /**
   * Button icon
   */
  icon?: LucideIcon | FC<LucideProps> | null;
  /**
   * Renders a spinner instead of the icon when `true`.
   */
  isLoading?: boolean;
};

export interface ActionModalProps extends ButtonProps {
  /**
   * @deprecated Set the `triggerLabel` on `triggerButtonProps.label` instead.
   */
  triggerLabel?: string;
  /**
   * @deprecated Set the `triggerIcon` on `triggerButtonProps.icon` instead.
   */
  triggerIcon?: LucideIcon | FC<LucideProps>;
  /**
   * @deprecated Set the `label` = `null` from the buttonProps instead.
   */
  iconOnly?: boolean;
  /**
   * @deprecated Set the `enableSpinner` on `triggerButtonProps.isLoading` instead.
   */
  enableSpinner?: boolean;
  /**
   * @deprecated Set the `confirmLabel` on `confirmButtonProps.label` instead.
   */
  confirmLabel?: string;
  /**
   * @deprecated Set the `confirmAction` on `confirmButtonProps.action` instead.
   */
  confirmAction?: ButtonProps['action'];
  /**
   * @deprecated Set the `cancelLabel` on `cancelButtonProps.label` instead.
   */
  cancelLabel?: string;
  title?: string;
  description?: string | ReactNode;
  modalSize?: ComponentProps<typeof Modal>['size'];
  triggerButtonProps?: IButtonProps;
  confirmButtonProps?: IButtonProps;
  cancelButtonProps?: IButtonProps;
  /**
   * A callback function that is called when the trigger button is pressed.
   *
   * @description
   * If the function returns a promise, the modal will wait for the promise to resolve
   * before opening. If the promise is rejected, the modal will not open.
   *
   * This is useful for performing async operations before opening the modal, such as
   * form validation or API calls.
   *
   * If the function calls `event.preventDefault()`, the modal will not open.
   * This allows you to conditionally prevent the modal from opening based on custom logic.
   */
  onTriggerPress?: (event: GestureResponderEvent) => Promise<void>;
  onConfirm?: (e: GestureResponderEvent) => void;
  onCancel?: (e: GestureResponderEvent) => void;
}

export function ActionModal({
  triggerIcon,
  iconOnly = false,
  triggerLabel = 'Action',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmAction,
  enableSpinner = false,
  title = 'Confirm Action',
  description = 'Are you sure you want to proceed with this action? This action cannot be undone.',
  onTriggerPress,
  onCancel,
  onConfirm,
  modalSize = 'md',
  triggerButtonProps,
  confirmButtonProps,
  cancelButtonProps,
  ...props
}: ActionModalProps) {
  const [open, setOpen] = useState(false);

  const {
    isLoading: isTriggerLoading = enableSpinner,
    icon: triggerBtnIcon = triggerIcon,
    label: triggerBtnLabel = triggerLabel,
  } = triggerButtonProps || {};

  const {
    isLoading: isConfirmBtnLoading,
    label: confirmBtnLabel = confirmLabel,
    icon: confirmBtnIcon,
    action: confirmBtnAction = confirmAction,
    ...restConfirmBtnProps
  } = confirmButtonProps || {};

  const {
    label: cancelBtnLabel = cancelLabel,
    icon: cancelBtnIcon,
    isLoading: _cancelBtnLoading,
    action: cancelBtnAction = 'default',
    variant: cancelBtnVariant = 'outline',
    ...restCancelBtnProps
  } = cancelButtonProps || {};

  function toggleModal() {
    setOpen((prev) => !prev);
  }

  async function handleTriggerPress(e: GestureResponderEvent) {
    const proceed = await onTriggerPress?.(e).then(
      () => true,
      () => false
    );
    if (proceed === false) return;
    if (e.defaultPrevented) return;
    toggleModal();
  }

  function handleConfirm(e: GestureResponderEvent) {
    e.persist();
    onConfirm?.(e);
    if (!e.defaultPrevented) toggleModal();
  }

  function handleCancel(e: GestureResponderEvent) {
    e.persist();
    onCancel?.(e);
    if (!e.defaultPrevented) toggleModal();
  }

  return (
    <>
      <Button {...props} {...triggerButtonProps} onPress={handleTriggerPress}>
        {isTriggerLoading ? (
          <ButtonSpinner />
        ) : (
          triggerBtnIcon && <ButtonIcon as={triggerBtnIcon} />
        )}
        {triggerBtnLabel && !iconOnly && <ButtonText>{triggerBtnLabel}</ButtonText>}
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
            <Button
              {...restCancelBtnProps}
              action={cancelBtnAction}
              variant={cancelBtnVariant}
              onPress={handleCancel}
            >
              {cancelBtnIcon && <ButtonIcon as={cancelBtnIcon} />}
              {cancelBtnLabel && <ButtonText>{cancelBtnLabel}</ButtonText>}
            </Button>

            <Button
              {...restConfirmBtnProps}
              action={confirmBtnAction ?? props?.action}
              onPress={handleConfirm}
            >
              {isConfirmBtnLoading ? (
                <ButtonSpinner />
              ) : (
                confirmBtnIcon && <ButtonIcon as={confirmBtnIcon} />
              )}
              {confirmBtnLabel && <ButtonText>{confirmBtnLabel}</ButtonText>}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
