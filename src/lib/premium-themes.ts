/**
 * @fileOverview Engine de geração de temas premium determinísticos.
 * Gera paletas, gradientes e partículas baseados no nome e área do usuário.
 */

import { themes } from '@/styles/themes';
import { detectAreaFromRole } from './utils';

export function hashString(str: string | null | undefined) {
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function hslToHex(h: number, s: number, l: number) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generatePalette(seed: number) {
  const hue = seed % 360;
  return {
    primary: hslToHex(hue, 85, 55),
    secondary: hslToHex((hue + 45) % 360, 80, 60),
    accent: hslToHex((hue + 120) % 360, 75, 55),
    dark: hslToHex(hue, 40, 12),
  };
}

function generateMeshGradient(colors: { primary: string; secondary: string; accent: string; dark: string }) {
  return `
    radial-gradient(circle at 20% 30%, ${colors.primary}55, transparent 60%),
    radial-gradient(circle at 80% 40%, ${colors.secondary}55, transparent 60%),
    radial-gradient(circle at 50% 80%, ${colors.accent}55, transparent 60%),
    ${colors.dark}
  `;
}

const emojiSets = {
  tecnologia: ["💻", "⚡", "🚀", "🤖", "🧠", "📡", "🔧", "🖥️"],
  saude: ["❤️", "🏥", "🩺", "💊", "🧬", "🧪", "🩹", "🍏"],
  gastronomia: ["🍕", "🍳", "🔥", "🍔", "🌮", "🥘", "🍜", "🧑‍🍳"],
  vendas: ["💰", "📊", "📈", "🏆", "🤝", "💼", "📣", "💎"],
  administrativo: ["📋", "🗄️", "📈", "💻", "💼", "🖊️", "🗓️", "☕"],
  logistica: ["📦", "🚚", "🚢", "✈️", "🏗️", "🛒", "🏷️", "🗺️"],
  educacao: ["📚", "🎓", "✏️", "🎒", "🏫", "🧠", "🔍", "📖"],
  marketing: ["📢", "📣", "📈", "🎯", "💡", "🎨", "🚀", "📱"],
  design: ["🎨", "🖌️", "✨", "🌈", "🖍️", "🧵", "🖼️", "🧠"],
  engenharia: ["⚙️", "📐", "🏗️", "🔧", "🔨", "🔩", "🔬", "🛰️"],
  construcao: ["🏗️", "🔨", "👷", "🚧", "📐", "🏠", "🔩", "🧱"],
  beleza: ["💅", "💄", "💆‍♀️", "🧖‍♀️", "✂️", "🧴", "🪞", "✨"],
  seguranca: ["🛡️", "👮", "🚨", "🔐", "🔦", "🕵️", "🕶️", "📡"],
  limpeza: ["🧹", "🧽", "🧼", "🫧", "🧺", "🧤", "✨", "🚿"],
  agro: ["🌱", "🚜", "🐄", "🌾", "🍎", "🌿", "🐝", "🌽"],
  juridico: ["⚖️", "📜", "💼", "🏛️", "🖋️", "🔍", "📖", "🔨"],
  turismo: ["✈️", "🏖️", "🎒", "🏨", "🗺️", "🛳️", "📸", "🌍"],
  industria: ["🏭", "⚙️", "🔧", "📦", "🚛", "⚡", "🧤", "🛠️"],
  financas: ["💰", "🪙", "🏦", "💳", "📉", "📈", "💵", "💎"],
  rh: ["🤝", "👥", "🗣️", "🏆", "🌟", "📊", "📋", "💡"],
  ciencia: ["🧬", "🔬", "🔭", "🧪", "🪐", "🔋", "🧠", "📊"],
  artes: ["🎭", "🎨", "🎬", "🎤", "🎻", "🩰", "🎟️", "✨"],
  imobiliario: ["🏠", "🏢", "🔑", "🏗️", "🛋️", "🏡", "🏙️", "🛋️"],
  esportes: ["⚽", "🏀", "🏆", "🎾", "🏋️", "🥇", "🥊", "🏄"],
  meio_ambiente: ["🍃", "🌳", "♻️", "☀️", "💧", "🌎", "🐼", "🚲"],
  social: ["🌍", "🤲", "🆘", "🧡", "🕊️", "🏡", "✊", "🫂"],
  moda: ["👗", "👠", "👜", "🧵", "🧵", "🕶️", "💍", "📸"],
  midia: ["🎙️", "📻", "📰", "🎥", "🎬", "📱", "📡", "📝"],
  seguros: ["☂️", "🏠", "🚗", "🏥", "📑", "🛡️", "🤝", "✅"],
  energia: ["⚡", "🔋", "☀️", "🏮", "🔥", "⚙️", "🏭", "🔌"],
  pets: ["🐾", "🐶", "🐱", "🐰", "🦜", "🦴", "🏥", "🧸"],
  automotivo: ["🚗", "🏎️", "🏎️", "🛠️", "🔧", "🚦", "🛣️", "⛽"],
  militar: ["🎖️", "🛡️", "🚁", "🚢", "🪖", "🚩", "🗺️", "📡"],
  servicos_publicos: ["🏛️", "🏢", "📋", "⚖️", "👮", "🚒", "🚑", "🌳"],
  religioso: ["🙏", "🕊️", "📖", "⛪", "☀️", "🕯️", "👐", "📿"]
};

function generateParticles(seed: number, area: string) {
  const normalizedArea = area.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const keys = Object.keys(emojiSets) as (keyof typeof emojiSets)[];
  const areaKey = keys.find(k => normalizedArea.includes(k)) || "tecnologia";
  const emojis = emojiSets[areaKey as keyof typeof emojiSets];
  
  const particles = [];
  for (let i = 0; i < 12; i++) {
    particles.push({
      emoji: emojis[(seed + i) % emojis.length],
      x: (seed * (i + 3)) % 100,
      y: (seed * (i + 7)) % 100,
      size: 20 + (seed * i) % 30,
      speed: 4 + (seed * i) % 6,
      delay: (seed * i) % 4,
    });
  }
  return particles;
}

export function generatePremiumTheme(name: string, area = "tecnologia") {
  const seed = hashString(name);
  const palette = generatePalette(seed);
  const particles = generateParticles(seed, area);
  return {
    palette,
    meshGradient: generateMeshGradient(palette),
    heroEmoji: particles[0].emoji,
    particles,
  };
}

export function generateSystemProfileTheme(name: string, headline: string, areas: string[]) {
  const seed = hashString((name || '') + (headline || ''));
  const mainArea = areas[0] || "Geral";
  const palette = generatePalette(seed);
  const particles = generateParticles(seed, mainArea);
  
  const areaEmojis: Record<string, string> = {};
  areas.forEach((a, i) => {
    const aSeed = hashString(a);
    const set = generateParticles(aSeed, a);
    areaEmojis[a] = set[0].emoji;
  });

  return {
    themeName: `Premium ${mainArea}`,
    primaryHex: palette.primary,
    secondaryHex: palette.secondary,
    darkHex: palette.dark,
    gradientStart: palette.primary,
    gradientEnd: palette.secondary,
    floatingEmojis: particles.slice(0, 8).map(p => p.emoji),
    heroEmoji: particles[0].emoji,
    tagline: `Portfólio Profissional de ${name}`,
    areaEmojis,
  };
}

export function generateSystemResumeTheme(name: string, profession: string) {
  const detected = detectAreaFromRole(profession);
  const themeBase = themes[detected.slug as keyof typeof themes] || themes.default;
  const seed = hashString((name || '') + (profession || ''));
  const palette = generatePalette(seed);

  const sidebarAreas = ['tecnologia', 'saude', 'logistica', 'administrativo', 'educacao', 'financas', 'juridico', 'ciencia'];
  const layoutStyle = sidebarAreas.includes(detected.slug) ? 'sidebar' : 'vibrant';

  const particles = generateParticles(seed, detected.slug);

  return {
    themeName: `Sistema ${detected.name}`,
    layoutStyle,
    primaryColor: themeBase.hex,
    secondaryColor: themeBase.hexSecondary,
    accentColor: palette.accent,
    sidebarColor: themeBase.hexDark,
    sidebarTextColor: '#ffffff',
    textOnPrimary: '#ffffff',
    headerEmoji: themeBase.emoji,
    decorationEmoji: particles[1].emoji,
    experienceEmoji: '🏢',
    educationEmoji: '🎓',
    courseEmoji: '📚',
    skillEmoji: '⭐',
    bulletEmoji: themeBase.emoji,
    summaryEmoji: '💬',
    professionalSummary: `PROFISSIONAL COM EXPERIÊNCIA EM ${(profession || '').toUpperCase()}, FOCADO EM RESULTADOS E EXCELÊNCIA TÉCNICA NA ÁREA DE ${detected.name.toUpperCase()}.`,
  };
}
