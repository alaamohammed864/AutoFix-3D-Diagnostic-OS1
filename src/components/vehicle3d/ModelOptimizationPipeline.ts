// AutoFix 3D - 3D Model Optimization Pipeline
// Level-of-Detail (LOD), Draco Decompression, KTX2 Texture Compression, and Progressive Streaming Telemetry

export type LODLevel = 'low' | 'medium' | 'high';
export type LODMode = 'auto' | 'low' | 'medium' | 'high';

export interface ModelOptimizationStats {
  lodLevel: LODLevel;
  dracoActive: boolean;
  dracoCompressionRatio: string;
  textureCompression: 'Basis/KTX2' | 'WebP GPU' | 'Uncompressed';
  vramSavedPercent: number;
  triangleCount: number;
  meshCount: number;
  streamingStatus: 'STREAMING' | 'READY' | 'CACHED';
  loadedSubsystemsCount: number;
  totalSubsystemsCount: number;
}

export const LOD_STATS_PRESETS: Record<LODLevel, { triangles: number; meshes: number; vramMb: number }> = {
  low: {
    triangles: 1240,
    meshes: 8,
    vramMb: 1.4,
  },
  medium: {
    triangles: 6850,
    meshes: 24,
    vramMb: 4.8,
  },
  high: {
    triangles: 24600,
    meshes: 68,
    vramMb: 14.2,
  },
};

export class Telemetry3DManager {
  private static instance: Telemetry3DManager;

  public currentStats: ModelOptimizationStats = {
    lodLevel: 'low',
    dracoActive: true,
    dracoCompressionRatio: '4.8 : 1 (Draco 16-bit Quantized)',
    textureCompression: 'Basis/KTX2',
    vramSavedPercent: 68,
    triangleCount: LOD_STATS_PRESETS.low.triangles,
    meshCount: LOD_STATS_PRESETS.low.meshes,
    streamingStatus: 'READY',
    loadedSubsystemsCount: 8,
    totalSubsystemsCount: 8,
  };

  private listeners = new Set<(stats: ModelOptimizationStats) => void>();

  public static getInstance(): Telemetry3DManager {
    if (!Telemetry3DManager.instance) {
      Telemetry3DManager.instance = new Telemetry3DManager();
    }
    return Telemetry3DManager.instance;
  }

  public updateStats(partial: Partial<ModelOptimizationStats>): void {
    this.currentStats = { ...this.currentStats, ...partial };
    this.listeners.forEach(cb => cb(this.currentStats));
  }

  public subscribe(cb: (stats: ModelOptimizationStats) => void): () => void {
    this.listeners.add(cb);
    cb(this.currentStats);
    return () => this.listeners.delete(cb);
  }
}
