/**
 * Scrapes a YouTube channel's live URL to find the active broadcast Video ID.
 * Returns { videoId: string, isLive: boolean }
 */
async function getLiveStreamId(channelId) {
  try {
    const url = channelId.startsWith('@') ? `https://www.youtube.com/${channelId}/live` : `https://www.youtube.com/channel/${channelId}/live`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      console.error(`YouTube Scraper: Failed to fetch ${url} - Status ${response.status}`);
      return { videoId: null, isLive: false };
    }

    const html = await response.text();

    // The canonical URL on a /live page always points to the watch URL if there is an active stream or recent VOD
    const idMatch = html.match(/<link rel="canonical" href="https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})"/);
    const videoId = idMatch ? idMatch[1] : null;

    if (!videoId) {
      return { videoId: null, isLive: false };
    }

    // Check if the page contains indicators that it's currently a live broadcast
    const isLiveMatch = html.includes('isLiveBroadcast') || html.includes('"isLive":true');

    return {
      videoId,
      isLive: isLiveMatch
    };
  } catch (error) {
    console.error('YouTube Scraper Error:', error);
    return { videoId: null, isLive: false };
  }
}

/**
 * Scrapes a YouTube channel's /videos page to get recent upload video IDs and metadata.
 * Returns Array of { id, title, subtitle, img, videoUrl, author, game, watchUrl }
 */
async function getLatestChannelVideos(channelHandle, gameTitle, limit = 4) {
  try {
    const url = channelHandle.startsWith('@') 
      ? `https://www.youtube.com/${channelHandle}/videos` 
      : `https://www.youtube.com/channel/${channelHandle}/videos`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      console.error(`YouTube Scraper: Failed to fetch videos for ${url} - Status ${response.status}`);
      return [];
    }

    const html = await response.text();
    // Video IDs appear in order of upload in YouTube HTML
    const videoMatches = [...html.matchAll(/"videoId":"([a-zA-Z0-9_-]{11})"/g)].map(m => m[1]);
    const uniqueIds = [...new Set(videoMatches)].slice(0, limit);

    const videoList = await Promise.all(
      uniqueIds.map(async (vid) => {
        try {
          const oEmbedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${vid}&format=json`);
          if (oEmbedRes.ok) {
            const info = await oEmbedRes.json();
            return {
              id: vid,
              game: gameTitle,
              title: gameTitle,
              subtitle: info.title,
              img: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
              videoUrl: `https://www.youtube.com/embed/${vid}`,
              author: info.author_name || gameTitle,
              authorUrl: info.author_url || url,
              watchUrl: `https://www.youtube.com/watch?v=${vid}`
            };
          }
        } catch (e) {
          // ignore error and fallback
        }
        return {
          id: vid,
          game: gameTitle,
          title: gameTitle,
          subtitle: `${gameTitle} Official Video`,
          img: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
          videoUrl: `https://www.youtube.com/embed/${vid}`,
          author: gameTitle,
          watchUrl: `https://www.youtube.com/watch?v=${vid}`
        };
      })
    );

    return videoList;
  } catch (error) {
    console.error(`YouTube Scraper Error fetching videos for ${channelHandle}:`, error);
    return [];
  }
}

/**
 * Fetches latest video uploads from each connected game YouTube channel
 */
async function getAllGameHighlights() {
  const [crossfireVideos, valorantVideos] = await Promise.all([
    getLatestChannelVideos('@CrossfirePhilippines', 'CROSSFIRE', 4),
    getLatestChannelVideos('@ValorantEsports', 'VALORANT', 4)
  ]);

  // Interleave the uploads so both channels are featured alternatingly
  const interleaved = [];
  const maxLen = Math.max(crossfireVideos.length, valorantVideos.length);
  for (let i = 0; i < maxLen; i++) {
    if (crossfireVideos[i]) interleaved.push(crossfireVideos[i]);
    if (valorantVideos[i]) interleaved.push(valorantVideos[i]);
  }

  return {
    highlights: interleaved,
    crossfire: crossfireVideos,
    valorant: valorantVideos
  };
}

module.exports = {
  getLiveStreamId,
  getLatestChannelVideos,
  getAllGameHighlights
};
