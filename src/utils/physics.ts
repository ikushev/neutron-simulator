import { SimResult, FermiPoint, Material, SimResult2D, SimResultTwoGroup } from '../types';

const NA = 0.602214076; // Avogadro in 10^24 units

/**
 * Изчислява ядрената концентрация N (10^24 nuclei/cm3)
 */
export function calculateAtomicDensity(rho: number, A: number, fractionPercent: number): number {
  if (A <= 0) return 0;
  return (rho * NA * (fractionPercent / 100)) / A;
}

/**
 * Изчислява сумарните макроскопични сечения за смес от материали
 */
export function calculateMixtureProperties(materials: Material[]) {
  let totalSigmaA = 0;
  let totalSigmaF = 0;
  let totalSigmaS = 0;

  const detailed = materials.map(m => {
    const N = calculateAtomicDensity(m.density, m.atomicMass, m.fraction);
    const macroA = N * m.sigmaA;
    const macroF = N * m.sigmaF;
    const macroS = N * m.sigmaS;

    totalSigmaA += macroA;
    totalSigmaF += macroF;
    totalSigmaS += macroS;

    return {
      ...m,
      N,
      macroA,
      macroF,
      macroS
    };
  });

  return {
    materials: detailed,
    totalSigmaA,
    totalSigmaF,
    totalSigmaS
  };
}

/**
 * Симулира преходни процеси за Ксенон-135 и Самарий-149
 * Връща масив от точки за визуализация във времето (часове)
 */
export function calculatePoisonTransients(flux: number, hours: number = 72) {
  // Константи за Xe-135 (често използвани приближения)
  const lambdaI = 0.1035; // h^-1 (t1/2 = 6.7h)
  const lambdaXe = 0.0753; // h^-1 (t1/2 = 9.2h)
  const sigmaXe = 2.6e6 * 1e-24; // barns to cm^2 (2.6M barns)
  const gammaI = 0.063;
  const gammaXe = 0.003;
  const sigmaF = 0.1; // Примерно сечение за делене

  const dt = 1; // стъпка от 1 час
  const data = [];
  
  const safeFlux = Math.max(flux, 1e-10);
  let I = (gammaI * sigmaF * safeFlux) / lambdaI;
  let Xe = ((gammaI + gammaXe) * sigmaF * safeFlux) / (lambdaXe + sigmaXe * safeFlux);
  
  // Равновесни стойности като базова линия
  const eqI = Math.max(I, 1e-10);
  const eqXe = Math.max(Xe, 1e-10);

  for (let t = 0; t <= hours; t++) {
    // В t=10 спираме реактора (flux = 0)
    const currentFlux = t < 10 ? flux : 0;
    
    // Euler integration (simplified)
    const dI = (gammaI * sigmaF * currentFlux) - (lambdaI * I);
    const dXe = (lambdaI * I) + (gammaXe * sigmaF * currentFlux) - (lambdaXe * Xe) - (sigmaXe * currentFlux * Xe);
    
    I += dI * dt;
    Xe += dXe * dt;
    
    data.push({
      t,
      xenon: Number((Xe / eqXe).toFixed(3)), // Относително спрямо равновесието
      iodine: Number((I / eqI).toFixed(3)),
      isShutdown: t >= 10
    });
  }
  
  return data;
}

/**
 * Изчислява обратната връзка по реактивност от температурите.
 */
export function calculateReactivityFeedback(
  currentTf: number, 
  currentTc: number, 
  alphaF: number = -3e-5, 
  alphaC: number = -2e-4,
  refTf: number = 500,
  refTc: number = 280
): number {
  const dRhoFuel = alphaF * (currentTf - refTf);
  const dRhoCoolant = alphaC * (currentTc - refTc);
  return dRhoFuel + dRhoCoolant;
}

/**
 * Проверява за условия за аварийна защита (АЗ).
 */
export function checkSafetyLimits(power: number, fuelTemp: number) {
  const powerLimit = 120; // 120%
  const fuelLimit = 2800; // 2800°C
  
  return {
    scram: power > powerLimit || fuelTemp > fuelLimit,
    reason: power > powerLimit ? 'Превишаване на мощността' : fuelTemp > fuelLimit ? 'Топене на горивото' : ''
  };
}

