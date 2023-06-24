import { AddIcon } from '@chakra-ui/icons';
import {
  Box,
  Center,
  Flex,
  Heading,
  IconButton,
  Input,
  Spinner,
  Stack,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { useAuth } from '../hooks/useAuth';
import { fetchClient } from '../lib/fetchClient';
import { Post as PostType } from '../model/Post';
import { Alert } from './Alert';
import { Post } from './Post';
import { PostForm } from './PostForm';

export const Stream = () => {
  const user = useAuth();

  const limit = 20;

  const [alert, setAlert] = useState<{
    status: 'info' | 'warning' | 'success' | 'error' | 'loading' | undefined;
    content: string;
  }>({ status: undefined, content: '' });

  const [hasMore, setHasMore] = useState(true);
  const [key, setKey] = useState(0);
  const [offset, setOffset] = useState(limit);
  const [posts, setPosts] = useState<PostType[]>([]);

  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const value = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchClient
      .deserialize<PostType[]>('GET', `/posts?limit=${limit}`)
      .then((data) => {
        setPosts(data);
      })
      .catch((err) => console.error(err));
  }, []);

  const remountAlert = () => setKey(key + 1);

  const handleInputChange = async (query: string) => {
    try {
      setPosts(
        await fetchClient.deserialize<PostType[]>(
          'GET',
          query === ''
            ? `/posts?limit=${limit}`
            : `/search?query=${encodeURIComponent(query)}`
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleAdd = async (data: any) => {
    try {
      remountAlert();
      setPosts([
        await fetchClient.deserialize<PostType>('POST', '/posts', data),
        ...posts,
      ]);
      setAlert({ status: 'success', content: 'Added post successfully' });
    } catch (err: any) {
      setAlert({ status: 'error', content: err.toString() });
    }
  };

  const handleUpdate = async (post: PostType, data: any) => {
    try {
      remountAlert();
      setPosts(
        ((update: PostType) =>
          posts.map((p) => (p._id === update._id ? update : p)))(
          await fetchClient.deserialize<PostType>('PUT', '/posts', {
            _id: post._id,
            timestamp: post.timestamp,
            ...data,
          })
        )
      );
      setAlert({ status: 'success', content: 'Updated post successfully' });
    } catch (err: any) {
      setAlert({ status: 'error', content: err.toString() });
    }
  };

  const handleDelete = async (post: PostType) => {
    try {
      remountAlert();
      await fetchClient.delete(`/posts?id=${post._id}`);
      setPosts(posts.filter((p) => p._id !== post._id));
      setAlert({ status: 'success', content: 'Deleted post successfully' });
    } catch (err: any) {
      setAlert({ status: 'error', content: err.toString() });
    }
  };

  const handleTagClick = (tag: string) => {
    if (value.current) value.current.value = tag;
    handleInputChange(tag);
  };

  const fetchMore = async () => {
    const batch = await fetchClient.deserialize<PostType[]>(
      'GET',
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
            <IconButton
              aria-label='add'
              background='transparent'
              icon={<AddIcon />}
              ml='2'
              mt='2'
              onClick={onOpen}
              size='sm'
            >
              +
            </IconButton>
            <PostForm
              context='Add'
              onAdd={handleAdd}
              isOpen={isOpen}
              onClose={onClose}
            />
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
        ref={value}
        onChange={(e) => handleInputChange(e.target.value)}
      />
      {posts.length !== 0 && (
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
              onDelete={handleDelete}
              onTagClick={handleTagClick}
              onUpdate={handleUpdate}
              post={post}
            />
          ))}
        </InfiniteScroll>
      )}
      <Box>
        {alert.status && (
          <Alert key={key} status={alert.status} content={alert.content} />
        )}
      </Box>
    </Stack>
  );
};
