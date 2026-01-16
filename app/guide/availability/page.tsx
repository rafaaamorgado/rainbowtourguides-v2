export default function GuideAvailabilityPage() {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Availability</h2>
                <p className="text-muted-foreground">
                    Manage your weekly schedule and block out specific dates.
                </p>
            </div>

            <div className="rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
                <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                    <p className="mb-4 text-sm text-muted-foreground">
                        Availability calendar implementation coming soon.
                    </p>
                    <p className="text-xs text-muted-foreground">
                        (You can currently set your typical weekly schedule during onboarding)
                    </p>
                </div>
            </div>
        </div>
    );
}
