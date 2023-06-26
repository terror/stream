import {
  Box,
  Checkbox,
  Code,
  Divider,
  Heading,
  Image,
  Link,
  ListItem,
  OrderedList,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  UnorderedList,
  useColorMode,
} from '@chakra-ui/react';
import { chakra } from '@chakra-ui/system';
import deepmerge from 'deepmerge';
import * as React from 'react';
import { Components } from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  coldarkCold,
  nord,
} from 'react-syntax-highlighter/dist/esm/styles/prism';

type GetCoreProps = {
  children?: React.ReactNode;
  'data-sourcepos'?: any;
};

function getCoreProps(props: GetCoreProps): any {
  return props['data-sourcepos']
    ? { 'data-sourcepos': props['data-sourcepos'] }
    : {};
}

interface Defaults extends Components {
  heading?: Components['h1'];
}

export const defaults: Defaults = {
  p: (props) => {
    return <Text fontWeight='medium'>{props.children}</Text>;
  },

  em: (props) => {
    return (
      <Text fontWeight='medium' as='em'>
        {props.children}
      </Text>
    );
  },

  blockquote: (props) => {
    return (
      <Box borderLeft='4px' borderColor='gray.300' pl={2} lineHeight='lg'>
        <Text fontWeight='medium'>{props.children}</Text>
      </Box>
    );
  },

  code: ({ inline, className, children }) => {
    const { colorMode } = useColorMode();

    const background =
      colorMode === 'light' ? 'rgb(227, 234, 242)' : 'rgb(46, 52, 64)';

    if (inline) {
      return (
        <Code background={background} borderRadius='md' p='1'>
          {children}
        </Code>
      );
    }

    const match = /language-(\w+)/.exec(className || '');

    return match ? (
      <SyntaxHighlighter
        PreTag='div'
        children={String(children).replace(/\n$/, '')}
        customStyle={{
          borderRadius: '10px',
          fontSize: '14px',
          fontFamily: 'fira code',
        }}
        language={match[1]}
        style={colorMode === 'light' ? coldarkCold : nord}
      />
    ) : (
      <Code
        background={background}
        borderRadius='xl'
        children={children}
        className={className}
        display='block'
        fontFamily='fira code'
        fontSize='sm'
        overflow='auto'
        p='4'
        w='full'
        whiteSpace='pre'
      />
    );
  },

  del: (props) => {
    return <Text as='del'>{props.children}</Text>;
  },

  hr: (_) => {
    return <Divider />;
  },

  a: Link,

  img: Image,

  text: (props) => {
    return (
      <Text fontWeight='medium' as='span'>
        {props.children}
      </Text>
    );
  },

  ul: (props) => {
    const { ordered, children, depth } = props;

    const attrs = getCoreProps(props);

    let Element = UnorderedList;

    let styleType = 'disc';

    if (ordered) {
      Element = OrderedList;
      styleType = 'decimal';
    }

    if (depth === 1) styleType = 'circle';

    return (
      <Element
        as={ordered ? 'ol' : 'ul'}
        fontWeight='medium'
        pl={4}
        styleType={styleType}
        {...attrs}
      >
        {children}
      </Element>
    );
  },

  ol: (props) => {
    const { ordered, children, depth } = props;

    const attrs = getCoreProps(props);

    let Element = UnorderedList;

    let styleType = 'disc';

    if (ordered) {
      Element = OrderedList;
      styleType = 'decimal';
    }

    if (depth === 1) styleType = 'circle';

    return (
      <Element
        as={ordered ? 'ol' : 'ul'}
        fontWeight='medium'
        pl={4}
        styleType={styleType}
        {...attrs}
      >
        {children}
      </Element>
    );
  },

  li: (props) => {
    const { children, checked } = props;

    let checkbox = null;

    if (checked !== null && checked !== undefined) {
      checkbox = (
        <Checkbox isChecked={checked} isReadOnly>
          {children.slice(1)}
        </Checkbox>
      );
    }

    return (
      <ListItem
        fontWeight='medium'
        listStyleType={checked !== null ? 'none' : 'inherit'}
        {...getCoreProps(props)}
      >
        {checkbox || children}
      </ListItem>
    );
  },

  heading: (props) => {
    return (
      <Heading
        as={`h${props.level}`}
        size={['2xl', 'xl', 'lg', 'md', 'sm', 'xs'][`${props.level - 1}`]}
        {...getCoreProps(props)}
      >
        {props.children}
      </Heading>
    );
  },

  pre: (props) => {
    return <chakra.pre {...getCoreProps(props)}>{props.children}</chakra.pre>;
  },

  table: Table,

  thead: Thead,

  tbody: Tbody,

  tr: (props) => <Tr>{props.children}</Tr>,

  td: (props) => <Td>{props.children}</Td>,

  th: (props) => <Th>{props.children}</Th>,
};

const Renderer = (theme?: Defaults, merge = true): Components => {
  const elements = {
    p: defaults.p,
    em: defaults.em,
    blockquote: defaults.blockquote,
    code: defaults.code,
    del: defaults.del,
    hr: defaults.hr,
    a: defaults.a,
    img: defaults.img,
    text: defaults.text,
    ul: defaults.ul,
    ol: defaults.ol,
    li: defaults.li,
    h1: defaults.heading,
    h2: defaults.heading,
    h3: defaults.heading,
    h4: defaults.heading,
    h5: defaults.heading,
    h6: defaults.heading,
    pre: defaults.pre,
    table: defaults.table,
    thead: defaults.thead,
    tbody: defaults.tbody,
    tr: defaults.tr,
    td: defaults.td,
    th: defaults.th,
  };

  if (theme && merge) return deepmerge(elements, theme);

  return elements;
};

export default Renderer;
