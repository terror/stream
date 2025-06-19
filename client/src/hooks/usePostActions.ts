import { useDisclosure, useToast } from '@chakra-ui/react';
import { useState } from 'react';

import { fetchClient } from '../lib/fetchClient';
import { Post as PostType } from '../model/Post';

export const usePostActions = (onPostDeleted?: () => void) => {
  const toast = useToast({
    duration: 2000,
    position: 'bottom-right',
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [postToDelete, setPostToDelete] = useState<PostType | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleUpdate = async (
    model: PostType,
    data: any
  ): Promise<PostType> => {
    try {
      const updatedPost = await fetchClient.deserialize<PostType>(
        'PUT',
        '/posts',
        {
          _id: model._id,
          timestamp: model.timestamp,
          ...data,
        }
      );
      toast({ status: 'success', title: 'Updated post successfully' });
      return updatedPost;
    } catch (err: any) {
      toast({ status: 'error', title: err.toString() });
      throw err;
    }
  };

  const handleDeleteClick = (model: PostType) => {
    setPostToDelete(model);
    onOpen();
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);

    try {
      await fetchClient.delete(`/posts?id=${postToDelete._id}`);
      toast({ status: 'success', title: 'Deleted post successfully' });
      onClose();
      if (onPostDeleted) onPostDeleted();
      return postToDelete;
    } catch (err: any) {
      toast({ status: 'error', title: err.toString() });
      throw err;
    } finally {
      setIsDeleting(false);
      setPostToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setPostToDelete(null);
    onClose();
  };

  const handleAdd = async (data: any): Promise<PostType> => {
    try {
      const newPost = await fetchClient.deserialize<PostType>(
        'POST',
        '/posts',
        data
      );
      toast({ status: 'success', title: 'Added post successfully' });
      return newPost;
    } catch (err: any) {
      toast({ status: 'error', title: err.toString() });
      throw err;
    }
  };

  return {
    handleUpdate,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleAdd,
    isDeleteModalOpen: isOpen,
    postToDelete,
    isDeleting,
  };
};
