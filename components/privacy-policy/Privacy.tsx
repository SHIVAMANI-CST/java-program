import type { Metadata } from "next";
import { isDev } from "@/utils/envCheck";

export const metadata: Metadata = {
  title: "Privacy Policy | CinfyAI",
  description:
    "Read CinfyAI's Privacy Policy to learn how we collect, use, and protect your personal data when you use our services.",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Privacy Policy | CinfyAI",
    description:
      "Understand how CinfyAI handles your data securely with our Privacy Policy.",
    url: "https://app.cinfy.ai/privacy",
    siteName: "CinfyAI",
    type: "article",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | CinfyAI",
    description:
      "Understand how CinfyAI handles your data securely with our Privacy Policy.",
  },
};

// app/privacy/page.tsx
export default function PrivacyPolicyPage() {
  const supportEmail = isDev()
    ? "support@dev-compileinfy.com"
    : "support@cinfy.ai";

  return (
    <div className="min-h-[calc(100vh-44px)] md:min-h-[calc(100vh-48px)] lg:min-h-[calc(100vh-48px)] xl:min-h-[calc(100vh-56px)] p-4 md:p-5 lg:p-6 xl:p-8 bg-white flex items-start transition-all duration-300 ease-in-out relative">
        <div
        className="absolute top-0 right-0 w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[320px] lg:h-[320px] xl:w-[400px] xl:h-[400px] rounded-full z-0 pointer-events-none"
          style={{
            background: "rgba(142, 94, 255, 0.35)",
            filter: "blur(180px)",
            transform: "translate(100px, -80px)",
          }}
        />
        <div
        className="absolute top-0 left-0 w-[250px] h-[250px] md:w-[300px] md:h-[300px] lg:w-[320px] lg:h-[320px] xl:w-[400px] xl:h-[400px] rounded-full z-0 pointer-events-none"
          style={{
            background: "rgba(255, 133, 94, 0.2)",
            filter: "blur(180px)",
            transform: "translate(-100px, -80px)",
          }}
        />
      <main className="relative w-full flex flex-col items-start gap-4 md:gap-4 lg:gap-4 xl:gap-6 z-10 text-gray-800">
        <div className="sticky top-0 z-30 bg-white/10 backdrop-blur-lg pb-4 pt-4 -mt-4 -mx-4 px-4 md:-mx-5 md:px-5 lg:-mx-6 lg:px-6 xl:-mx-8 xl:px-8 w-[calc(100%+2rem)] md:w-[calc(100%+2.5rem)] lg:w-[calc(100%+3rem)] xl:w-[calc(100%+4rem)] transition-all">
          <h1 className="text-xl md:text-xl lg:text-xl xl:text-2xl font-semibold">
            CinfyAI — Privacy Policy
          </h1>
          <p className="text-sm md:text-xs lg:text-xs xl:text-sm text-gray-600 mt-1">
            Effective Date: 25 August 2025
          </p>
        </div>

        <div className="space-y-4 md:space-y-3 lg:space-y-3 xl:space-y-4">
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            This Privacy Policy explains how Compileinfy Technology Solutions
            Private Limited ("Compileinfy," "we," "us," or "our") collects,
            uses, discloses, and safeguards information when you access or use
            CinfyAI through our web and mobile applications (the "Service"). It
            applies to users globally, with additional details for users in
            India, the United States, the European Economic Area (EEA), the
            United Kingdom (UK), and other regions as applicable.
          </p>

          <p className="text-base md:text-sm lg:text-sm xl:text-base">
            <strong>Contact:</strong>{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {supportEmail}
            </a>
          </p>
        </div>

        <section className="space-y-3 md:space-y-2 lg:space-y-2.5 xl:space-y-3">
          <h2 className="text-xl md:text-lg lg:text-lg xl:text-xl font-semibold">
            Contents
          </h2>
          <ol className="list-decimal pl-6 md:pl-5 lg:pl-5 xl:pl-6 text-base md:text-sm lg:text-sm xl:text-base space-y-1 md:space-y-0.5 lg:space-y-0.5 xl:space-y-1">
            <li>Scope, Overview & Definitions</li>
            <li>Information We Collect</li>
            <li>How We Use Information (Including Model Training)</li>
            <li>Legal Bases & Our Role</li>
            <li>Sharing & Disclosures</li>
            <li>International Data Transfers</li>
            <li>Data Retention & Security</li>
            <li>Your Rights & Choices</li>
            <li>Children, Sensitive Data, Changes & Contact</li>
          </ol>
        </section>

        <section className="space-y-4 md:space-y-3 lg:space-y-3 xl:space-y-4">
          <h2 className="text-xl md:text-lg lg:text-lg xl:text-xl font-semibold">
            1. Scope, Overview & Definitions
          </h2>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            This Policy covers information we collect when you use CinfyAI's web
            and mobile applications, create or access an account, interact with
            our chat features, request support, or otherwise engage with us. It
            also explains your choices and rights, how you can contact us, and
            how we handle international transfers. For clarity, "Personal Data"
            means information that identifies or relates to an identifiable
            person (such as name, email address, and certain device
            identifiers). "Inputs" are prompts, instructions, or files you
            submit. "Outputs" are responses or generated content produced by the
            Service. "Usage Data" refers to logs and analytics relating to how
            the Service is used.
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            CinfyAI integrates with third‑party AI model providers to process
            Inputs and produce Outputs. Depending on your location and
            applicable laws, we act as a controller or equivalent under data
            protection laws for most account and platform operations. For
            enterprise or developer integrations where a customer configures
            data flows, we may act as a processor to that customer. This Policy
            provides a high‑level summary for global users; regional addenda or
            notices may apply where required by local law. If any part of this
            Policy conflicts with mandatory laws, those laws control.
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            We encourage you to review this Policy carefully. By using the
            Service, you agree to the practices described here. If you do not
            agree, do not use the Service. Where we rely on consent (for
            example, certain analytics or marketing activity, or optional
            model‑improvement programs), you may withdraw consent at any time as
            described below.
          </p>
        </section>

        <section className="space-y-4 md:space-y-3 lg:space-y-3 xl:space-y-4">
          <h2 className="text-xl md:text-lg lg:text-lg xl:text-xl font-semibold">
            2. Information We Collect
          </h2>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>Account & Profile Data.</strong> When you sign up, we
            collect your Full Name (required), Email Address (required), Mobile
            Number (optional), and Password. If you use Google Sign‑In, we
            receive basic profile information (e.g., name, email) from Google
            consistent with your permissions. We do not request access to your
            Gmail content or sensitive Google scopes unless explicitly needed
            and consented to for a specific feature.
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>Inputs & Outputs.</strong> We collect the text and files you
            submit as Inputs and the Outputs generated by the Service. These may
            contain Personal Data if you choose to include it. We recommend you
            avoid sharing Personal Data or confidential information in prompts
            unless necessary. We may use Inputs and Outputs for safety,
            diagnostics, and—in accordance with the choices described in this
            Policy—to improve models in the future.
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>Usage, Device & Technical Data.</strong> We collect
            information about your interactions with the Service including pages
            viewed, features used, timestamps, approximate location derived from
            IP, device type, operating system, app version, language,
            performance metrics, crash logs, and identifiers (e.g., cookies,
            mobile advertising IDs). We use cookies and similar technologies to
            remember preferences, keep you signed in, and analyze performance.
            You can manage cookie settings in your browser or device, though
            some features may not function properly if certain cookies are
            disabled.
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>Communications & Support.</strong> If you contact us (e.g.,
            via{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {supportEmail}
            </a>
            ), we collect the information you provide along with related
            metadata necessary to respond and maintain records. We may also
            store preferences, surveys, or feedback you share, and we maintain
            records of consents, opt‑outs, and settings.
          </p>
        </section>

        <section className="space-y-4 md:space-y-3 lg:space-y-3 xl:space-y-4">
          <h2 className="text-xl md:text-lg lg:text-lg xl:text-xl font-semibold">
            3. How We Use Information (Including Model Training)
          </h2>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            We use information to provide, maintain, and improve the Service;
            authenticate users; secure accounts; personalize experiences;
            troubleshoot; and operate safety systems (such as detecting abuse
            and enforcing policies). We process Inputs to produce Outputs and
            may share Inputs with third‑party AI model providers to generate
            those Outputs. We use Usage Data to analyze performance, optimize
            routing across models, and plan capacity.
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            We may also use Inputs, Outputs, and Usage Data to improve product
            quality, such as tuning prompts, refining safety filters, and
            evaluating features. <strong>Model Improvement & Training.</strong>{" "}
            Where permitted by law and our agreements, and in line with this
            Policy, we may use de‑identified or aggregated data, and in certain
            cases sampled Inputs/Outputs, to help train, evaluate, or fine‑tune
            models (ours or providers'). We strive to apply safeguards (e.g.,
            automated and manual review, filtering, minimization). If we offer
            an opt‑out mechanism for training on your data, we will honor your
            settings; you can request opt‑out at{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {supportEmail}
            </a>
            .
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            We may send you important service notices (e.g., security alerts,
            terms changes). We may also send optional communications about
            features or updates, subject to your preferences and applicable law;
            you may opt out of marketing at any time. Additionally, we use
            information for compliance with legal obligations, to protect rights
            and safety, and to establish, exercise, or defend legal claims.
          </p>
        </section>

        <section className="space-y-4 md:space-y-3 lg:space-y-3 xl:space-y-4">
          <h2 className="text-xl md:text-lg lg:text-lg xl:text-xl font-semibold">
            4. Legal Bases & Our Role
          </h2>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>India (DPDP Act 2023).</strong> We process personal data as
            a Data Fiduciary for purposes such as providing the Service,
            ensuring security, preventing fraud, and complying with legal
            requirements. Where consent is required (e.g., optional analytics or
            training programs), we obtain it and provide a means to withdraw it.
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>EEA/UK (GDPR/UK GDPR).</strong> Our legal bases include:
            performance of a contract (to provide the Service); legitimate
            interests (to secure, improve, and analyze the Service, prevent
            abuse, and support customers); consent (for optional activities like
            certain cookies/marketing/model‑improvement where required); and
            legal obligations. When acting as a processor for
            enterprise/developer customers, we process data on their
            instructions under a data processing agreement.
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>U.S. (including CCPA/CPRA).</strong> We may process
            "personal information" as defined by state privacy laws. We do not
            "sell" your personal information in the traditional sense; where we
            engage in activities that may be deemed "sharing" for cross‑context
            behavioral advertising, we will offer appropriate opt‑outs where
            applicable. We honor rights requests as described below.
          </p>
        </section>

        <section className="space-y-4 md:space-y-3 lg:space-y-3 xl:space-y-4">
          <h2 className="text-xl md:text-lg lg:text-lg xl:text-xl font-semibold">
            5. Sharing & Disclosures
          </h2>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>Service Providers & Partners.</strong> We share information
            with vendors who help operate CinfyAI (e.g., hosting, security,
            analytics, customer support). We also disclose Inputs to third‑party
            AI model providers as necessary to generate Outputs. These partners
            are contractually obligated to handle data securely and only for
            permitted purposes.
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>Single Sign‑On (SSO).</strong> If you sign in with Google,
            Google may process your information under its own privacy policies,
            and we receive your name and email as permitted. We do not access
            your Google content (like Gmail) unless a feature explicitly
            requests it and you grant explicit consent.
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>Legal, Safety & Compliance.</strong> We may disclose
            information if required by law, regulation, legal process, or
            governmental request; to enforce our Terms; to protect the rights,
            property, or safety of users, the public, or Compileinfy; or to
            detect, prevent, or address fraud, security, or technical issues.
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>Business Transfers.</strong> In connection with any merger,
            acquisition, asset sale, financing, or similar transaction,
            information may be transferred as part of the transaction, subject
            to this Policy and applicable law.
          </p>
        </section>

        <section className="space-y-4 md:space-y-3 lg:space-y-3 xl:space-y-4">
          <h2 className="text-xl md:text-lg lg:text-lg xl:text-xl font-semibold">
            6. International Data Transfers
          </h2>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            We operate globally, and your information may be transferred to,
            processed in, or stored in countries other than your own, including
            India, the United States, and regions where our providers are
            located. Where required, we implement safeguards for cross‑border
            transfers—such as contractual clauses, risk assessments, and
            technical and organizational measures—to protect your information
            consistent with this Policy and applicable law. By using the
            Service, you understand that your information may be processed in
            jurisdictions with different data protection laws than your home
            country.
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            We take steps to ensure that third‑party AI model providers and
            other vendors maintain appropriate data protection standards. If you
            would like more information about transfer mechanisms relevant to
            your region, contact us at{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {supportEmail}
            </a>
            .
          </p>
        </section>

        <section className="space-y-4 md:space-y-3 lg:space-y-3 xl:space-y-4">
          <h2 className="text-xl md:text-lg lg:text-lg xl:text-xl font-semibold">
            7. Data Retention & Security
          </h2>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            We retain Personal Data only as long as needed to provide the
            Service, comply with legal obligations, resolve disputes, enforce
            agreements, and support safety and audit functions. Retention
            periods vary depending on the type of data and our purposes. We may
            anonymize or aggregate information for analytics and product
            improvement. If you request deletion, we will handle your request in
            accordance with applicable law and our data retention practices,
            subject to legal obligations and legitimate interests (e.g., fraud
            prevention).
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            We employ administrative, technical, and physical safeguards
            designed to protect information against unauthorized access,
            destruction, loss, alteration, or misuse. These may include
            encryption in transit, access controls, audit logging, and secure
            development practices. However, no system can be completely secure,
            and we cannot guarantee absolute security. You are responsible for
            maintaining the confidentiality of your credentials and for promptly
            notifying us of any suspected compromise.
          </p>
        </section>

        <section className="space-y-4 md:space-y-3 lg:space-y-3 xl:space-y-4">
          <h2 className="text-xl md:text-lg lg:text-lg xl:text-xl font-semibold">
            8. Your Rights & Choices
          </h2>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>Access, Correction, Deletion.</strong> Subject to applicable
            law, you may have the right to access, correct, or delete your
            Personal Data. You can review and update basic account information
            within the app; for other requests, contact{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {supportEmail}
            </a>
            .
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>Opt‑Outs & Preferences.</strong> You may opt out of
            non‑essential communications and, where offered, cookie categories
            or model‑improvement programs. If we engage in activities deemed
            "sharing" under U.S. state laws, we will provide appropriate opt‑out
            mechanisms. You can also request to limit certain processing where
            required by law.
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>GDPR/UK GDPR rights (EEA/UK users).</strong> You may have
            rights to data portability, restriction of processing, object to
            processing (including for legitimate interests or direct marketing),
            and lodge a complaint with a supervisory authority. Where we rely on
            consent, you may withdraw consent at any time without affecting the
            lawfulness of processing before withdrawal.
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>India (DPDP) & U.S. Rights.</strong> We will honor
            applicable rights requests such as access, correction, and erasure
            under the DPDP Act and relevant U.S. state privacy laws (e.g.,
            CCPA/CPRA). We will not discriminate against you for exercising your
            privacy rights. We may ask you to verify your identity before
            completing a request.
          </p>
        </section>

        <section className="space-y-4 md:space-y-3 lg:space-y-3 xl:space-y-4">
          <h2 className="text-xl md:text-lg lg:text-lg xl:text-xl font-semibold">
            9. Children, Sensitive Data, Changes & Contact
          </h2>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>Children.</strong> CinfyAI is intended for users aged 18 and
            older. We do not knowingly collect Personal Data from individuals
            under 18. If you believe a minor has provided information to us,
            please contact us so we can take appropriate action.
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>Sensitive Data & Safety.</strong> Please avoid including
            sensitive Personal Data in Inputs (e.g., health, financial account
            numbers, government IDs) unless strictly necessary for your use
            case. AI Outputs may be inaccurate or inappropriate; always verify
            Outputs before relying on them. The Service does not provide
            professional advice.
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>Changes to This Policy.</strong> We may update this Policy
            from time to time. If we make material changes, we will notify you
            by updating the effective date and, where appropriate, providing
            additional notice (e.g., in‑app or email). Your continued use of the
            Service after an update indicates your acceptance of the revised
            Policy.
          </p>
          <p className="text-base md:text-sm lg:text-sm xl:text-base leading-relaxed md:leading-normal lg:leading-normal xl:leading-relaxed">
            <strong>Contact Us.</strong> For questions, rights requests, or
            concerns, email{" "}
            <a
              href={`mailto:${supportEmail}`}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {supportEmail}
            </a>
            . We aim to respond promptly and in accordance with applicable law.
          </p>
        </section>

        <div className="text-center text-sm md:text-xs lg:text-xs xl:text-sm text-gray-600 mt-8 md:mt-6 lg:mt-6 xl:mt-8">
          © Compileinfy Technology Solutions Private Limited. All rights
          reserved.
        </div>
      </main>
    </div>
  );
}
