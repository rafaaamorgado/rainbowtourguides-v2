import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, User, ArrowLeft, ArrowRight } from "lucide-react";
import { getMockArticle, getMockArticles } from "@/lib/mock-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type ArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getMockArticle(slug);

  if (!article) {
    return {
      title: "Article Not Found - Rainbow Tour Guides",
    };
  }

  return {
    title: `${article.title} - Rainbow Tour Guides Blog`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: "article",
      images: [article.featured_image],
    },
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = getMockArticle(slug);

  if (!article) {
    notFound();
  }

  // Get related articles (same category, exclude current)
  const allArticles = getMockArticles();
  const relatedArticles = allArticles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/blog" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to articles
            </Link>
          </Button>
        </div>
      </div>

      {/* Article Hero */}
      <section className="relative aspect-[21/9] w-full overflow-hidden bg-slate-900">
        <Image
          src={article.featured_image}
          alt={article.title}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />

        {/* Title Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-4xl mx-auto w-full px-6 pb-12 space-y-4">
            <Badge className="bg-brand text-white border-0">
              {article.category}
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight">
              {article.title}
            </h1>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-6 py-12">
        {/* Author Info */}
        <div className="flex items-center gap-4 pb-8 mb-8 border-b border-slate-200">
          <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-pride-lilac to-pride-mint">
            <Image
              src={article.author_photo}
              alt={article.author_name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-ink">{article.author_name}</p>
            <div className="flex items-center gap-4 text-sm text-ink-soft mt-1">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(article.published_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {article.read_time} min read
              </div>
            </div>
          </div>
        </div>

        {/* Article Body */}
        <div className="prose prose-slate prose-lg max-w-none">
          <div className="text-xl text-ink-soft leading-relaxed mb-8 font-light">
            {article.excerpt}
          </div>
          <div
            className="space-y-6"
            dangerouslySetInnerHTML={{
              __html: article.content
                .split("\n\n")
                .map((paragraph) => {
                  if (paragraph.startsWith("## ")) {
                    return `<h2 class="text-2xl font-bold text-ink mt-12 mb-4">${paragraph.replace(
                      "## ",
                      ""
                    )}</h2>`;
                  }
                  if (paragraph.startsWith("- ")) {
                    return `<li class="text-ink-soft leading-relaxed">${paragraph.replace(
                      "- ",
                      ""
                    )}</li>`;
                  }
                  return `<p class="text-ink-soft leading-relaxed">${paragraph}</p>`;
                })
                .join(""),
            }}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-slate-200">
          {article.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-ink-soft border-slate-300"
            >
              {tag}
            </Badge>
          ))}
        </div>
      </article>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="bg-slate-50 border-t border-slate-200 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <h2 className="text-3xl font-serif font-bold text-ink">
              Related Articles
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
                  className="group block bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="relative aspect-video overflow-hidden bg-slate-200">
                    <Image
                      src={related.featured_image}
                      alt={related.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-bold text-ink leading-snug group-hover:text-brand transition-colors">
                      {related.title}
                    </h3>
                    <p className="text-sm text-ink-soft line-clamp-2">
                      {related.excerpt}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-ink-soft pt-2">
                      <Clock className="h-3 w-3" />
                      {related.read_time} min read
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center pt-4">
              <Button asChild variant="outline">
                <Link href="/blog" className="flex items-center gap-2">
                  View all articles
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

