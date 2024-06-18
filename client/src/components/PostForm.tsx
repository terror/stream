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
  useColorMode,
} from '@chakra-ui/react';
import { useState } from 'react';

import { makeTags } from '../lib/utils';
import { Post as PostType } from '../model/Post';
import { Markdown } from './Markdown';

export type PostFormContext = 'Add' | 'Update';

export const PostForm = ({
  context,
  isOpen,
  onAdd,
  onClose,
  onUpdate,
  post,
}: {
  context: PostFormContext;
  isOpen: boolean;
  onAdd?: (data: any) => Promise<void>;
  onClose: () => void;
  onUpdate?: (post: PostType, data: any) => Promise<void>;
  post?: PostType;
}) => {
  const { colorMode } = useColorMode();

  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [tags, setTags] = useState(post?.tags.join(' ') || '');

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const data = {
      title,
      content,
      tags: makeTags(tags),
    };

    try {
      switch (context) {
        case 'Add': {
          if (onAdd) await onAdd(data);
          break;
        }
        case 'Update': {
          if (onUpdate && post) await onUpdate(post, data);
          break;
        }
      }
    } catch (err) {
      console.error(err);
    }

    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent maxW='85%'>
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
              <FormControl id='content' mb={4} mr={2} w='50%'>
                <FormLabel>Content</FormLabel>
                <Textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  isRequired
                />
              </FormControl>
              <Box w='50%' ml={2}>
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
            <Button
              backgroundColor={colorMode === 'light' ? '#DEE3EB' : '#1A1A1A'}
              mt='2'
              type='submit'
            >
              Publish
            </Button>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
