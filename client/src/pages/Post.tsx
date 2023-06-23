import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Navbar } from '../components/Navbar';
import { fetchClient } from '../lib/fetchClient';
import { Post as PostType } from '../model/Post';

export const Post = () => {
  const params = useParams<{ id: string }>();

  const [post, setPost] = useState<PostType | null>(null);

  useEffect(() => {
    fetchClient
      .getData<PostType>(`/posts/${params.id}`)
      .then((post) => setPost(post))
      .catch((err) => console.log(err));
  });

  return (
    <>
      <Navbar />
      <div>Post {params.id}</div>
      <div>{post?.content}</div>
    </>
  );
};
