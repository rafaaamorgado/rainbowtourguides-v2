type CityPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;
  return (
    <div className="space-y-2 py-12">
      <h1 className="text-3xl font-semibold capitalize">{slug} city guide</h1>
      <p className="text-muted-foreground">City detail placeholder while we build the marketplace.</p>
    </div>
  );
}


