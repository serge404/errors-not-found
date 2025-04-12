import { PortableText, type SanityDocument } from "next-sanity";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import Link from "next/link";

const builder = imageUrlBuilder(client);

const components = {
  types: {
    image: ({ value }) => {
      const imageUrl = builder.image(value).width(800).url();
      return (
        <img
          src={imageUrl}
          alt={value.alt || 'Post image'}
          className="rounded-xl my-6"
        />
      );
    },
    embed: ({ value }) => {
      const { url } = value;

      // YouTube
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        const videoId = url.split("v=")[1]?.split("&")[0] || url.split("/").pop();
        return (
          <iframe
            width="100%"
            height="400"
            className="rounded-xl my-6"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        );
      }

      // SoundCloud (via oEmbed)
      if (url.includes("soundcloud.com")) {
        return (
          <iframe
            width="100%"
            height="166"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            className="rounded-xl my-6"
            src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(
              url
            )}&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false`}
          ></iframe>
        );
      }

      // Apple Music
      if (url.includes("music.apple.com")) {
        return (
          <iframe
            allow="autoplay *; encrypted-media *;"
            frameBorder="0"
            height="450"
            style={{ width: "100%", overflow: "hidden", background: "transparent" }}
            sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation-by-user-activation"
            src={`https://embed.music.apple.com/us/album/${url.split("/album/")[1]}`}
          ></iframe>
        );
      }

      // Fallback
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
          {url}
        </a>
      );
    },
  },
};

const POST_QUERY = `*[_type == "post" && slug.current == $slug][0]`;

const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null;

const options = { next: { revalidate: 30 } };

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = await client.fetch<SanityDocument>(POST_QUERY, await params, options);
  const postImageUrl = post.image
    ? urlFor(post.image)?.width(550).height(310).url()
    : null;

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <Link href="/" className="hover:underline">
        ← Back to posts
      </Link>
      {postImageUrl && (
        <img
          src={postImageUrl}
          alt={post.title}
          className="aspect-video rounded-xl"
          width="550"
          height="310"
        />
      )}
      <h1 className="text-4xl font-bold mb-8">{post.title}</h1>
      <div className="prose">
        <p>Published: {new Date(post.publishedAt).toLocaleDateString()}</p>
        {Array.isArray(post.body) && <PortableText value={post.body} components={components} />}
      </div>
    </main>
  );
}