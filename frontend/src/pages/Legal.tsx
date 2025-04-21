export default function Legal() {
  return (
    <div className="mx-auto max-w-prose p-6">
      <h2 className="mb-4 text-2xl font-bold">Legal Notice</h2>
      <p>
        Coding Crash Courses
        <br />
        Florian Muster
        <br />
        Musterstraße 1
        <br />
        12345 Berlin, Germany
      </p>
      <p className="mt-4">
        Email:{" "}
        <a
          className="text-brand underline"
          href="mailto:info@codingcrashcourses.de"
        >
          info@codingcrashcourses.de
        </a>
      </p>
    </div>
  );
}
