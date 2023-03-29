import React, { useState } from 'react';

import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from '@chakra-ui/react';

import { fetchClient } from '../lib/fetchClient';

interface PostFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostForm: React.FC<PostFormProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      await fetchClient.post('/posts', {
        title,
        content,
        tags: tags.split(' '),
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Post</ModalHeader>
        <ModalCloseButton />
        <ModalBody mb='4'>
          <form onSubmit={handleSubmit}>
            <FormControl id='title' mb={4}>
              <FormLabel>Title</FormLabel>
              <Input
                type='text'
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </FormControl>
            <FormControl id='content' mb={4}>
              <FormLabel>Content</FormLabel>
              <Textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
            </FormControl>
            <FormControl id='title' mb={4}>
              <FormLabel>Tags</FormLabel>
              <Input
                type='text'
                value={tags}
                onChange={(event) => setTags(event.target.value)}
              />
            </FormControl>
            <Button type='submit'>Submit</Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
