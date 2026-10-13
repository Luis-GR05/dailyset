import React, {
  useRef,
  useState,
  useEffect,
  useImperativeHandle,
  useSyncExternalStore,
  forwardRef,
} from "react";
import * as THREE from "three";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

export interface CarouselItem {
  id?: string;
  tag?: string;
  tagEn?: string;
  titulo?: string;
  tituloEn?: string;
  subtitulo?: string;
  subtituloEn?: string;
  detalles?: string;
  detallesEn?: string;
  tasa?: string;
  tasaEn?: string;
  imagen?: string;
  src?: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  href?: string;
}

export interface ConcaveCarouselRef {
  next: () => void;
  previous: () => void;
  goTo: (index: number) => void;
}

export interface ConcaveCarouselProps {
  items: CarouselItem[];
  startIndex?: number;
  aspect?: number;
  size?: number;
  curvature?: number;
  distance?: number;
  tilt?: number;
  gap?: number;
  radius?: number;
  reflection?: number;
  dim?: number;
  autoplay?: "drift" | "step" | "off";
  speed?: number;
  interval?: number;
  snap?: boolean;
  inertia?: number;
  pauseOnHover?: boolean;
  draggable?: boolean;
  wheel?: boolean;
  captions?: boolean;
  controls?: boolean;
  backgroundColor?: string;
  paused?: boolean;
  dpr?: number;
  ariaLabel?: string;
  locale?: string;
  onIndexChange?: (index: number) => void;
  onSelect?: (item: CarouselItem, index: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

/* ─── Math & Constants ─── */
const RAD_52 = (52 * Math.PI) / 180;
const TWO_PI = 2 * Math.PI;
const clamp = (val: number, min: number, max: number) =>
  Math.min(max, Math.max(min, val));

const subscribeReducedMotion = (cb: () => void) => {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const getReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ─── Shaders ─── */
const vertexShader = `
uniform float uCenter;
uniform float uWidth;
uniform float uK;
uniform float uFloor;
uniform float uMirror;
varying vec2 vUv;
varying float vLift;

void main() {
  vUv = uv;
  float s = uCenter + (uv.x - 0.5) * uWidth;
  float y = uv.y - 0.5;
  float x = s;
  float z = 0.0;
  if (uK > 1e-5) {
    float a = s * uK;
    float h = sin(a * 0.5);
    x = sin(a) / uK;
    z = 2.0 * h * h / uK;
  }
  vLift = y - uFloor;
  if (uMirror > 0.5) y = 2.0 * uFloor - y;
  gl_Position = projectionMatrix * viewMatrix * vec4(x, y, z, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform sampler2D uImage;
uniform float uImageAspect;
uniform float uWidth;
uniform float uRadius;
uniform float uLoaded;
uniform float uAlpha;
uniform float uMirror;
uniform float uReflect;
uniform float uDim;
uniform float uHover;
uniform vec2 uResolution;
uniform vec3 uPlaceholder;
varying vec2 vUv;
varying float vLift;

float roundBox(vec2 p, vec2 b, float r) {
  vec2 q = abs(p) - b + r;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
}

void main() {
  vec2 size = vec2(uWidth, 1.0);
  vec2 p = (vUv - 0.5) * size;
  float lift = max(vLift, 0.0);
  float mirror = step(0.5, uMirror);
  float soft = 1.0 + mirror * lift * 26.0;
  float d = roundBox(p, size * 0.5, min(uRadius, 0.5 * min(size.x, size.y)));
  float aa = max(fwidth(d), 1e-5) * 0.7 * soft;
  float mask = 1.0 - smoothstep(-aa, aa, d);

  float fade = mix(1.0, uReflect * pow(1.0 - clamp(lift / 0.62, 0.0, 1.0), 2.2), mirror);
  float edge = abs(gl_FragCoord.x / uResolution.x * 2.0 - 1.0);
  float vignette = 1.0 - uDim * smoothstep(0.18, 1.05, edge) * (1.0 - 0.85 * uHover);
  float alpha = mask * fade * vignette * uAlpha;
  if (alpha < 0.002) discard;

  float panelAspect = size.x / size.y;
  vec2 uv = vUv - 0.5;
  if (panelAspect > uImageAspect) {
    uv.y *= uImageAspect / panelAspect;
  } else {
    uv.x *= panelAspect / uImageAspect;
  }
  uv += 0.5;
  float blur = 1.0 + mirror * lift * 30.0;
  vec3 color = textureGrad(uImage, uv, dFdx(uv) * blur, dFdy(uv) * blur).rgb;

  float loaded = clamp(uLoaded, 0.0, 1.0);
  vec3 rgb = mix(uPlaceholder, color, loaded);
  alpha *= mix(0.08, 1.0, loaded);
  gl_FragColor = vec4(rgb * alpha, alpha);
}
`;

interface InternalTextureItem {
  image: HTMLImageElement;
  texture: THREE.Texture;
  aspect: number;
  ready: boolean;
  uploaded: boolean;
  fade: number;
}

interface PointerDragState {
  id: number;
  x: number;
  y: number;
  grab: number;
  origin: number;
  moved: boolean;
  samples: { t: number; p: number }[];
}

const ConcaveCarousel = forwardRef<ConcaveCarouselRef, ConcaveCarouselProps>(
  function ConcaveCarousel(
    {
      items,
      startIndex = 0,
      aspect = 1.25,
      size = 0.46,
      curvature = 0.72,
      distance = 4.0,
      tilt = 0,
      gap = 16,
      radius = 14,
      reflection = 0.08,
      dim = 0.35,
      autoplay = "drift",
      speed = 0.16,
      interval = 4,
      snap = true,
      inertia = 0.5,
      pauseOnHover = true,
      draggable = true,
      wheel = true,
      captions = true,
      controls = true,
      backgroundColor = "transparent",
      paused = false,
      dpr = 2,
      ariaLabel = "Concave carousel",
      locale = "es",
      onIndexChange,
      onSelect,
      className = "",
      style,
    },
    ref
  ) {
    const rootRef = useRef<HTMLDivElement>(null);
    const canvasWrapRef = useRef<HTMLDivElement>(null);
    const captionsWrapRef = useRef<HTMLDivElement>(null);
    const controllerRef = useRef<{
      sync: () => void;
      step: (n: number) => void;
      goTo: (n: number) => void;
      destroy: () => void;
    } | null>(null);

    const isReduced = useSyncExternalStore(
      subscribeReducedMotion,
      getReducedMotion,
      () => false
    );

    const normalizedItems = items.length ? items : [];
    const itemsRef = useRef(normalizedItems);
    const initialIndex = clamp(Math.round(startIndex), 0, Math.max(normalizedItems.length - 1, 0));
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [isHeld, setIsHeld] = useState(false);
    const [hasWebGL, setHasWebGL] = useState(true);
    const [controlsTop, setControlsTop] = useState<number | null>(null);

    const config = {
      aspect,
      size,
      curvature,
      distance,
      tilt,
      gap,
      radius,
      reflection,
      dim,
      autoplay,
      speed,
      interval,
      snap,
      inertia,
      pauseOnHover,
      draggable,
      wheel,
      captions,
      controls,
      backgroundColor,
      paused,
      dpr,
      reduced: isReduced,
      held: isHeld,
      locale,
    };
    const configRef = useRef(config);
    const callbacksRef = useRef({ onIndexChange, onSelect });

    useEffect(() => {
      configRef.current = config;
      itemsRef.current = normalizedItems;
      callbacksRef.current = { onIndexChange, onSelect };
      controllerRef.current?.sync();
    });

    useImperativeHandle(
      ref,
      () => ({
        next: () => controllerRef.current?.step(1),
        previous: () => controllerRef.current?.step(-1),
        goTo: (idx: number) => controllerRef.current?.goTo(idx),
      }),
      []
    );

    useEffect(() => {
      const root = rootRef.current;
      const canvasWrap = canvasWrapRef.current;
      const captionsWrap = captionsWrapRef.current;
      if (!root || !canvasWrap || !captionsWrap) return;

      const doc = root.ownerDocument;
      const canvas = doc.createElement("canvas");
      canvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block;";

      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
          premultipliedAlpha: true,
          powerPreference: "high-performance",
        });
      } catch {
        setHasWebGL(false);
        return;
      }

      canvasWrap.appendChild(canvas);
      renderer.setClearColor(0, 0);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, 0.02, 400);
      const geometry = new THREE.PlaneGeometry(1, 1, 72, 1);

      const placeholderData = new Uint8Array([28, 28, 30, 255]);
      const placeholderTexture = new THREE.DataTexture(placeholderData, 1, 1);
      placeholderTexture.needsUpdate = true;

      const resolution = new THREE.Vector2(1, 1);
      const placeholderColor = new THREE.Color(0.12, 0.12, 0.14);
      const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

      const createMaterial = (isMirror: boolean) =>
        new THREE.ShaderMaterial({
          uniforms: {
            uImage: { value: placeholderTexture },
            uImageAspect: { value: 1.5 },
            uCenter: { value: 0 },
            uWidth: { value: 1.3 },
            uK: { value: 0.3 },
            uFloor: { value: -0.535 },
            uMirror: { value: isMirror ? 1 : 0 },
            uRadius: { value: 0.04 },
            uLoaded: { value: 0 },
            uAlpha: { value: 1 },
            uReflect: { value: 0 },
            uDim: { value: 0 },
            uHover: { value: 0 },
            uResolution: { value: resolution },
            uPlaceholder: { value: placeholderColor },
          },
          vertexShader,
          fragmentShader,
          transparent: true,
          premultipliedAlpha: true,
          depthTest: false,
          depthWrite: false,
          side: THREE.DoubleSide,
        });

      // 28 panel slots (mesh + reflection mirror)
      const slots = Array.from({ length: 28 }, () => {
        const mirror = new THREE.Mesh(geometry, createMaterial(true));
        const mesh = new THREE.Mesh(geometry, createMaterial(false));
        mirror.frustumCulled = false;
        mesh.frustumCulled = false;
        mirror.visible = false;
        mesh.visible = false;
        mirror.renderOrder = 0;
        mesh.renderOrder = 1;
        scene.add(mirror);
        scene.add(mesh);
        return { mesh, mirror };
      });

      // Caption elements layer
      const captionNodes = Array.from({ length: 5 }, () => {
        const wrap = doc.createElement("div");
        wrap.setAttribute("aria-hidden", "true");
        wrap.style.cssText =
          "position:absolute;left:0;top:0;display:flex;flex-direction:column;align-items:center;gap:3px;text-align:center;white-space:nowrap;opacity:0;pointer-events:none;will-change:transform,opacity;transform:translate(-50%, 0);";

        const title = doc.createElement("span");
        title.style.cssText =
          "font-size:16px;font-weight:900;text-transform:uppercase;letter-spacing:0.04em;color:#ffffff;line-height:1.2;text-shadow:0 2px 10px rgba(0,0,0,0.8);";

        const sub = doc.createElement("span");
        sub.style.cssText =
          "font-size:12px;font-weight:600;color:rgba(212,251,52,0.9);letter-spacing:0.06em;text-transform:uppercase;line-height:1.3;";

        wrap.appendChild(title);
        wrap.appendChild(sub);
        captionsWrap.appendChild(wrap);

        return {
          node: wrap,
          title,
          subtitle: sub,
          index: NaN,
          opacity: -1,
          x: NaN,
          y: NaN,
        };
      });

      let textureList: InternalTextureItem[] = [];
      let loadedSrcKey = "";
      let viewportW = 0;
      let viewportH = 0;
      let pixelRatio = 1;
      let hasSize = false;

      let currentPos = initialIndex;
      let currentVel = 0;
      let targetPos: number | null = initialIndex;
      let dragMomentum = 0;
      let driftFactor = 1;
      let pauseUntil = 0;
      let stepTimer = 0;
      let isWheelActive = false;
      let wheelLastTime = 0;
      let introProgress = 0;
      let introOffset = 0;
      let introDone = false;
      let introStartTime = 0;
      let rafId = 0;
      let timeoutId = 0;
      let lastTime = 0;
      let isIntersecting = false;
      let isDestroyed = false;
      let isContextLost = false;
      let didDragMove = false;
      let isHovering = false;
      let hoverIndex: number | null = null;
      const hoverOpacityMap = new Map<number, number>();
      let lastReportedIndex = NaN;
      let lastControlsTop = NaN;
      let pointerState: PointerDragState | null = null;

      const layout = {
        labelGap: 24,
        controlsTop: 24,
        unit: 1,
        pitch: 1.3,
        width: 1.25,
        k: 0.3,
        distance: 2.2,
        lift: 0,
        radius: 0.04,
      };

      const getNumItems = () => Math.max(itemsRef.current.length, 1);
      const wrapIndex = (i: number) => {
        const n = getNumItems();
        return ((i % n) + n) % n;
      };

      const syncTextures = () => {
        const curItems = itemsRef.current;
        const key = curItems
          .map((it) => it.src || it.imagen || "")
          .join("\0");
        if (key === loadedSrcKey) return;
        loadedSrcKey = key;

        captionNodes.forEach((cn) => {
          cn.index = NaN;
        });
        textureList.forEach((t) => {
          t.image.onload = null;
          t.texture.dispose();
        });

        const n = Math.max(curItems.length, 1);
        const centerIdx = wrapIndex(Math.round(currentPos));

        textureList = curItems.map((item, idx) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.decoding = "async";

          const distFromCenter = Math.abs(idx - centerIdx) % n;
          const minCircularDist = Math.min(distFromCenter, n - distFromCenter);
          img.fetchPriority = minCircularDist <= 2 ? "high" : "low";

          const tex = new THREE.Texture(img);
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = true;
          tex.anisotropy = maxAniso;

          const itemObj: InternalTextureItem = {
            image: img,
            texture: tex,
            aspect: 1.5,
            ready: false,
            uploaded: false,
            fade: 0,
          };

          img.onload = () => {
            if (isDestroyed) return;
            itemObj.aspect =
              img.naturalWidth / Math.max(img.naturalHeight, 1);
            itemObj.ready = true;
            tex.needsUpdate = true;
            scheduleRender();
          };

          img.src = item.src || item.imagen || "";
          return itemObj;
        });
      };

      const updateViewport = () => {
        const cfg = configRef.current;
        const w = Math.round(root.clientWidth);
        const h = Math.round(root.clientHeight);
        if (w < 2 || h < 2) {
          hasSize = false;
          return false;
        }
        const pr = Math.min(window.devicePixelRatio || 1, Math.max(cfg.dpr, 0.5));
        if (!hasSize || w !== viewportW || h !== viewportH || pr !== pixelRatio) {
          hasSize = true;
          viewportW = w;
          viewportH = h;
          pixelRatio = pr;
          renderer.setPixelRatio(pixelRatio);
          renderer.setSize(viewportW, viewportH, false);
          resolution.set(viewportW * pixelRatio, viewportH * pixelRatio);
          return true;
        }
        return false;
      };

      const projectArcPoint = (s: number, y: number, out: THREE.Vector3) => {
        const k = layout.k;
        if (k > 1e-5) {
          const a = s * k;
          const h = Math.sin(a * 0.5);
          out.set(Math.sin(a) / k, y, (2 * h * h) / k);
        } else {
          out.set(s, y, 0);
        }
        return out;
      };

      const tempVec = new THREE.Vector3();
      const isAngleFacingCamera = (s: number) => {
        const k = layout.k;
        if (k <= 1e-5) return true;
        const r = 1 / k;
        return r + (layout.distance - r) * Math.cos(s * k) > 0.02 * r;
      };

      const projectToScreenX = (s: number) => {
        projectArcPoint(s, 0, tempVec).project(camera);
        return tempVec.z > 1 ? NaN : tempVec.x;
      };

      const projectToScreenY = (s: number, y: number) => {
        projectArcPoint(s, y, tempVec).project(camera);
        return ((1 - tempVec.y) / 2) * viewportH;
      };

      const updateCamera = () => {
        const cfg = configRef.current;
        const hFactor = clamp(viewportH / 620, 0.72, 1.15);
        const labelGap = 24 * hFactor;
        const captionsHeight = cfg.captions ? labelGap + 42 + 34 * hFactor : labelGap;
        const controlsHeight = cfg.controls ? captionsHeight + 36 : cfg.captions ? labelGap + 42 : 0;

        layout.labelGap = labelGap;
        layout.controlsTop = captionsHeight;

        const effectiveH = Math.max(viewportH - controlsHeight, 0.55 * viewportH);
        const asp = clamp(cfg.aspect, 0.4, 3.5);
        let panelH = clamp(cfg.size, 0.15, 0.95) * effectiveH;
        const dist = clamp(cfg.distance, 0.9, 12);

        const maxTan = Math.tan((62 * Math.PI) / 180);
        if (viewportW / panelH / 2 / dist > maxTan) {
          panelH = viewportW / 2 / dist / maxTan;
        }

        const gapNorm = Math.max(0, cfg.gap) / panelH;
        layout.unit = panelH;
        layout.width = asp;
        layout.pitch = asp + gapNorm;
        layout.k = (clamp(cfg.curvature, 0, 1) * RAD_52) / layout.pitch;
        layout.distance = dist;
        layout.radius = Math.max(0, cfg.radius) / panelH;

        const tiltRad = (clamp(cfg.tilt, -30, 30) * Math.PI) / 180;
        camera.fov = (2 * Math.atan(viewportH / 2 / panelH / dist) * 180) / Math.PI;
        camera.aspect = viewportW / viewportH;
        camera.near = Math.max(0.01, 0.02 * dist);
        camera.far = dist + 200;
        camera.position.set(0, Math.tan(tiltRad) * dist, dist);
        camera.lookAt(0, 0, 0);
        camera.clearViewOffset();
        camera.updateMatrixWorld();

        const topY = projectToScreenY(0, 0.5);
        const botY = projectToScreenY(0, -0.5);
        const rayPoint = raycastCylinder(0.75, 0);
        const minTop = rayPoint ? Math.min(projectToScreenY(rayPoint.s, 0.5), topY) : topY;
        const maxBot = controlsHeight > 0 ? botY + controlsHeight : rayPoint ? projectToScreenY(rayPoint.s, -0.5) : botY;

        layout.lift = clamp((minTop - (viewportH - maxBot)) / 2, -0.25 * viewportH, 0.25 * viewportH);
        camera.setViewOffset(viewportW, viewportH, 0, layout.lift, viewportW, viewportH);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld();
      };

      const raycaster = new THREE.Raycaster();
      const ndcVec = new THREE.Vector2();

      const raycastCylinder = (ndcX: number, ndcY: number) => {
        ndcVec.set(ndcX, ndcY);
        raycaster.setFromCamera(ndcVec, camera);
        const o = raycaster.ray.origin;
        const d = raycaster.ray.direction;
        const k = layout.k;

        if (k <= 1e-5) {
          if (Math.abs(d.z) < 1e-6) return null;
          const t = -o.z / d.z;
          return t <= 0 ? null : { s: o.x + t * d.x, y: o.y + t * d.y };
        }

        const r = 1 / k;
        const ox = o.x;
        const oz = o.z - r;
        const dNorm = d.x * d.x + d.z * d.z;
        if (dNorm < 1e-9) return null;

        const b = 2 * (ox * d.x + oz * d.z);
        const disc = b * b - 4 * dNorm * (ox * ox + oz * oz - r * r);
        if (disc < 0) return null;

        const t = (-b + Math.sqrt(disc)) / (2 * dNorm);
        if (t <= 0) return null;

        const hitX = o.x + t * d.x;
        const hitZ = o.z + t * d.z;
        return {
          s: Math.atan2(hitX, r - hitZ) * r,
          y: o.y + t * d.y,
        };
      };

      const getPanelUnderMouse = (clientX: number, clientY: number) => {
        const rect = root.getBoundingClientRect();
        const hit = raycastCylinder(
          ((clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1,
          1 - ((clientY - rect.top) / Math.max(rect.height, 1)) * 2
        );
        if (!hit) return null;
        const panelIdx = Math.round(hit.s / layout.pitch + currentPos);
        if (
          Math.abs(hit.s - (panelIdx - currentPos) * layout.pitch) > layout.width / 2 ||
          Math.abs(hit.y) > 0.5 ||
          !isAngleFacingCamera(hit.s)
        ) {
          return null;
        }
        return panelIdx;
      };

      const scheduleRender = () => {
        if (isDestroyed || isContextLost || !isIntersecting || rafId) return;
        if (timeoutId) {
          window.clearTimeout(timeoutId);
          timeoutId = 0;
        }
        rafId = requestAnimationFrame(renderLoop);
      };

      const extendInteractivity = (secs = 2.4) => {
        const now = performance.now() / 1000;
        pauseUntil = Math.max(pauseUntil, now + secs);
        stepTimer = Math.max(stepTimer, now + Math.max(configRef.current.interval, secs));
      };

      const goToPanel = (index: number) => {
        const n = getNumItems();
        const base = Math.round(targetPos ?? currentPos);
        const diff = ((((index - wrapIndex(base)) % n) + n + Math.floor(n / 2)) % n) - Math.floor(n / 2);
        targetPos = base + diff;
        extendInteractivity();
        scheduleRender();
      };

      const stepPanel = (direction: number) => {
        targetPos = Math.round(targetPos ?? currentPos) + direction;
        extendInteractivity();
        scheduleRender();
      };

      /* ── Physics spring integrator ── */
      const integrateSpring = (
        pos: number,
        vel: number,
        target: number,
        dt: number,
        period: number
      ) => {
        const omega = TWO_PI / Math.max(period, 0.02);
        const subSteps = Math.max(1, Math.ceil(dt / (1 / 240)));
        const h = dt / subSteps;
        let v = vel;
        let p = pos;
        for (let i = 0; i < subSteps; i++) {
          v += (omega * omega * (target - p) - 1.64 * omega * v) * h;
          p += v * h;
        }
        return [p, v];
      };

      function renderLoop(frameTime: number) {
        rafId = 0;
        if (isDestroyed || isContextLost) return;
        if (!hasSize) {
          if (!updateViewport()) return;
          updateCamera();
        }

        const cfg = configRef.current;
        const dt = lastTime && frameTime - lastTime < 100
          ? Math.min(Math.max((frameTime - lastTime) / 1000, 0), 0.05)
          : 1 / 60;
        lastTime = frameTime;
        const nowSec = performance.now() / 1000;
        const redMotion = cfg.reduced;
        let needsNextFrame = false;

        // Intro animation
        if (!introDone) {
          if (!introStartTime) introStartTime = nowSec;
          let allReady = true;
          for (let i = -2; i <= 2; i++) {
            const tex = textureList[wrapIndex(Math.round(currentPos) + i)];
            if (tex && !tex.uploaded) allReady = false;
          }
          if (allReady || redMotion || nowSec - introStartTime > 1.6) {
            introDone = true;
            introOffset = redMotion ? 0 : -1.6;
            introProgress = redMotion ? 1 : 0;
          } else {
            needsNextFrame = true;
          }
        }
        if (introDone && introProgress < 1) {
          introProgress = Math.min(1, introProgress + dt / 2.2);
          needsNextFrame = true;
        }
        const smoothIntro = 1 - Math.pow(1 - introProgress, 4);

        // Upload prioritized textures
        (() => {
          const n = textureList.length;
          const center = wrapIndex(Math.round(currentPos));
          let bestItem: InternalTextureItem | null = null;
          let bestDist = Infinity;
          for (let i = 0; i < n; i++) {
            const it = textureList[i];
            if (!it.ready || it.uploaded) continue;
            const d = Math.abs(i - center) % n;
            const dist = Math.min(d, n - d);
            if (dist < bestDist) {
              bestDist = dist;
              bestItem = it;
            }
          }
          if (bestItem) {
            renderer.initTexture(bestItem.texture);
            bestItem.uploaded = true;
            needsNextFrame = true;
          }
        })();

        // Fade in uploaded textures
        for (const tex of textureList) {
          if (tex.uploaded && tex.fade < 1) {
            tex.fade = redMotion || !introDone ? 1 : Math.min(1, tex.fade + dt / 0.5);
            needsNextFrame = true;
          }
        }

        // Autoplay logic
        const auto = cfg.autoplay;
        const intervalSec = Math.max(cfg.interval, 0.8);
        const isPaused = cfg.paused || cfg.held || redMotion || auto === "off";
        const isHoverBraked = (pointerState && pointerState.moved) || (cfg.pauseOnHover && isHovering);
        const isSuppressed = isHoverBraked || nowSec < pauseUntil;
        const targetDrift = isPaused || isSuppressed || auto !== "drift" ? 0 : 1;
        const driftSpeedRate = targetDrift > driftFactor ? 0.9 : 0.32;
        driftFactor += (targetDrift - driftFactor) * (1 - Math.exp(-dt / driftSpeedRate));

        if (Math.abs(targetDrift - driftFactor) > 0.001) {
          needsNextFrame = true;
        } else {
          driftFactor = targetDrift;
        }

        if (auto === "step" && !isPaused && getNumItems() > 1) {
          if (isHoverBraked || stepTimer === 0) {
            stepTimer = Math.max(stepTimer, nowSec + 0.6 * intervalSec);
          } else if (nowSec >= stepTimer && !isSuppressed) {
            stepTimer = nowSec + intervalSec;
            targetPos = Math.round(targetPos ?? currentPos) + (cfg.speed < 0 ? -1 : 1);
          }
        } else {
          stepTimer = 0;
        }

        if (isWheelActive && nowSec - wheelLastTime > 0.14) {
          isWheelActive = false;
          if (cfg.snap && targetPos !== null) {
            targetPos = Math.round(targetPos);
          }
        }

        const driftStep = cfg.speed * driftFactor;

        if (pointerState && pointerState.moved) {
          needsNextFrame = true;
        } else if (targetPos !== null) {
          [currentPos, currentVel] = integrateSpring(
            currentPos,
            currentVel,
            targetPos,
            dt,
            redMotion ? 0.08 : isWheelActive ? 0.6 : 0.85
          );

          if (Math.abs(currentPos - targetPos) < 1e-4 && Math.abs(currentVel) < 1e-4) {
            currentPos = targetPos;
            currentVel = 0;
            if (auto !== "drift" || isPaused || isSuppressed) {
              targetPos = null;
            }
          } else {
            needsNextFrame = true;
          }

          if (auto === "drift" && driftFactor > 0 && targetPos !== null && Math.abs(currentPos - targetPos) < 0.02) {
            targetPos = null;
          }
          if (targetPos === null) {
            dragMomentum = currentVel - driftStep;
          }
        } else {
          const inr = clamp(cfg.inertia, 0, 1);
          dragMomentum *= Math.exp(-dt / (0.25 + 1.6 * inr));
          if (Math.abs(dragMomentum) < 1e-4) {
            dragMomentum = 0;
          } else {
            needsNextFrame = true;
          }
          currentVel = driftStep + dragMomentum;
          currentPos += currentVel * dt;
        }

        // Notify active index change
        const currentActiveIdx = wrapIndex(Math.round(currentPos));
        if (currentActiveIdx !== lastReportedIndex) {
          lastReportedIndex = currentActiveIdx;
          setActiveIndex(currentActiveIdx);
          callbacksRef.current.onIndexChange?.(currentActiveIdx);
        }

        updateViewport();
        updateCamera();

        const animPos = currentPos + introOffset * (1 - smoothIntro);
        const dimVal = clamp(cfg.dim, 0, 1);
        const reflectVal = clamp(cfg.reflection, 0, 1);
        const baseCenter = Math.round(animPos);
        let visibleCount = 0;

        // Position 3D panels
        for (let i = -14; i < 14 && visibleCount < 28; i++) {
          const panelIdx = baseCenter + i;
          const s = (panelIdx - animPos) * layout.pitch;

          if (
            (layout.k > 1e-5 && Math.abs(s * layout.k) > 0.98 * Math.PI) ||
            !isAngleFacingCamera(s)
          ) {
            continue;
          }

          const screenLeft = projectToScreenX(s - layout.width / 2);
          const screenRight = projectToScreenX(s + layout.width / 2);
          if (
            Number.isNaN(projectToScreenX(s)) ||
            Number.isNaN(screenLeft) ||
            Number.isNaN(screenRight) ||
            Math.max(screenLeft, screenRight) < -1.15 ||
            Math.min(screenLeft, screenRight) > 1.15
          ) {
            continue;
          }

          const slot = slots[visibleCount++];
          const texItem = textureList[wrapIndex(panelIdx)];
          const panelAlpha = introDone
            ? redMotion
              ? 1
              : clamp((1.6 * smoothIntro - 0.12 * Math.abs(i)) / 0.6, 0, 1)
            : 0;

          let hoverVal = hoverOpacityMap.get(panelIdx) ?? 0;
          const isTargetHover = +(hoverIndex === panelIdx);
          if (Math.abs(hoverVal - isTargetHover) > 0.001) {
            hoverVal += (isTargetHover - hoverVal) * (1 - Math.exp(-dt / 0.18));
            needsNextFrame = true;
          } else {
            hoverVal = isTargetHover;
          }
          hoverOpacityMap.set(panelIdx, hoverVal);

          for (const meshObj of [slot.mesh, slot.mirror]) {
            const isMirror = meshObj === slot.mirror;
            meshObj.visible = !isMirror || reflectVal > 0.001;
            const uni = meshObj.material.uniforms;
            uni.uCenter.value = s;
            uni.uWidth.value = layout.width;
            uni.uK.value = layout.k;
            uni.uRadius.value = layout.radius;
            uni.uAlpha.value = panelAlpha;
            uni.uReflect.value = reflectVal;
            uni.uDim.value = dimVal;
            uni.uHover.value = hoverVal;

            if (texItem) {
              uni.uImage.value = texItem.uploaded ? texItem.texture : placeholderTexture;
              uni.uImageAspect.value = texItem.aspect;
              uni.uLoaded.value = texItem.uploaded ? texItem.fade : 0;
            }
          }
        }

        // Hide unused panel slots
        for (let i = visibleCount; i < 28; i++) {
          slots[i].mesh.visible = false;
          slots[i].mirror.visible = false;
        }

        // Clean stale hover entries
        for (const key of Array.from(hoverOpacityMap.keys())) {
          if (Math.abs(key - currentPos) > 28) {
            hoverOpacityMap.delete(key);
          }
        }

        // Render HTML Captions projected in 3D
        const curItems = itemsRef.current;
        const currentLocale = cfg.locale;
        const captionBase = Math.round(animPos);

        for (let i = -2; i <= 2; i++) {
          const capIdx = captionBase + i;
          const nodeItem = captionNodes[((capIdx % 5) + 5) % 5];
          const s = (capIdx - animPos) * layout.pitch;
          let targetOpacity = 0;

          if (cfg.captions && isAngleFacingCamera(s)) {
            if (nodeItem.index !== capIdx) {
              nodeItem.index = capIdx;
              const rawItem = curItems[wrapIndex(capIdx)];
              if (rawItem) {
                const titleText =
                  currentLocale === "es"
                    ? rawItem.titulo || rawItem.title || ""
                    : rawItem.tituloEn || rawItem.title || rawItem.titulo || "";
                const tagText =
                  currentLocale === "es"
                    ? rawItem.tag || ""
                    : rawItem.tagEn || rawItem.tag || "";
                const subText =
                  currentLocale === "es"
                    ? rawItem.subtitulo || rawItem.subtitle || ""
                    : rawItem.subtituloEn || rawItem.subtitle || rawItem.subtitulo || "";

                nodeItem.title.textContent = titleText;
                nodeItem.subtitle.textContent = tagText
                  ? `${tagText} · ${subText}`
                  : subText;
                nodeItem.subtitle.style.display =
                  tagText || subText ? "block" : "none";
              }
            }

            const diffFromCenter = Math.abs(capIdx - animPos);
            const dist = clamp((diffFromCenter - 0.2) / 0.35, 0, 1);
            const distFade = 1 - dist * dist * (3 - 2 * dist);
            const introFade = introDone
              ? redMotion
                ? 1
                : clamp((smoothIntro - 0.55) / 0.4, 0, 1)
              : 0;
            targetOpacity = diffFromCenter < 0.55 ? distFade * introFade : 0;

            projectArcPoint(s, -0.5, tempVec).project(camera);
            const pxX = ((tempVec.x + 1) / 2) * viewportW;
            const pxY = ((1 - tempVec.y) / 2) * viewportH + layout.labelGap;

            if (
              Number.isNaN(nodeItem.x) ||
              Math.abs(pxX - nodeItem.x) > 0.05 ||
              Math.abs(pxY - nodeItem.y) > 0.05
            ) {
              nodeItem.x = pxX;
              nodeItem.y = pxY;
              nodeItem.node.style.transform = `translate(${pxX.toFixed(2)}px, ${pxY.toFixed(2)}px) translateX(-50%)`;
            }
          }

          if (Math.abs(targetOpacity - nodeItem.opacity) > 0.002) {
            nodeItem.opacity = targetOpacity;
            nodeItem.node.style.opacity = targetOpacity.toFixed(3);
          }
        }

        // Layout controls bar under the active center panel
        projectArcPoint(0, -0.5, tempVec).project(camera);
        const controlsTopPx = ((1 - tempVec.y) / 2) * viewportH + layout.controlsTop;
        if (Number.isNaN(lastControlsTop) || Math.abs(controlsTopPx - lastControlsTop) > 0.5) {
          lastControlsTop = controlsTopPx;
          setControlsTop(controlsTopPx);
        }

        renderer.render(scene, camera);

        if (
          needsNextFrame ||
          pointerState ||
          (auto === "drift" && driftFactor > 0.001)
        ) {
          scheduleRender();
        } else if (auto === "step" && !isPaused && !isHoverBraked && getNumItems() > 1) {
          timeoutId = window.setTimeout(() => {
            timeoutId = 0;
            lastTime = 0;
            scheduleRender();
          }, 1000 * Math.max(Math.max(stepTimer, pauseUntil) - nowSec, 0.02) + 16);
        } else if (auto === "drift" && !isPaused && !isHoverBraked && nowSec < pauseUntil) {
          timeoutId = window.setTimeout(() => {
            timeoutId = 0;
            lastTime = 0;
            scheduleRender();
          }, (pauseUntil - nowSec) * 1000 + 16);
        }
      }

      /* ── Pointer event listeners ── */
      const onPointerMove = (e: PointerEvent) => {
        if (e.pointerType !== "touch" && !pointerState) {
          isHovering = true;
          const hitIdx = getPanelUnderMouse(e.clientX, e.clientY);
          if (hitIdx !== hoverIndex) {
            hoverIndex = hitIdx;
          }
          root.style.cursor =
            hitIdx !== null ? "pointer" : configRef.current.draggable ? "grab" : "";
        }

        if (pointerState && pointerState.id === e.pointerId) {
          if (!pointerState.moved && Math.hypot(e.clientX - pointerState.x, e.clientY - pointerState.y) > 6) {
            pointerState.moved = true;
            hoverIndex = null;
            targetPos = null;
            currentVel = 0;
            dragMomentum = 0;
            root.style.cursor = "grabbing";
            try {
              canvasWrap.setPointerCapture(e.pointerId);
            } catch {
              // fallback
            }
          }

          if (pointerState.moved) {
            const rect = root.getBoundingClientRect();
            const hit = raycastCylinder(
              ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1,
              1 - ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2
            );
            if (hit) {
              currentPos = pointerState.origin + (pointerState.grab - hit.s) / layout.pitch;
              const now = performance.now();
              pointerState.samples.push({ t: now, p: currentPos });
              while (pointerState.samples.length > 2 && now - pointerState.samples[0].t > 110) {
                pointerState.samples.shift();
              }
            }
          }
        }
        scheduleRender();
      };

      const onPointerDown = (e: PointerEvent) => {
        if (!e.isPrimary || e.button > 0) return;
        if (!configRef.current.draggable) {
          pointerState = null;
          didDragMove = false;
          return;
        }

        const rect = root.getBoundingClientRect();
        const hit = raycastCylinder(
          ((e.clientX - rect.left) / Math.max(rect.width, 1)) * 2 - 1,
          1 - ((e.clientY - rect.top) / Math.max(rect.height, 1)) * 2
        );

        pointerState = {
          id: e.pointerId,
          x: e.clientX,
          y: e.clientY,
          grab: hit ? hit.s : 0,
          origin: currentPos,
          moved: false,
          samples: [{ t: performance.now(), p: currentPos }],
        };
        setIsHeld(true);
        didDragMove = false;
        extendInteractivity();
        scheduleRender();
      };

      const onPointerUp = (e: PointerEvent) => {
        if (!pointerState || pointerState.id !== e.pointerId) return;
        const state = pointerState;
        pointerState = null;
        setIsHeld(false);

        try {
          if (canvasWrap.hasPointerCapture(e.pointerId)) {
            canvasWrap.releasePointerCapture(e.pointerId);
          }
        } catch {
          // ignore
        }

        if (state.moved) {
          didDragMove = true;
          const now = performance.now();
          const validSamples = state.samples.filter((s) => now - s.t < 110);
          let vel = 0;
          if (validSamples.length > 1 && now - validSamples[validSamples.length - 1].t < 60) {
            const dtSec = Math.max((validSamples[validSamples.length - 1].t - validSamples[0].t) / 1000, 1 / 120);
            vel = (validSamples[validSamples.length - 1].p - validSamples[0].p) / dtSec;
          }

          const cfg = configRef.current;
          currentVel = vel = cfg.reduced ? 0 : clamp(vel, -14, 14);
          dragMomentum = vel;
          const inr = clamp(cfg.inertia, 0, 1);
          targetPos = cfg.snap ? Math.round(currentPos + vel * (0.14 + 0.46 * inr)) : null;
          extendInteractivity();
          root.style.cursor = cfg.draggable ? "grab" : "";
        }
        scheduleRender();
      };

      const onClick = (e: MouseEvent) => {
        if (didDragMove) {
          didDragMove = false;
          return;
        }
        const clickedIdx = getPanelUnderMouse(e.clientX, e.clientY);
        if (clickedIdx !== null) {
          const isCentered =
            clickedIdx === Math.round(targetPos ?? currentPos) &&
            Math.abs(currentPos - Math.round(currentPos)) < 0.2;

          if (isCentered) {
            const item = itemsRef.current[wrapIndex(clickedIdx)];
            if (item) {
              callbacksRef.current.onSelect?.(item, wrapIndex(clickedIdx));
            }
          } else {
            targetPos = clickedIdx;
            extendInteractivity();
            scheduleRender();
          }
        }
      };

      const onPointerLeave = (e: PointerEvent) => {
        if (pointerState && pointerState.id === e.pointerId) return;
        isHovering = false;
        hoverIndex = null;
        root.style.cursor = "";
        extendInteractivity(0.6);
        scheduleRender();
      };

      const onWheel = (e: WheelEvent) => {
        if (!configRef.current.wheel) return;
        e.preventDefault();
        const modeMultiplier = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? viewportH : 1;
        const delta = clamp(
          (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * modeMultiplier,
          -240,
          240
        );
        const base = targetPos ?? (configRef.current.snap ? Math.round(currentPos) : currentPos);
        targetPos = (isWheelActive ? base : configRef.current.snap ? Math.round(base) : base) + delta / 100;
        isWheelActive = true;
        wheelLastTime = performance.now() / 1000;
        extendInteractivity();
        scheduleRender();
      };

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowRight") {
          e.preventDefault();
          stepPanel(1);
        } else if (e.key === "ArrowLeft") {
          e.preventDefault();
          stepPanel(-1);
        } else if (e.key === "Home") {
          e.preventDefault();
          goToPanel(0);
        } else if (e.key === "End") {
          e.preventDefault();
          goToPanel(getNumItems() - 1);
        } else if (e.key === "Enter" && e.target === root) {
          e.preventDefault();
          const activeItem = itemsRef.current[wrapIndex(Math.round(targetPos ?? currentPos))];
          if (activeItem) {
            callbacksRef.current.onSelect?.(activeItem, wrapIndex(Math.round(targetPos ?? currentPos)));
          }
        }
      };

      canvasWrap.addEventListener("pointerdown", onPointerDown);
      canvasWrap.addEventListener("pointermove", onPointerMove);
      canvasWrap.addEventListener("pointerup", onPointerUp);
      canvasWrap.addEventListener("pointercancel", onPointerUp);
      canvasWrap.addEventListener("pointerleave", onPointerLeave);
      canvasWrap.addEventListener("click", onClick);
      canvasWrap.addEventListener("wheel", onWheel, { passive: false });
      root.addEventListener("keydown", onKeyDown);

      const resizeObserver = new ResizeObserver(() => {
        if (updateViewport()) {
          updateCamera();
          scheduleRender();
        }
      });
      resizeObserver.observe(root);

      let intersectionObserver: IntersectionObserver | null = null;
      if (typeof IntersectionObserver !== "undefined") {
        intersectionObserver = new IntersectionObserver(
          ([entry]) => {
            isIntersecting = entry.isIntersecting;
            if (isIntersecting) {
              lastTime = 0;
              scheduleRender();
            } else {
              if (rafId) cancelAnimationFrame(rafId);
              rafId = 0;
              if (timeoutId) window.clearTimeout(timeoutId);
              timeoutId = 0;
            }
          },
          { rootMargin: "80px" }
        );
        intersectionObserver.observe(root);
      } else {
        isIntersecting = true;
      }

      const onContextLost = (e: Event) => {
        e.preventDefault();
        isContextLost = true;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = 0;
      };

      const onContextRestored = () => {
        isContextLost = false;
        loadedSrcKey = "";
        syncTextures();
        scheduleRender();
      };

      canvas.addEventListener("webglcontextlost", onContextLost);
      canvas.addEventListener("webglcontextrestored", onContextRestored);

      syncTextures();
      updateViewport();
      updateCamera();
      scheduleRender();

      controllerRef.current = {
        sync: () => {
          syncTextures();
          if (updateViewport()) updateCamera();
          scheduleRender();
        },
        step: stepPanel,
        goTo: goToPanel,
        destroy: () => {
          isDestroyed = true;
          if (rafId) cancelAnimationFrame(rafId);
          if (timeoutId) window.clearTimeout(timeoutId);
          intersectionObserver?.disconnect();
          resizeObserver.disconnect();

          canvasWrap.removeEventListener("pointerdown", onPointerDown);
          canvasWrap.removeEventListener("pointermove", onPointerMove);
          canvasWrap.removeEventListener("pointerup", onPointerUp);
          canvasWrap.removeEventListener("pointercancel", onPointerUp);
          canvasWrap.removeEventListener("pointerleave", onPointerLeave);
          canvasWrap.removeEventListener("click", onClick);
          canvasWrap.removeEventListener("wheel", onWheel);
          root.removeEventListener("keydown", onKeyDown);

          canvas.removeEventListener("webglcontextlost", onContextLost);
          canvas.removeEventListener("webglcontextrestored", onContextRestored);

          textureList.forEach((t) => {
            t.image.onload = null;
            t.texture.dispose();
          });
          slots.forEach((s) => {
            s.mesh.material.dispose();
            s.mirror.material.dispose();
          });
          hoverOpacityMap.clear();
          captionNodes.forEach((cn) => cn.node.remove());
          placeholderTexture.dispose();
          geometry.dispose();
          renderer.dispose();
          if (!renderer.getContext().isContextLost()) {
            renderer.forceContextLoss();
          }
          canvas.remove();
        },
      };

      return () => {
        controllerRef.current?.destroy();
        controllerRef.current = null;
      };
    }, []);

