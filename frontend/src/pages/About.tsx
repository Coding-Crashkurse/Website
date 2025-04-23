export default function About() {
  return (
    <div className="mx-auto max-w-prose p-6 space-y-4">
      <h2 className="text-2xl font-bold">About Me</h2>

      <p>
        Hi, I’m <strong>Markus</strong> — a Python developer from Germany who
        enjoys turning modern AI concepts into weekend-friendly, project-based
        tutorials. Everything you see here is born from personal side-projects,
        so you get the essentials without the fluff.
      </p>

      <p>
        • All example code is open-sourced on&nbsp;
        <a
          href="https://github.com/Coding-Crashkurse"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1e8aff] underline"
        >
          GitHub
        </a>
        .
        <br />• Free walkthrough videos live on&nbsp;
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
        Like the content and want to support future crash-courses?&nbsp;
        <strong>Get&nbsp;$200 in DigitalOcean credits</strong>&nbsp;by signing
        up through the referral badge below—no extra cost for you, but it helps
        me keep new lessons coming 🚀
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
