import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchCourses, Course } from "./services/api";
import CourseCard from "./components/CourseCard";
import About from "./pages/About";
import Legal from "./pages/Legal";
import Privacy from "./pages/Privacy";
import AdminPanel from "./pages/Admin";
import ChatWidget from "./components/ChatWidget";

export default function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => void fetchCourses().then(setCourses), []);

  return (
    <BrowserRouter>
      {/* Wrapper sorgt dafür, dass Seite volle Höhe hat
          und Footer immer unten bleibt */}
      <div className="flex min-h-screen flex-col bg-[#0e1726] text-white">
        {/* NAVBAR */}
        <header className="bg-[#1e8aff] py-3 shadow-md">
          <div className="container mx-auto flex items-center gap-6 px-4">
            <Link to="/" className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white">
                <img src="/logo.png" alt="Logo" className="h-6" />
              </span>
              <span className="font-semibold text-lg text-white">
                Coding Crash Courses
              </span>
            </Link>

            <nav className="ml-auto flex gap-6 text-sm text-white">
              <Link to="/" className="hover:text-gray-200">
                Home
              </Link>
              <Link to="/about" className="hover:text-gray-200">
                About
              </Link>
              <a
                href="https://studio.youtube.com/channel/UCuGxbFmuThl3vWO-tozt43A"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-200"
              >
                YouTube
              </a>
            </nav>
          </div>
        </header>

        {/* MAIN – flex-grow füllt den restlichen Platz */}
        <main className="container mx-auto flex-grow px-4 py-10">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <section className="text-center mb-12 max-w-3xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold mb-3">
                      Hands-On Python &amp; AI Courses for Everyone
                    </h2>
                    <p className="text-lg text-gray-300">
                      Project-driven lessons that focus on real tools across the
                      Python ecosystem — no fluff, no buzzwords.
                    </p>
                  </section>

                  <section className="grid md:grid-cols-3 xl:grid-cols-4 gap-6">
                    {courses.map((c) => (
                      <CourseCard key={c.id} course={c} />
                    ))}
                  </section>
                </>
              }
            />

            <Route path="/about" element={<About />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="*" element={<p className="p-6">Page not found.</p>} />
          </Routes>
        </main>

        {/* FOOTER */}
        <footer className="text-center text-xs text-gray-400 py-4">
          © {new Date().getFullYear()} Coding Crash Courses&nbsp;•&nbsp;
          <Link to="/legal" className="hover:underline">
            Impressum
          </Link>
          &nbsp;|&nbsp;
          <Link to="/privacy" className="hover:underline">
            Datenschutz
          </Link>
        </footer>
      </div>

      {/* optionaler Chat-Button */}
      <ChatWidget />
    </BrowserRouter>
  );
}
