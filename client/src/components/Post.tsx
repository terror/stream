import { Flex, HStack, Stack, Text } from '@chakra-ui/react';
import ChakraUIRenderer from 'chakra-ui-markdown-renderer';
import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

import { formatDate } from '../lib/formatDate';
import { Post as PostType } from '../model/Post';

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
          components={ChakraUIRenderer()}
          rehypePlugins={[rehypeKatex, rehypeHighlight]}
          remarkPlugins={[remarkGfm, remarkMath]}
          skipHtml
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