/**
 * Валидира физическите допустими граници на параметрите.
 */
export function validatePhysicsRanges(state: any): any {
  const safe = { ...state };
  
  if (typeof safe.L === 'number') safe.L = Math.max(1, Math.min(safe.L, 500));
  if (typeof safe.sigmaA === 'number') safe.sigmaA = Math.max(0, Math.min(safe.sigmaA, 10));
  if (typeof safe.D === 'number') safe.D = Math.max(0.01, Math.min(safe.D, 10));
  if (typeof safe.powerLevel === 'number') safe.powerLevel = Math.max(0, safe.powerLevel);
  if (typeof safe.fuelTemp === 'number') safe.fuelTemp = Math.max(-273, safe.fuelTemp);
  
  if (Array.isArray(safe.materials)) {
    safe.materials = safe.materials.map((m: any) => ({
      ...m,
      fraction: Math.max(0, Math.min(m.fraction || 0, 100)),
      density: Math.max(0.001, m.density || 0)
    }));
  }

  return safe;
}

/**
 * Решава точковото кинетично уравнение с 6 групи закъсняващи неутрони и обратна връзка.
 * @param deltaRho - стъпаловидно изменение на реактивността
 * @param duration - продължителност на симулацията (сек)
 * @param feedback - активни обратни връзки
 */
export function calculatePointKinetics(
  deltaRho: number, 
  duration: number = 30,
  feedback?: { alphaF: number, alphaC: number, scram?: boolean }
) {
  const beta = 0.0065;
  const Lambda = 1e-4; // Generation time (s)
  
  // 6 групи закъсняващи неутрони (U-235)
  const beta_i = [0.000215, 0.001424, 0.001274, 0.002568, 0.000748, 0.000271];
  const lambda_i = [0.0124, 0.0305, 0.111, 0.301, 1.14, 3.01];

  let P = 1.0; // Първоначална мощност (относителна)
  let C = beta_i.map((bi, idx) => bi / (lambda_i[idx] * Lambda));
  
  // Coupling initial state
  const T0_f = 500;
  const T0_c = 280;
  let Tf = T0_f;
  let Tc = T0_c;
  
  const dt = 0.02;
  const data = [];

  for (let t = 0; t <= duration; t += dt) {
    if (Math.abs(t % 0.1) < 0.01) {
      const fbRho = feedback ? (feedback.alphaF * (Tf - T0_f) + feedback.alphaC * (Tc - T0_c)) : 0;
      const totalRho = (t > 1 ? deltaRho : 0) + fbRho + (feedback?.scram ? -0.05 : 0);
      
      data.push({ 
        t: Number(t.toFixed(1)), 
        power: P * 100, // Convert to %
        tf: Tf,
        tc: Tc,
        fbRho: fbRho
      });
    }

    // Step change at t=1s
    let rho = t > 1 ? deltaRho : 0;
    
    // Feedback
    if (feedback) {
      rho += (feedback.alphaF * (Tf - T0_f) + feedback.alphaC * (Tc - T0_c));
      if (feedback.scram) rho -= 0.05; // Strong negative reactivity during SCRAM
    }
    
    // Point Kinetics Derivatives
    const SumLambdaC = C.reduce((acc, ci, i) => acc + lambda_i[i] * ci, 0);
    const dP = ((rho - beta) / Lambda) * P + SumLambdaC;
    const dC = C.map((ci, i) => (beta_i[i] / Lambda) * P - lambda_i[i] * ci);

    // Thermal Coupling (simplified 1-node model)
    // dTc/dt = (Power - HeatLoss) / Capacity
    const dTc = 0.5 * (P - 1.0) - 0.1 * (Tc - T0_c);
    const dTf = 2.0 * (P - 1.0) - 0.5 * (Tf - Tc);

    // Integrals (Euler)
    P += dP * dt;
    C = C.map((ci, i) => ci + dC[i] * dt);
    Tf += dTf * dt;
    Tc += dTc * dt;
    
    // Numerical Stability Guards
    if (P < 0) P = 0;
    if (P > 50) P = 50; // Hard clamp for display safety (5000% power)
    if (isNaN(P)) P = 0; 
  }
  
  return data;
}

