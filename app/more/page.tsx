import Link from "next/link";
import { ArrowLeft, Brush, Link as LinkIcon, ShieldCheck } from "lucide-react";

const items = [
  {
    icon: LinkIcon,
    title: "One clean link",
    text: "Put your socials, bio, tags, avatar, and media in one profile people can actually scan.",
  },
  {
    icon: Brush,
    title: "Personal styling",
    text: "Tune your profile colors, background, font, links, badges, and card style from the dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Safer defaults",
    text: "Dashboard access is protected, signup is server-side, and public profile content is normalized before rendering.",
  },
];

export default function MorePage() {
  return (
    <main className="mx-main">
      <nav className="mx-nav">
        <Link href="/" className="mx-back">
          <ArrowLeft size={16} />
          Back
        </Link>
        <Link href="/login">
          <button className="mx-action">Create page</button>
        </Link>
      </nav>

      <section className="mx-wrap">
        <p className="mx-kicker">softcard.cc</p>
        <h1>Everything important, in one profile.</h1>
        <p className="mx-sub">
          Softcard gives each user a clean public page with just enough customization to feel personal without getting messy.
        </p>

        <div className="mx-grid">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div className="mx-card" key={item.title}>
                <Icon size={20} />
                <h2>{item.title}</h2>
                <p>{item.text}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
