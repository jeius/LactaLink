import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Modal, ModalBackdrop, ModalContent } from '../ui/modal';

export default function PinLocationModal() {
  const inset = useSafeAreaInsets();
  return (
    <Modal>
      <ModalBackdrop />
      <ModalContent
        className="relative flex-1"
        style={{
          marginHorizontal: 20,
          marginBottom: inset.bottom + 20,
          marginTop: inset.top + 20,
        }}
      ></ModalContent>
    </Modal>
  );
}