/**
 * Изчислява температурен профил в ТВЕЛ и охладител.
 */
export function calculateThermalHydraulics(powerLinear: number = 200, bulkTemp: number = 280) {
  const Rf = 0.41; // Радиус на горивната таблетка (cm)
  const Rc = 0.475; // Външен радиус на обвивката (cm)
  const kf = 0.03; // Топлопроводимост на горивото (UO2) (W/cm·K)
  const kc = 0.15; // Топлопроводимост на обвивката (Zircaloy) (W/cm·K)
  const h = 3.5; // Коефициент на топлопредаване (W/cm2·K)
  
  // Температура на повърхността на обвивката (T_s)
  // q' = h * 2 * pi * Rc * (Ts - Tb)
  const Ts = bulkTemp + powerLinear / (h * 2 * Math.PI * Rc);
  
  // Температура на вътрешната повърхност на обвивката (T_ci)
  // T_ci - Ts = q' * ln(Rc/Rf) / (2 * pi * kc)
  const Tci = Ts + (powerLinear * Math.log(Rc / Rf)) / (2 * Math.PI * kc);
  
  // Температура на оста на таблетката (T_0)
  // T_0 - Tci = q' / (4 * pi * kf)
  const T0 = Tci + powerLinear / (4 * Math.PI * kf);

  const data = [];
  const steps = 50;

  // Профил в горивото
  for (let i = 0; i <= steps; i++) {
    const r = (i / steps) * Rf;
    const T = T0 - (powerLinear * r * r) / (4 * Math.PI * kf * Rf * Rf);
    data.push({ r: Number(r.toFixed(3)), T: Number(T.toFixed(1)), zone: 'Гориво' });
  }

  // Профил в обвивката
  for (let i = 1; i <= 10; i++) {
    const r = Rf + (i / 10) * (Rc - Rf);
    const T = Tci - (powerLinear * Math.log(r / Rf)) / (2 * Math.PI * kc);
    data.push({ r: Number(r.toFixed(3)), T: Number(T.toFixed(1)), zone: 'Обвивка' });
  }

  // Околна среда (bulk)
  data.push({ r: Rc + 0.1, T: bulkTemp, zone: 'Охладител' });

  return data;
}

/**
 * Решава 1D дифузионно уравнение чрез Метод на крайните разлики (FDM).
 */
export function solveSteadyStateDiffusion(
  L: number,
  D: number,
  sigmaA: number,
  S: number,
  nodes: number = 60
): SimResult[] {
  const safeNodes = Math.max(nodes, 2);
  const h = L / (safeNodes - 1);
  const a = new Array(safeNodes);
  const b = new Array(safeNodes).fill(0);
  const c = new Array(safeNodes);
  const d = new Array(safeNodes);

  for (let i = 0; i < safeNodes; i++) {
    if (i === 0 || i === safeNodes - 1) {
      b[i] = 1;
      a[i] = 0;
      c[i] = 0;
      d[i] = 0;
    } else {
      a[i] = -D / (h * h);
      b[i] = (2 * D) / (h * h) + sigmaA;
      c[i] = -D / (h * h);
      d[i] = S;
    }
  }

  // Thomas algorithm
  for (let i = 1; i < safeNodes; i++) {
    const m = a[i] / b[i - 1];
    b[i] = b[i] - m * c[i - 1];
    d[i] = d[i] - m * d[i - 1];
  }

  const phi = new Array(safeNodes);
  phi[safeNodes - 1] = d[safeNodes - 1] / b[safeNodes - 1];

  for (let i = safeNodes - 2; i >= 0; i--) {
    phi[i] = (d[i] - c[i] * phi[i + 1]) / b[i];
  }

  return phi.map((v, idx) => ({ x: Number((idx * h).toFixed(2)), phi: Math.max(0, v) }));
}

