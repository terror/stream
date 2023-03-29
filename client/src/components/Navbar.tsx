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
          <ModalHeader>About</ModalHeader>
          <ModalCloseButton />
          <ModalBody mb='4'>
            <Stack spacing='20px'>
              <Text fontWeight='medium'>
                The stream provides a serene abode for me to articulate my
                thoughts, unencumbered by the cacophonous clamor prevalent on
                platforms such as Twitter. My motivation to create this virtual
                sanctuary was kindled by the captivating essence of Linus Lee's
                stream, which can be savored at{' '}
                <Link href='https://stream.thesephist.com/' target='_blank'>
                  https://stream.thesephist.com/
                </Link>
                .
              </Text>
              .
              <Text fontWeight='medium'>
                You can{' '}
                <Link href={`${import.meta.env.VITE_API_URL}/auth/login`}>
                  login
                </Link>{' '}
                to comment on posts, or if you're an admin you can craft posts
                (which you're not, since the only admin account is my own).
              </Text>
              <Text fontWeight='semibold'>
                Check out the code on GitHub:{' '}
                <Link href='https://github.com/terror/stream' target='_blank'>
                  https://github.com/terror/stream
                </Link>
              </Text>
            </Stack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
};
