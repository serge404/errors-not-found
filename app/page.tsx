"use client";

import Link from "next/link";
import { type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { useState, useEffect } from "react";
import Image from "next/image";



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

export default function IndexPage() {
  const [posts, setPosts] = useState<SanityDocument[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      const result = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);
      console.log("Sanity posts:", result);
      setPosts(result);
    };

    fetchPosts();
  }, []);

  // Typing-style reveal
  useEffect(() => {
    if (visibleCount < posts.length) {
      const timeout = setTimeout(() => {
        setVisibleCount((prev) => prev + 1);
      }, 600); // Adjust typing speed
      return () => clearTimeout(timeout);
    }
  }, [visibleCount, posts]);

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <h1 className="typing-effect text-3xl md:text-5xl font-bold mb-8">
        ERRORS NOT FOUND </h1>

      <br></br>

      <ul className="flex flex-col gap-y-6">
        {posts.slice(0, visibleCount).map((post) => {
          const imageUrl = post.mainImage
            ? urlFor(post.mainImage)?.width(800).url()
            : null;

          return (
            <li key={post._id} className="fade-in">
              <Link href={`/${post.slug.current}`}>
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={post.title}
                    className="rounded-xl mb-2 aspect-video object-cover"
                    width={800}
                    height={400}
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