    const activeItem = normalizedItems[activeIndex] ?? normalizedItems[0];

    return (
      <div
        ref={rootRef}
        className={`relative w-full h-[520px] sm:h-[580px] md:h-[620px] select-none overflow-hidden outline-none ${className}`}
        style={{
          backgroundColor,
          ...style,
        }}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={0}
      >
        {/* ── 3D WebGL Canvas Layer ── */}
        <div
          ref={canvasWrapRef}
          style={{
            position: "absolute",
            inset: 0,
            touchAction: "pan-y",
            userSelect: "none",
            WebkitUserSelect: "none",
          }}
        />

        {/* ── Projected Captions Layer ── */}
        <div
          ref={captionsWrapRef}
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            pointerEvents: "none",
          }}
        />

        {/* ── WebGL Fallback (only if WebGL is disabled or failed) ── */}
        {!hasWebGL && (
          <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-white">
            <p>Tu navegador no soporta aceleración 3D para este carrusel.</p>
          </div>
        )}

        {/* ── Routine Action Button Under Caption ── */}
        {activeItem && controlsTop !== null && (
          <div
            className="absolute left-0 right-0 flex justify-center items-center pointer-events-auto transition-opacity duration-300"
            style={{
              top: controlsTop - 2,
              zIndex: 30,
            }}
          >
            <Link to="/registro">
              <button
                className="group flex items-center gap-2 px-5 py-2 rounded-full bg-[var(--color-primary)] text-black font-black text-[10px] sm:text-[11px] uppercase tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(212,251,52,0.35)] transition-all cursor-pointer hover:scale-105 active:scale-95"
                title={locale === "es" ? "Comenzar rutina" : "Start routine"}
              >
                <span>{locale === "es" ? "Comenzar Rutina" : "Start Routine"}</span>
                <ArrowUpRight
                  size={13}
                  className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                />
              </button>
            </Link>
          </div>
        )}

        {/* ── Navigation Controls & Index Counter (ReactBits style) ── */}
        {controls && controlsTop !== null && (
          <div
            className="absolute left-0 right-0 flex justify-center items-center gap-5 pointer-events-none"
            style={{
              top: controlsTop + 48,
              zIndex: 30,
            }}
          >
            <button
              type="button"
              aria-label={locale === "es" ? "Anterior" : "Previous"}
              onClick={() => controllerRef.current?.step(-1)}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white pointer-events-auto cursor-pointer transition-all hover:scale-110 active:scale-90 backdrop-blur-md"
            >
              <ChevronLeft size={16} />
            </button>

            <div className="flex items-center gap-2 font-mono text-[11px] tracking-wider pointer-events-auto select-none bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/8">
              <span className="font-bold text-[var(--color-primary)]">
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
              <span className="text-white/30">/</span>
              <span className="text-white/50">
                {String(normalizedItems.length).padStart(2, "0")}
              </span>
            </div>

            <button
              type="button"
              aria-label={locale === "es" ? "Siguiente" : "Next"}
              onClick={() => controllerRef.current?.step(1)}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white pointer-events-auto cursor-pointer transition-all hover:scale-110 active:scale-90 backdrop-blur-md"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    );
  }
);

export default ConcaveCarousel;
