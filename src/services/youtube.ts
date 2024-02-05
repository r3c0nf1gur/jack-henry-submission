import type { Comment } from "../types/comment";
import type { YoutubeVideo } from "../types/video";

export const fetchVideoInfo = async (
  youtubeQuery: string,
  sortCriteria: string
): Promise<YoutubeVideo[]> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/${
        import.meta.env.VITE_YOUTUBE_API_VERSION
      }/search?part=snippet&order=${sortCriteria}&maxResults=50&q=${youtubeQuery}&key=${
        import.meta.env.VITE_YOUTUBE_API_KEY
      }`
    );
    if (response.status === 200) {
      const data = await response.json();
      return data.items;
    } else {
      throw new Error(await response.text());
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.log("Fetch request aborted:", error.message);
      return [];
    } else {
      throw error;
    }
  }
};

export const fetchComments = async (
  videoId: string,
  signal?: AbortSignal
): Promise<{ comments: Comment[]; totalComments: number }> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/${
        import.meta.env.VITE_YOUTUBE_API_VERSION
      }/commentThreads?part=snippet&maxResults=100&videoId=${videoId}&key=${
        import.meta.env.VITE_YOUTUBE_API_KEY
      }`,
      {
        signal,
      }
    );
    if (response.status === 200) {
      const data = await response.json();
      const items: Comment[] = data.items || [];
      let totalComments: number = items.length;

      items.forEach((comment) => {
        if (comment.snippet.totalReplyCount) {
          totalComments += comment.snippet.totalReplyCount;
        }
      });

      return { comments: items, totalComments };
    } else {
      throw new Error(await response.text());
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.log("Fetch request aborted:", error.message);
      return { comments: [], totalComments: 0 };
    } else {
      throw error;
    }
  }
};

export const fetchRating = async (
  videoId: string,
  signal?: AbortSignal
): Promise<number> => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/${
        import.meta.env.VITE_YOUTUBE_API_VERSION
      }/videos/getRating?id=${videoId}&key=${
        import.meta.env.VITE_YOUTUBE_API_KEY
      }`,
      {
        signal,
      }
    );
    if (response.status === 200) {
      const data = await response.json();
      return data.items[0].rating;
    } else {
      throw new Error(await response.text());
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      console.log("Fetch request aborted:", error.message);
      return 0;
    } else {
      throw error;
    }
  }
};
