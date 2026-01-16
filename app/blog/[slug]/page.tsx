import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// Mock content
const CONTENT = {
  "welcome-to-rainbow-tour-guides": {
    title: "Welcome to Rainbow Tour Guides v2",
    date: "2026-01-15",
    content: `
            <p class="lead">We're thrilled to unveil the new version of our platform.</p>
            <p>Our mission is simple: <strong>connect LGBTQ+ travelers with safe, verified local guides.</strong></p>
            <h2>Why v2?</h2>
            <p>We've listened to your feedback. You wanted verified profiles, secure payments, and clearer availability. We delivered.</p>
            <ul>
               <li>New Double-Blind Reviews</li>
               <li>Instant Booking Requests</li>
               <li>Enhanced Guide Profiles</li>
            </ul>
        `
  },
  // ... others handled by fallback
};

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = CONTENT[slug as keyof typeof CONTENT];

  if (!post) {
    // Fallback generic for demo
    return (
      <div className="container max-w-3xl py-12 space-y-8">
        <Button variant="ghost" asChild className="-ml-4">
          <Link href="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Link>
        </Button>
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}</h1>
          <div className="text-muted-foreground">Published recently</div>
        </div>
        <div className="prose max-w-none">
          <p>This is a placeholder content for the blog post "<strong>{slug}</strong>".</p>
          <p>In a real implementation, this would fetch MDX content from a CMS or local file system.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-12 space-y-8">
      <Button variant="ghost" asChild className="-ml-4">
        <Link href="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog</Link>
      </Button>

      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
        <div className="text-muted-foreground">Published on {post.date}</div>
      </div>

      <div
        className="prose prose-zinc prose-lg max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </div>
  );
}
