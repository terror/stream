import {
  Flex,
  HStack,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  useColorMode,
  useDisclosure,
} from '@chakra-ui/react';

import { loginUrl } from '../lib/utils';

export const Navbar = () => {
  const { toggleColorMode } = useColorMode();

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex p='4'>
      <Text fontWeight='bold'>
        <Link href='/' style={{ textDecoration: 'none' }}>
          the stream
        </Link>
      </Text>
      <HStack ml='auto'>
        <Link
          onClick={toggleColorMode}
          fontStyle='italic'
          fontWeight='medium'
          as='div'
          style={{ textDecoration: 'none' }}
        >
          light/dark
        </Link>
        <Link
          fontWeight='bold'
          ml='auto'
          onClick={onOpen}
          style={{ textDecoration: 'none' }}
        >
          about
        </Link>
      </HStack>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader mb='-4'>About</ModalHeader>
          <ModalCloseButton />
          <ModalBody mb='4'>
            <Stack spacing='20px'>
              <Text fontWeight='medium'>
                As someone who values a calm and peaceful environment for
                introspection and creativity, I built stream to provide an
                idyllic haven to articulate my thoughts. Unlike other social
                media platforms that can be inundated with noise and chatter,
                the stream offers a serene space to focus and share ideas (aka
                mostly shitposts and rants about stuff I'm working on) without
                the distractions of a crowded feed.
              </Text>
              <Text fontWeight='medium'>
                It was the captivating and serene nature of Linus Lee's stream
                that inspired me to create my own virtual sanctuary. The way his
                stream allowed for deep thinking and contemplation without the
                typical interruptions of social media was truly inspiring. If
                you're curious and would like to experience this unique
                atmosphere for yourself, I highly recommend checking out his
                stream over at{' '}
                <Link href='https://stream.thesephist.com/' target='_blank'>
                  https://stream.thesephist.com/
                </Link>
                .
              </Text>
              .
              <Text fontWeight='medium'>
                If you do decide to join in on the conversation, please note
                that you'll need to <Link href={loginUrl()}>login</Link> to
                comment on posts. Additionally, if you happen to have admin
                access, you'll be able to craft new posts. However, I should
                mention that the only admin account at this time is my own, so
                you don't have admin privileges.
              </Text>
              <Text fontWeight='semibold'>
                If you're interested in exploring the code behind the stream,
                you can find it on Github over at{' '}
                <Link href='https://github.com/terror/stream' target='_blank'>
                  https://github.com/terror/stream.
                </Link>{' '}
              </Text>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
