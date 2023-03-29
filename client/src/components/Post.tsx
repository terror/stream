import { Flex, HStack, Stack, Text } from '@chakra-ui/react';

import { formatDate } from '../lib/formatDate';
import { Post as PostType } from '../model/Post';
import { Markdown } from './Markdown';

export const Post: React.FC<PostType> = ({
  title,
  content,
  timestamp,
  tags,
}) => {
  return (
    <Flex p='2' key={timestamp} alignItems='flex-start'>
      <Text mt='0.5' mr='4' fontSize='sm' fontWeight='medium' flexShrink={0}>
        {formatDate(timestamp)}
      </Text>
      <Stack>
        {title && <Text fontWeight='bold'>{title}</Text>}
        <Markdown content={content} />
        <HStack>
          {tags.map(
            (tag, i) =>
              tag && (
                <Text fontSize='sm' fontWeight='medium' p='1' key={i}>
                  #{tag}
                </Text>
              )
          )}
        </HStack>
      </Stack>
    </Flex>
  );
};
