type CountryPageProps = {
  params: { slug: string };
};

export default function CountryPage({ params }: CountryPageProps) {
  return (
    <div className="space-y-2 py-12">
      <h1 className="text-3xl font-semibold capitalize">{params.slug} adventures</h1>
      <p className="text-muted-foreground">Country placeholder with simple copy for now.</p>
    </div>
  );
}

