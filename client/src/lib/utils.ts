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

export const makeTags = (tags: string) => {
  return tags.length === 0
    ? []
    : tags.split(' ').map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));
};
