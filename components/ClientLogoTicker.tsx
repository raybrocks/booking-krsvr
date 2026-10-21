import React from "react";
import Image from "next/image";

export interface LogoClientItem {
  id: string;
  companyName: string;
  logoImage?: string | null;
  websiteUrl?: string | null;
}

interface ClientLogoTickerProps {
  clients: LogoClientItem[];
  title?: string;
}

export default function ClientLogoTicker({
  clients,
  title = "Sørlandsbedrifter som har hatt teambuilding på Krs VR Arena"
}: ClientLogoTickerProps) {
  // Only display clients that actually have a logo image
  const validClients = clients.filter((c) => !!c.logoImage);

  if (validClients.length === 0) {
    return null;
  }

  // If fewer than 5 unique clients with logos, render them statically centered without duplication.
  // When 5 or more clients exist, enable the smooth infinite marquee ticker.
  const isTickerMode = validClients.length >= 5;

  const renderLogoItem = (client: LogoClientItem, key: string) => {
    const logoContent = (
      <div 
        className="group relative h-9 sm:h-11 md:h-12 w-auto max-w-[150px] sm:max-w-[180px] md:max-w-[220px] flex items-center justify-center transition-all duration-300"
        title={`${client.companyName} – Teambuilding hos KRS VR Arena`}
      >
        <Image
          src={client.logoImage!}
          alt={`${client.companyName} – Bedriftskunde hos KRS VR Arena i Kristiansand`}
          width={180}
          height={60}
          className="max-h-8 sm:max-h-10 md:max-h-11 w-auto object-contain opacity-75 hover:opacity-100 transition-all duration-300 group-hover:scale-105"
          style={{ filter: "brightness(0) invert(1)" }}
          unoptimized
        />
      </div>
    );

    if (client.websiteUrl) {
      return (
        <a
          key={key}
          href={client.websiteUrl}
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="inline-flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-[#9C39FF]/50 rounded-lg p-1.5"
        >
          {logoContent}
        </a>
      );
    }

    return (
      <div key={key} className="inline-flex items-center justify-center p-1.5">
        {logoContent}
      </div>
    );
  };

  return (
    <section 
      className="my-10 md:my-14 w-full overflow-hidden" 
      aria-label="Bedrifter som har hatt teambuilding hos KRS VR Arena"
    >
      {/* Subtle Title / Eyebrow */}
      <div className="text-center px-4 mb-5 md:mb-6">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.18em] text-zinc-400 max-w-xl mx-auto leading-relaxed">
          {title}
        </p>
      </div>

      {isTickerMode ? (
        <>
          <style>{`
            @keyframes krsLogoTicker {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(-50%, 0, 0); }
            }
            .krs-logo-ticker-track {
              display: flex;
              width: max-content;
              will-change: transform;
              animation: krsLogoTicker 32s linear infinite;
            }
            .krs-logo-ticker-track:hover {
              animation-play-state: paused;
            }
            @media (prefers-reduced-motion: reduce) {
              .krs-logo-ticker-track {
                animation: none;
                flex-wrap: wrap;
                justify-content: center;
              }
            }
          `}</style>

          {/* Marquee Track with Soft Gradient Fade on Edges */}
          <div className="relative w-full overflow-hidden py-3">
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 md:w-36 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 md:w-36 bg-gradient-to-l from-black via-black/80 to-transparent z-10" />

            <div className="krs-logo-ticker-track items-center gap-8 sm:gap-14 md:gap-20">
              {[...validClients, ...validClients].map((client, idx) => 
                renderLogoItem(client, `ticker-${client.id}-${idx}`)
              )}
            </div>
          </div>
        </>
      ) : (
        /* Static Centered Row when fewer than 5 clients (no duplication) */
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 py-3 px-4 max-w-4xl mx-auto">
          {validClients.map((client) => 
            renderLogoItem(client, `static-${client.id}`)
          )}
        </div>
      )}
    </section>
  );
}
