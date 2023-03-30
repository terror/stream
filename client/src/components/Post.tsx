import { DeleteIcon } from '@chakra-ui/icons';
import { Flex, HStack, IconButton, Link, Stack, Text } from '@chakra-ui/react';

import { useAuth } from '../hooks/useAuth';
import { fetchClient } from '../lib/fetchClient';
import { formatDate } from '../lib/formatDate';
import { Post as PostType } from '../model/Post';
import { Markdown } from './Markdown';

interface PostProps {
  post: PostType;
  onTagClick: (tag: string) => void;
}

export const Post: React.FC<PostProps> = ({ post, onTagClick }) => {
  const user = useAuth();

  const handleDelete = async () => {
    try {
      await fetchClient.delete(`/posts?id=${post._id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Flex p='2' key={post.timestamp} alignItems='flex-start'>
      <Text mt='0.5' mr='4' fontSize='sm' fontWeight='medium' flexShrink={0}>
        {formatDate(post.timestamp)}
      </Text>
      <Stack maxW='70%'>
        {post.title && <Text fontWeight='bold'>{post.title}</Text>}
        <Markdown content={post.content} />
        <HStack>
          {post.tags.map(
            (tag, i) =>
              tag && (
                <Link
                  fontSize='sm'
                  fontWeight='medium'
                  key={i}
                  onClick={() => onTagClick(tag)}
                  p='1'
                  style={{ textDecoration: 'none' }}
                >
                  {tag}
                </Link>
              )
          )}
        </HStack>
      </Stack>
      {user && user.isAdmin && (
        <IconButton
          background='transparent'
          onClick={handleDelete}
          aria-label='delete'
          icon={<DeleteIcon />}
          size='sm'
          ml='auto'
        >
          Delete
        </IconButton>
      )}
    </Flex>
  );
};
