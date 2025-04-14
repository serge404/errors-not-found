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

function useTypewriter(text: string, speed = 60) {
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let i = 0;
    if (text.length === 0) return;  // Handle case where there's no text to type

    // Start typing immediately
    setTyped(text[0]);

    const interval = setInterval(() => {
      i++;
      setTyped((prev) => prev + text[i]);
      if (i >= text.length - 1) clearInterval(interval); // Stop after the last character
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed]);

  return typed;
}

function PostItem({ post, isVisible }: { post: SanityDocument, isVisible: boolean }) {
  // Check if the title exists and isVisible is true, else return an empty string
  const typedTitle = useTypewriter(isVisible ? post.title || "" : "", 60); // Slower typing

  const formattedDate = new Date(post.publishedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const typedDate = useTypewriter(isVisible ? formattedDate : "", 100); // adjust speed as needed

  const imageUrl = post.mainImage
    ? urlFor(post.mainImage)?.width(800).url()
    : null;

    return (
      <li className="fade-in">
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
          <h2 className="text-xl font-semibold">{typedTitle}</h2>
          <p>{typedDate}</p>
        </Link>
      </li>
    );
}

export default function IndexPage() {
  const [posts, setPosts] = useState<SanityDocument[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      const result = await client.fetch<SanityDocument[]>(POSTS_QUERY, {}, options);
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
          ERRORS NOT FOUND
        </h1>

        <br></br>

        <ul className="flex flex-col gap-y-6">
          {posts.slice(0, visibleCount).map((post, i) => 
            <PostItem key={post._id} post={post} isVisible={visibleCount > i} />
            )}
        </ul>
      </main>
    );
  }