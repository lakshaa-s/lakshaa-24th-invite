import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Float, Lightformer } from '@react-three/drei';
import { ReactNode, useMemo, useRef } from 'react';
import * as THREE from 'three';

/* ---------------- Roulette maths ---------------- */
// European wheel order, clockwise from 0.
const ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const STEP = (Math.PI * 2) / ORDER.length;
const WINNING_NUMBER = 24;

const SPIN_SECONDS = 6;
const IDLE_SPEED = 0.12; // rad/s once the ball has landed
const BALL_LAPS = 7;

const WHEEL_R = 2;
const WHEEL_H = 0.14;
const WHEEL_Y = 0.1;
const FACE_Y = WHEEL_Y + WHEEL_H / 2;
const BALL_R = 0.075;
const TRACK_R = 2.24;
const TRACK_Y = 0.151;
const POCKET_R = WHEEL_R * 0.78;

const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------- Canvas textures ---------------- */
function canvasTexture(w: number, h: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  draw(canvas.getContext('2d')!);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

const SERIF = '"Playfair Display", Georgia, serif';

function drawWheelFace(ctx: CanvasRenderingContext2D) {
  const size = ctx.canvas.width;
  const c = size / 2;
  const outer = c * 0.995;
  const inner = c * 0.6;

  ORDER.forEach((n, i) => {
    const a = i * STEP;
    ctx.beginPath();
    ctx.arc(c, c, outer, a - STEP / 2, a + STEP / 2);
    ctx.arc(c, c, inner, a + STEP / 2, a - STEP / 2, true);
    ctx.closePath();
    ctx.fillStyle = n === 0 ? '#0e6b3a' : RED.has(n) ? '#a3101f' : '#0d0d0d';
    ctx.fill();
    ctx.strokeStyle = '#c9a23a';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Number, with its top pointing to the centre so it reads upright at the front.
    ctx.save();
    ctx.translate(c + Math.cos(a) * outer * 0.9, c + Math.sin(a) * outer * 0.9);
    ctx.rotate(a - Math.PI / 2);
    ctx.fillStyle = n === WINNING_NUMBER ? '#fcf6ba' : '#f3ece0';
    ctx.font = `700 ${size * 0.036}px ${SERIF}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(n), 0, 0);
    ctx.restore();
  });

  for (const r of [outer * 0.8, inner]) {
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 6;
    ctx.stroke();
  }

  const wood = ctx.createRadialGradient(c, c, 0, c, c, inner);
  wood.addColorStop(0, '#7a4e28');
  wood.addColorStop(0.65, '#3d2212');
  wood.addColorStop(1, '#1b0d05');
  ctx.beginPath();
  ctx.arc(c, c, inner - 3, 0, Math.PI * 2);
  ctx.fillStyle = wood;
  ctx.fill();
}

function drawChipFace(color: string, accent: string) {
  return (ctx: CanvasRenderingContext2D) => {
    const size = ctx.canvas.width;
    const c = size / 2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(c, c, c, 0, Math.PI * 2);
    ctx.fill();

    // Edge spots
    ctx.fillStyle = accent;
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.translate(c, c);
      ctx.rotate((i * Math.PI) / 4);
      ctx.fillRect(-size * 0.05, -c, size * 0.1, size * 0.16);
      ctx.restore();
    }

    ctx.setLineDash([size * 0.03, size * 0.02]);
    ctx.strokeStyle = accent;
    ctx.lineWidth = size * 0.012;
    ctx.beginPath();
    ctx.arc(c, c, c * 0.62, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = accent;
    ctx.font = `900 ${size * 0.3}px ${SERIF}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('24', c, c + size * 0.02);
  };
}

function drawCard(rank: string, suit: string, red: boolean) {
  return (ctx: CanvasRenderingContext2D) => {
    const { width: w, height: h } = ctx.canvas;
    const ink = red ? '#b3131f' : '#111';
    ctx.fillStyle = '#f6efe0';
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, w * 0.08);
    ctx.fill();
    ctx.strokeStyle = '#c9a23a';
    ctx.lineWidth = w * 0.015;
    ctx.beginPath();
    ctx.roundRect(w * 0.05, w * 0.05, w * 0.9, h - w * 0.1, w * 0.05);
    ctx.stroke();

    ctx.fillStyle = ink;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const corner = (x: number, y: number, flip: boolean) => {
      ctx.save();
      ctx.translate(x, y);
      if (flip) ctx.rotate(Math.PI);
      ctx.font = `700 ${w * 0.17}px ${SERIF}`;
      ctx.fillText(rank, 0, 0);
      ctx.font = `${w * 0.13}px ${SERIF}`;
      ctx.fillText(suit, 0, w * 0.15);
      ctx.restore();
    };
    corner(w * 0.17, w * 0.2, false);
    corner(w * 0.83, h - w * 0.2, true);
    ctx.font = `${w * 0.55}px ${SERIF}`;
    ctx.fillText(suit, w / 2, h / 2);
  };
}

/* ---------------- Materials ---------------- */
const gold = new THREE.MeshStandardMaterial({ color: '#d4af37', metalness: 1, roughness: 0.22 });
const darkWood = new THREE.MeshStandardMaterial({ color: '#241108', roughness: 0.45, metalness: 0.1 });

/* ---------------- Scene pieces ---------------- */
function Wheel() {
  const wheel = useRef<THREE.Group>(null!);
  const ball = useRef<THREE.Mesh>(null!);
  const startedAt = useRef<number | null>(null);

  const wheelMaterials = useMemo(() => {
    const face = new THREE.MeshStandardMaterial({
      map: canvasTexture(1024, 1024, drawWheelFace),
      roughness: 0.35,
      metalness: 0.05,
    });
    return [gold, face, darkWood];
  }, []);

  // A pocket painted at canvas angle a sits at local Y-angle -a on the cylinder cap.
  // Rotating the wheel by psi puts it at world angle (-a + psi); 0 faces the camera.
  const pocketAngle = -ORDER.indexOf(WINNING_NUMBER) * STEP;
  const idleDuringSpin = reducedMotion ? 0 : IDLE_SPEED * SPIN_SECONDS;
  const spinTarget = -pocketAngle + Math.PI * 2 * 4 - idleDuringSpin;

  useFrame(({ clock }) => {
    if (startedAt.current === null) startedAt.current = clock.elapsedTime;
    const t = clock.elapsedTime - startedAt.current;
    const p = reducedMotion ? 1 : Math.min(t / SPIN_SECONDS, 1);
    const ease = 1 - Math.pow(1 - p, 3);

    const psi = spinTarget * ease + (reducedMotion ? 0 : IDLE_SPEED * t);
    wheel.current.rotation.y = psi;

    // Ball laps the other way, then drops into the winning pocket.
    const gamma = pocketAngle + psi + Math.PI * 2 * BALL_LAPS * (1 - ease);
    const drop = THREE.MathUtils.smoothstep(p, 0.55, 0.88);
    const r = THREE.MathUtils.lerp(TRACK_R, POCKET_R, drop);
    const hop = p > 0.55 && p < 0.9 ? Math.abs(Math.sin(p * 55)) * 0.12 * (1 - drop) : 0;
    const y = THREE.MathUtils.lerp(TRACK_Y + BALL_R, FACE_Y + BALL_R * 0.6, drop) + hop;
    ball.current.position.set(Math.sin(gamma) * r, y, Math.cos(gamma) * r);
  });

  return (
    <group>
      {/* Bowl */}
      <mesh position={[0, 0, 0]} material={darkWood} receiveShadow castShadow>
        <cylinderGeometry args={[2.55, 2.7, 0.3, 96]} />
      </mesh>
      <mesh position={[0, TRACK_Y, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <ringGeometry args={[2.02, 2.5, 96]} />
        <meshStandardMaterial color="#3a1d0e" roughness={0.3} metalness={0.1} />
      </mesh>
      <mesh position={[0, TRACK_Y + 0.02, 0]} rotation-x={Math.PI / 2} material={gold}>
        <torusGeometry args={[2.52, 0.05, 16, 128]} />
      </mesh>

      {/* Spinning wheel */}
      <group ref={wheel}>
        <mesh position={[0, WHEEL_Y, 0]} material={wheelMaterials} castShadow receiveShadow>
          <cylinderGeometry args={[WHEEL_R, WHEEL_R * 1.02, WHEEL_H, 96]} />
        </mesh>
        <group position={[0, FACE_Y, 0]}>
          <mesh position={[0, 0.25, 0]} material={gold} castShadow>
            <cylinderGeometry args={[0.05, 0.3, 0.5, 32]} />
          </mesh>
          {[0, 1, 2, 3].map((k) => (
            <group key={k} rotation-y={(k * Math.PI) / 2} position={[0, 0.42, 0]}>
              <mesh rotation-z={Math.PI / 2} position={[0.28, 0, 0]} material={gold} castShadow>
                <cylinderGeometry args={[0.025, 0.025, 0.56, 12]} />
              </mesh>
              <mesh position={[0.58, 0, 0]} material={gold} castShadow>
                <sphereGeometry args={[0.06, 20, 20]} />
              </mesh>
            </group>
          ))}
          <mesh position={[0, 0.62, 0]} material={gold} castShadow>
            <sphereGeometry args={[0.09, 24, 24]} />
          </mesh>
        </group>
      </group>

      {/* Ball */}
      <mesh ref={ball} castShadow>
        <sphereGeometry args={[BALL_R, 32, 32]} />
        <meshStandardMaterial color="#fbfaf5" roughness={0.15} metalness={0.1} />
      </mesh>
    </group>
  );
}

function Chip({ position, rotation, color, accent, edge }: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: string;
  accent: string;
  edge: string;
}) {
  const materials = useMemo(() => {
    const face = new THREE.MeshStandardMaterial({
      map: canvasTexture(512, 512, drawChipFace(color, accent)),
      roughness: 0.4,
    });
    return [new THREE.MeshStandardMaterial({ color: edge, roughness: 0.5 }), face, face];
  }, [color, accent, edge]);

  return (
    <Float speed={1.6} rotationIntensity={1.2} floatIntensity={1.4}>
      <mesh position={position} rotation={rotation} material={materials} castShadow>
        <cylinderGeometry args={[0.5, 0.5, 0.11, 48]} />
      </mesh>
    </Float>
  );
}

function Card({ position, rotation, rank, suit, red }: {
  position: [number, number, number];
  rotation: [number, number, number];
  rank: string;
  suit: string;
  red: boolean;
}) {
  const map = useMemo(() => canvasTexture(512, 730, drawCard(rank, suit, red)), [rank, suit, red]);
  return (
    <Float speed={1.2} rotationIntensity={0.8} floatIntensity={1.1}>
      <mesh position={position} rotation={rotation}>
        <planeGeometry args={[0.95, 1.35]} />
        <meshStandardMaterial map={map} side={THREE.DoubleSide} roughness={0.55} />
      </mesh>
    </Float>
  );
}

/** Wheel sits to the right on desktop and below the headline on phones. */
function Layout({ children }: { children: ReactNode }) {
  const { size } = useThree();
  const wide = size.width >= 768;
  return (
    <group position={wide ? [2.1, 0, 0.3] : [0, 0, 2.4]} scale={wide ? 0.88 : 0.58}>
      {children}
    </group>
  );
}

function CameraRig() {
  useFrame(({ camera, pointer }, dt) => {
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 0.9, 2.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 6.2 + pointer.y * 0.5, 2.5, dt);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function CasinoScene({ active = true }: { active?: boolean }) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.75]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 6.2, 8], fov: 35 }}
      gl={{ antialias: true, alpha: true }}
    >
      <fog attach="fog" args={['#050505', 10, 20]} />
      <ambientLight intensity={0.12} />
      <spotLight
        position={[2.5, 9, 3]}
        angle={0.55}
        penumbra={0.9}
        intensity={220}
        color="#ffe2b0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <pointLight position={[-5, 2.5, -2]} intensity={45} color="#ff2a3d" />
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.2} color="#ffe7b3" position={[0, 5, -6]} scale={[12, 3, 1]} />
        <Lightformer form="circle" intensity={3} color="#ffffff" position={[5, 4, 5]} scale={2.5} />
        <Lightformer form="rect" intensity={1.8} color="#ff3b4f" position={[-6, 1, 0]} rotation-y={Math.PI / 2} scale={[8, 2, 1]} />
      </Environment>

      <Layout>
        <Wheel />
        <Chip position={[-2.3, 0.9, 3.0]} rotation={[0.9, 0.3, 0.4]} color="#9b111e" accent="#f6efe0" edge="#5e0a12" />
        <Chip position={[3.1, 1.8, -0.8]} rotation={[1.2, 0, -0.5]} color="#111111" accent="#d4af37" edge="#050505" />
        <Chip position={[2.2, 1.1, 2.8]} rotation={[0.4, 0.6, 0.9]} color="#f6efe0" accent="#9b111e" edge="#c9bca3" />
        <Chip position={[1.9, 2.6, -3.2]} rotation={[1.4, 0.2, 0.1]} color="#0e5a34" accent="#f6efe0" edge="#083a21" />
        <Card position={[-0.9, 2.7, -3.0]} rotation={[-0.6, 0.3, 0.25]} rank="2" suit="♥" red />
        <Card position={[0.2, 2.4, -2.6]} rotation={[-0.5, -0.1, -0.2]} rank="4" suit="♠" red={false} />
      </Layout>

      {/* Felt under the table catches the spotlight pool */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.16, 0]} receiveShadow>
        <circleGeometry args={[14, 64]} />
        <meshStandardMaterial color="#2c0710" roughness={1} />
      </mesh>

      <CameraRig />
    </Canvas>
  );
}
