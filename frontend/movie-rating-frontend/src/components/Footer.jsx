import { Link } from "react-router-dom";

function FooterLinkGroup({ heading, links }) {
  return (
    <div>
      <h3 className="text-xs font-extrabold uppercase tracking-widest text-white/40 mb-4">
        {heading}
      </h3>
      <ul className="flex flex-col gap-2.5">
        {links.map(({ label, to, external }) =>
          external ? (
            <li key={label}>
              <a
                href={to}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/55 hover:text-white transition-colors"
              >
                {label}
              </a>
            </li>
          ) : (
            <li key={label}>
              <Link
                to={to}
                className="text-sm text-white/55 hover:text-white transition-colors"
              >
                {label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

const BROWSE_LINKS = [
  { label: "Movies", to: "/search?type=movie" },
  { label: "TV Shows", to: "/search?type=show" },
  { label: "Top Rated", to: "/search?category=rating" },
];

const ACCOUNT_LINKS = [
  { label: "Watchlist", to: "/watchlist" },
  { label: "My Reviews", to: "/my-reviews" },
];

const CURRENT_YEAR = new Date().getFullYear();

function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/5 mt-auto">
      <div className="max-w-screen-2xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link
              to="/"
              className="inline-flex items-center gap-2 mb-3 no-underline"
            >
              <span className="text-xl font-extrabold tracking-tight">
                <span className="text-white">Cine</span>
                <span className="text-blue-500">Match</span>
              </span>
            </Link>
            <p className="text-sm text-white/40 leading-relaxed max-w-[18rem]">
              Discover, rate, and track the movies and shows you love.
            </p>
          </div>

          <FooterLinkGroup heading="Browse" links={BROWSE_LINKS} />
          <FooterLinkGroup heading="Account" links={ACCOUNT_LINKS} />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-white/5">
          <p className="text-xs text-white/25">
            © {CURRENT_YEAR} CineMatch. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
