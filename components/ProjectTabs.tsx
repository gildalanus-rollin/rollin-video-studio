"use client";

import Link from "next/link";

import { useState } from "react";
import ProjectMaterialPanel from "@/components/ProjectMaterialPanel";
import ProjectEditorialPanel from "@/components/ProjectEditorialPanel";
import ProjectGraphicPanel from "@/components/ProjectGraphicPanel";
import GenerateExportButton from "@/components/GenerateExportButton";

type Props = {
  projectId: string;
  title: string;
  mainSourceUrl: string;
  secondarySources: string[];
  selectedImage: string;
  selectedVideo: string;
  selectedMusic: string;
  summary: string;
  externalImageUrl: string;
  externalVideoUrl: string;
  narrationMode: string;
  effectiveEditorialProfile: string;
  durationLimitSeconds: number;
  outputFormat: string;
  voiceOption?: string;
  avatarOption?: string;
  renderScript: string;
  initialStatus: string;
  currentVoiceoverUrl?: string;
  imageUrl: string;
  narrativePreset: string;
  graphicTitleSize: string;
  graphicTitlePosition: string;
  avatarEnabled: boolean;
  subtitleEnabled: boolean;
  subtitlePosition: string;
  subtitleSize: string;
  subtitleText: string;
};

const TABS = [
  { id: "material", label: "1. Material" },
  { id: "editorial", label: "2. Editorial" },
  { id: "grafica", label: "3. Gráfica" },
  { id: "export", label: "4. Export" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function ProjectTabs(props: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("material");

  return (
    <div className="space-y-0">
      <div className="flex gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={
              activeTab === tab.id
                ? "flex-1 rounded-xl bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm transition"
                : "flex-1 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-white/60 hover:text-slate-700"
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="pt-5">
        {activeTab === "material" && (
          <ProjectMaterialPanel
            projectId={props.projectId}
            mainSourceUrl={props.mainSourceUrl}
            secondarySources={props.secondarySources}
            selectedImage={props.selectedImage}
            selectedVideo={props.selectedVideo}
            selectedMusic={props.selectedMusic}
            summary={props.summary}
            externalImageUrl={props.externalImageUrl}
            externalVideoUrl={props.externalVideoUrl}
            durationLimitSeconds={props.durationLimitSeconds}
            narrationMode={props.narrationMode}
          />
        )}

        {activeTab === "editorial" && (
          <ProjectEditorialPanel
            projectId={props.projectId}
            title={props.title}
            mainSourceUrl={props.mainSourceUrl}
            effectiveEditorialProfile={props.effectiveEditorialProfile}
            outputFormat={props.outputFormat}
            secondarySources={props.secondarySources}
            summary={props.summary}
            selectedImage={props.selectedImage}
            selectedVideo={props.selectedVideo}
            selectedMusic={props.selectedMusic}
            externalImageUrl={props.externalImageUrl}
            externalVideoUrl={props.externalVideoUrl}
            narrationMode={props.narrationMode}
            initialVoiceOption={props.voiceOption}
            initialAvatarOption={props.avatarOption}
            renderScript={props.renderScript}
            initialStatus={props.initialStatus}
            currentVoiceoverUrl={props.currentVoiceoverUrl}
          />
        )}

        {activeTab === "grafica" && (
          <ProjectGraphicPanel
            projectId={props.projectId}
            title={props.title}
            imageUrl={props.imageUrl}
            outputFormat={props.outputFormat}
            narrativePreset={props.narrativePreset}
            graphicTitleSize={props.graphicTitleSize}
            graphicTitlePosition={props.graphicTitlePosition}
            avatarEnabled={props.avatarEnabled}
            subtitleEnabled={props.subtitleEnabled}
            subtitlePosition={props.subtitlePosition}
            subtitleSize={props.subtitleSize}
            subtitleText={props.subtitleText}
          />
        )}

        {activeTab === "export" && (
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              4. export y render
            </p>
            <h2 className="mt-2 text-xl font-semibold text-slate-900">
              salida del proyecto
            </h2>
            <div className="mt-5 space-y-3">
              <GenerateExportButton projectId={props.projectId} />
              <a
                href={"/projects/" + props.projectId + "/exports"}
                className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                ver historial de exports
              </a>
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm leading-6 text-slate-500">
                El export toma el título, el resumen editorial, el render_script,
                la imagen principal y la secuencia visual del proyecto.
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
