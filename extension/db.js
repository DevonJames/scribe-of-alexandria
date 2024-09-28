import Dexie from 'dexie';

// Define the schema for the database
const db = new Dexie('ContentArchiveDB');

// Define the database tables and their structure
db.version(1).stores({
  articles: `
    didTx,
    title,
    *byline,
    canonicalUrl,
    canonicalLocationTorrent,
    canonicalLocationIPFS,
    canonicalLocationArweave,
    description,
    publishedOnUtcEpoch,
    *tags,
    nsfw,
    *embeddedVideos,
    *embeddedArticles,
    *archivedTimestamp,
    archivedBy,
    interactionMetadata
  `,
  videos: `
    didTx,
    title,
    description,
    language,
    *channel,
    canonicalUrl,
    canonicalLocationTorrent,
    canonicalLocationIPFS,
    canonicalLocationArweave,
    publishedOnUtcEpoch,
    tags,
    nsfw,
    filename,
    size,
    width,
    height,
    duration,
    contentType,
    *thumbnails,
    archivedTimestamp,
    archivedBy,
    interactionMetadata
  `,
  images: `
    didTx,
    mimeType,
    height,
    width,
    fileSize,
    canonicalUrl,
    canonicalLocationTorrent,
    canonicalLocationIPFS,
    canonicalLocationArweave,
    *creator,
    publishedOnUtcEpoch,
    tags,
    nsfw,
    archivedTimestamp,
    archivedBy,
    interactionMetadata
  `
});

// Optional: Add methods to interact with the database
export const addArticle = async (article) => {
  try {
    await db.articles.add(article);
    console.log('Article added to the database:', article);
  } catch (error) {
    console.error('Error adding article:', error);
  }
};

export const addVideo = async (video) => {
  try {
    await db.videos.add(video);
    console.log('Video added to the database:', video);
  } catch (error) {
    console.error('Error adding video:', error);
  }
};

export const addImage = async (image) => {
  try {
    await db.images.add(image);
    console.log('Image added to the database:', image);
  } catch (error) {
    console.error('Error adding image:', error);
  }
};

export const updateArticle = async (didTx, updates) => {
  try {
    await db.articles.update(didTx, updates);
    console.log('Article updated:', updates);
  } catch (error) {
    console.error('Error updating article:', error);
  }
}

export const updateVideo = async (didTx, updates) => {
  try {
    await db.videos.update(didTx, updates);
    console.log('Video updated:', updates);
  } catch (error) {
    console.error('Error updating video:', error);
  }
}

export const updateImage = async (didTx, updates) => {
  try {
    await db.images.update(didTx, updates);
    console.log('Image updated:', updates);
  } catch (error) {
    console.error('Error updating image:', error);
  }
}

export const deleteArticle = async (didTx) => {
  try {
    await db.articles.delete(didTx);
    console.log('Article deleted:', didTx);
  } catch (error) {
    console.error('Error deleting article:', error);
  }
}

export const deleteVideo = async (didTx) => {
  try {
    await db.videos.delete(didTx);
    console.log('Video deleted:', didTx);
  } catch (error) {
    console.error('Error deleting video:', error);
  }
}

export const deleteImage = async (didTx) => {
  try {
    await db.images.delete(didTx);
    console.log('Image deleted:', didTx);
  } catch (error) {
    console.error('Error deleting image:', error);
  }
}

// Example query methods
export const getArticleByDidTx = async (didTx) => {
  return await db.articles.get({ didTx });
};

export const getAllArticles = async () => {
  return await db.articles.toArray();
};

export const getArticleByTags = async (tags) => {
  const articles = await db.articles.filter(article => article.tags.some(tag => tags.includes(tag))).toArray();
  return articles.sort((a, b) => {
    const aMatches = a.tags.filter(tag => tags.includes(tag)).length;
    const bMatches = b.tags.filter(tag => tags.includes(tag)).length;
    return bMatches - aMatches;
  });
}

export const getVideoByDidTx = async (didTx) => {
  return await db.videos.get({ didTx });
};

export const getAllVideos = async () => {
  return await db.videos.toArray();
};

export const getVideoByTags = async (tags) => {
  const videos = await db.videos.filter(video => video.tags.some(tag => tags.includes(tag))).toArray();
  return videos.sort((a, b) => {
    const aMatches = a.tags.filter(tag => tags.includes(tag)).length;
    const bMatches = b.tags.filter(tag => tags.includes(tag)).length;
    return bMatches - aMatches;
  });
}

export const getImageByDidTx = async (didTx) => {
  return await db.images.get({ didTx });
};

export const getAllImages = async () => {
  return await db.images.toArray();
};

export const getImageByTags = async (tags) => {
  const images = await db.images.filter(image => image.tags.some(tag => tags.includes(tag))).toArray();
  return images.sort((a, b) => {
    const aMatches = a.tags.filter(tag => tags.includes(tag)).length;
    const bMatches = b.tags.filter(tag => tags.includes(tag)).length;
    return bMatches - aMatches;
  });
}

// Export the database object

export default db;