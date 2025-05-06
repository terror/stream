import { MoonIcon, SunIcon } from '@chakra-ui/icons';
import {
  Flex,
  HStack,
  IconButton,
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

  const { colorMode } = useColorMode();

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Flex p='4' alignItems='center'>
      <Text fontWeight='bold'>
        <Link href='/' style={{ textDecoration: 'none' }}>
          ~/
        </Link>
      </Text>
      <HStack ml='auto'>
        <IconButton
          aria-label='Toggle color mode'
          icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
          background='transparent'
          onClick={toggleColorMode}
        />
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
                This is my personal micro-blogging platform I use occasionally.
                I wrote this to get away from services like{' '}
                <Link href='https://x.com/home' target='_blank'>
                  X
                </Link>
                , where I tend to get distracted easily.
              </Text>
              <Text fontWeight='medium'>
                If you do decide to join in on the conversation, please note
                that you'll need to <Link href={loginUrl()}>login</Link> to
                comment on posts (coming soon).
              </Text>
              <Text fontWeight='semibold'>
                If you're interested in exploring the code behind the stream,
                you can find it{' '}
                <Link href='https://github.com/terror/stream' target='_blank'>
                  here
                </Link>
                .
              </Text>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
