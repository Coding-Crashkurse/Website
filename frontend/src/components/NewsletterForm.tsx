export default function NewsletterForm() {
  return (
    <form
      action="/api/subscribe"
      method="post"
      className="flex w-full flex-col gap-3 sm:flex-row"
    >
      <input
        name="email"
        type="email"
        required
        placeholder="Your email address"
        className="flex-1 rounded border px-4 py-2"
      />
      <button
        type="submit"
        className="rounded bg-brand px-6 py-2 font-semibold text-white hover:bg-brand-dark"
      >
        Notify Me
      </button>
    </form>
  );
}
