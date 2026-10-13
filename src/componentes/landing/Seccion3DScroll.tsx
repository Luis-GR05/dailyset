import { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "../../context/I18nContext";
import { Link } from "react-router-dom";
import {
  Activity,
  Flame,
  Zap,
  ArrowUpRight,
  Rotate3d,
  Compass,
  CheckCircle2,
  Dumbbell,
} from "lucide-react";

interface StageData {
  id: string;
  badge: string;
  badgeEn: string;
  titulo: string;
  tituloEn: string;
  subtitulo: string;
  subtituloEn: string;
  descripcion: string;
  descripcionEn: string;
  anguloRodilla: string;
  activacionMuscular: string;
  fase: string;
  faseEn: string;
  metricas: {
    etiqueta: string;
    etiquetaEn: string;
    valor: string;
    subvalor?: string;
    destacado?: boolean;
  }[];
}

const STAGES: StageData[] = [
  {
    id: "setup",
    badge: "01 / BIOMECÁNICA DEL SETUP",
    badgeEn: "01 / SETUP BIOMECHANICS",
    titulo: "POSTURA INICIAL & PRE-ACTIVACIÓN",
    tituloEn: "INITIAL STANCE & CORE BRACING",
    subtitulo: "BLOQUEO ARTICULAR NEUTRO",
    subtituloEn: "NEUTRAL JOINT LOCK",
    descripcion:
      "Alineación al ancho de hombros, retracción escapular y presión intra-abdominal fijada. La barra olímpica de 140 kg descansa firme sobre los trapecios en equilibrio sagital.",
    descripcionEn:
      "Shoulder-width stance, scapular retraction, and intra-abdominal pressure locked. The 140 kg barbell rests securely on upper traps in complete sagittal balance.",
    anguloRodilla: "180° EXTENSIÓN",
    activacionMuscular: "22% (PRE-TENSIÓN)",
    fase: "POSICIÓN INICIAL",
    faseEn: "STARTING POSITION",
    metricas: [
      { etiqueta: "CARGA TOTAL", etiquetaEn: "TOTAL LOAD", valor: "140.0 KG", subvalor: "IPF Spec", destacado: true },
      { etiqueta: "ÁNGULO RODILLA", etiquetaEn: "KNEE ANGLE", valor: "180°", subvalor: "Bloqueo Neutro" },
      { etiqueta: "PRESIÓN CORE", etiquetaEn: "CORE BRACING", valor: "100%", subvalor: "Valsalva Activo" },
      { etiqueta: "CENTRO GRAVEDAD", etiquetaEn: "CENTER MASS", valor: "MEDIOPIÉ", subvalor: "Vector Puro" },
    ],
  },
  {
    id: "excentrica",
    badge: "02 / FASE EXCÉNTRICA CONTROLADA",
    badgeEn: "02 / CONTROLLED ECCENTRIC",
    titulo: "DESCENSO & DISOCIACIÓN LUMBOPÉLVICA",
    tituloEn: "DESCENT & PELVIC DISASSOCIATION",
    subtitulo: "TENSIÓN ELÁSTICA EN CUÁDRICEPS",
    subtituloEn: "ELASTIC TENSION IN QUADS",
    descripcion:
      "Flexión coordinada de caderas y rodillas con tempo 3:0. Los cuádriceps (vasto externo e interno) acumulan energía elástica mientras la columna se mantiene neutra.",
    descripcionEn:
      "Coordinated hip and knee flexion with 3:0 tempo. Quadriceps store kinetic elastic tension while spinal integrity remains completely locked.",
    anguloRodilla: "125° FLEXIÓN",
    activacionMuscular: "68% (ELONGACIÓN)",
    fase: "FASE EXCÉNTRICA",
    faseEn: "ECCENTRIC PHASE",
    metricas: [
      { etiqueta: "ÁNGULO RODILLA", etiquetaEn: "KNEE ANGLE", valor: "125°", subvalor: "Flexión Fluida", destacado: true },
      { etiqueta: "ACTIVACIÓN VASTOS", etiquetaEn: "QUAD RECRUITMENT", valor: "68%", subvalor: "Heatmap Neón" },
      { etiqueta: "TEMPO DESCENSO", etiquetaEn: "DESCENT TEMPO", valor: "2.8s", subvalor: "Control Puro" },
      { etiqueta: "BAR-PATH", etiquetaEn: "BAR-PATH", valor: "VERTICAL", subvalor: "±1.2mm Desvío" },
    ],
  },
  {
    id: "profundidad",
    badge: "03 / PROFUNDIDAD ÓPTIMA IPF",
    badgeEn: "03 / OPTIMAL IPF DEPTH",
    titulo: "PUNTO DE INFLEXIÓN & MÁXIMA TENSIÓN",
    tituloEn: "INFLECTION POINT & PEAK TENSION",
    subtitulo: "ROTURA DE PARALELA A 90°",
    subtituloEn: "BREAKING PARALLEL AT 90°",
    descripcion:
      "Cadera por debajo de la línea articular de la rodilla. Máximo pico de reclutamiento neuromuscular en glúteo mayor y vasto lateral, sin colapso de rodilla en valgo.",
    descripcionEn:
      "Hip crease drops below top of the knee. Maximum neuromuscular recruitment in gluteus maximus and vastus lateralis with zero knee valgus collapse.",
    anguloRodilla: "88° PARALELA",
    activacionMuscular: "98% (PICO MÁXIMO)",
    fase: "FONDO / PUNTO INFLEXIÓN",
    faseEn: "BOTTOM / INFLECTION",
    metricas: [
      { etiqueta: "ÁNGULO RODILLA", etiquetaEn: "KNEE ANGLE", valor: "88°", subvalor: "Profundidad Válida", destacado: true },
      { etiqueta: "ACTIVACIÓN GLÚTEO", etiquetaEn: "GLUTE POWER", valor: "98%", subvalor: "Pico Máximo" },
      { etiqueta: "FUERZA REACTIVA", etiquetaEn: "GROUND FORCE", valor: "1,420 N", subvalor: "Empuje Simétrico" },
      { etiqueta: "RIR PREDICTIVO", etiquetaEn: "EST. RIR", valor: "2 REPS", subvalor: "Calculado IA" },
    ],
  },
  {
    id: "concentrica",
    badge: "04 / POTENCIA CONCÉNTRICA & BLOQUEO",
    badgeEn: "04 / CONCENTRIC DRIVE & LOCKOUT",
    titulo: "PROPULSIÓN EXPLOSIVA & REPETICIÓN GUARDADA",
    tituloEn: "EXPLOSIVE ASCENT & LOGGED REP",
    subtitulo: "EXTENSIÓN COMPLETA DE CADERA",
    subtituloEn: "FULL HIP EXTENSION",
    descripcion:
      "Aceleración concéntrica con extensión simultánea de rodillas y caderas. Bloqueo triunfal de la serie y sincronización automática del volumen levantado en DailySET.",
    descripcionEn:
      "Concentric acceleration with simultaneous hip and knee extension. Triumphant lockout with instant volume logging into your DailySET profile.",
    anguloRodilla: "180° BLOQUEO",
    activacionMuscular: "100% ÉXITO",
    fase: "REPETICIÓN COMPLETADA",
    faseEn: "REP COMPLETED",
    metricas: [
      { etiqueta: "VELOCIDAD PROPULSIVA", etiquetaEn: "MEAN VELOCITY", valor: "0.78 M/S", subvalor: "Aceleración VBT", destacado: true },
      { etiqueta: "REPETICIÓN", etiquetaEn: "REP NUMBER", valor: "REP 1 / 10", subvalor: "Serie 3" },
      { etiqueta: "RPE REGISTRADO", etiquetaEn: "LOGGED RPE", valor: "8.0", subvalor: "Sobrecarga Lograda" },
      { etiqueta: "ESTADO DAILYSET", etiquetaEn: "DAILYSET SYNC", valor: "GUARDADO", subvalor: "En la nube" },
    ],
  },
];

export default function Seccion3DScroll() {
  const { locale } = useI18n();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Estados visuales reactivos
  const [activeStage, setActiveStage] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showMusclesHeatmap, setShowMusclesHeatmap] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);

  // Referencias Three.js
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // Jerarquía cinemática del atleta deportivo
  const athleteRootRef = useRef<THREE.Group | null>(null);
  const hipsRef = useRef<THREE.Group | null>(null);
  const spineRef = useRef<THREE.Group | null>(null);
  const leftThighRef = useRef<THREE.Group | null>(null);
  const rightThighRef = useRef<THREE.Group | null>(null);
  const leftKneeRef = useRef<THREE.Group | null>(null);
  const rightKneeRef = useRef<THREE.Group | null>(null);
  const leftCalfRef = useRef<THREE.Group | null>(null);
  const rightCalfRef = useRef<THREE.Group | null>(null);
  const barbellRef = useRef<THREE.Group | null>(null);

  // Materiales de los músculos activos para animar el heatmap
  const quadMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const gluteMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const coreMaterialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const angleRingMeshRef = useRef<THREE.Mesh | null>(null);
  const forceVectorMeshRef = useRef<THREE.Group | null>(null);

  // Interacción táctil y ratón
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });
  const userRotationRef = useRef({ x: 0.1, y: 0.35 });

  // Interpolación de scroll para máxima fluidez a 60-120fps
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);
  const autoRotateRef = useRef(autoRotate);
  autoRotateRef.current = autoRotate;

  // 1. Inicialización de Three.js y modelado del atleta biomecánico
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Escena con niebla sutil de estudio atlético
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.fog = new THREE.FogExp2(0x050505, 0.032);

    // Cámara deportiva en perspectiva 3/4
    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 7.8);
    cameraRef.current = camera;

    // Renderizador de alta definición
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // ─── ILUMINACIÓN ATLÉTICA DE ESTUDIO ───
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    // Luz cenital principal (resalta la definición muscular)
    const topLight = new THREE.DirectionalLight(0xffffff, 4.0);
    topLight.position.set(2, 8, 4);
    scene.add(topLight);

    // Luz lateral de contraste fría
    const sideLight = new THREE.DirectionalLight(0x7dd3fc, 2.2);
    sideLight.position.set(-5, 2, -2);
    scene.add(sideLight);

    // Luz de borde neón flúor DailySET (#D4FB34)
    const neonBrandLight = new THREE.PointLight(0xd4fb34, 4.5, 12);
    neonBrandLight.position.set(0, 1.5, 3.5);
    scene.add(neonBrandLight);

    // ─── MATERIALES DE RENDIMIENTO DEPORTIVO ───
    // Traje de compresión biomecánico (Grafito / Carbono)
    const suitMaterial = new THREE.MeshStandardMaterial({
      color: 0x141417,
      metalness: 0.7,
      roughness: 0.35,
    });

    // Articulaciones cromadas pulidas
    const jointMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.12,
    });

    // Músculos activos: Cuádriceps (Heatmap Dinámico)
    const quadMat = new THREE.MeshStandardMaterial({
      color: 0xd4fb34,
      emissive: 0xd4fb34,
      emissiveIntensity: 0.8,
      metalness: 0.2,
      roughness: 0.3,
    });
    quadMaterialRef.current = quadMat;

    // Músculos activos: Glúteo Mayor
    const gluteMat = new THREE.MeshStandardMaterial({
      color: 0xff6422,
      emissive: 0xff6422,
      emissiveIntensity: 0.5,
      metalness: 0.2,
      roughness: 0.3,
    });
    gluteMaterialRef.current = gluteMat;

    // Músculos activos: Core / Abdominales
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0xd4fb34,
      emissive: 0xd4fb34,
      emissiveIntensity: 0.4,
      metalness: 0.2,
      roughness: 0.3,
    });
    coreMaterialRef.current = coreMat;

    // Acero de la barra olímpica y discos
    const chromeBarMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      metalness: 0.98,
      roughness: 0.08,
    });
    const bumperPlateMat = new THREE.MeshStandardMaterial({
      color: 0x18181b,
      metalness: 0.85,
      roughness: 0.2,
    });
    const bumperRingMat = new THREE.MeshStandardMaterial({
      color: 0xd4fb34,
      emissive: 0xd4fb34,
      emissiveIntensity: 0.7,
      metalness: 0.3,
      roughness: 0.2,
    });

    // ─── CONSTRUCCIÓN DEL MANIQUÍ ATLETA BIOMECÁNICO ───
    const athleteRoot = new THREE.Group();
    athleteRoot.position.y = -1.2;
    scene.add(athleteRoot);
    athleteRootRef.current = athleteRoot;

    // Plataforma de levantamiento de halterofilia
    const platformGeo = new THREE.CylinderGeometry(2.6, 2.7, 0.12, 48);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x111113,
      metalness: 0.5,
      roughness: 0.6,
    });
    const platformMesh = new THREE.Mesh(platformGeo, platformMat);
    platformMesh.position.y = -0.06;
    athleteRoot.add(platformMesh);

    // Aro exterior fluorescente en la plataforma
    const platRingGeo = new THREE.TorusGeometry(2.6, 0.025, 16, 48);
    platRingGeo.rotateX(Math.PI / 2);
    const platRing = new THREE.Mesh(platRingGeo, bumperRingMat);
    athleteRoot.add(platRing);

    // Caderas / Pelvis (Centro articular)
    const hips = new THREE.Group();
    hips.position.y = 1.65;
    athleteRoot.add(hips);
    hipsRef.current = hips;

    const pelvisMesh = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.35, 0.48), suitMaterial);
    hips.add(pelvisMesh);

    // Músculo Glúteo (Posterior)
    const gluteMesh = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.32, 0.22), gluteMat);
    gluteMesh.position.set(0, -0.05, -0.22);
    hips.add(gluteMesh);

    // Columna / Torso
    const spine = new THREE.Group();
    spine.position.y = 0.22;
    hips.add(spine);
    spineRef.current = spine;

    // V-Taper Torso muscular (Cintura a hombros)
    const torsoGeo = new THREE.CylinderGeometry(0.52, 0.36, 0.85, 24);
    const torsoMesh = new THREE.Mesh(torsoGeo, suitMaterial);
    torsoMesh.position.y = 0.45;
    spine.add(torsoMesh);

    // Abdominales / Core activo (Heatmap anterior)
    const coreMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.48, 0.12), coreMat);
    coreMesh.position.set(0, 0.35, 0.22);
    spine.add(coreMesh);

    // Pectorales atléticos
    const chestMesh = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.28, 0.18), suitMaterial);
    chestMesh.position.set(0, 0.68, 0.2);
    spine.add(chestMesh);

    // Cuello y Cabeza
    const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.22, 16), suitMaterial);
    neckMesh.position.y = 0.98;
    spine.add(neckMesh);

    const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24), suitMaterial);
    headMesh.position.y = 1.22;
    headMesh.scale.set(0.9, 1.1, 1.0);
    spine.add(headMesh);

    // Visor atlético inteligente (HUD Neón)
    const visorMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.245, 0.245, 0.08, 24, 1, false, 0, Math.PI),
      bumperRingMat
    );
    visorMesh.position.set(0, 1.22, 0.02);
    visorMesh.rotation.y = -Math.PI / 2;
    spine.add(visorMesh);

    // ─── BARRA OLÍMPICA DE 140 KG APOYADA EN LOS TRAPECIOS ───
    const barbell = new THREE.Group();
    barbell.position.set(0, 0.82, -0.16);
    spine.add(barbell);
    barbellRef.current = barbell;

    // Barra central cromada (2.2m)
    const barGeo = new THREE.CylinderGeometry(0.04, 0.04, 3.6, 24);
    barGeo.rotateZ(Math.PI / 2);
    const barMesh = new THREE.Mesh(barGeo, chromeBarMat);
    barbell.add(barMesh);

    // Función constructora de discos de 140 kg
    const createBumperSet = (offsetX: number) => {
      const setGroup = new THREE.Group();
      setGroup.position.x = offsetX;

      const plate1 = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.12, 32), bumperPlateMat);
      plate1.rotateZ(Math.PI / 2);
      setGroup.add(plate1);

      const plate1Rim = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.025, 12, 32), bumperRingMat);
      plate1Rim.rotateY(Math.PI / 2);
      setGroup.add(plate1Rim);

      const plate2 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.1, 32), bumperPlateMat);
      plate2.position.x = Math.sign(offsetX) * 0.13;
      plate2.rotateZ(Math.PI / 2);
      setGroup.add(plate2);

      const plate3 = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.08, 32), bumperRingMat);
      plate3.position.x = Math.sign(offsetX) * 0.24;
      plate3.rotateZ(Math.PI / 2);
      setGroup.add(plate3);

      barbell.add(setGroup);
    };

    createBumperSet(1.3);
    createBumperSet(-1.3);

    // Brazos sujetando la barra olímpica en la espalda
    const createArm = (isLeft: boolean) => {
      const sign = isLeft ? 1 : -1;
      const shoulderJoint = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), jointMaterial);
      shoulderJoint.position.set(sign * 0.48, 0.8, 0);
      spine.add(shoulderJoint);

      const bicep = new THREE.Mesh(new THREE.CapsuleGeometry(0.09, 0.36, 8, 16), suitMaterial);
      bicep.position.set(sign * 0.68, 0.72, -0.08);
      bicep.rotation.z = -sign * 0.7;
      spine.add(bicep);

      const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.38, 8, 16), suitMaterial);
      forearm.position.set(sign * 0.92, 0.8, -0.16);
      forearm.rotation.z = -sign * 0.4;
      forearm.rotation.x = -0.5;
      spine.add(forearm);
    };
    createArm(true);
    createArm(false);

    // ─── PIERNAS BIOMECÁNICAS (CADERAS -> MUSLOS -> RODILLAS -> GEMELOS -> PIES) ───
    const stanceWidth = 0.45;

    // Pierna Izquierda
    const leftThigh = new THREE.Group();
    leftThigh.position.set(stanceWidth, 0, 0);
    hips.add(leftThigh);
    leftThighRef.current = leftThigh;

    const leftHipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), jointMaterial);
    leftThigh.add(leftHipJoint);

    const leftFemurMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.62, 8, 16), suitMaterial);
    leftFemurMesh.position.y = -0.38;
    leftThigh.add(leftFemurMesh);

    // Cuádriceps activo izquierdo (Heatmap frontal)
    const leftQuadGlow = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.52, 8, 16), quadMat);
    leftQuadGlow.position.set(0, -0.36, 0.08);
    leftThigh.add(leftQuadGlow);

    const leftKnee = new THREE.Group();
    leftKnee.position.y = -0.76;
    leftThigh.add(leftKnee);
    leftKneeRef.current = leftKnee;

    const leftKneeCap = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), jointMaterial);
    leftKnee.add(leftKneeCap);

    const leftCalf = new THREE.Group();
    leftKnee.add(leftCalf);
    leftCalfRef.current = leftCalf;

    const leftTibiaMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.58, 8, 16), suitMaterial);
    leftTibiaMesh.position.y = -0.36;
    leftCalf.add(leftTibiaMesh);

    // Zapatilla de levantamiento izquierda
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.46), bumperRingMat);
    leftShoe.position.set(0, -0.72, 0.1);
    leftCalf.add(leftShoe);

    // Pierna Derecha
    const rightThigh = new THREE.Group();
    rightThigh.position.set(-stanceWidth, 0, 0);
    hips.add(rightThigh);
    rightThighRef.current = rightThigh;

    const rightHipJoint = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), jointMaterial);
    rightThigh.add(rightHipJoint);

    const rightFemurMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.62, 8, 16), suitMaterial);
    rightFemurMesh.position.y = -0.38;
    rightThigh.add(rightFemurMesh);

    // Cuádriceps activo derecho (Heatmap frontal)
    const rightQuadGlow = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.52, 8, 16), quadMat);
    rightQuadGlow.position.set(0, -0.36, 0.08);
    rightThigh.add(rightQuadGlow);

    const rightKnee = new THREE.Group();
    rightKnee.position.y = -0.76;
    rightThigh.add(rightKnee);
    rightKneeRef.current = rightKnee;

    const rightKneeCap = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), jointMaterial);
    rightKnee.add(rightKneeCap);

    const rightCalf = new THREE.Group();
    rightKnee.add(rightCalf);
    rightCalfRef.current = rightCalf;

    const rightTibiaMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 0.58, 8, 16), suitMaterial);
    rightTibiaMesh.position.y = -0.36;
    rightCalf.add(rightTibiaMesh);

    // Zapatilla de levantamiento derecha
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.12, 0.46), bumperRingMat);
    rightShoe.position.set(0, -0.72, 0.1);
    rightCalf.add(rightShoe);

    // ─── GONIÓMETRO HUD VIRTUAL 3D (ÁNGULO DE RODILLA) ───
    const angleRingGeo = new THREE.RingGeometry(0.3, 0.34, 32);
    const angleRingMat = new THREE.MeshBasicMaterial({
      color: 0xd4fb34,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const angleRingMesh = new THREE.Mesh(angleRingGeo, angleRingMat);
    angleRingMesh.position.set(stanceWidth + 0.22, 0.85, 0);
    angleRingMesh.rotation.y = Math.PI / 2;
    athleteRoot.add(angleRingMesh);
    angleRingMeshRef.current = angleRingMesh;

    // Vector de fuerza vertical reactiva contra el suelo
    const forceGroup = new THREE.Group();
    const forceLine = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 2.4, 16),
      new THREE.MeshBasicMaterial({ color: 0xd4fb34, transparent: true, opacity: 0.55 })
    );
    forceLine.position.y = 1.2;
    forceGroup.add(forceLine);
    athleteRoot.add(forceGroup);
    forceVectorMeshRef.current = forceGroup;

    // ─── CAMPO DE PARTÍCULAS CINÉTICAS ───
    const pCount = 240;
    const pPositions = new Float32Array(pCount * 3);
    const pColors = new Float32Array(pCount * 3);
    const cLime = new THREE.Color(0xd4fb34);
    const cWhite = new THREE.Color(0xffffff);

    for (let i = 0; i < pCount; i++) {
      const radius = 1.8 + Math.random() * 3.8;
      const theta = Math.random() * Math.PI * 2;
      const y = Math.random() * 4.2;

      pPositions[i * 3] = radius * Math.cos(theta);
      pPositions[i * 3 + 1] = y;
      pPositions[i * 3 + 2] = radius * Math.sin(theta);

      const color = Math.random() > 0.4 ? cLime : cWhite;
      pColors[i * 3] = color.r;
      pColors[i * 3 + 1] = color.g;
      pColors[i * 3 + 2] = color.b;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPositions, 3));
    pGeo.setAttribute("color", new THREE.BufferAttribute(pColors, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ─── RESIZE ADAPTABLE A MÓVILES Y PANTALLAS GRANDES ───
    const handleResize = () => {
      if (!canvasContainerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = canvasContainerRef.current.clientWidth;
      const h = canvasContainerRef.current.clientHeight;
      if (w === 0 || h === 0) return;

      cameraRef.current.aspect = w / h;
      if (w < 640) {
        cameraRef.current.position.set(0, 1.2, 9.4);
      } else if (w < 1024) {
        cameraRef.current.position.set(0, 1.2, 8.4);
      } else {
        cameraRef.current.position.set(0, 1.2, 7.6);
      }
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // ─── LOOP DE CINEMÁTICA Y RENDERIZADO 60-120 FPS ───
    const clock = new THREE.Clock();

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Suavizado Lerp del progreso de scroll
      currentProgressRef.current += (targetProgressRef.current - currentProgressRef.current) * 0.09;
      const p = currentProgressRef.current;

      // Suavizado del ratón / interacción táctil
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;

      // ─── CÁLCULO CINEMÁTICO DE LA SENTADILLA (SQUAT) ───
      // p va de 0.0 a 1.0 a lo largo del scroll
      // 0.0 -> De pie erguido
      // 0.55 -> Fondo máximo (profundidad 88°)
      // 1.0 -> Extensión completa / Bloqueo
      let depthFactor = 0;
      if (p <= 0.55) {
        // Fase excéntrica: baja suavemente
        depthFactor = Math.sin((p / 0.55) * (Math.PI / 2));
      } else {
        // Fase concéntrica: sube con aceleración
        const returnT = (p - 0.55) / 0.45;
        depthFactor = Math.cos(returnT * (Math.PI / 2));
      }

      // 1. Altura de las caderas (Hips Drop)
      // De pie = 1.65m; Profundidad máxima = 0.88m
      const hipY = 1.65 - depthFactor * 0.77;
      const hipZ = -depthFactor * 0.28; // Las caderas van hacia atrás para mantener equilibrio
      if (hipsRef.current) {
        hipsRef.current.position.y = hipY;
        hipsRef.current.position.z = hipZ;
      }

      // 2. Inclinación del torso (Spine Angle)
      // Mantiene la barra de 140kg exactamente alineada sobre el mediopié
      if (spineRef.current) {
        spineRef.current.rotation.x = depthFactor * 0.46; // ~26° de inclinación anterior
      }

      // 3. Flexión de Caderas / Muslos (Thigh Rotation)
      const thighAngle = -depthFactor * 1.52; // ~87° de flexión
      if (leftThighRef.current && rightThighRef.current) {
        leftThighRef.current.rotation.x = thighAngle;
        rightThighRef.current.rotation.x = thighAngle;
      }

      // 4. Flexión de Rodillas (Knee Joint Rotation)
      const kneeAngle = depthFactor * 2.38; // ~136° de flexión interna
      if (leftKneeRef.current && rightKneeRef.current) {
        leftKneeRef.current.rotation.x = kneeAngle;
        rightKneeRef.current.rotation.x = kneeAngle;
      }

      // 5. Inclinación de la tibia para dorsiflexión
      const calfCounterAngle = -depthFactor * 0.42;
      if (leftCalfRef.current && rightCalfRef.current) {
        leftCalfRef.current.rotation.x = calfCounterAngle;
        rightCalfRef.current.rotation.x = calfCounterAngle;
      }

      // 6. Actualización dinámica del Goniómetro de Rodilla
      if (angleRingMeshRef.current) {
        angleRingMeshRef.current.position.y = hipY - 0.76 * Math.cos(depthFactor * 1.2);
        angleRingMeshRef.current.position.z = hipZ + 0.3 * Math.sin(depthFactor * 1.2);
        angleRingMeshRef.current.scale.set(
          1 + depthFactor * 0.3,
          1 + depthFactor * 0.3,
          1 + depthFactor * 0.3
        );
      }

      // 7. Heatmap muscular activo (Cuádriceps y Glúteos brillan con la tensión)
      const tensionIntensity = 0.4 + depthFactor * 2.8;
      if (quadMaterialRef.current) {
        quadMaterialRef.current.emissiveIntensity = tensionIntensity;
      }
      if (gluteMaterialRef.current) {
        gluteMaterialRef.current.emissiveIntensity = 0.3 + depthFactor * 3.2;
      }
      if (coreMaterialRef.current) {
        coreMaterialRef.current.emissiveIntensity = 0.4 + depthFactor * 1.6;
      }

      // 8. Rotación orbital de la escena
      if (athleteRootRef.current) {
        const autoSpin = autoRotateRef.current ? elapsedTime * 0.5 : 0;
        // Vista en 3/4 dinámica que gira suavemente conforme bajas
        const baseRotY = 0.45 + p * 0.9 + autoSpin;
        athleteRootRef.current.rotation.y =
          baseRotY + mouseRef.current.x * 0.6 + userRotationRef.current.y;
        athleteRootRef.current.rotation.x =
          mouseRef.current.y * 0.3 + userRotationRef.current.x;
      }

      // Partículas flotando suavemente
      particles.rotation.y = elapsedTime * 0.04;

      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // 2. Control de visibilidad del Heatmap muscular
  useEffect(() => {
    if (quadMaterialRef.current && gluteMaterialRef.current && coreMaterialRef.current) {
      const baseEmissive = showMusclesHeatmap ? 1.0 : 0.05;
      quadMaterialRef.current.emissiveIntensity = baseEmissive;
      gluteMaterialRef.current.emissiveIntensity = baseEmissive;
      coreMaterialRef.current.emissiveIntensity = baseEmissive;
    }
  }, [showMusclesHeatmap]);

  // 3. Cálculo sincronizado de scroll con requestAnimationFrame
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!wrapperRef.current) {
            ticking = false;
            return;
          }
          const rect = wrapperRef.current.getBoundingClientRect();
          const totalScrollable = wrapperRef.current.offsetHeight - window.innerHeight;

          if (totalScrollable <= 0) {
            ticking = false;
            return;
          }

          const progress = Math.max(0, Math.min(1, -rect.top / totalScrollable));
          targetProgressRef.current = progress;
          setScrollProgress(progress);

          const stageIndex = Math.min(
            STAGES.length - 1,
            Math.floor(progress * STAGES.length)
          );
          setActiveStage(stageIndex);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 4. Manejo de ratón para rotar 360° la visualización
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mouseRef.current.targetX = x;
    mouseRef.current.targetY = y;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;
      userRotationRef.current.y = dragStartRef.current.rotY + deltaX * 0.008;
      userRotationRef.current.x = dragStartRef.current.rotX + deltaY * 0.008;
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: userRotationRef.current.x,
      rotY: userRotationRef.current.y,
    };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // 5. Manejo táctil interactivo en móviles y tablets
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      isDraggingRef.current = true;
      dragStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        rotX: userRotationRef.current.x,
        rotY: userRotationRef.current.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isDraggingRef.current && e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartRef.current.x;
      const deltaY = touch.clientY - dragStartRef.current.y;
      userRotationRef.current.y = dragStartRef.current.rotY + deltaX * 0.01;
      userRotationRef.current.x = dragStartRef.current.rotX + deltaY * 0.01;
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Navegación fluida por etapas
  const scrollToStage = useCallback((index: number) => {
    if (!wrapperRef.current) return;
    const wrapperTop = wrapperRef.current.offsetTop;
    const totalScrollable = wrapperRef.current.offsetHeight - window.innerHeight;
    const targetScrollY = wrapperTop + (index / (STAGES.length - 1)) * totalScrollable;

    window.scrollTo({
      top: targetScrollY,
      behavior: "smooth",
    });
  }, []);

  const reset3DView = () => {
    userRotationRef.current = { x: 0.1, y: 0.35 };
    mouseRef.current = { x: 0, y: 0, targetX: 0, targetY: 0 };
  };

  const currentStageData = STAGES[activeStage];

  return (
    <section
      ref={wrapperRef}
      id="ingenieria-3d"
      className="relative w-full min-h-[350vh] bg-black text-white"
    >
      {/* ─── CONTENEDOR FIJO / STICKY 100VH ─── */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between select-none">
        {/* Glows atléticos de fondo */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[750px] rounded-full pointer-events-none opacity-20 blur-[180px] -z-10"
          style={{ backgroundColor: "var(--color-primary)" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,251,52,0.04)_0%,transparent_75%)] pointer-events-none -z-10" />

        {/* ─── 1. BARRA SUPERIOR HUD DEPORTIVO ─── */}
        <div className="relative z-20 px-5 sm:px-10 pt-5 sm:pt-7 flex items-center justify-between border-b border-white/5 pb-3 bg-black/50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex h-2.5 w-2.5 rounded-full bg-[var(--color-primary)] animate-ping" />
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] font-mono text-[var(--color-primary)]">
                {locale === "es" ? "BIOMECÁNICA 3D · ANÁLISIS DEPORTIVO" : "3D BIOMECHANICS · LIFTING ANALYSIS"}
              </span>
              <span className="hidden sm:inline text-neutral-600 text-xs font-mono">|</span>
              <span className="text-[10px] font-mono text-neutral-400 hidden sm:inline flex items-center gap-1">
                <Dumbbell size={12} className="text-[var(--color-primary)] inline" />
                SENTADILLA TRASERA 140 KG · TEMPO CONTROLADO
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Heatmap Muscular */}
            <button
              onClick={() => setShowMusclesHeatmap((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer border ${
                showMusclesHeatmap
                  ? "bg-[var(--color-primary)] text-black border-[var(--color-primary)] shadow-[0_0_12px_rgba(212,251,52,0.4)]"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:border-[var(--color-primary)]/40"
              }`}
              title="Alternar Heatmap de activación muscular"
            >
              <Flame size={12} className={showMusclesHeatmap ? "text-black" : "text-[var(--color-primary)]"} />
              <span>{showMusclesHeatmap ? "HEATMAP: ON" : "HEATMAP"}</span>
            </button>

            {/* Toggle Auto-giro */}
            <button
              onClick={() => setAutoRotate((prev) => !prev)}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-mono font-bold transition-all cursor-pointer border ${
                autoRotate
                  ? "bg-[var(--color-primary)] text-black border-[var(--color-primary)] shadow-[0_0_12px_rgba(212,251,52,0.4)]"
                  : "bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:border-[var(--color-primary)]/40"
              }`}
              title="Giro automático 360°"
            >
              <Rotate3d size={12} className={autoRotate ? "text-black" : "text-[var(--color-primary)]"} />
              <span>{autoRotate ? "AUTO 360°: ON" : "AUTO 360°"}</span>
            </button>

            {/* Reset Vista */}
            <button
              onClick={reset3DView}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] sm:text-xs font-mono font-bold text-neutral-300 transition-all cursor-pointer hover:border-[var(--color-primary)]/40"
              title="Restablecer ángulo frontal"
            >
              <Rotate3d size={12} className="text-[var(--color-primary)]" />
              <span>{locale === "es" ? "Frontal" : "Front"}</span>
            </button>

            {/* Indicador de scroll */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono text-neutral-400">
              <Compass size={12} className="text-[var(--color-primary)]" />
              <span>{Math.round(scrollProgress * 100)}% SCROLL</span>
            </div>
          </div>
        </div>

        {/* ─── 2. CUERPO CENTRAL: LIENZO 3D + PANEL DE MÉTRICAS BIOMECÁNICAS ─── */}
        <div className="relative flex-1 w-full max-w-7xl mx-auto px-5 sm:px-8 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-6 pointer-events-none">
          {/* COLUMNA IZQUIERDA: INFORMACIÓN BIOMECÁNICA DINÁMICA */}
          <div className="w-full lg:max-w-md xl:max-w-lg z-20 space-y-4 pointer-events-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStage}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -22 }}
                transition={{ duration: 0.32, ease: "easeOut" }}
                className="space-y-3.5"
              >
                {/* Badge de fase deportiva */}
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 text-[var(--color-primary)] text-[10px] sm:text-xs font-black uppercase font-mono tracking-wider backdrop-blur-md shadow-[0_0_15px_rgba(212,251,52,0.12)]">
                  <Activity size={12} />
                  <span>
                    {locale === "es" ? currentStageData.badge : currentStageData.badgeEn}
                  </span>
                </div>

                {/* Título de la fase de movimiento */}
                <h2 className="text-3xl sm:text-4xl xl:text-5xl font-black uppercase tracking-tight text-white leading-none drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
                  {locale === "es" ? currentStageData.titulo : currentStageData.tituloEn}
                </h2>

                <div className="flex items-center gap-3 text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase">
                  <span className="text-[var(--color-primary)] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--color-primary)] animate-pulse" />
                    {locale === "es" ? currentStageData.fase : currentStageData.faseEn}
                  </span>
                  <span className="text-neutral-500">|</span>
                  <span className="text-neutral-300">
                    RODILLA: {currentStageData.anguloRodilla}
                  </span>
                </div>

                {/* Descripción biomecánica */}
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
                  {locale === "es" ? currentStageData.descripcion : currentStageData.descripcionEn}
                </p>

                {/* Tarjetas de telemetría deportiva */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {currentStageData.metricas.map((m, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
                        m.destacado
                          ? "bg-[var(--color-primary)]/10 border-[var(--color-primary)]/40 shadow-[0_0_24px_rgba(212,251,52,0.15)]"
                          : "bg-neutral-900/60 border-white/10 hover:border-white/20"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
                          {locale === "es" ? m.etiqueta : m.etiquetaEn}
                        </p>
                        {m.subvalor && (
                          <span className="text-[9px] font-mono text-[var(--color-primary)]/80">
                            {m.subvalor}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-base sm:text-lg font-black font-mono tracking-tight mt-1 ${
                          m.destacado ? "text-[var(--color-primary)]" : "text-white"
                        }`}
                      >
                        {m.valor}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* CTA y aviso de scroll */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link to="/registro">
                <button
                  className="px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest text-black transition-all flex items-center gap-1.5 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
                  style={{ backgroundColor: "var(--color-primary)" }}
                >
                  <span>{locale === "es" ? "ENTRENAR AHORA" : "START LIFTING"}</span>
                  <ArrowUpRight size={14} />
                </button>
              </Link>
              <span className="text-[10px] font-mono text-neutral-400 flex items-center gap-1.5 bg-white/5 px-3 py-2 rounded-full border border-white/5">
                <Zap size={12} className="text-[var(--color-primary)]" />
                <span>
                  {locale === "es"
                    ? "Scrollea para controlar la repetición del atleta"
                    : "Scroll down to drive the athlete's squat"}
                </span>
              </span>
            </div>
          </div>

          {/* COLUMNA CENTRAL / DERECHA: LIENZO THREE.JS DEL ATLETA */}
          <div
            ref={canvasContainerRef}
            onMouseMove={handleMouseMove}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className="absolute inset-0 lg:relative lg:inset-auto lg:flex-1 h-full min-h-[360px] w-full cursor-grab active:cursor-grabbing pointer-events-auto"
            title="Arrastra para rotar la técnica del atleta en 360°"
          >
            {/* Aviso interactivo de técnica */}
            <div className="absolute bottom-6 right-6 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-neutral-300 pointer-events-none shadow-xl">
              <Rotate3d
                size={13}
                className="text-[var(--color-primary)] animate-spin"
                style={{ animationDuration: "8s" }}
              />
              <span>{locale === "es" ? "Arrastra para ver técnica 360°" : "Drag to view 360° form"}</span>
            </div>

            {/* Telemetría HUD de esquina */}
            <div className="absolute top-4 right-6 z-10 hidden md:flex flex-col items-end gap-1 font-mono text-[9px] text-neutral-400 pointer-events-none">
              <div className="flex items-center gap-1 text-[var(--color-primary)] font-bold">
                <CheckCircle2 size={11} />
                <span>DAILYSET_VBT_RADAR v3.1</span>
              </div>
              <span>BAR_PATH: 99.4% VERTICAL</span>
              <span>CARGA: 140.0 KG | IPF CALIBRATED</span>
              <span className="text-neutral-500">
                GONIO: {currentStageData.anguloRodilla}
              </span>
            </div>
          </div>
        </div>

        {/* ─── 3. BARRA INFERIOR: FASES DE LA REPETICIÓN & PROGRESO ─── */}
        <div className="relative z-20 px-5 sm:px-10 pb-5 sm:pb-7 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 bg-black/70 backdrop-blur-md pt-4">
          {/* Botones de navegación directa entre fases del ejercicio */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
            {STAGES.map((stg, i) => {
              const isSelected = activeStage === i;
              return (
                <button
                  key={stg.id}
                  onClick={() => scrollToStage(i)}
                  className={`px-3.5 sm:px-4 py-2 rounded-xl text-[10px] sm:text-xs font-black font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    isSelected
                      ? "bg-[var(--color-primary)] text-black shadow-[0_0_18px_rgba(212,251,52,0.4)] scale-105"
                      : "bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white border border-white/5"
                  }`}
                >
                  <span className="opacity-70">0{i + 1}</span>
                  <span>
                    {locale === "es"
                      ? i === 0
                        ? "01 Setup"
                        : i === 1
                        ? "02 Descenso"
                        : i === 2
                        ? "03 Paralela (90°)"
                        : "04 Bloqueo"
                      : i === 0
                      ? "01 Setup"
                      : i === 1
                      ? "02 Eccentric"
                      : i === 2
                      ? "03 Parallel (90°)"
                      : "04 Lockout"}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Barra de progreso de la repetición */}
          <div className="w-full sm:w-64 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-neutral-400">
              <span className="flex items-center gap-1">
                <Activity size={11} className="text-[var(--color-primary)]" />
                <span>{locale === "es" ? "REP EN CURSO" : "REP PROGRESS"}</span>
              </span>
              <span className="text-[var(--color-primary)]">
                {Math.round(scrollProgress * 100)}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-[var(--color-primary)] transition-all duration-100 ease-out rounded-full shadow-[0_0_8px_var(--color-primary)]"
                style={{ width: `${Math.max(5, scrollProgress * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
