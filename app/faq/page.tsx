"use client";

import { Search } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-surface-pride-lilac/20 to-background pt-20 pb-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-center text-ink mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-center text-ink-soft text-lg max-w-2xl mx-auto">
            Get answers to common questions about Rainbow Tour Guides
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="container mx-auto px-4 -mt-6 mb-12">
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-ink-soft" />
          <Input
            type="search"
            placeholder="Search for questions..."
            className="pl-10 h-12 bg-card"
          />
        </div>
      </section>

      {/* FAQ Categories */}
      <section className="container mx-auto px-4 pb-20">
        <Tabs defaultValue="travelers" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
            <TabsTrigger value="travelers">For Travelers</TabsTrigger>
            <TabsTrigger value="guides">For Guides</TabsTrigger>
            <TabsTrigger value="safety">Safety</TabsTrigger>
            <TabsTrigger value="pricing">Pricing</TabsTrigger>
          </TabsList>

          {/* For Travelers */}
          <TabsContent value="travelers">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-2xl font-display font-bold text-ink mb-6">
                For Travelers
              </h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="font-semibold text-left">
                    How do I book a tour with a guide?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Browse our guide profiles by city or country, select a guide
                    that matches your interests, and click the "Request
                    Booking" button. Fill out the booking form with your
                    preferred dates, number of travelers, and any special
                    requests. The guide will review your request and respond
                    within 24-48 hours to confirm availability and finalize
                    details.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="font-semibold text-left">
                    How do I pay for a tour?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Once your booking is confirmed by the guide, you'll receive
                    a payment link to complete the transaction securely through
                    our platform. We accept major credit cards and debit cards.
                    Payment is processed at the time of booking confirmation,
                    and funds are held securely until the tour is completed.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="font-semibold text-left">
                    What is the cancellation policy?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    You can cancel up to 7 days before your tour for a full
                    refund. Cancellations made 3-7 days before the tour receive
                    a 50% refund. Cancellations within 3 days of the tour are
                    non-refundable. In case of emergencies or unforeseen
                    circumstances, please contact our support team to discuss
                    your options.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="font-semibold text-left">
                    Can I customize my tour experience?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Absolutely! When submitting your booking request, include
                    any specific interests, accessibility needs, or special
                    requests in the message to your guide. Most guides are happy
                    to customize tours to match your preferences, whether you're
                    interested in nightlife, history, art, food, or local LGBTQ+
                    culture.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="font-semibold text-left">
                    What languages do guides speak?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Each guide profile lists the languages they speak fluently.
                    You can filter guides by language when browsing. Most guides
                    speak English plus their local language, and many speak
                    additional languages. Check the guide's profile for specific
                    language details.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="font-semibold text-left">
                    How long are typical tours?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Tour duration varies by guide and location. Most tours range
                    from half-day (4 hours) to full-day (8 hours) experiences.
                    Some guides offer multi-day packages or evening-only
                    experiences. Tour length and pricing are detailed on each
                    guide's profile, and you can discuss custom durations
                    directly with your guide.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger className="font-semibold text-left">
                    What's included in the tour price?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    The tour price covers the guide's time and expertise. Unless
                    otherwise specified on the guide's profile, additional costs
                    like meals, entrance fees to attractions, and transportation
                    are typically not included. Your guide will clarify what's
                    included when confirming your booking.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger className="font-semibold text-left">
                    Can I book a tour for a group?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Yes! Many guides accommodate groups. When requesting a
                    booking, specify the number of travelers in your group.
                    Pricing may vary based on group size, and some guides offer
                    discounts for larger groups. Contact the guide directly to
                    discuss group rates and logistics.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-9">
                  <AccordionTrigger className="font-semibold text-left">
                    How do I contact my guide after booking?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Once your booking is confirmed, you'll have access to a
                    secure messaging system to communicate directly with your
                    guide. You can discuss meeting points, finalize details, ask
                    questions, and coordinate any last-minute changes through
                    this platform.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-10">
                  <AccordionTrigger className="font-semibold text-left">
                    What if I need to reschedule my tour?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Contact your guide as soon as possible through the messaging
                    system if you need to reschedule. Most guides are flexible
                    and will work with you to find alternative dates, subject to
                    their availability. Rescheduling policies may vary by guide,
                    but we encourage open communication to find the best
                    solution.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          {/* For Guides */}
          <TabsContent value="guides">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-2xl font-display font-bold text-ink mb-6">For Guides</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="font-semibold text-left">
                    How do I become a guide on Rainbow Tour Guides?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Click "Sign Up" and select "Guide" during registration.
                    Complete your profile with information about your city,
                    languages, tour themes, and experience. Upload a profile
                    photo and any relevant certifications. Our team reviews all
                    applications within 3-5 business days. Once approved, your
                    profile goes live and you can start receiving booking
                    requests.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="font-semibold text-left">
                    What qualifications do I need?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    You should be a local resident or have extensive knowledge
                    of your city, be passionate about LGBTQ+ travel and culture,
                    and be able to communicate effectively in at least one
                    language. While professional tour guide certification is a
                    plus, it's not required. We value authentic local
                    perspectives and genuine connections with travelers.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="font-semibold text-left">
                    How do payouts work?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    After completing a tour, payment is released to your account
                    within 2-3 business days. You'll receive the tour price
                    minus our platform fee. Payouts are processed via bank
                    transfer or PayPal. You can track all earnings and
                    transaction history in your guide dashboard.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="font-semibold text-left">
                    Can I set my own prices?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Yes! You have full control over your pricing. Set your rates
                    based on your experience, tour complexity, duration, and
                    local market conditions. You can offer different price
                    points for half-day, full-day, or specialty tours. We
                    provide guidance on competitive pricing in your region, but
                    the final decision is yours.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="font-semibold text-left">
                    How do I manage my availability?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Your guide dashboard includes a calendar where you can set
                    available dates, block off unavailable periods, and manage
                    booking requests. You have full control over which requests
                    to accept and can update your availability at any time.
                    Travelers see your general availability when requesting
                    bookings.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="font-semibold text-left">
                    What support does Rainbow Tour Guides provide?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    We provide 24/7 support for any issues during tours, secure
                    payment processing, marketing and promotion of your profile,
                    a messaging platform to communicate with travelers, and
                    resources to help you deliver excellent experiences. Our
                    team is always available to assist with technical questions
                    or booking issues.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger className="font-semibold text-left">
                    Can I decline booking requests?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Absolutely. You're never obligated to accept a booking
                    request. Review each request carefully and only accept those
                    that fit your schedule and comfort level. While we encourage
                    responsiveness, you have complete autonomy over which tours
                    you conduct.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger className="font-semibold text-left">
                    How can I get more bookings?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Keep your profile complete and current with high-quality
                    photos, respond promptly to booking requests, encourage
                    travelers to leave reviews, offer diverse tour themes to
                    appeal to different interests, and maintain consistent
                    availability. Featured guides with excellent reviews and
                    complete profiles receive priority placement in search
                    results.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          {/* Safety & Verification */}
          <TabsContent value="safety">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-2xl font-display font-bold text-ink mb-6">
                Safety & Verification
              </h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="font-semibold text-left">
                    How are guides verified?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    All guides undergo a verification process before their
                    profiles are approved. We verify identity documents, review
                    submitted credentials and experience, conduct background
                    checks where legally permitted, and review references or
                    proof of local knowledge. Our team manually reviews each
                    application to ensure quality and safety.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="font-semibold text-left">
                    What if something goes wrong during my tour?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Your safety is our priority. If you experience any issues
                    during a tour, you can contact our 24/7 support team through
                    the app or website. For emergencies, always call local
                    emergency services first. We have protocols in place to
                    address safety concerns, and serious violations result in
                    immediate guide suspension and investigation.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="font-semibold text-left">
                    Are my personal details shared with guides?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    We protect your privacy throughout the booking process.
                    Guides only receive the information necessary to provide
                    your tour, such as your first name, contact method through
                    our platform, and tour preferences. Your full contact
                    details, payment information, and personal data remain
                    secure and are never fully shared with guides.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="font-semibold text-left">
                    Can I read reviews from other travelers?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Yes! Each guide profile displays verified reviews from
                    travelers who have completed tours. These reviews include
                    ratings and detailed feedback about the experience. All
                    reviews are from confirmed bookings, ensuring authenticity.
                    Reading reviews is a great way to get a sense of what to
                    expect from your tour.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="font-semibold text-left">
                    What happens if a guide cancels my tour?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    While rare, if a guide needs to cancel a confirmed tour,
                    you'll receive an immediate notification and a full refund.
                    We'll also help you find an alternative guide in the same
                    location if your dates are still available. Guides who
                    frequently cancel face account review and potential
                    suspension.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="font-semibold text-left">
                    Is travel insurance recommended?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Yes, we strongly recommend purchasing travel insurance that
                    covers trip cancellations, medical emergencies, and other
                    unforeseen events. While our platform provides certain
                    protections for bookings, comprehensive travel insurance
                    offers additional peace of mind for your entire trip.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>

          {/* Pricing & Payments */}
          <TabsContent value="pricing">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-2xl font-display font-bold text-ink mb-6">
                Pricing & Payments
              </h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="font-semibold text-left">
                    What are the platform fees?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Rainbow Tour Guides charges a service fee on each booking.
                    Travelers pay a 5% service fee added to the tour price.
                    Guides pay a 15% commission on each completed tour. These
                    fees help us maintain the platform, provide support, and
                    process payments securely.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="font-semibold text-left">
                    When do I get charged for a booking?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Your payment method is charged once the guide confirms your
                    booking request. The funds are held securely by our payment
                    processor until the tour is completed. This protects both
                    travelers and guides, ensuring that payment is only released
                    after the service is provided.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="font-semibold text-left">
                    What payment methods do you accept?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    We accept all major credit cards (Visa, Mastercard, American
                    Express, Discover) and debit cards. All transactions are
                    processed through secure, PCI-compliant payment gateways. We
                    do not store your full payment information on our servers.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="font-semibold text-left">
                    Are there any hidden costs?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    No hidden costs. The tour price displayed on the guide's
                    profile, plus the 5% service fee, is the total amount you'll
                    pay through our platform. Additional expenses like meals,
                    transportation, or attraction tickets are separate and
                    should be clarified with your guide before the tour. All
                    fees are clearly itemized during checkout.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="font-semibold text-left">
                    How do refunds work?
                  </AccordionTrigger>
                  <AccordionContent className="p-4 text-ink-soft">
                    Refunds are processed according to our cancellation policy.
                    For eligible cancellations, refunds are issued to your
                    original payment method within 5-10 business days. If a
                    guide cancels your confirmed tour, you receive an immediate
                    full refund including the service fee. Refund amounts depend
                    on how far in advance you cancel.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
