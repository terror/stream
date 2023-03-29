import {
  Button,
  Center,
  Flex,
  Heading,
  Input,
  Spinner,
  Stack,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { Fragment, useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { useAuth } from '../hooks/useAuth';
import { fetchClient } from '../lib/fetchClient';
import { Post as PostType } from '../model/Post';
import { Post } from './Post';
import { PostForm } from './PostForm';

export const Stream = () => {
  const limit = 20;

  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(limit);

  const user = useAuth();

  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [posts, setPosts] = useState<PostType[]>([]);

  useEffect(() => {
    fetchClient
      .getData<PostType[]>('/posts')
      .then((data) => {
        setPosts(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleInputChange = async (query: string) => {
    try {
      setPosts(
        await fetchClient.getData<PostType[]>(
          query === ''
            ? `/posts?limit=${limit}&offset=${0}`
            : `/search?query=${query}`
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMore = async () => {
    const batch = await fetchClient.getData<PostType[]>(
      `/posts?limit=${limit}&offset=${offset}`
    );

    if (batch.length === 0) setHasMore(false);
    else {
      setPosts(posts.concat(batch));
      setOffset(offset + limit);
    }
  };

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
        onChange={(e) => handleInputChange(e.target.value)}
      />
      <InfiniteScroll
        dataLength={posts.length}
        hasMore={hasMore}
        loader={
          <Center mt='4'>
            <Spinner />
          </Center>
        }
        next={fetchMore}
        style={{ overflowY: 'hidden' }}
      >
        {posts.map((post, i) => (
          <Post
            key={i}
            title={post.title}
            timestamp={post.timestamp}
            content={post.content}
            tags={post.tags}
          />
        ))}
      </InfiniteScroll>
    </Stack>
  );
};
