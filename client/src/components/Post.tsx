import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  HStack,
  IconButton,
  Link,
  SimpleGrid,
  Stack,
  StackItem,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { formatDate } from '../lib/utils';
import { Post as PostType } from '../model/Post';
import { Markdown } from './Markdown';
import { PostForm } from './PostForm';

const Controls = ({
  handleDelete,
  isOpen,
  onClose,
  onOpen,
  onUpdate,
  post,
}: {
  handleDelete: () => void;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onUpdate?: (post: PostType, data: any) => Promise<void>;
  post: PostType;
}) => {
  return (
    <StackItem alignSelf='end'>
      <IconButton
        aria-label='edit'
        background='transparent'
        icon={<EditIcon />}
        onClick={onOpen}
        size='sm'
      />
      <IconButton
        aria-label='delete'
        background='transparent'
        icon={<DeleteIcon />}
        onClick={handleDelete}
        size='sm'
      />
      <PostForm
        context='Update'
        onUpdate={onUpdate}
        post={post}
        isOpen={isOpen}
        onClose={onClose}
      />
    </StackItem>
  );
};

const Data = ({
  post,
  onTagClick,
}: {
  post: PostType;
  onTagClick?: (tag: string) => void;
}) => {
  return (
    <SimpleGrid columns={[1, null, 4]} key={post.timestamp} mb='4'>
      <Text mt='0.5' mb='2' fontSize='sm' fontWeight='medium'>
        <RouterLink to={`/posts/${post._id}`}>
          {formatDate(post.timestamp)}
        </RouterLink>
      </Text>
      <Stack gridColumn='span 3'>
        {post.title && <Text fontWeight='bold'>{post.title}</Text>}
        <Markdown content={post.content} />
        <HStack>
          {post.tags.map(
            (tag, i) =>
              tag &&
              (onTagClick ? (
                <Link
                  fontSize='sm'
                  fontWeight='medium'
                  key={i}
                  onClick={() => onTagClick && onTagClick(tag)}
                  p='1'
                  style={{ textDecoration: 'none' }}
                >
                  {tag}
                </Link>
              ) : (
                <Text key={i} fontSize='sm' fontWeight='medium' p='1'>
                  {tag}
                </Text>
              ))
          )}
        </HStack>
      </Stack>
    </SimpleGrid>
  );
};

export const Post = ({
  onDelete,
  onTagClick,
  onUpdate,
  post,
}: {
  onDelete?: (post: PostType) => Promise<void>;
  onTagClick?: (tag: string) => void;
  onUpdate?: (post: PostType, data: any) => Promise<void>;
  post: PostType;
}) => {
  const user = useAuth();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleDelete = async () => {
    try {
      if (onDelete) await onDelete(post);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Stack>
      <StackItem>
        <Data post={post} onTagClick={onTagClick} />
      </StackItem>
      {user && user.isAdmin && (
        <Controls
          onOpen={onOpen}
          handleDelete={handleDelete}
          onUpdate={onUpdate}
          isOpen={isOpen}
          onClose={onClose}
          post={post}
        />
      )}
    </Stack>
  );
};
