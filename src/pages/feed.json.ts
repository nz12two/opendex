import type { APIRoute } from 'astro';
import { Feed } from 'feed';
import { getCollection } from 'astro:content';
import { siteConfig } from '../data/navigation';

export const prerender = true;

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = (site?.toString() ?? siteConfig.url).replace(/\/$/, '');

  const posts = (await getCollection('blog'))
    .filter(p => !p.data.draft && p.id !== 'index')
    .sort((a, b) => b.data.pubDate.getTime() - a.data.pubDate.getTime());

  const feed = new Feed({
    title: 'OpenDex Blog',
    description: siteConfig.description,
    id: siteUrl + '/blog/',
    link: siteUrl + '/blog/',
    language: 'pt-BR',
    image: siteUrl + '/favicon.svg',
    favicon: siteUrl + '/favicon.svg',
    copyright: `© ${new Date().getFullYear()} OpenDex`,
    updated: posts[0]?.data.pubDate ?? new Date(),
    generator: 'OpenDex',
  });

  for (const post of posts) {
    const url = `${siteUrl}/blog/${post.id}/`;
    feed.addItem({
      title: post.data.title,
      id: url,
      link: url,
      description: post.data.description,
      content: post.body ?? post.data.description,
      author: [{ name: post.data.author }],
      date: post.data.updatedDate ?? post.data.pubDate,
      published: post.data.pubDate,
      category: post.data.categories.map(c => ({ name: c })),
    });
  }

  return new Response(feed.json1(), {
    headers: { 'Content-Type': 'application/feed+json; charset=utf-8' },
  });
};
