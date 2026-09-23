"use client";

import { useEffect, useState } from "react";
import { buildSubtitleBlocks } from "@/lib/subtitles";
import { LAYOUT, SUBTITLE_COLORS, tituloFontSizeFrac } from "@/lib/graphicLayout";
import type { Momento } from "@/lib/graphicLayout";

type Placa = {
  titulo: string;
  antetitulo?: string | null;
  momento: Momento;
};

type Props = {
  projectId: string;
  title: string;
  imageUrl: string;
  outputFormat: string;
  narrativePreset: string;
  avatarEnabled?: boolean | null;
  subtitleEnabled?: boolean | null;
  subtitleColor?: string | null;
  subtitleText?: string | null;
  category?: string | null;
  date?: string | null;
};

function getAspectClass(outputFormat: string) {
  switch (outputFormat) {
    case "9:16":
      return "aspect-[9/16] max-w-[280px]";
    case "1:1":
      return "aspect-square max-w-[420px]";
    case "16:9":
    default:
      return "aspect-video max-w-[560px]";
  }
}

// Dimensiones de referencia de cada formato de preview (coinciden con los
// max-width de arriba). Se usan solo para calcular las medidas de LAYOUT en
// pixeles concretos, no afectan el tamano real del video exportado.
function getPreviewDimensions(outputFormat: string) {
  switch (outputFormat) {
    case "9:16":
      return { width: 280, height: (280 * 16) / 9 };
    case "1:1":
      return { width: 420, height: 420 };
    case "16:9":
    default:
      return { width: 560, height: (560 * 9) / 16 };
  }
}

export default function GraphicPreview({
  projectId,
  title,
  imageUrl,
  outputFormat,
  narrativePreset,
  avatarEnabled,
  subtitleEnabled,
  subtitleColor,
  subtitleText,
  category,
  date,
}: Props) {
  const [placas, setPlacas] = useState<Placa[]>([]);
  const [placasLoaded, setPlacasLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${projectId}/placas`)
      .then((r) => r.json())
      .then((json) => setPlacas(json.placas ?? []))
      .catch(() => setPlacas([]))
      .finally(() => setPlacasLoaded(true));
  }, [projectId]);

  const showAvatar =
    narrativePreset === "titulo-resumen-foto-avatar" && Boolean(avatarEnabled);

  const inicioPlaca = placas.find((p) => p.momento === "inicio") ?? null;

  const subtitleBlocks = buildSubtitleBlocks(subtitleText);
  const previewSubtitle = subtitleBlocks[0] || "";
  const subtitleHexColor =
    SUBTITLE_COLORS[subtitleColor || "blanco"] ?? SUBTITLE_COLORS.blanco;

  const { width, height } = getPreviewDimensions(outputFormat);

  const tituloText = inicioPlaca?.titulo || title || "Titulo del proyecto";
  const tituloFontSize = height * tituloFontSizeFrac(tituloText.length);

  const showSinGrafica = placasLoaded && Boolean(subtitleEnabled) && !inicioPlaca;

  return (
    <div className="space-y-4">
      <div
        className={`relative overflow-hidden rounded-[28px] border border-slate-200 bg-slate-950 ${getAspectClass(
          outputFormat
        )}`}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Preview grafica"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-slate-900" />
        )}

        {placasLoaded && inicioPlaca ? (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              top: height * LAYOUT.glowTopFrac,
              background:
                "radial-gradient(130% 85% at 50% 135%, #F114CD 0%, #870AAD 38%, rgba(63,12,52,.55) 58%, rgba(0,0,0,0) 78%)",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: "38%",
              background:
                "linear-gradient(to top, rgba(0,0,0,.55) 0%, rgba(0,0,0,0) 100%)",
            }}
          />
        )}

        {showAvatar ? (
          <div className="absolute right-4 top-4 z-20 h-24 w-20 rounded-2xl border border-white/20 bg-slate-800/90 shadow-lg md:h-28 md:w-24">
            <div className="flex h-full items-center justify-center px-2 text-center text-[10px] uppercase tracking-wide text-white/80">
              avatar
            </div>
          </div>
        ) : null}

        {placasLoaded && inicioPlaca ? (
          <div
            style={{
              position: "absolute",
              top: height * LAYOUT.blockTopFrac,
              left: width * LAYOUT.blockLeftFrac,
              right: width * LAYOUT.blockRightFrac,
              display: "flex",
              flexDirection: "column",
            }}
          >
                        <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: width * LAYOUT.badgeGapFrac,
                marginBottom: height * LAYOUT.badgeToTituloGapFrac,
              }}
            >
              <span
                style={{
                  width: height * LAYOUT.badgeDotFrac,
                  height: height * LAYOUT.badgeDotFrac,
                  borderRadius: "50%",
                  background: "#FF221B",
                  flexShrink: 0,
                  position: "relative",
                  top: -(height * LAYOUT.badgeDotOffsetFrac),
                }}
              />
              <span
                style={{
                  color: "#fff",
                  fontWeight: 600,
                  fontSize: height * LAYOUT.categoriaFontFrac,
                  letterSpacing: 0.8,
                  textTransform: "uppercase",
                }}
              >
                {category || "General"}
              </span>
              <span style={{ flex: 1 }} />
              <span
                style={{
                  color: "rgba(255,255,255,0.65)",
                  fontWeight: 500,
                  fontSize: height * LAYOUT.fechaFontFrac,
                  letterSpacing: 0.5,
                }}
              >
                {date || ""}
              </span>
            </div>

            <h3
              style={{
                margin: 0,
                color: "#fff",
                fontWeight: 700,
                fontSize: tituloFontSize,
                lineHeight: 1.08,
                textTransform: "uppercase",
                textAlign: "left",
                whiteSpace: "pre-line",
              }}
            >
              {tituloText}
            </h3>
          </div>
        ) : null}

        {showSinGrafica ? (
          <div
            style={{
              position: "absolute",
              left: width * LAYOUT.moscaLeftFrac,
              top: height * LAYOUT.moscaTopFrac,
              writingMode: "vertical-rl",
              transform: "rotate(180deg)",
              color: "#fff",
              fontWeight: 800,
              fontSize: height * LAYOUT.moscaFontFrac,
              letterSpacing: 1,
            }}
          >
            Rollin News
          </div>
        ) : null}

        {showSinGrafica && previewSubtitle ? (
          <div
            style={{
              position: "absolute",
              left: width * LAYOUT.subtituloLeftFrac,
              right: width * LAYOUT.subtituloRightFrac,
              bottom: height * LAYOUT.subtituloBottomFrac,
              textAlign: "center",
            }}
          >
            <span
              style={{
                color: subtitleHexColor,
                fontWeight: 800,
                fontSize: height * LAYOUT.subtituloFontFrac,
                lineHeight: 1.3,
                textTransform: "uppercase",
                textShadow: "0 2px 10px rgba(0,0,0,0.65)",
              }}
            >
              {previewSubtitle}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
