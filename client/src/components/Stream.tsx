import { AddIcon } from '@chakra-ui/icons';
import {
  Center,
  Flex,
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
import { useDeleteModal } from '../hooks/useDeleteModal';
import { usePostActions } from '../hooks/usePostActions';
import { fetchClient } from '../lib/fetchClient';
import { Post as PostType } from '../model/Post';
import { Post } from './Post';
import { PostForm } from './PostForm';

export const Stream = ({ q }: { q: string | null }) => {
  const user = useAuth();
  const limit = 20;

  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(limit);
  const [posts, setPosts] = useState<PostType[]>([]);

  const { colorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const value = useRef<HTMLInputElement>(null);

  const {
    handleUpdate,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    handleAdd,
    isDeleteModalOpen,
    isDeleting,
  } = usePostActions();

  const { DeleteModal } = useDeleteModal();

  useEffect(() => {
    fetchClient
      .deserialize<PostType[]>('GET', `/posts?limit=${limit}`)
      .then((data) => {
        setPosts(data);
        if (q && value.current) handleInputChange((value.current.value = q));
      })
      .catch((err: any) => console.error(err));
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

  const handleAddWithState = async (data: any) => {
    const newPost = await handleAdd(data);
    setPosts([newPost, ...posts]);
  };

  const handleUpdateWithState = async (post: PostType, data: any) => {
    const updatedPost = await handleUpdate(post, data);
    setPosts(posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
  };

  const handleDeleteWithState = async (post: PostType) => {
    handleDeleteClick(post);
  };

  const handleDeleteConfirmWithState = async () => {
    try {
      const deletedPost = await handleDeleteConfirm();

      if (deletedPost) {
        setPosts(posts.filter((p) => p._id !== deletedPost._id));
      }
    } catch (err) {
      console.error(err);
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

    if (batch.length === 0) {
      setHasMore(false);
    } else {
      setPosts(posts.concat(batch));
      setOffset(offset + limit);
    }
  };

  return (
    <Stack p='4'>
      <Flex alignItems='center'>
        <Input
          placeholder='Search the stream...'
          fontWeight='medium'
          background={colorMode === 'light' ? '#DEE3EB' : '#1A1A1A'}
          border='none'
          outline='none'
          _focus={{ boxShadow: 'none' }}
          ref={value}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        {user && user.isAdmin && (
          <Fragment>
            <IconButton
              aria-label='add'
              background='transparent'
              icon={<AddIcon />}
              _hover={{ background: 'transparent' }}
              onClick={onOpen}
              size='sm'
            >
              +
            </IconButton>
            <PostForm
              context={{ type: 'add', handler: handleAddWithState }}
              isOpen={isOpen}
              onClose={onClose}
            />
          </Fragment>
        )}
      </Flex>
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
              onDelete={handleDeleteWithState}
              onTagClick={handleTagClick}
              onUpdate={handleUpdateWithState}
              post={post}
            />
          ))}
        </InfiniteScroll>
      )}
      <DeleteModal
        isOpen={isDeleteModalOpen}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirmWithState}
        isDeleting={isDeleting}
      />
    </Stack>
  );
};
