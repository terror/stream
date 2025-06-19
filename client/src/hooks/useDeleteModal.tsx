import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import React from 'react';

export const useDeleteModal = () => {
  const DeleteModal = ({
    isOpen,
    onCancel,
    onConfirm,
    isDeleting,
  }: {
    isOpen: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    isDeleting: boolean;
  }) => (
    <Modal isOpen={isOpen} onClose={onCancel} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Confirm Delete</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Are you sure you want to delete this post? This action cannot be
            undone.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button
            variant='ghost'
            mr={3}
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            colorScheme='red'
            onClick={onConfirm}
            isLoading={isDeleting}
            loadingText='Deleting...'
          >
            Delete
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  return { DeleteModal };
};
