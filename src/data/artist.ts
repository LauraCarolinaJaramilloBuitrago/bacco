// Toda la información viene del presskit oficial y los enlaces del artista.

export const LINKS = {
  instagram: "https://www.instagram.com/bacco.999/",
  tiktok: "https://www.tiktok.com/@bacco.999",
  youtube: "https://www.youtube.com/@bacco.999",
  soundcloud: "https://soundcloud.com/baco9991",
  facebook: "https://www.facebook.com/search/top?q=BACCO%20OFIC",
  whatsapp:
    "https://wa.me/573027341912?text=" +
    encodeURIComponent("Hola BACCO, quiero hablar de un booking para mi evento."),
  presskit: "/presskit-bacco.pdf",
} as const;

export type Accent = "leaf" | "river" | "firefly" | "heliconia";

export const ACCENT_HEX: Record<Accent, string> = {
  leaf: "#3fbf5a",
  river: "#19d3c5",
  firefly: "#f5b841",
  heliconia: "#ff4f6d",
};

export type GenreInfo = {
  name: string;
  /** Rango típico de BPM */
  bpm: string;
  accent: Accent;
  /** Cómo suena */
  sound: string;
  tags: string[];
};

// Orden del slider: Techno primero, Raw Techno al final.
export const GENRE_INFO: GenreInfo[] = [
  {
    name: "Techno",
    bpm: "125–140",
    accent: "heliconia",
    sound:
      "Pulso hipnótico y repetitivo: bombo firme, percusión seca y capas que crecen despacio hasta atrapar la pista. Oscuro, físico y hecho para perderse en el groove de madrugada.",
    tags: ["Hipnótico", "Oscuro", "Bombo firme"],
  },
  {
    name: "Indie Dance",
    bpm: "108–120",
    accent: "river",
    sound:
      "Más melódico y cálido: líneas de bajo con carácter, sintetizadores brillantes y aire de nu disco. Baile suave, emotivo y luminoso, con espacio para respirar.",
    tags: ["Melódico", "Nu disco", "Luminoso"],
  },
  {
    name: "Progressive House",
    bpm: "120–128",
    accent: "firefly",
    sound:
      "Construcciones largas y progresivas: melodías que se apilan, filtros que se abren y clímax que llegan despacio. Viaje emocional más que golpe directo.",
    tags: ["Épico", "Capas", "Emotivo"],
  },
  {
    name: "Hard Groove",
    bpm: "130–145",
    accent: "heliconia",
    sound:
      "Groove acelerado y contundente: percusión rodante, bajos pegajosos y energía de pico. Mezcla la fuerza del techno con el swing del groove.",
    tags: ["Intenso", "Rodante", "Energía"],
  },
  {
    name: "Groove",
    bpm: "120–126",
    accent: "leaf",
    sound:
      "El bajo manda: ritmo con swing, percusiones sincopadas y mucho rebote. Cuerpo suelto, pista en movimiento constante y cero rigidez.",
    tags: ["Swing", "Bajo", "Rebote"],
  },
  {
    name: "Raw Techno",
    bpm: "135–150",
    accent: "leaf",
    sound:
      "Techno crudo y sin adornos: bombos saturados, percusión industrial, texturas ásperas y mucha tensión. Rápido, directo y físico, hecho para la pista a máxima potencia.",
    tags: ["Crudo", "Industrial", "Bombo saturado"],
  },
];

export const GENRES = GENRE_INFO.map((g) => g.name);

export type Track = {
  id: string;
  title: string;
  kind: "youtube" | "soundcloud";
  label: string;
  src: string;
  cover: string;
  href: string;
  accent: Accent;
};

