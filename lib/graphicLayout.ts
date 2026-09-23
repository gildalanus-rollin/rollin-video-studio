export type Momento = "inicio" | "mitad" | "final";

// Todas las medidas de la grafica y los subtitulos estan expresadas como
// fraccion de la altura/ancho del video, tomadas del mockup aprobado (405x720).
// Se multiplican por el tamano real (del render o de la vista previa) para
// que se vean igual en cualquier resolucion o formato.
//
// El bloque antetitulo + badge + titulo fluye: cada elemento se apila debajo
// del anterior segun su alto real (una o dos lineas), en vez de tener una
// posicion fija cada uno. Solo el bloque entero tiene una posicion de arranque
// fija (blockTopFrac).
export const LAYOUT = {
  glowTopFrac: 310 / 720,

  blockTopFrac: 395 / 720,
  blockLeftFrac: 20 / 405,
  blockRightFrac: 22 / 405,

  antetituloFontFrac: 16 / 720,
  antetituloGapFrac: 12 / 720,

  badgeDotFrac: 9 / 720,
  badgeDotOffsetFrac: 2 / 720,
  badgeGapFrac: 8 / 405,
  categoriaFontFrac: 14 / 720,
  fechaFontFrac: 13 / 720,
  badgeToTituloGapFrac: 14 / 720,

  tituloFontTiersFrac: [36, 32, 28, 24, 20, 17].map((v) => v / 720),

  moscaLeftFrac: 32 / 405,
  moscaTopFrac: 75 / 720,
  moscaFontFrac: 15 / 720,
  subtituloLeftFrac: 32 / 405,
  subtituloRightFrac: 32 / 405,
  subtituloBottomFrac: 150 / 720,
  subtituloFontFrac: 20 / 720,
};

export const SUBTITLE_COLORS: Record<string, string> = {
  amarillo: "#FFE600",
  blanco: "#FFFFFF",
};

export function tituloFontSizeFrac(len: number) {
  const tiers = LAYOUT.tituloFontTiersFrac;
  if (len <= 20) return tiers[0];
  if (len <= 40) return tiers[1];
  if (len <= 60) return tiers[2];
  if (len <= 85) return tiers[3];
  if (len <= 120) return tiers[4];
  return tiers[5];
}
