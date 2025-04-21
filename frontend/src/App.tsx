import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { fetchCourses, Course } from "./services/api";
import CourseCard from "./components/CourseCard";
import About from "./pages/About";
import Legal from "./pages/Legal";
import AdminPanel from "./pages/Admin";
import ChatWidget from "./components/ChatWidget";

export default function App() {
  const [courses, setCourses] = useState<Course[]>([]);
  useEffect(() => void fetchCourses().then(setCourses), []);

  return (
    <BrowserRouter>
      {/* NAVBAR */}
      <header className="bg-[#1e8aff] py-3 shadow-md">
        <div className="container mx-auto flex items-center gap-6 px-4">
          {/* Logo + Brand */}
          <Link to="/" className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <img src="/logo.png" alt="" className="h-6" />
            </span>
            <span className="font-semibold text-lg text-white">
              Coding Crash Courses
            </span>
          </Link>

          {/* öffentliche Links (OHNE /admin) */}
          <nav className="ml-auto flex gap-6 text-sm text-white">
            <Link to="/" className="hover:text-gray-200">
              Home
            </Link>
            <Link to="/about" className="hover:text-gray-200">
              About
            </Link>
            <Link to="/legal" className="hover:text-gray-200">
              Legal
            </Link>
            <a
              href="https://studio.youtube.com/channel/UCuGxbFmuThl3vWO-tozt43A"
              target="_blank"
              className="hover:text-gray-200"
            >
              YouTube
            </a>
          </nav>
        </div>
      </header>

      {/* MAIN */}
      <main className="container mx-auto px-4 py-10">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <section className="text-center mb-12 max-w-3xl mx-auto">
                  <h2 className="text-4xl md:text-5xl font-bold mb-3 text-white">
                    Hands‑On Python & AI Courses for Everyone
                  </h2>
                  <p className="text-lg text-gray-300">
                    Project‑driven lessons that focus on real tools across the
                    Python ecosystem — no fluff, no buzzwords.
                  </p>
                </section>

                <section className="grid md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {courses.map((c) => (
                    <CourseCard key={c.id} course={c} />
                  ))}
                </section>

                <footer className="mt-16 text-center text-xs text-gray-400">
                  © {new Date().getFullYear()} Coding Crash Courses
                </footer>
              </>
            }
          />

          <Route path="/about" element={<About />} />
          <Route path="/legal" element={<Legal />} />
          {/* Route bleibt vorhanden, nur nicht verlinkt */}
          <Route path="/admin" element={<AdminPanel />} />

          <Route path="*" element={<p className="p-6">Page not found.</p>} />
        </Routes>
      </main>

      <ChatWidget />
    </BrowserRouter>
  );
}
