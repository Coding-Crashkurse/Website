// pages/Privacy.tsx
export default function Privacy() {
  return (
    <div className="mx-auto max-w-prose p-6 space-y-6">
      <h2 className="text-2xl font-bold">Privacy Policy</h2>

      {/* 1. Controller */}
      <section>
        <h3 className="font-semibold">1 — Controller</h3>
        <p>
          Coding&nbsp;Crashkurse <br />
          Markus&nbsp;Lang <br />
          Freischützstraße&nbsp;72 <br />
          81927 Munich, Germany <br />
          E-mail:&nbsp;
          <a
            href="mailto:datamastery87@gmail.com"
            className="text-[#1e8aff] underline"
          >
            datamastery87@gmail.com
          </a>
        </p>
      </section>

      {/* 2. Data processing */}
      <section>
        <h3 className="font-semibold">
          2 — Do we process personal data?
        </h3>
        <p>
          <strong>We do not store any personal data.</strong>  
          When you open this website, your browser must briefly transmit your IP address
          to our hosting provider so that the page can be delivered.  
          This IP transmission is&nbsp;<em>purely technical</em>, is not
          logged or written to disk, and is discarded immediately after the page
          has been served.  
          <em>Legal basis:</em> Article&nbsp;6&nbsp;(1)(f) GDPR
          (legitimate interest in providing a secure website).
        </p>
      </section>

      {/* 3. Cookies / tracking */}
      <section>
        <h3 className="font-semibold">3 — Cookies / tracking</h3>
        <p>
          This website uses<strong> no cookies, analytics pixels
          or other tracking technologies.</strong>
        </p>
      </section>

      {/* 4. Processors */}
      <section>
        <h3 className="font-semibold">4 — Processors</h3>
        <p>
          • <strong>Hosting provider:</strong> DigitalOcean LLC, datacenter FRA1 (Frankfurt, Germany).<br />
          • <strong>AI model:</strong> Microsoft Azure OpenAI Service, region “Germany West Central” (Frankfurt).  
          Both providers only process the non-persistent, technically required connection data described above.
        </p>
      </section>

      {/* 5. Your rights */}
      <section>
        <h3 className="font-semibold">5 — Your rights</h3>
        <p className="text-sm">
          As we do not store personal data, the GDPR rights to access,
          rectification, erasure, restriction, portability and objection
          are in practice not applicable.  
          If you have questions about data protection, contact us at&nbsp;
          <a
            href="mailto:datamastery87@gmail.com"
            className="text-[#1e8aff] underline"
          >
            datamastery87@gmail.com
          </a>.
          You may also lodge a complaint with your supervisory authority.
        </p>
      </section>

      {/* 6. EU ODR */}
      <section>
        <h3 className="font-semibold text-sm">
          6 — EU Online Dispute Resolution
        </h3>
        <p className="text-xs text-gray-400">
          The European Commission’s platform for online dispute resolution is
          available at&nbsp;
          <a
            href="https://ec.europa.eu/consumers/odr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1e8aff] underline"
          >
            https://ec.europa.eu/consumers/odr/
          </a>.&nbsp;
          We are currently neither willing nor obliged to participate in
          dispute-resolution proceedings before a consumer arbitration board.
        </p>
      </section>
    </div>
  );
}
