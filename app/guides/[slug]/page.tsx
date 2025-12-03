type GuidePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  return (
    <div className="space-y-2 py-12">
      <h1 className="text-3xl font-semibold capitalize">Guide profile: {slug}</h1>
      <p className="text-muted-foreground">Guide placeholder route for roadmap alignment.</p>
    </div>
  );
}

