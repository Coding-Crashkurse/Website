import { Link, NavLink } from "react-router-dom";

export default function Header() {
  const nav = [
    { to: "/", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/blog", label: "Blog", disabled: true }, // example of a future link
    { to: "/admin", label: "Admin" },
  ];

  return (
    <header className="sticky top-0 z-20 bg-black bg-opacity-80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-brand"
        >
          <img src="/logo.png" alt="Logo" className="h-10 w-10" />
          Coding&nbsp;Crash&nbsp;Courses
        </Link>

        {/* Navigation */}
        <nav className="hidden gap-6 md:flex">
          {nav.map(({ to, label, disabled }) =>
            disabled ? (
              <span key={label} className="cursor-not-allowed opacity-40">
                {label}
              </span>
            ) : (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${
                    isActive ? "text-white" : "text-gray-300 hover:text-white"
                  }`
                }
              >
                {label}
              </NavLink>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
