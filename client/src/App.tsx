import {
  Fragment,
  PropsWithChildren,
  createContext,
  useEffect,
  useState,
  useContext,
} from 'react';

import {
  Flex,
  Button,
  HStack,
  Heading,
  Input,
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

type User = {
  login: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  url?: string;
  isAdmin: boolean;
};

const fetchClient = {
  async get(endpoint: string, init?: RequestInit) {
    return fetch('/api' + endpoint, init);
  },
  async getData<T>(endpoint: string, init?: RequestInit) {
    return (await (await this.get(endpoint, init)).json()) as T;
  },
  post: async (endpoint: string, data: any, init?: RequestInit) => {
    return fetch('/api' + endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...init,
    });
  },
};

export const AuthContext = createContext<User | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren<any>) => {
  const [user, setUser] = useState<User | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClient
      .getData<User>('/user', { credentials: 'include' })
      .then((user) => setUser(user))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={user}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};

const Navbar = () => {
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

const Stream = () => {
  const { colorMode } = useColorMode();

  const user = useAuth();

  return (
    <Stack p='4'>
      <Flex alignItems='center'>
        <Heading>Liam's stream</Heading>
        {user && (
          <Button
            mt='2'
            ml='2'
            size='sm'
            background={colorMode === 'light' ? 'gray.200' : 'gray.700'}
          >
            +
          </Button>
        )}
      </Flex>
      <Input
        placeholder='Search the stream...'
        fontWeight='medium'
        border='none'
        outline='none'
        background={colorMode === 'light' ? 'gray.200' : 'gray.700'}
        _focus={{ boxShadow: 'none' }}
      />
    </Stack>
  );
};

const App = () => {
  return (
    <Fragment>
      <Navbar />
      <Stream />
    </Fragment>
  );
};

export default App;
