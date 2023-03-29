import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import 'katex/dist/katex.min.css';

import { Text, Flex, HStack, Stack } from '@chakra-ui/react';

import { Post as PostType } from '../model/Post';
import { formatDate } from '../lib/formatDate';

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
        <ReactMarkdown
          children={content}
          rehypePlugins={[rehypeKatex, rehypeHighlight]}
          remarkPlugins={[remarkGfm, remarkMath]}
        />
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
