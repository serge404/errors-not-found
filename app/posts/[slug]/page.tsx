export default function BlogPost({ params }: { params: { slug: string } }) {
    return (
      <div>
        <h1>Post: {params.slug}</h1>
        <p>This is a dynamic blog post page for the slug: {params.slug}</p>
      </div>
    );
  }