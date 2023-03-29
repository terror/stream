import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
} from '@chakra-ui/react';
import React, { useState } from 'react';

import { fetchClient } from '../lib/fetchClient';
import { Markdown } from './Markdown';

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
        tags: tags.length === 0 ? [] : tags.split(' ').map((tag) => `#${tag}`),
      });
    } catch (err) {
      console.error(err);
    }

    onClose();
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
            <Flex direction='row' overflow='auto'>
              <FormControl id='content' mb={4} w='50%' m='2'>
                <FormLabel>Content</FormLabel>
                <Textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  isRequired
                />
              </FormControl>
              <Box w='50%' m='2'>
                <Text fontWeight='medium' mb='4'>
                  Preview
                </Text>
                <Markdown content={content} />
              </Box>
            </Flex>
            <FormControl id='title' mb={4}>
              <FormLabel>Tags</FormLabel>
              <Input
                type='text'
                value={tags}
                onChange={(event) => setTags(event.target.value)}
              />
            </FormControl>
            <Button mt='4' type='submit'>
              Publish
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
