type GuidePageProps = {
  params: { slug: string };
};

export default function GuidePage({ params }: GuidePageProps) {
  return (
    <div className="space-y-2 py-12">
      <h1 className="text-3xl font-semibold capitalize">Guide profile: {params.slug}</h1>
      <p className="text-muted-foreground">Guide placeholder route for roadmap alignment.</p>
    </div>
  );
}

