import { m } from "motion/react";
import { SendIcon } from "@/components/ui/animated-state-icons";
import { ArrowIcon, FacebookIcon, InstagramIcon, SoundCloudIcon, TikTokIcon, YouTubeIcon } from "@/components/ui/jungle-icons";
import { Smoke } from "@/components/effects/smoke";
import { buttonVariants } from "@/components/ui/button-variants";
import { ACCENT_HEX, LINKS } from "@/data/artist";
import { Eyebrow, Reveal } from "./shared";

const SOCIAL = [
  { name: "Instagram", handle: "@bacco.999", href: LINKS.instagram, icon: InstagramIcon, c: ACCENT_HEX.heliconia },
  { name: "TikTok", handle: "@bacco.999", href: LINKS.tiktok, icon: TikTokIcon, c: ACCENT_HEX.river },
  { name: "YouTube", handle: "@bacco.999", href: LINKS.youtube, icon: YouTubeIcon, c: ACCENT_HEX.heliconia },
  { name: "SoundCloud", handle: "baco9991", href: LINKS.soundcloud, icon: SoundCloudIcon, c: ACCENT_HEX.firefly },
  { name: "Facebook", handle: "BACCO OFIC", href: LINKS.facebook, icon: FacebookIcon, c: ACCENT_HEX.river },
];

export function Booking() {
  return (
    <section id="booking" className="relative isolate overflow-hidden px-4 pb-10 pt-28 sm:px-6 sm:pt-36">
      <img
        src="/img/jungle-falls.webp"
        alt=""
        loading="lazy"
        className="absolute inset-0 -z-20 h-full w-full object-cover opacity-30 [mask-image:linear-gradient(to_bottom,transparent,#000_25%,#000_75%,transparent)]"
      />
      <div className="absolute inset-0 -z-10 bg-ink/40" />
      <Smoke className="-z-10" rate={0.4} intensity={0.25} />

      <div className="mx-auto max-w-6xl">
        <Reveal className="text-center">
          <Eyebrow accent="leaf" className="justify-center">
            Booking
          </Eyebrow>
          <h2 className="font-display mx-auto mt-6 max-w-4xl text-[clamp(2rem,7.5vw,6rem)] font-black uppercase leading-[0.92] tracking-[-0.04em] text-white">
            ¿Tu pista necesita <span className="text-glow">selva</span>?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed sm:mt-6 sm:text-lg text-white">
            Fiestas, clubes, festivales y colectivos. Escríbele directo y cuadren fecha, set y rider.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <m.a
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              href={LINKS.whatsapp}
              target="_blank"
              rel="noreferrer"
              className={buttonVariants({ size: "lg", className: "h-14 px-6 text-base sm:h-16 sm:px-9 sm:text-lg" })}
            >
              <SendIcon size={26} trigger="hover" /> WhatsApp +57 302 734 1912
            </m.a>
          </div>
        </Reveal>

        <ul className="mt-20 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" aria-label="Redes sociales">
          {SOCIAL.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.06}>
              <li>
                <m.a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="glass group relative flex h-full flex-col gap-5 overflow-hidden rounded-[22px] p-4 sm:gap-6 sm:p-5"
                >
                  <span aria-hidden className="absolute -right-10 -top-10 size-28 rounded-full opacity-25 blur-2xl transition duration-500 group-hover:opacity-80" style={{ background: s.c }} />
                  <span className="relative flex items-center justify-between">
                    <s.icon size={20} color={s.c} />
                    <ArrowIcon dir="up-right" size={14} color="#fff" />
                  </span>
                  <span className="relative">
                    <span className="font-display block break-words text-[13px] font-extrabold uppercase text-white sm:text-[15px]">{s.name}</span>
                    <span className="mt-0.5 block text-sm font-medium text-white">{s.handle}</span>
                  </span>
                </m.a>
              </li>
            </Reveal>
          ))}
        </ul>

        <footer className="mt-24 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm font-medium text-white sm:flex-row">
          <span className="font-display text-xl font-black">BACCO</span>
          <span>Mocoa, Putumayo · Colombia</span>
          <span>© {new Date().getFullYear()} BACCO</span>
        </footer>
      </div>
    </section>
  );
}
