with open('app/projects/[id]/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

old = '''const { data: assetRows } = await supabaseAdmin
    .from("project_assets")
    .select("storage_bucket, storage_path, source_type, value, is_primary")
    .eq("project_id", id)
    .eq("asset_type", "image")
    .order("is_primary", { ascending: false })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const projectAssets = (assetRows ?? []) as AssetPreviewRow[];
  const primaryAsset =
    projectAssets.find((a) => a.is_primary) ?? projectAssets[0] ?? null;'''

new = '''// Usar la primera imagen de la secuencia visual como portada
  const { data: firstSceneRows } = await supabaseAdmin
    .from("project_visual_sequence")
    .select("asset:project_assets (storage_bucket, storage_path, source_type, value, is_primary, original_filename)")
    .eq("project_id", id)
    .order("sequence_order", { ascending: true })
    .limit(5);

  const firstImageScene = (firstSceneRows ?? []).find((row: any) => {
    const a = row.asset;
    if (!a) return false;
    const isVideo = (a.original_filename || "").match(/\\.(mp4|mov|webm)$/i);
    return !isVideo;
  }) as any;
  const primaryAsset = (firstImageScene?.asset ?? null) as AssetPreviewRow | null;'''

print("Found:", old in content)
content = content.replace(old, new)

with open('app/projects/[id]/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")