import { AddIcon } from '@chakra-ui/icons';
import {
  Center,
  Flex,
  Heading,
  IconButton,
  Input,
  Spinner,
  Stack,
  useColorMode,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { Fragment, useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { useAuth } from '../hooks/useAuth';
import { fetchClient } from '../lib/fetchClient';
import { Post as PostType } from '../model/Post';
import { Post } from './Post';
import { PostForm } from './PostForm';

export const Stream = ({ q }: { q: string | null }) => {
  const toast = useToast({
    duration: 2000,
    position: 'bottom-right',
  });

  const user = useAuth();

  const limit = 20;

  const [hasMore, setHasMore] = useState(true);
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
        if (q && value.current) handleInputChange((value.current.value = q));
      })
      .catch((err: any) => toast({ status: 'error', title: err.toString() }));
  }, []);

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
      setPosts([
        await fetchClient.deserialize<PostType>('POST', '/posts', data),
        ...posts,
      ]);
      toast({ status: 'success', title: 'Added post successfully' });
    } catch (err: any) {
      toast({ status: 'error', title: err.toString() });
    }
  };

  const handleUpdate = async (post: PostType, data: any) => {
    try {
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
      toast({ status: 'success', title: 'Updated post successfully' });
    } catch (err: any) {
      toast({ status: 'error', title: err.toString() });
    }
  };

  const handleDelete = async (post: PostType) => {
    try {
      await fetchClient.delete(`/posts?id=${post._id}`);
      setPosts(posts.filter((p) => p._id !== post._id));
      toast({ status: 'success', title: 'Deleted post successfully' });
    } catch (err: any) {
      toast({ status: 'error', title: err.toString() });
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
    </Stack>
  );
};
