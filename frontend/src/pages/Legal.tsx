export default function Legal() {
  return (
    <div className="mx-auto max-w-prose p-6 space-y-4">
      {/* bilingual heading */}
      <h2 className="text-2xl font-bold">
        Legal Notice&nbsp; /&nbsp; Impressum
      </h2>

      {/* basic provider details */}
      <p>
        Coding&nbsp;Crashkurse
        <br />
        Markus&nbsp;Lang
        <br />
        Freischützstraße&nbsp;72
        <br />
        81927&nbsp;Munich, Germany
      </p>

      {/* responsible person according to the German media treaty */}
      <p>
        Responsible for content&nbsp;(
        <span className="italic">Verantwortlich&nbsp;gemäß&nbsp;§18&nbsp;Abs.&nbsp;2&nbsp;MStV</span>
        ):
        <br />
        Markus&nbsp;Lang, address as above
      </p>

      {/* contact */}
      <p>
        E-mail:&nbsp;
        <a
          href="mailto:datamastery87@gmail.com"
          className="text-[#1e8aff] underline"
        >
          datamastery87@gmail.com
        </a>
      </p>

      {/* EU dispute-resolution (ODR) */}
      <p className="text-sm text-gray-400">
        The European Commission provides an online dispute resolution (ODR)
        platform:&nbsp;
        <a
          href="https://ec.europa.eu/consumers/odr/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1e8aff] underline"
        >
          https://ec.europa.eu/consumers/odr/
        </a>
        . We are neither willing nor obliged to take part in dispute settlement
        proceedings before a consumer arbitration board.
      </p>
    </div>
  );
}
