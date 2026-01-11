import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User, ArrowRight } from "lucide-react";
import { getMockArticles } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Travel Stories & Guides - Rainbow Tour Guides",
  description:
    "LGBTQ+ travel stories, destination guides, safety tips, and cultural insights from our community of verified local guides.",
  openGraph: {
    title: "Travel Stories & Guides - Rainbow Tour Guides",
    description:
      "LGBTQ+ travel stories, destination guides, and cultural insights.",
    type: "website",
  },
};

export default function BlogPage() {
  const articles = getMockArticles();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Header */}
      <section className="bg-gradient-to-b from-slate-50 to-white border-b border-slate-200 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-ink mb-4 tracking-tight">
              Travel Stories & Guides
            </h1>
            <p className="text-xl text-ink-soft leading-relaxed font-light">
              LGBTQ+ travel insights, destination guides, and stories from our
              community of verified local guides.
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="group block"
              >
                <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  {/* Featured Image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-200">
                    <Image
                      src={article.featured_image}
                      alt={article.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Category Badge */}
                    <Badge className="bg-brand/10 text-brand border-0 text-xs font-semibold">
                      {article.category}
                    </Badge>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-ink leading-snug group-hover:text-brand transition-colors">
                      {article.title}
                    </h2>

                    {/* Excerpt */}
                    <p className="text-sm text-ink-soft leading-relaxed line-clamp-3">
                      {article.excerpt}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-xs text-ink-soft pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{article.author_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{article.read_time} min read</span>
                      </div>
                    </div>

                    {/* Read More */}
                    <div className="flex items-center gap-2 text-brand text-sm font-semibold pt-2 group-hover:gap-3 transition-all">
                      Read more
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

