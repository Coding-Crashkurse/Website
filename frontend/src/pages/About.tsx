export default function About() {
  return (
    <div className="mx-auto max-w-prose p-6 space-y-4">
      <h2 className="text-2xl font-bold">About Me</h2>

      <p>
        Hi, I’m <strong>Markus</strong> — a Python developer from Germany who enjoys turning modern AI concepts into weekend-friendly, project-based tutorials. Everything you see here comes from my personal side-projects, so you get the practical essentials without any fluff.
      </p>

      <p>
        Outside of coding, I’m passionate about cycling and strength training. Whether it’s hitting the gym or going for a long bike ride, I believe balance between tech and fitness helps keep ideas fresh.
      </p>

      <p>
        • All example code is open-sourced on{" "}
        <a
          href="https://github.com/Coding-Crashkurse"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1e8aff] underline"
        >
          GitHub
        </a>
        .
        <br />• Free walkthrough videos are available on{" "}
        <a
          href="https://www.youtube.com/@codingcrashcourses8533"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1e8aff] underline"
        >
          YouTube
        </a>
        .
      </p>

      <p>
        Like the content and want to support future crash-courses?{" "}
        <strong>Get $200 in DigitalOcean credits</strong> by signing up through the referral badge below — no extra cost for you, and it helps me keep new lessons coming.
      </p>

      <p>
        💬 For questions, collaborations, or just to say hi:{" "}
        <a
          href="mailto:datamastery87@gmail.com"
          className="text-[#1e8aff] underline"
        >
          datamastery87@gmail.com
        </a>
      </p>

      {/* DigitalOcean referral badge */}
      <a
        href="https://www.digitalocean.com/?refcode=18a788f7e75a&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        <img
          src="https://web-platforms.sfo2.cdn.digitaloceanspaces.com/WWW/Badge%202.svg"
          alt="DigitalOcean Referral Badge"
          className="h-12 w-auto"
        />
      </a>
    </div>
  );
}
