import { Center, Spinner, Stack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Layout } from '../components/Layout';
import { Post as PostComponent } from '../components/Post';
import { fetchClient } from '../lib/fetchClient';
import { Post as PostType } from '../model/Post';

export const Post = () => {
  const params = useParams<{ id: string }>();

  const [post, setPost] = useState<PostType | undefined | null>(undefined);

  useEffect(() => {
    fetchClient
      .deserialize<PostType>('GET', `/posts/${params.id}`)
      .then((post) => setPost(post))
      .catch((err) => console.log(err));
  }, []);

  if (post === undefined) {
    return (
      <Layout>
        <Center mt='4'>
          <Spinner />
        </Center>
      </Layout>
    );
  }

  const handleUpdate = async (post: PostType, data: any) => {
    try {
      setPost(
        await fetchClient.deserialize<PostType>('PUT', '/posts', {
          _id: post?._id,
          timestamp: post?.timestamp,
          ...data,
        })
      );
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (post: PostType) => {
    try {
      await fetchClient.delete(`/posts?id=${post._id}`);
      setPost(null);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Layout>
      {post === null ? (
        <Center fontWeight='bold' fontSize='2xl'>
          No post found for id {params.id}
        </Center>
      ) : (
        <Stack p='4'>
          {post && (
            <PostComponent
              post={post}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          )}
        </Stack>
      )}
    </Layout>
  );
};
