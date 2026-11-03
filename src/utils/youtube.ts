/*
 * Pull the video id out of the common YouTube link formats.
 * Returns null for anything that isn't a YouTube video.
 */
export const getYouTubeId = (value: string | null): string | null => {
  if (!value) return null;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    let id: string | null = null;

    if (host === "youtu.be") {
      id = url.pathname.slice(1);
    } else if (host === "youtube.com" || host === "m.youtube.com") {
      if (url.pathname === "/watch") {
        id = url.searchParams.get("v");
      } else if (
        url.pathname.startsWith("/embed/") ||
        url.pathname.startsWith("/shorts/")
      ) {
        id = url.pathname.split("/")[2] ?? null;
      }
    }

    return id && /^[\w-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
};

export const getYouTubeEmbedUrl = (value: string | null): string | null => {
  const id = getYouTubeId(value);

  return id
    ? `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`
    : null;
};