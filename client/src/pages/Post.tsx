import { Center, Spinner, Stack, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Layout } from '../components/Layout';
import { NotFound } from '../components/NotFound';
import { Post as PostComponent } from '../components/Post';
import { fetchClient } from '../lib/fetchClient';
import { Post as PostType } from '../model/Post';

export const Post = () => {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();

  const toast = useToast({
    duration: 2000,
    position: 'bottom-right',
  });

  const [post, setPost] = useState<PostType | undefined | null>(undefined);

  useEffect(() => {
    fetchClient
      .deserialize<PostType>('GET', `/posts/${params.id}`)
      .then((data) => setPost(data))
      .catch((err: any) => toast({ status: 'error', title: err.toString() }));
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

  if (post === null) {
    return <NotFound />;
  }

  const handleUpdate = async (model: PostType, data: any) => {
    try {
      setPost(
        await fetchClient.deserialize<PostType>('PUT', '/posts', {
          _id: model?._id,
          timestamp: model?.timestamp,
          ...data,
        })
      );
      toast({ status: 'success', title: 'Updated post successfully' });
    } catch (err: any) {
      toast({ status: 'error', title: err.toString() });
    }
  };

  const handleDelete = async (model: PostType) => {
    try {
      await fetchClient.delete(`/posts?id=${model._id}`);
      setPost(null);
      toast({ status: 'success', title: 'Deleted post successfully' });
    } catch (err: any) {
      toast({ status: 'error', title: err.toString() });
    }
  };

  return (
    <Layout>
      <Stack p='4'>
        {post && (
          <PostComponent
            post={post}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onTagClick={(tag) => navigate(`/?q=${encodeURIComponent(tag)}`)}
          />
        )}
      </Stack>
    </Layout>
  );
};
