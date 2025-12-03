type CountryPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function CountryPage({ params }: CountryPageProps) {
  const { slug } = await params;
  return (
    <div className="space-y-2 py-12">
      <h1 className="text-3xl font-semibold capitalize">{slug} adventures</h1>
      <p className="text-muted-foreground">Country placeholder with simple copy for now.</p>
    </div>
  );
}

