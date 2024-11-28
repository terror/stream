export const formatDate = (date: string) => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  }).format(new Date(date));
};

export const loginUrl = () => {
  return import.meta.env.VITE_API_URL !== undefined
    ? `${import.meta.env.VITE_API_URL}/api/auth/login`
    : '/api/auth/login';
};

export const makeTags = (tags: string) => {
  return tags.length === 0
    ? []
    : tags.split(' ').map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));
};
