import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { client } from "@/sanity/client";

const POSTS_QUERY = `*[
  _type == "post"
  && defined(slug.current)
]|order(publishedAt desc)[0...12]{_id, title, slug, publishedAt, mainImage}`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 30 } };

export default async function IndexPage() {
  const posts = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);

  console.log(posts)

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <h1 className="typing-effect">ERRORS NOT FOUND</h1>
      <ul className="flex flex-col gap-y-4">
      {posts.map((post) => {
        const imageUrl = post.mainImage ? urlFor(post.mainImage)?.width(800).url() : null;
        
        return (
          <li className="hover:underline" key={post._id}>
            <Link href={`/${post.slug.current}`}>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt={post.title}
                  className="rounded-xl mb-2 aspect-video object-cover"
                />
              )}
              <h2 className="text-xl font-semibold">{post.title}</h2>
              <p>{new Date(post.publishedAt).toLocaleDateString()}</p>
            </Link>
          </li>
        );
      })}
      </ul>
      
    </main>
  );
}