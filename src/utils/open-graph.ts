import scraper from 'open-graph-scraper';

export async function getUrlOpenGraphData(url: string) {
  if (!url) return null;

  const options = { url: url };
  const { error, result, response } = await scraper(options);

  if (!result.success) {
    return null;
  }
  return {
    url: result.ogUrl,
    title: result.ogTitle,
    image: result.ogImage,
  };
}
