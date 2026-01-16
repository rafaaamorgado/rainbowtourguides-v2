import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

// Mock data for MVP blog
const POSTS = [
  {
    slug: "welcome-to-rainbow-tour-guides",
    title: "Welcome to Rainbow Tour Guides v2",
    excerpt: "We are building the world's most trusted marketplace for LGBTQ+ focused travel experiences.",
    date: "2026-01-15",
    author: "Team Rainbow",
    readTime: "3 min read"
  },
  {
    slug: "safety-first-approach",
    title: "Our Safety-First Approach",
    excerpt: "How we verify guides and ensure safe spaces for our community travelers.",
    date: "2026-01-10",
    author: "Safety Team",
    readTime: "5 min read"
  },
  {
    slug: "top-destinations-2026",
    title: "Top Queer Destinations for 2026",
    excerpt: "From Lisbon's Principe Real to Bangkok's Silom Soi 2, discover where our community is traveling.",
    date: "2026-01-05",
    author: "Editorial",
    readTime: "7 min read"
  }
];

export default function BlogIndexPage() {
  return (
    <div className="container max-w-4xl py-12 space-y-12">
      <div className="space-y-4 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Community Stories</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          News, safety tips, and travel inspiration from the Rainbow Tour Guides team.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {POSTS.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.slug} className="group">
            <Card className="h-full group-hover:shadow-md transition-shadow">
              <div className="aspect-video w-full bg-muted rounded-t-xl" />
              <CardHeader>
                <div className="flex justify-between items-center text-xs text-muted-foreground mb-2">
                  <span>{format(new Date(post.date), 'MMM d, yyyy')}</span>
                  <span>{post.readTime}</span>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3">
                  {post.excerpt}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
