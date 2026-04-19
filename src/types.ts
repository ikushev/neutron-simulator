export type MaterialType = 'Гориво' | 'Забавител' | 'Охладител' | 'Поглътител';

export interface Material {
  id: string;
  type: MaterialType;
  name: string;
  density: number;    // g/cm3
  atomicMass: number; // A
  sigmaA: number;     // barns
  sigmaF: number;     // barns
  sigmaS: number;     // barns
  fraction: number;   // %
}

export interface GroupConstant {
  id: string;
  name: string;
  sigmaA: number;
  nuSigmaF: number;
  D: number;
}

export interface PhysicsState {
  L: number;
  D: number;
  sigmaA: number;
  source: number;
  fermiAge?: number;
  materials?: Material[];
  constants?: GroupConstant[];
  geometry?: '1D' | '2D';
  scram?: boolean;
  powerLevel?: number;
  fuelTemp?: number;
  coolantTemp?: number;
  dopplerAlpha?: number;
  moderatorAlpha?: number;
  rhoControl?: number; // External reactivity input
  linearPower?: number; // W/cm
  bulkCoolantTemp?: number; // C
}

export interface SimResult2D {
  x: number;
  y: number;
  phi: number;
}

export interface SimResultTwoGroup {
  x: number;
  phiFast: number;
  phiThermal: number;
}

export interface SimResult {
  x: number;
  phi: number;
}

export interface FermiPoint {
  r: number;
  q: number;
}

export interface QuizQuestion {
  text: string;
  options: string[];
  correct: number;
}
