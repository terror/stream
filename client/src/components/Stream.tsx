import {
  Button,
  Flex,
  Heading,
  Input,
  Stack,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { Fragment, useEffect, useState } from 'react';

import { useAuth } from '../hooks/useAuth';
import { fetchClient } from '../lib/fetchClient';
import { Post as PostType } from '../model/Post';
import { Post } from './Post';
import { PostForm } from './PostForm';

export const Stream = () => {
  const user = useAuth();

  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    fetchClient
      .getData<PostType[]>('/posts')
      .then((data) => {
        console.log(data);
        setPosts(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <Stack p='4'>
      <Flex alignItems='center'>
        <Heading>Liam's stream</Heading>
        {user && user.isAdmin && (
          <Fragment>
            <Button
              mt='2'
              ml='2'
              onClick={onOpen}
              size='sm'
              background={colorMode === 'light' ? 'gray.200' : 'gray.700'}
            >
              +
            </Button>
            <PostForm isOpen={isOpen} onClose={onClose} />
          </Fragment>
        )}
      </Flex>
      <Input
        placeholder='Search the stream...'
        fontWeight='medium'
        border='none'
        outline='none'
        background={colorMode === 'light' ? 'gray.200' : 'gray.700'}
        _focus={{ boxShadow: 'none' }}
      />
      {posts.map((post, i) => (
        <Post
          key={i}
          title={post.title}
          timestamp={post.timestamp}
          content={post.content}
          tags={post.tags}
        />
      ))}
    </Stack>
  );
};
