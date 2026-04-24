import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Aperio" },
      {
        name: "description",
        content:
          "How Aperio collects, uses, and protects your data. Your faith data is private, never sold, never used for ads.",
      },
      { property: "og:title", content: "Privacy Policy — Aperio" },
      {
        property: "og:description",
        content:
          "How Aperio collects, uses, and protects your data. Your faith data is private, never sold, never used for ads.",
      },
    ],
  }),
});

function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back
          </Link>
          <span className="text-xs uppercase tracking-widest text-muted-foreground">
            Aperio
          </span>
        </div>

        <header className="mb-10 border-b border-border pb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Privacy Policy
          </p>
          <h1 className="text-4xl md:text-5xl font-serif tracking-tight mb-4">
            Where the Word Opens.
          </h1>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Effective Date: April 24, 2026</p>
            <p>Last Updated: April 24, 2026</p>
          </div>
          <blockquote className="mt-6 border-l-2 border-primary/40 pl-4 italic text-muted-foreground">
            "Your word is a lamp to my feet and a light to my path." — Psalm
            119:105
          </blockquote>
        </header>

        <article className="prose prose-neutral dark:prose-invert max-w-none space-y-8 text-[15px] leading-relaxed">
          <Section title="1. Introduction">
            <p>
              Welcome to Aperio. We are committed to protecting your personal
              information and your right to privacy. This Privacy Policy
              explains how Aperio ("we," "us," or "our") collects, uses,
              stores, and protects the information you provide when you use
              the Aperio application and its services (collectively, the
              "Service").
            </p>
            <p>
              Aperio is a faith-based Bible study application powered by
              Clavis AI, designed to help users engage deeply with Scripture
              through AI-powered commentary, prayer journaling, reading
              plans, and scholarly tools.
            </p>
            <p className="italic text-muted-foreground">
              Your faith data — your prayers, your annotations, your
              spiritual journey — is sacred. We treat it that way. Your data
              is private, never sold, and never used for advertising.
            </p>
            <p>
              By using Aperio, you agree to the collection and use of
              information in accordance with this policy. If you do not
              agree with any part of this policy, please do not use the
              Service.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <h3 className="font-semibold mt-4">2.1 Information You Provide to Us</h3>
            <p>When you create an account and complete the onboarding process, we collect:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account credentials: email address and password (passwords are encrypted using bcrypt and are never stored in plain text)</li>
              <li>Personal identification: first name, last name, date of birth, and gender</li>
              <li>Location information: city, state, and country</li>
              <li>Professional context: your occupation or student status</li>
              <li>Faith background: denomination, faith journey stage, and topics of interest</li>
              <li>App preferences: preferred Bible translation, Clavis AI tone preference, and daily reading goal</li>
            </ul>

            <h3 className="font-semibold mt-4">2.2 Content You Create</h3>
            <p>Aperio stores the following content that you actively create within the app:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Prayer journal entries — including prayer text, categories, intercession names, and testimony records</li>
              <li>Personal Bible annotations and verse notes</li>
              <li>Bookmarked verses and chapters</li>
              <li>Reading plan progress and daily reflection responses</li>
              <li>Lecture Builder content (Academic Mode users)</li>
              <li>Reading session history and daily goal progress</li>
            </ul>
            <p>This content is created by you, stored securely for your use, and is never shared with other users or third parties without your explicit consent.</p>

            <h3 className="font-semibold mt-4">2.3 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Usage data: which features you use, how long you spend reading, and how frequently you engage with the app</li>
              <li>Device information: device type, operating system, and browser type</li>
              <li>Clavis AI interaction data: the number of times you use Clavis commentary features (used for rate limiting and service improvement — not tied to the content of your queries)</li>
              <li>Reading progress: which books and chapters you have read and when</li>
            </ul>

            <h3 className="font-semibold mt-4">2.4 Information from Third Parties</h3>
            <p>If you choose to sign in using a third-party authentication service such as Google, we receive basic profile information (name and email address) from that provider in accordance with their privacy policies and your permission settings.</p>
          </Section>

          <Section title="3. How We Use Your Information">
            <h3 className="font-semibold mt-4">3.1 To Provide and Improve the Service</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Authenticate your identity and manage your account</li>
              <li>Personalize your Aperio experience based on your onboarding preferences</li>
              <li>Enable Clavis AI to deliver relevant commentary, search results, and scripture suggestions tailored to your reading tone and study level</li>
              <li>Track your reading progress and prayer streaks</li>
              <li>Deliver daily scripture and Clavis-curated reading plan recommendations</li>
            </ul>

            <h3 className="font-semibold mt-4">3.2 To Communicate With You</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Send account-related notifications such as password resets and security alerts</li>
              <li>Deliver daily reading reminders and prayer notifications (only if you have enabled these in your settings)</li>
              <li>Respond to your support requests</li>
            </ul>

            <h3 className="font-semibold mt-4">3.3 For Research and Product Improvement</h3>
            <p>We may use anonymized, aggregated data — meaning data that cannot identify you personally — to understand how users engage with Aperio, improve features, and develop new functionality. This includes understanding which books of the Bible are most read, which Clavis features are most used, and general demographic trends across our user base.</p>
            <p>Individual user data, including your prayers, annotations, and personal study history, is never used for product analytics. Only anonymized aggregate patterns are analyzed.</p>

            <h3 className="font-semibold mt-4">3.4 For Business and Legal Purposes</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>Process subscription payments through our payment processor</li>
              <li>Comply with applicable laws and legal obligations</li>
              <li>Protect the rights, property, and safety of Aperio, our users, and the public</li>
            </ul>
          </Section>

          <Section title="4. Clavis AI and Your Data">
            <p>Clavis is the AI engine that powers Aperio's commentary, search, and personalization features. Clavis is powered by Anthropic's Claude API. When you interact with Clavis — opening commentary, running a search, or receiving a prayer scripture suggestion — your query or passage text is sent to Anthropic's API to generate a response.</p>
            <p className="italic text-muted-foreground"><strong className="not-italic text-foreground">Important:</strong> The content of your prayers is not sent to Clavis unless you explicitly use the prayer-to-scripture connection feature. Even then, only a limited excerpt of the prayer text is transmitted to generate a scripture suggestion.</p>
            <p>Anthropic processes these requests in accordance with their own privacy policy and data usage terms. We encourage you to review Anthropic's privacy policy at anthropic.com/privacy. We do not store your Clavis queries indefinitely — query data is used only to generate your response and is subject to Anthropic's data retention policies.</p>
            <p><strong>Clavis response caching:</strong> To improve performance and reduce costs, Aperio caches Clavis commentary responses for popular Bible passages. Cached responses are stored by passage reference and translation, not by user identity. This means commonly read passages may be served from our cache rather than generating a new AI response each time.</p>
          </Section>

          <Section title="5. How We Protect Your Information">
            <p>We take the security of your personal information seriously, particularly your faith-related data. We implement the following measures:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Encryption in transit:</strong> All data transmitted between your device and our servers is encrypted using HTTPS and TLS protocols</li>
              <li><strong>Encryption at rest:</strong> Your data is stored on DigitalOcean's managed PostgreSQL database infrastructure, which provides encryption at rest</li>
              <li><strong>Password security:</strong> Passwords are never stored in plain text. We use bcrypt hashing with a cost factor of 12, which is the industry standard for secure password storage</li>
              <li><strong>Access controls:</strong> Only authorized Aperio systems can access your data. No individual employee has access to your prayer journal or personal annotations</li>
              <li><strong>Rate limiting:</strong> We implement rate limiting on all API endpoints to prevent unauthorized access and abuse</li>
            </ul>
            <p>While we implement these safeguards, no method of electronic storage or internet transmission is 100% secure. We cannot guarantee absolute security. If you become aware of a security concern, please contact us immediately at privacy@aperioapp.com.</p>
          </Section>

          <Section title="6. Data Sharing and Disclosure">
            <p className="italic text-muted-foreground">We do not sell your personal data. We do not share your data with advertisers. Aperio is and will remain ad-free.</p>
            <p>We share your information only in the following limited circumstances:</p>

            <h3 className="font-semibold mt-4">6.1 Service Providers</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>DigitalOcean — cloud infrastructure and database hosting</li>
              <li>Anthropic — AI processing for Clavis commentary and search features</li>
              <li>Stripe — payment processing for Pro and Scholar subscriptions (Stripe does not have access to your faith data or personal annotations)</li>
              <li>AO Lab — Bible scripture content delivery via their Free Use Bible API (no user data is shared with AO Lab)</li>
            </ul>

            <h3 className="font-semibold mt-4">6.2 Legal Requirements</h3>
            <p>We may disclose your information if required to do so by law or in response to valid requests by public authorities such as a court or government agency. We will notify you of such requests unless prohibited by law.</p>

            <h3 className="font-semibold mt-4">6.3 Business Transfers</h3>
            <p>If Aperio is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction. We will notify you before your personal information is transferred and becomes subject to a different privacy policy.</p>

            <h3 className="font-semibold mt-4">6.4 With Your Consent</h3>
            <p>We may share your information with third parties when you have given us explicit consent to do so, such as sharing a reading plan or lecture with other Aperio users.</p>
          </Section>

          <Section title="7. Your Rights and Choices">
            <h3 className="font-semibold mt-4">7.1 Access and Portability</h3>
            <p>You have the right to access the personal information we hold about you. You can export your data — including your prayer journal, annotations, and reading history — directly from the Aperio app under Profile &gt; Settings &gt; Privacy &amp; Data &gt; Export My Data.</p>

            <h3 className="font-semibold mt-4">7.2 Correction</h3>
            <p>You can update or correct your personal information at any time through the Profile screen in the app. This includes your name, location, denomination, and all other onboarding preferences.</p>

            <h3 className="font-semibold mt-4">7.3 Deletion</h3>
            <p>You have the right to request deletion of your account and all associated data. You can do this by going to Profile &gt; Settings &gt; Privacy &amp; Data &gt; Delete My Account. Upon deletion, we will permanently remove your account, prayer journal, annotations, reading history, and all personally identifiable information within 30 days. Anonymized, aggregated data derived from your usage may be retained for analytical purposes.</p>

            <h3 className="font-semibold mt-4">7.4 Notification Preferences</h3>
            <p>You can manage your notification preferences at any time through Profile &gt; Settings &gt; Notifications. You may opt out of daily reading reminders, prayer reminders, and other push notifications while retaining access to the app.</p>

            <h3 className="font-semibold mt-4">7.5 Withdrawing Consent</h3>
            <p>Where we process your data based on consent, you may withdraw that consent at any time. Withdrawal of consent does not affect the lawfulness of processing based on consent before withdrawal.</p>
          </Section>

          <Section title="8. Data Retention">
            <p>We retain your personal information for as long as your account is active or as needed to provide you with the Service. Specifically:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Account data is retained for the lifetime of your account</li>
              <li>Prayer journal entries, annotations, and reading history are retained indefinitely while your account is active, because these records represent your personal spiritual journey and have ongoing value to you</li>
              <li>Clavis usage logs are retained for 90 days for rate limiting and service improvement purposes</li>
              <li>Payment records are retained for 7 years as required by applicable tax and financial regulations</li>
              <li>Upon account deletion, personally identifiable data is permanently removed within 30 days</li>
            </ul>
          </Section>

          <Section title="9. Children's Privacy">
            <p>Aperio is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at privacy@aperioapp.com and we will delete that information promptly.</p>
            <p>Users between the ages of 13 and 18 may use Aperio with the consent of a parent or guardian. We encourage parents to review this Privacy Policy with their children.</p>
          </Section>

          <Section title="10. International Users">
            <p>Aperio is operated in the United States. If you are located outside the United States, please be aware that your information may be transferred to, stored, and processed in the United States, where our servers are located. By using Aperio, you consent to this transfer.</p>
            <p>If you are located in the European Economic Area (EEA), United Kingdom, or other regions with specific data protection laws, you may have additional rights under applicable law, including rights under the General Data Protection Regulation (GDPR). We are committed to complying with applicable data protection regulations. Our legal basis for processing your data is your consent, which you provide when you create an account and complete onboarding.</p>
          </Section>

          <Section title="11. Cookies and Tracking">
            <p>Aperio uses session cookies to maintain your login state and authentication. These are essential for the app to function and cannot be disabled. We do not use tracking cookies, advertising cookies, or third-party analytics cookies.</p>
            <p>We do not use any third-party advertising networks, remarketing services, or behavioral tracking tools. Your activity within Aperio is not tracked for advertising purposes — ever.</p>
          </Section>

          <Section title="12. Aperio Access — Sponsorship Program">
            <p>Aperio Access is our program that allows Pro subscribers to sponsor free access for believers in developing nations. When you participate in the Aperio Access program as a sponsor, your sponsorship is anonymous — we do not share your identity with sponsored users, and sponsored users' identities are not shared with sponsors. The program counter displayed on our website reflects aggregate totals only.</p>
          </Section>

          <Section title="13. Changes to This Privacy Policy">
            <p>We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or for other operational reasons. When we make material changes, we will notify you through the app and update the "Last Updated" date at the top of this document.</p>
            <p>We encourage you to review this Privacy Policy periodically. Your continued use of Aperio after any changes constitutes your acceptance of the updated policy.</p>
          </Section>

          <Section title="14. Contact Us">
            <p>If you have any questions, concerns, or requests regarding this Privacy Policy or the way we handle your personal information, please contact us:</p>
            <div className="not-prose rounded-lg border border-border bg-muted/30 p-4 text-sm">
              <p className="font-semibold">Aperio Privacy Team</p>
              <p>Email: privacy@aperioapp.com</p>
              <p>Website: aperioapp.com</p>
              <p>Mailing Address: Aperio / Katylst Agency, Alpharetta, Georgia, United States</p>
            </div>
            <p>We are committed to responding to all privacy-related inquiries within 30 days.</p>
          </Section>
        </article>

        <footer className="mt-16 border-t border-border pt-8 text-center text-xs text-muted-foreground">
          <p className="text-base font-serif text-foreground mb-1">APERIO</p>
          <p className="italic mb-2">Where the Word Opens.</p>
          <p>Powered by Clavis AI · Katylst Agency · aperioapp.com</p>
        </footer>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl md:text-2xl font-serif tracking-tight mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}