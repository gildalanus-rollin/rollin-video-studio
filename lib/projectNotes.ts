export type ProjectNotesData = {
  secondarySources: string[];
  summary: string;
  selectedImage: string;
  selectedVideo: string;
  selectedMusic: string;
  externalImageUrl: string;
  externalVideoUrl: string;
  narrationMode: string;
};

function extractSection(source: string, key: string) {
  const match = source.match(
    new RegExp(`###${key}###\\s*([\\s\\S]*?)(?=\\n\\s*###[A-Z_]+###|$)`)
  );

  return match?.[1]?.trim() ?? "";
}

export function parseProjectNotes(notes: string | null): ProjectNotesData {
  if (!notes || !notes.trim()) {
    return {
      secondarySources: [],
      summary: "",
      selectedImage: "",
      selectedVideo: "",
      selectedMusic: "",
      externalImageUrl: "",
      externalVideoUrl: "",
      narrationMode: "",
    };
  }

  const raw = notes.trim();

  if (raw.includes("###")) {
    const secondaryRaw = extractSection(raw, "SECONDARY_SOURCES");
    const summaryRaw = extractSection(raw, "SUMMARY");
    const selectedImage = extractSection(raw, "SELECTED_IMAGE");
    const selectedVideo = extractSection(raw, "SELECTED_VIDEO");
    const selectedMusic = extractSection(raw, "SELECTED_MUSIC");
    const externalImageUrl = extractSection(raw, "EXTERNAL_IMAGE_URL");
    const externalVideoUrl = extractSection(raw, "EXTERNAL_VIDEO_URL");
    const narrationMode = extractSection(raw, "NARRATION_MODE");

    return {
      secondarySources: secondaryRaw
        ? secondaryRaw.split("\n").map((item) => item.trim()).filter(Boolean)
        : [],
      summary: summaryRaw,
      selectedImage,
      selectedVideo,
      selectedMusic,
      externalImageUrl,
      externalVideoUrl,
      narrationMode,
    };
  }

  if (raw.startsWith("Fuentes secundarias:")) {
    return {
      secondarySources: raw
        .replace(/^Fuentes secundarias:\s*/i, "")
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
      summary: "",
      selectedImage: "",
      selectedVideo: "",
      selectedMusic: "",
      externalImageUrl: "",
      externalVideoUrl: "",
      narrationMode: "",
    };
  }

  return {
    secondarySources: [],
    summary: raw,
    selectedImage: "",
    selectedVideo: "",
    selectedMusic: "",
    externalImageUrl: "",
    externalVideoUrl: "",
    narrationMode: "",
  };
}

export function buildProjectNotes(data: ProjectNotesData) {
  const sections: string[] = [];

  if (data.secondarySources.length > 0) {
    sections.push(
      `###SECONDARY_SOURCES###\n${data.secondarySources.join("\n").trim()}`
    );
  }

  if (data.summary.trim()) {
    sections.push(`###SUMMARY###\n${data.summary.trim()}`);
  }

  if (data.selectedImage.trim()) {
    sections.push(`###SELECTED_IMAGE###\n${data.selectedImage.trim()}`);
  }

  if (data.selectedVideo.trim()) {
    sections.push(`###SELECTED_VIDEO###\n${data.selectedVideo.trim()}`);
  }

  if (data.selectedMusic.trim()) {
    sections.push(`###SELECTED_MUSIC###\n${data.selectedMusic.trim()}`);
  }

  if (data.externalImageUrl.trim()) {
    sections.push(`###EXTERNAL_IMAGE_URL###\n${data.externalImageUrl.trim()}`);
  }

  if (data.externalVideoUrl.trim()) {
    sections.push(`###EXTERNAL_VIDEO_URL###\n${data.externalVideoUrl.trim()}`);
  }

  if (data.narrationMode.trim()) {
    sections.push(`###NARRATION_MODE###\n${data.narrationMode.trim()}`);
  }

  return sections.join("\n\n") || null;
}
