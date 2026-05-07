"use client";

import PlacasEditor from "@/components/PlacasEditor";

import { useState } from "react";
import ProjectSettingsEditor from "@/components/ProjectSettingsEditor";
import NarrationModeEditor from "@/components/NarrationModeEditor";
import ProjectSummaryEditor from "@/components/ProjectSummaryEditor";
import RenderScriptEditor from "@/components/RenderScriptEditor";
import VoiceoverEditor from "@/components/VoiceoverEditor";

type Props = {
  projectId: string;
  title: string;
  mainSourceUrl: string;
  effectiveEditorialProfile: string;
  durationLimitSeconds: number;
  outputFormat: string;
  secondarySources: string[];
  summary: string;
  selectedImage: string;
  selectedVideo: string;
  selectedMusic: string;
  externalImageUrl: string;
  externalVideoUrl: string;
  narrationMode: string;
  renderScript: string;
  initialStatus?: string | null;
  initialVoiceOption?: string | null;
  initialAvatarOption?: string | null;
  currentVoiceoverUrl?: string;
};

export default function ProjectEditorialPanel({
  projectId,
  title,
  mainSourceUrl,
  effectiveEditorialProfile,
  durationLimitSeconds,
  outputFormat,
  secondarySources,
  summary,
  selectedImage,
  selectedVideo,
  selectedMusic,
  externalImageUrl,
  externalVideoUrl,
  narrationMode,
  renderScript,
  initialStatus,
  initialVoiceOption,
  initialAvatarOption,
  currentVoiceoverUrl,
}: Props) {
  const [currentSummary, setCurrentSummary] = useState(summary);
  const [currentRenderScript, setCurrentRenderScript] = useState(renderScript);

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        2. enfoque editorial
      </p>

      <div className="mt-5 space-y-4">
        <ProjectSettingsEditor
          projectId={projectId}
          initialCategory={effectiveEditorialProfile}
          initialDurationLimitSeconds={durationLimitSeconds}
          initialOutputFormat={outputFormat}
          initialStatus={initialStatus}
        />

        <NarrationModeEditor
          projectId={projectId}
          initialNarrationMode={narrationMode}
          initialVoiceOption={initialVoiceOption ?? undefined}
          initialAvatarOption={initialAvatarOption ?? undefined}
        />

        <ProjectSummaryEditor
          projectId={projectId}
          mainSourceUrl={mainSourceUrl}
          initialSecondarySources={secondarySources}
          initialSummary={currentSummary}
          initialSelectedImage={selectedImage}
          initialSelectedVideo={selectedVideo}
          initialSelectedMusic={selectedMusic}
          initialExternalImageUrl={externalImageUrl}
          initialExternalVideoUrl={externalVideoUrl}
          durationLimitSeconds={durationLimitSeconds}
          onSummaryChange={setCurrentSummary}
        />

        <RenderScriptEditor
          projectId={projectId}
          initialRenderScript={currentRenderScript}
          title={title}
          summary={currentSummary}
          durationLimitSeconds={durationLimitSeconds}
          onRenderScriptChange={setCurrentRenderScript}
        />

        <PlacasEditor
          projectId={projectId}
          durationLimitSeconds={durationLimitSeconds}
        />

        <VoiceoverEditor
          projectId={projectId}
          renderScript={currentRenderScript}
          currentVoiceoverUrl={currentVoiceoverUrl}
        />
      </div>
    </section>
  );
}