/**
 * Решава 2D дифузионно уравнение чрез Jacobi итерация (опростено).
 */
export function solve2DDiffusion(
  Lx: number,
  Ly: number,
  D: number,
  sigmaA: number,
  S: number,
  nx: number = 20,
  ny: number = 20
): SimResult2D[] {
  const hx = Lx / (nx - 1);
  const hy = Ly / (ny - 1);
  
  let phi = Array.from({ length: nx }, () => new Array(ny).fill(0));
  let nextPhi = Array.from({ length: nx }, () => new Array(ny).fill(0));
  
  // Jacobi Iteration (Steady State)
  const maxIterations = 500;
  for (let iter = 0; iter < maxIterations; iter++) {
    let maxDiff = 0;
    for (let i = 1; i < nx - 1; i++) {
      for (let j = 1; j < ny - 1; j++) {
        const xTerm = (phi[i+1][j] + phi[i-1][j]) / (hx * hx);
        const yTerm = (phi[i][j+1] + phi[i][j-1]) / (hy * hy);
        const denom = (2 / (hx * hx) + 2 / (hy * hy) + sigmaA / D);
        nextPhi[i][j] = (xTerm + yTerm + (S / D)) / denom;
      }
    }
    phi = nextPhi.map(row => [...row]);
  }

  const results: SimResult2D[] = [];
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      results.push({
        x: Number((i * hx).toFixed(1)),
        y: Number((j * hy).toFixed(1)),
        phi: Number(phi[i][j].toFixed(4))
      });
    }
  }
  return results;
}

/**
 * Решава двугрупова дифузия в 1D (Бързи и Топлинни неутрони).
 */
export function solveTwoGroupDiffusion(
  L: number,
  D1: number, D2: number,
  SigmaA1: number, SigmaA2: number,
  SigmaR1: number, // Downscattering 1 -> 2
  nuSigmaF1: number, nuSigmaF2: number,
  k: number = 1.0,
  nodes: number = 60
): SimResultTwoGroup[] {
  const h = L / (nodes - 1);
  const phi1 = new Array(nodes).fill(0);
  const phi2 = new Array(nodes).fill(0);
  
  // Power iteration simplified for steady state flux profile
  // Initial guess
  phi1.fill(1.0);
  phi2.fill(1.0);

  for (let iter = 0; iter < 50; iter++) {
    // Solve Fast
    // -D1 d2phi1 + (SigmaA1 + SigmaR1)phi1 = (nuSigmaF1*phi1 + nuSigmaF2*phi2)/k
    // Simplified: treat source as fixed in one iteration
    const fastSource = phi1.map((p1, i) => (nuSigmaF1 * p1 + nuSigmaF2 * phi2[i]) / k);
    const solvedFast = solveSteadyStateDiffusion(L, D1, SigmaA1 + SigmaR1, fastSource[nodes/2], nodes);
    solvedFast.forEach((res, i) => phi1[i] = res.phi);

    // Solve Thermal
    // -D2 d2phi2 + SigmaA2*phi2 = SigmaR1 * phi1
    const thermalSource = phi1.map(p1 => SigmaR1 * p1);
    const solvedThermal = solveSteadyStateDiffusion(L, D2, SigmaA2, thermalSource[nodes/2], nodes);
    solvedThermal.forEach((res, i) => phi2[i] = res.phi);
  }

  return phi1.map((p1, i) => ({
    x: Number((i * h).toFixed(2)),
    phiFast: p1,
    phiThermal: phi2[i]
  }));
}

/**
 * Уравнение на Ферми за забавянето за точков източник
 */
export function calculateFermiAgeDistribution(
  tau: number,
  maxR: number = 150,
  steps: number = 100
): FermiPoint[] {
  const data: FermiPoint[] = [];
  const safeTau = Math.max(tau, 0.5);

  for (let i = 0; i <= steps; i++) {
    const r = (i / steps) * maxR;
    const q = Math.exp(-(r * r) / (4 * safeTau)) / Math.pow(4 * Math.PI * safeTau, 1.5);
    data.push({ r: Number(r.toFixed(1)), q });
  }
  return data;
}
