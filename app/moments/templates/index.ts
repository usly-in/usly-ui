import type { ComponentType } from "react";
import type { TemplateProps, TemplateEntry } from "./types";
import { EnergyRush } from "./EnergyRush";
import { RooftopGlow } from "./RooftopGlow";
import { Cinematic } from "./Cinematic";
import { NightMode } from "./NightMode";
import { Vinyl } from "./Vinyl";
import { BirthdayBash } from "./BirthdayBash";
import CakeParallax from "./CakeParallax";
import { TicketMarquee } from "./TicketMarquee";
import { VHSCamcorder } from "./VHSCamcorder";
import { PolaroidCorkboard } from "./PolaroidCorkboard";

export type { TemplateProps, TemplateEntry };

/** Lookup map: templateId → React component */
export const TEMPLATE_MAP: Record<string, ComponentType<TemplateProps>> = {
  "fun-energy": EnergyRush,
  "chill-food": RooftopGlow,
  "sunset-talk": Cinematic,
  "latenight-walk": NightMode,
  "music-sharing": Vinyl,
  "birthday-bash": BirthdayBash,
  "cake-parallax": CakeParallax,
  "ticket-marquee": TicketMarquee,
  "vhs-camcorder": VHSCamcorder,
  "polaroid-corkboard": PolaroidCorkboard,
};

/** Ordered list used by pickers and renderers */
export const TEMPLATE_LIST: TemplateEntry[] = [
  {
    id: "fun-energy",
    name: "Energy Rush",
    tag: "Fun & High-Energy",
    emoji: "🎳",
    placeholders: {
      title: "Bowling night chaos",
      caption: "Bowling / arcade / laser tag / go-karting",
      story:
        "We went all in — competing, laughing, probably embarrassing ourselves. The kind of evening where you forget to check your phone.",
    },
  },
  {
    id: "chill-food",
    name: "Rooftop Glow",
    tag: "Chill Hangout + Food",
    emoji: "🌆",
    placeholders: {
      title: "Rooftop evening",
      caption: "Rooftop chill + music + food",
      story:
        "Nothing planned, nothing rushed. Just a rooftop, some good music, and food that tasted better because of the company.",
    },
  },
  {
    id: "sunset-talk",
    name: "Cinematic",
    tag: "Sunset + Honest Talk",
    emoji: "🌅",
    placeholders: {
      title: "Watching the sky change",
      caption: "A quiet rooftop, just us and the horizon",
      story:
        "Found a quiet rooftop and sat down to watch the sky. The kind of conversation that wanders into future dreams — no destination, no rush.",
    },
  },
  {
    id: "latenight-walk",
    name: "Night Mode",
    tag: "Late-Night Walk",
    emoji: "🌙",
    placeholders: {
      title: "Midnight wandering",
      caption: "Ice cream, chai, and street food after dark",
      story:
        "Walked around with no real plan. Ended up with ice cream, chai, and street food along the way. These unscripted ones always feel the most real.",
    },
  },
  {
    id: "music-sharing",
    name: "Vinyl",
    tag: "Music + Sharing",
    emoji: "🎵",
    placeholders: {
      title: "Songs that remind me of you",
      caption: "Exchanging playlists, sitting, feeling the songs",
      story:
        "We sat together and swapped songs — the ones that remind us of each other. Sometimes music says what words can't.",
    },
  },
  {
    id: "birthday-bash",
    name: "Birthday Bash",
    tag: "Birthday Party",
    emoji: "🎂",
    placeholders: {
      title: "Birthday Bash",
      caption: "Cake, friends, and confetti",
      story: "A night of celebration — cake, candles, and the people who make life brighter.",
    },
  },
  {
    id: "cake-parallax",
    name: "Cake Parallax",
    tag: "Birthday",
    emoji: "🎂",
    placeholders: {
      title: "Cake Time",
      caption: "Layered cake with parallax",
      story: "Happy Birthday!",
    },
  },
  {
    id: "ticket-marquee",
    name: "Ticket & Marquee",
    tag: "Sunset + Honest Talk",
    emoji: "🎟️",
    placeholders: {
      title: "Watching the sky change",
      caption: "A quiet rooftop, just us and the horizon",
      story:
        "Found a quiet rooftop and sat down to watch the sky. The kind of conversation that wanders into future dreams — no destination, no rush.",
    },
  },
  {
    id: "vhs-camcorder",
    name: "VHS Camcorder",
    tag: "Sunset + Honest Talk",
    emoji: "📼",
    placeholders: {
      title: "Watching the sky change",
      caption: "A quiet rooftop, just us and the horizon",
      story:
        "Found a quiet rooftop and sat down to watch the sky. The kind of conversation that wanders into future dreams — no destination, no rush.",
    },
  },
  {
    id: "polaroid-corkboard",
    name: "Polaroid & Corkboard",
    tag: "Sunset + Honest Talk",
    emoji: "📌",
    placeholders: {
      title: "Watching the sky change",
      caption: "A quiet rooftop, just us and the horizon",
      story:
        "Found a quiet rooftop and sat down to watch the sky. The kind of conversation that wanders into future dreams — no destination, no rush.",
    },
  },
];