export const TRACKS: Track[] = [
  {
    id: "2484",
    title: "2484 · Bogotá DJ Room",
    kind: "youtube",
    label: "Set en video",
    src: "37gfqURwpwM",
    cover: "https://i.ytimg.com/vi/37gfqURwpwM/hqdefault.jpg",
    href: "https://youtu.be/37gfqURwpwM",
    accent: "leaf",
  },
  {
    id: "jaguar",
    title: "Jaguar Frequency",
    kind: "soundcloud",
    label: "SoundCloud",
    src: "https://soundcloud.com/baco9991/jauguar-frequency",
    cover: "/img/b16.webp",
    href: "https://soundcloud.com/baco9991/jauguar-frequency",
    accent: "firefly",
  },
  {
    id: "sugarcane",
    title: "Sugarcane Leaves",
    kind: "youtube",
    label: "Set en video",
    src: "MFhkIgeLmhE",
    cover: "https://i.ytimg.com/vi/MFhkIgeLmhE/hqdefault.jpg",
    href: "https://youtu.be/MFhkIgeLmhE",
    accent: "river",
  },
  {
    id: "frecuencia",
    title: "Frecuencia Vibrante",
    kind: "youtube",
    label: "Set en video",
    src: "vdZta3-nwa0",
    cover: "https://i.ytimg.com/vi/vdZta3-nwa0/hqdefault.jpg",
    href: "https://youtu.be/vdZta3-nwa0",
    accent: "heliconia",
  },
];

export type Stop = {
  city: string;
  region: string;
  collectives: string[];
  note: string;
  accent: Accent;
  home?: boolean;
};

// Recorrido: de la casa en el piedemonte amazónico hasta la capital
export const ROUTE: Stop[] = [
  {
    city: "Mocoa",
    region: "Putumayo",
    collectives: ["Guego Music", "The Crew", "New Dawne", "Techno Jungle", "DMT Raves"],
    note: "Casa. Donde la selva se volvió pista.",
    accent: "leaf",
    home: true,
  },
  {
    city: "Puerto Asís",
    region: "Putumayo",
    collectives: ["Putumayo Drums"],
    note: "Bajando el río, tambores de la región.",
    accent: "river",
  },
  {
    city: "Pitalito",
    region: "Huila",
    collectives: ["Mind"],
    note: "Primer salto fuera del Putumayo.",
    accent: "firefly",
  },
  {
    city: "Isnos",
    region: "Huila",
    collectives: ["Deepnoss"],
    note: "Groove profundo entre montañas.",
    accent: "heliconia",
  },
  {
    city: "Yaguará",
    region: "Neiva · Huila",
    collectives: ["Yaguara Underground"],
    note: "La escena underground del Huila.",
    accent: "river",
  },
  {
    city: "Bogotá",
    region: "Cundinamarca",
    collectives: ["2484 · Bogotá DJ Room"],
    note: "La capital escuchó la selva.",
    accent: "firefly",
  },
];

export type Photo = { id: number; src: string; sm: string; alt: string; tag: "cabina" | "selva"; tall?: boolean };

const p = (id: number, tag: Photo["tag"], alt: string, tall = false): Photo => ({
  id,
  src: `/img/b${id}.webp`,
  sm: `/img/b${id}-sm.webp`,
  alt,
  tag,
  tall,
});

export const PHOTOS: Photo[] = [
  p(15, "selva", "BACCO entre helechos y plantas de la selva", true),
  p(6, "cabina", "BACCO en cabina frente a pantallas LED con su nombre"),
  p(4, "cabina", "Cabina al aire libre de noche con el valle iluminado al fondo"),
  p(10, "selva", "Retrato de BACCO con gafas oscuras entre pastizales", true),
  p(7, "cabina", "Luces de escenario sobre BACCO tocando", true),
  p(3, "cabina", "BACCO mezclando en controladora bajo luces azules"),
  p(12, "selva", "BACCO sentado en una roca frente a las montañas", true),
  p(9, "cabina", "Escenario rojo con visuales de BACCO"),
  p(1, "cabina", "BACCO en la cabina con luz violeta", true),
  p(14, "selva", "BACCO entre la vegetación verde"),
  p(16, "cabina", "BACCO con audífonos y luz verde junto al portátil", true),
  p(11, "selva", "BACCO sentado sobre roca al atardecer", true),
  p(2, "cabina", "BACCO en cabina oscura con luz turquesa"),
  p(17, "selva", "BACCO de pie en un camino rural bajo cielo azul", true),
  p(8, "cabina", "Haz de luz atravesando el escenario rojo"),
  p(13, "selva", "BACCO en las rocas con la cordillera detrás", true),
  p(5, "cabina", "Escenario con techo rojo y pantallas LED"),
];
