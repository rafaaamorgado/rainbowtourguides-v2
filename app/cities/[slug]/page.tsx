type CityPageProps = {
  params: { slug: string };
};

export default function CityPage({ params }: CityPageProps) {
  return (
    <div className="space-y-2 py-12">
      <h1 className="text-3xl font-semibold capitalize">{params.slug} city guide</h1>
      <p className="text-muted-foreground">City detail placeholder while we build the marketplace.</p>
    </div>
  );
}

