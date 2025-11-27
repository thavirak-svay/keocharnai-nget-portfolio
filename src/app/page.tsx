'use client';
import React, { useRef, useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import {
  Camera,
  ShoppingBag,
  Shirt,
  Smile,
  Clapperboard,
  Mail,
  Sparkles,
  Menu,
  X,
  Play,
  Heart,
  TrendingUp,
  Users,
  Star,
  Zap,
  Gem,
  Coffee,
  Globe,
  Send,
  Instagram,
  Youtube,
  Facebook,
} from 'lucide-react';
import { personalData, type IconName, type VideoHighlight } from '@/app/data';

const ICON_MAP: Record<IconName, LucideIcon> = {
  users: Users,
  trendingUp: TrendingUp,
  heart: Heart,
  star: Star,
  camera: Camera,
  shirt: Shirt,
  shoppingBag: ShoppingBag,
  smile: Smile,
  clapperboard: Clapperboard,
  sparkles: Sparkles,
  gem: Gem,
  coffee: Coffee,
  globe: Globe,
  zap: Zap,
  youtube: Youtube,
  instagram: Instagram,
  facebook: Facebook,
  play: Play,
  mail: Mail,
};

/**

 * ------------------------------------------------------------------

 * 1. ABSTRACT "LIQUID SILK" SHADER

 * Optimization: Wrapped in React.memo, added fade-in logic

 * ------------------------------------------------------------------

 */

const vertexShaderSource = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`

const fragmentShaderSource = `
  precision mediump float;
  uniform float uTime;
  uniform vec2 uResolution;
  uniform vec2 uMouse;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  varying vec2 vUv;
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  void main() {
    vec2 st = gl_FragCoord.xy / uResolution.xy;
    st.x *= uResolution.x / uResolution.y;
    vec2 mousePos = uMouse;
    mousePos.x *= uResolution.x / uResolution.y;
    float dist = distance(st, mousePos);
    float mouseInfluence = smoothstep(0.5, 0.0, dist);
    float t = uTime * 0.15;
    vec2 q = vec2(0.);
    q.x = snoise(st * 2.0 + vec2(0.0, t * 0.5));
    q.y = snoise(st * 2.0 + vec2(1.0, t * 0.5));
    vec2 r = vec2(0.);
    r.x = snoise(st + 1.0 * q + vec2(1.7, 9.2) + 0.15 * t);
    r.y = snoise(st + 1.0 * q + vec2(8.3, 2.8) + 0.126 * t);
    r += mouseInfluence * 0.15;
    float f = snoise(st * 1.5 + r);
    vec3 color = uColor3; 
    color = mix(color, uColor2, clamp(length(q), 0.0, 1.0));
    color = mix(color, uColor1, clamp(f * f * f * 1.5, 0.0, 1.0));
    color = mix(color, uColor3, 0.65); 
    float grain = fract(sin(dot(vUv.xy, vec2(12.9898,78.233))) * 43758.5453);
    color += grain * 0.04;
    gl_FragColor = vec4(color, 1.0);
  }
`

const hexToRgb = (hex: string) => {
  const bigint = Number.parseInt(hex.replace('#', ''), 16);
  const r = ((bigint >> 16) & 255) / 255;
  const g = ((bigint >> 8) & 255) / 255;
  const b = (bigint & 255) / 255;
  return [r, g, b];
};

// MEMOIZED to prevent re-renders
const FluidBackground = memo(({ onLoad }: { onLoad?: () => void }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl');

    if (!gl) return;

    const createShader = (gl: WebGLRenderingContext, type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'uTime');
    const uResolution = gl.getUniformLocation(program, 'uResolution');
    const uMouse = gl.getUniformLocation(program, 'uMouse');
    const uColor1 = gl.getUniformLocation(program, 'uColor1');
    const uColor2 = gl.getUniformLocation(program, 'uColor2');
    const uColor3 = gl.getUniformLocation(program, 'uColor3');

    const c1 = hexToRgb('#C21E56');
    const c2 = hexToRgb('#FFCAD4');
    const c3 = hexToRgb('#FFF5F7');
    gl.uniform3f(uColor1, c1[0], c1[1], c1[2]);
    gl.uniform3f(uColor2, c2[0], c2[1], c2[2]);
    gl.uniform3f(uColor3, c3[0], c3[1], c3[2]);

    let mouseX = 0.5;
    let mouseY = 0.5;
    let targetMouseX = 0.5;
    let targetMouseY = 0.5;

    const handleResize = () => {
      canvas.width = globalThis.innerWidth;
      canvas.height = globalThis.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const aspect = canvas.width / canvas.height;
      targetMouseX = (e.clientX / globalThis.innerWidth) * aspect;
      targetMouseY = 1 - e.clientY / globalThis.innerHeight;
    };

    globalThis.addEventListener('resize', handleResize);
    globalThis.addEventListener('mousemove', handleMouseMove);
    handleResize();

    let startTime = Date.now();
    let animationFrameId: number;

    const render = () => {
      const currentTime = (Date.now() - startTime) * 0.001;
      gl.uniform1f(uTime, currentTime);
      mouseX += (targetMouseX - mouseX) * 0.03;
      mouseY += (targetMouseY - mouseY) * 0.03;
      gl.uniform2f(uMouse, mouseX, mouseY);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    if (onLoad) onLoad();

    return () => {
      globalThis.removeEventListener('resize', handleResize);
      globalThis.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [onLoad]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none opacity-100">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
});

FluidBackground.displayName = 'FluidBackground';

/**

 * ------------------------------------------------------------------

 * 2. UI COMPONENTS

 * ------------------------------------------------------------------

 */

const Fonts = () => (
  <style
    dangerouslySetInnerHTML={{
      __html: `
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600&family=Syne:wght@600;700;800&display=swap');
    .font-syne { font-family: 'Syne', sans-serif; }
    .font-body { font-family: 'Plus Jakarta Sans', sans-serif; }
    /* PERFORMANCE: GPU Acceleration + Backface Hidden to stop flicker */
    .glass-panel {
      background: rgba(255, 255, 255, 0.55);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.8);
      box-shadow: 0 8px 32px 0 rgba(194, 30, 86, 0.05);
      transform: translate3d(0,0,0); 
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
    }
    .glass-nav {
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(24px);
      border-bottom: 1px solid rgba(255, 245, 247, 0.5);
      transform: translate3d(0,0,0);
    }
    .cherry-glow { box-shadow: 0 0 35px rgba(194, 30, 86, 0.25); }
    .text-shine-gray {
      background: linear-gradient(120deg, #4B5563, #9CA3AF, #F3F4F6, #FFFFFF, #F3F4F6, #9CA3AF, #4B5563);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: transparent;
      animation: shine 3s linear infinite;
      filter: drop-shadow(0px 1px 1px rgba(0,0,0,0.1));
    }
    .bg-shine-silver {
      background: linear-gradient(135deg, #E5E7EB 0%, #F9FAFB 25%, #D1D5DB 50%, #F3F4F6 75%, #E5E7EB 100%);
      background-size: 200% 200%;
      animation: shine 3s ease infinite;
      border: 1px solid rgba(255,255,255,0.8);
      box-shadow: inset 0 0 8px rgba(255,255,255,0.8), 0 4px 10px rgba(0,0,0,0.05);
    }
    @keyframes shine {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
    /* Global Performance Classes */
    .gpu-fix {
      transform: translateZ(0);
      will-change: transform, opacity;
    }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  `,
    }}
  />
);
// NEW: "Lively & Cute Cartoony Cherry"
const CherryLogo = () => (
  <motion.div className="text-[#C21E56] cursor-pointer" whileHover="hover" initial="initial">
    <svg width="44" height="44" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Stems & Leaf */}
      <path d="M18 4 C 18 4, 20 12, 13 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 4 C 18 4, 16 12, 23 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M18 4 Q 22 1, 24 5 Q 20 8, 18 4" fill="currentColor" />
      {/* Left Cherry */}
      <circle cx="12" cy="22" r="6" fill="currentColor" />
      {/* Left Cherry Face - Blinking */}
      <g fill="white">
        <motion.circle
          cx="10"
          cy="21"
          r="0.7"
          animate={{ scaleY: [1, 0.1, 1] }}
          transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
        />

        <motion.circle
          cx="14"
          cy="21"
          r="0.7"
          animate={{ scaleY: [1, 0.1, 1] }}
          transition={{ repeat: Infinity, duration: 3, repeatDelay: 2 }}
        />
      </g>
      <path d="M11 23 Q 12 24.5, 13 23" stroke="white" strokeWidth="0.8" strokeLinecap="round" fill="none" />
      {/* Right Cherry - The Cheeky One */}
      <circle cx="24" cy="23" r="6" fill="currentColor" />
      {/* Right Cherry Face - Winking on Hover */}
      <motion.g>
        <motion.circle
          cx="22"
          cy="22"
          r="0.7"
          fill="white"
          variants={{ initial: { scaleY: 1 }, hover: { scaleY: 0.1, transition: { duration: 0.2 } } }}
        />
        <circle cx="26" cy="22" r="0.7" fill="white" />
        <motion.path
          d="M23 24 Q 24 25.5, 25 24"
          stroke="white"
          strokeWidth="0.8"
          strokeLinecap="round"
          fill="none"
          variants={{
            initial: { d: "M23 24 Q 24 25.5, 25 24" },
            hover: { d: "M23 24 Q 24 27, 25 24", transition: { duration: 0.2 } },
          }}
        />
      </motion.g>
      {/* Sparkle */}
      <motion.path
        d="M30 10 L31 12 L33 13 L31 14 L30 16 L29 14 L27 13 L29 12 Z"
        fill="#FFD700"
        animate={{ rotate: 360, scale: [1, 1.2, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
      />
    </svg>
  </motion.div>
)

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const links = personalData.navLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <CherryLogo />
          <span className="font-syne font-bold text-base sm:text-lg md:text-xl text-[#2B2B2B] tracking-tight whitespace-nowrap ml-2">
            KEOCHARNAI <span className="text-[#C21E56]">NGET</span>
          </span>
        </div>

        <div className="hidden md:flex gap-8 items-center">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-body text-sm font-medium text-[#2B2B2B] hover:text-[#C21E56] transition-colors relative group"
            >
              {link.label}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C21E56] transition-all group-hover:w-full" />
            </a>
          ))}
        <a
          href="https://t.me/char_nai"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#C21E56] text-white font-syne font-bold px-6 py-2 rounded-full hover:scale-105 transition-transform shadow-lg shadow-[#C21E56]/30"
        >
          Let's Work
        </a>
        </div>

        <button className="md:hidden text-black p-1 drop-shadow-[0_1px_1px_rgba(0,0,0,0.15)]" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} strokeWidth={2.25} className="text-black" /> : <Menu size={24} strokeWidth={2.25} className="text-black" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="mobile-nav-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 md:hidden bg-white/40 backdrop-blur-xl z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              key="mobile-nav-panel"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white/75 border border-white/60 backdrop-blur-2xl overflow-hidden absolute w-full left-0 z-50 shadow-2xl shadow-[#C21E56]/20"
              style={{
                backdropFilter: "blur(18px) saturate(130%)",
                WebkitBackdropFilter: "blur(18px) saturate(130%)",
                backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.9) 0%, rgba(255,245,249,0.82) 100%)",
              }}
            >
              <div className="flex flex-col p-6 gap-6 items-center">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="font-syne text-2xl text-[#2B2B2B] hover:text-[#C21E56]"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}

                <a
                  href="https://t.me/char_nai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#C21E56] text-white font-syne font-bold px-8 py-3 rounded-full shadow-lg w-full max-w-xs text-center"
                >
                  Let's Work
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
};

const StatItem = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ size?: number }>;
}) => (
  <div className="flex flex-col items-center">
    <div className="p-3 bg-white/60 rounded-full mb-2 text-[#C21E56] shadow-sm hover:scale-110 transition-transform duration-300">
      <Icon size={20} />
    </div>
    <span className="font-syne font-bold text-xl md:text-3xl text-[#2B2B2B]">{value}</span>
    <span className="font-body text-[10px] md:text-sm text-[#2B2B2B]/60 uppercase tracking-wider">{label}</span>
  </div>
);

const StatsBar = () => (
  <section className="w-full max-w-7xl mx-auto px-6 py-8 md:py-12 relative z-20 -mt-8 md:-mt-10">
    <div className="glass-panel rounded-3xl p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-8 md:gap-8 items-center justify-center">
      {personalData.stats.map((stat) => {
        const IconComponent = ICON_MAP[stat.icon];
        return <StatItem key={stat.label} label={stat.label} value={stat.value} icon={IconComponent} />;
      })}
    </div>
  </section>
);

const Hero = () => (
  <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
    <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/50 border border-pink-200 backdrop-blur-sm"
      >
        <Sparkles size={16} className="text-[#C21E56]" />
        <span className="font-body text-xs font-semibold tracking-wider text-[#C21E56] uppercase">
          {personalData.badge}
        </span>
      </motion.div>
      <motion.h1
        className="font-syne font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-7xl tracking-tight text-[#2B2B2B] leading-[1.1] md:leading-[0.9]"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        {personalData.fullName} <br />
        <span className="text-shine-gray drop-shadow-md">{personalData.brandHighlight}</span>
      </motion.h1>
      <motion.p
        className="mt-6 md:mt-8 font-body text-base md:text-xl text-[#2B2B2B]/80 max-w-2xl mx-auto leading-relaxed px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        {personalData.heroDescription}
      </motion.p>
      <motion.div
        className="mt-8 md:mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center px-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.6 }}
      >
        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="https://www.tiktok.com/@jewelln"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-8 py-4 bg-[#C21E56] text-white font-syne font-bold rounded-full cherry-glow flex items-center justify-center gap-2 text-lg shadow-lg shadow-[#C21E56]/20"
        >
          <Play size={20} fill="currentColor" />
          {personalData.ctaPrimary}
        </motion.a>

        <motion.a
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          href="https://t.me/char_nai"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-8 py-4 bg-shine-silver text-[#4B5563] font-syne font-bold rounded-full border-none shadow-md hover:shadow-xl transition-all text-lg relative overflow-hidden"
        >
          <span className="relative z-10">{personalData.ctaSecondary}</span>
        </motion.a>
      </motion.div>
    </div>
  </section>
);

const AboutSection = () => (
  <section id="about" className="py-12 md:py-20 px-6 relative z-10">
    <div className="max-w-5xl mx-auto text-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <span className="text-5xl md:text-6xl mb-4 md:mb-6 block">✨</span>
        <h2 className="font-syne font-bold text-2xl md:text-5xl text-[#2B2B2B] mb-6 md:mb-8 leading-tight">
          "{personalData.aboutStatementPrefix}{' '}
          <span className="text-[#C21E56] italic">{personalData.aboutStatementAccent}</span>{' '}
          {personalData.aboutStatementSuffix}"
        </h2>
        <p className="font-body text-base md:text-xl text-[#2B2B2B]/70 leading-relaxed mb-8 max-w-3xl mx-auto">
          {personalData.aboutDescription}
        </p>
        <div className="flex flex-wrap justify-center gap-2 md:gap-3">
          {personalData.aboutTags.map((tag) => (
            <span
              key={tag}
              className="px-4 py-2 md:px-6 md:py-2 rounded-full bg-white/50 border border-pink-100 font-syne font-bold text-sm md:text-base text-[#C21E56] shadow-sm backdrop-blur-sm hover:border-gray-300 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  </section>
);

// SMOOTH INFINITE MARQUEE
// - Duplicates content for seamless loop
// - Pure Transform animation (0% -> -50%)
// - pointer-events-none disables interaction
const GalleryItem = ({ src, alt }: { src: string; alt: string }) => (
  <div className="relative w-[200px] h-[280px] md:w-[280px] md:h-[380px] shrink-0 mx-3 md:mx-4 rounded-xl overflow-hidden border-4 border-white shadow-md">
    <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
    <div className="absolute inset-0 bg-black/5" />
  </div>
);

const MarqueeRow = ({
  images,
  direction = 'left',
  rotate = 0,
}: {
  images: string[];
  direction?: 'left' | 'right';
  rotate?: number;
}) => {
  const MIN_IMAGES_FOR_SINGLE_LOOP = 12;
  const needsDuplication = images.length < MIN_IMAGES_FOR_SINGLE_LOOP;

  const displayImages = needsDuplication
    ? Array.from({ length: 2 }, (_, repeatIndex) =>
        images.map((src, baseIndex) => ({
          src,
          id: `${src}-${repeatIndex}-${baseIndex}`,
        }))
      ).flat()
    : images.map((src, baseIndex) => ({
        src,
        id: `${src}-single-${baseIndex}`,
      }));

  let animationKeyframes: string[];
  if (direction === 'left') {
    animationKeyframes = needsDuplication ? ['0%', '-50%'] : ['0%', '-100%'];
  } else {
    animationKeyframes = needsDuplication ? ['-50%', '0%'] : ['-100%', '0%'];
  }

  const marqueeDuration = needsDuplication ? 40 : 55;

  return (
    <div
      className={`relative w-full mb-6 md:mb-8 overflow-hidden pointer-events-none ${
        rotate === -1 ? '-rotate-1' : 'rotate-1'
      }`}
    >
      <motion.div
        className="flex w-max"
        animate={{ x: animationKeyframes }}
        transition={{ repeat: Infinity, duration: marqueeDuration, ease: 'linear' }}
      >
        {displayImages.map((image) => (
          <GalleryItem key={image.id} src={image.src} alt="Gallery item" />
        ))}
      </motion.div>
    </div>
  );
};

const CreativeGallery = () => {
  const { row1, row2 } = personalData.galleryImages;

  return (
    <section className="py-20 relative z-10 overflow-hidden bg-transparent">
      <div className="mb-12 text-center px-6">
        <h2 className="font-syne font-bold text-3xl md:text-5xl text-[#2B2B2B] mb-2">
          Life in <span className="text-[#C21E56] italic">Motion</span>
        </h2>

        <p className="font-body text-[#2B2B2B]/60">A stream of memories, outfits, and moments.</p>
      </div>
      <MarqueeRow images={row1} direction="left" rotate={-1} />
      <MarqueeRow images={row2} direction="right" rotate={1} />
      <div className="absolute top-0 left-0 h-full w-12 md:w-32 bg-linear-to-r from-[#FFF5F7] to-transparent z-20 pointer-events-none" />
      <div className="absolute top-0 right-0 h-full w-12 md:w-32 bg-linear-to-l from-[#FFF5F7] to-transparent z-20 pointer-events-none" />
    </section>
  );
};

const BentoCard = ({
  title,
  icon: Icon,
  color,
  spanClass,
  tags,
  delay,
  image,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  color: string;
  spanClass: string;
  tags: string[];
  delay: number;
  image?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-50px" }}
    transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    className={`${spanClass} h-full group`}
  >
    <div
      className="relative h-full flex flex-col justify-between overflow-hidden rounded-3xl p-6 md:p-8 glass-panel border border-white/60 hover:shadow-xl hover:shadow-pink-500/10 hover:border-white/90 bg-white transition-shadow duration-300"
      style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
    >
      {image && (
        <>
          <div className="absolute inset-0 bg-gray-200 z-0" />
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 ease-out group-hover:scale-105 z-0"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-linear-to-t from-white/95 via-white/60 to-white/30 z-0" />
        </>
      )}
      {/* Gradient Blob */}
      <div className={`absolute top-0 right-0 w-40 h-40 bg-linear-to-br ${color} opacity-40 blur-3xl rounded-bl-full z-0 pointer-events-none transition-opacity duration-500 group-hover:opacity-60`} />
      <div className="relative z-10 transform-gpu transition-transform duration-300">
        <div className="w-14 h-14 rounded-2xl bg-white/80 backdrop-blur-md border border-white/50 flex items-center justify-center mb-6 shadow-sm text-[#C21E56]">
          <Icon size={26} />
        </div>
        <h3 className="font-syne font-bold text-2xl md:text-3xl text-[#2B2B2B] leading-tight mb-2 drop-shadow-sm">{title}</h3>
      </div>
      <div className="flex flex-wrap gap-2 mt-4 relative z-10 transform-gpu transition-transform duration-300">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-xs font-body font-bold text-[#2B2B2B]/70 border border-white/50 shadow-sm"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  </motion.div>
);

const BentoGrid = () => (
  <section id="content" className="py-12 md:py-20 px-6 max-w-7xl mx-auto relative z-10">
    <div className="mb-10 md:mb-16">
      <h2 className="font-syne font-bold text-3xl md:text-5xl text-[#2B2B2B] mb-4">
        The <span className="text-[#C21E56]">Content</span> Mix
      </h2>
      <p className="font-body text-base md:text-lg text-[#2B2B2B]/70 max-w-xl">
        From café hopping to chaotic styling sessions, here's what fills my feed.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[320px]">
      {personalData.bentoCards.map((card) => {
        const IconComponent = ICON_MAP[card.icon];
        return (
          <BentoCard
            key={card.title}
            title={card.title}
            icon={IconComponent}
            color={card.color}
            spanClass={card.spanClass}
            tags={card.tags}
            delay={card.delay}
            image={card.image}
          />
        );
      })}
    </div>
  </section>
);

type TikTokMetadata = {
  title: string | null
  views: number | null
  cover: string | null
  error?: string
}

type VideoHighlightWithState = VideoHighlight & { isHydrating: boolean }

const formatViewCount = (count?: number | null) => {
  if (typeof count !== 'number' || Number.isNaN(count) || count < 0) {
    return null
  }

  if (count >= 1_000_000) {
    return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  }

  if (count >= 1_000) {
    return `${(count / 1_000).toFixed(1).replace(/\.0$/, '')}K`
  }

  return count.toLocaleString()
}

const VideoCard = ({
  views,
  title,
  image,
  link,
  isLoading = false,
}: {
  views: string
  title: string
  image: string
  link: string
  isLoading?: boolean
}) => (
  <a
    href={link}
    target="_blank"
    rel="noreferrer noopener"
    className="flex-none w-64 h-96 rounded-2xl relative overflow-hidden group cursor-pointer shadow-lg shadow-pink-500/5 hover:shadow-pink-500/20 transition-all duration-300 hover:-translate-y-2 snap-center z-0 hover:z-10 bg-white gpu-fix"
    style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
  >
    <div
      className={`absolute inset-0 ${isLoading ? 'bg-linear-to-b from-gray-200 via-gray-100 to-gray-200 animate-pulse' : 'bg-gray-200'}`}
    />
    {!isLoading && (
      <>
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 z-10"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-black/10 z-20" />
      </>
    )}
    <div className="absolute bottom-0 left-0 p-4 text-white z-30">
      <div className="flex items-center gap-2 mb-2 text-pink-200 text-sm font-medium">
        {isLoading ? (
          <div className="h-3 w-20 bg-white/30 rounded-full animate-pulse" />
        ) : (
          <>
            <Play size={14} fill="currentColor" /> {views}
          </>
        )}
      </div>
      <p className="font-syne font-bold text-lg leading-snug line-clamp-2">
        {isLoading ? <span className="block h-6 w-32 bg-white/30 rounded-lg animate-pulse" /> : title}
      </p>
    </div>
    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md w-10 h-10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center justify-center">
      {isLoading ? (
        <div className="w-5 h-5 bg-white/40 rounded-full animate-pulse" />
      ) : (
        <span className="relative inline-flex items-center justify-center">
          <Heart size={20} className="text-white transition-opacity duration-200 group-hover:opacity-0" />
          <Heart
            size={20}
            fill="currentColor"
            className="absolute inset-0 text-[#FE2C55] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
          />
        </span>
      )}
    </div>
  </a>
);

const VideoCarousel = () => {
  const [videoData, setVideoData] = useState<VideoHighlightWithState[]>(() =>
    personalData.videoHighlights.map((video) => ({
      ...video,
      isHydrating: true,
    }))
  )

  useEffect(() => {
    let isMounted = true

    const hydrateVideos = async () => {
      const updatedVideos = await Promise.all(
        personalData.videoHighlights.map(async (video) => {
          try {
            const response = await fetch('/api/tiktok', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: video.link }),
            })

            if (!response.ok) {
              throw new Error('Failed to fetch TikTok metadata.')
            }

            const metadata = (await response.json()) as TikTokMetadata
            const formattedViews = formatViewCount(metadata.views)
            const normalizedTitle = metadata.title?.trim()
            const hasMeaningfulTitle =
              normalizedTitle && !normalizedTitle.toLowerCase().includes('tiktok') && normalizedTitle.length > 2
            const prefersDynamicViews = video.dynamicViews === true || !video.views?.trim()
            const resolvedViews = prefersDynamicViews && formattedViews ? `${formattedViews} Views` : video.views

            return {
              ...video,
              title: hasMeaningfulTitle ? normalizedTitle : video.title,
              image: metadata.cover ?? video.image,
              views: resolvedViews && resolvedViews.length > 0 ? resolvedViews : video.views,
              isHydrating: false,
            }
          } catch {
            return {
              ...video,
              isHydrating: false,
            }
          }
        })
      )

      if (isMounted) {
        setVideoData(updatedVideos)
      }
    }

    hydrateVideos()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section id="viral" className="py-12 md:py-20 relative z-10 overflow-visible">
      <div className="max-w-7xl mx-auto px-6 mb-8 md:mb-10 flex justify-between items-end">
        <div>
          <h2 className="font-syne font-bold text-3xl md:text-4xl text-[#2B2B2B] mb-2">
            Viral <span className="text-[#C21E56]">Moments</span>
          </h2>
          <p className="font-body text-sm md:text-base text-[#2B2B2B]/70">Most loved edits from TikTok & Reels.</p>
        </div>
        <a
          href="https://www.tiktok.com/@jewelln"
          className="hidden md:flex items-center gap-2 text-[#C21E56] font-bold font-syne hover:underline"
          target="_blank"
          rel="noreferrer noopener"
        >
          View All <Sparkles size={16} />
        </a>
      </div>
      <div className="px-6 pb-12 overflow-visible">
        <div className="flex gap-4 md:gap-6 overflow-x-auto hide-scrollbar snap-x snap-mandatory pt-4 md:pt-6">
          {videoData.map((video) => (
            <VideoCard
              key={video.link}
              views={video.views}
              title={video.title}
              image={video.image}
              link={video.link}
              isLoading={video.isHydrating}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

const BrandCollabs = () => (
  <section id="collabs" className="py-8 md:py-10 border-y border-pink-100 bg-white/40 backdrop-blur-sm relative z-10">
    <div className="max-w-7xl mx-auto px-6 text-center mb-6 md:mb-8">
      <span className="font-syne font-bold text-[#2B2B2B]/40 uppercase tracking-widest text-xs md:text-sm">
        Trusted By Global Brands
      </span>
    </div>
    <div className="relative overflow-hidden">
      <div className="flex gap-8 md:gap-16 items-center justify-center flex-wrap px-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
        {personalData.brands.map((brand) => {
          const IconComponent = ICON_MAP[brand.icon];
          return (
            <div key={brand.name} className="flex items-center gap-2 group cursor-default">
              <IconComponent size={20} className="md:w-6 md:h-6 group-hover:text-[#C21E56] transition-colors" />
              <span className="font-syne font-bold text-lg md:text-xl text-[#2B2B2B] group-hover:text-[#C21E56] transition-colors">
                {brand.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

const Newsletter = () => (
  <section className="py-12 md:py-20 px-6 relative z-10">
    <div className="max-w-4xl mx-auto glass-panel rounded-4xl md:rounded-[3rem] p-8 md:p-12 text-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-linear-to-r from-[#C21E56] to-[#FFB3C1]" />

      <div className="relative z-10">
        <Mail size={32} className="md:w-10 md:h-10 mx-auto text-[#C21E56] mb-4 md:mb-6" />

        <h2 className="font-syne font-bold text-2xl md:text-4xl text-[#2B2B2B] mb-3 md:mb-4">The Cherry On Top 🍒</h2>

        <p className="font-body text-sm md:text-base text-[#2B2B2B]/70 mb-6 md:mb-8 max-w-lg mx-auto">
          Join my inner circle for weekly outfit links, unseen vlogs, and exclusive aesthetic tips. No spam, just vibes.
        </p>

        <form
          className="max-w-md mx-auto flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <input
            type="email"
            placeholder="Your cute email..."
            className="flex-1 bg-white/60 border border-pink-200 rounded-full px-4 py-2 md:px-6 md:py-3 font-body text-sm focus:outline-none focus:border-[#C21E56] focus:ring-1 focus:ring-[#C21E56] transition-all"
          />

          <button
            type="submit"
            className="bg-[#C21E56] text-white rounded-full w-11 h-11 md:w-12 md:h-12 hover:scale-105 transition-transform shadow-lg shadow-pink-500/20 flex items-center justify-center shrink-0"
          >
            <Send size={18} className="shrink-0" />
          </button>
        </form>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer
    id="contact"
    className="relative z-10 bg-white/80 backdrop-blur-xl border-t border-pink-100 pt-12 md:pt-20 pb-8 md:pb-10 overflow-hidden"
  >
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center mb-10 md:mb-16">
        <div>
          <h2 className="font-syne font-extrabold text-4xl md:text-7xl text-[#2B2B2B] mb-4 md:mb-6">
            LET'S <br />
            <span className="text-[#C21E56]">COLLAB</span>
          </h2>

          <p className="font-body text-lg md:text-xl text-[#2B2B2B]/70 max-w-md mb-6 md:mb-8">
            Want to create sweet, honest content for your brand? Drop me a line!
          </p>

          <button className="flex items-center gap-3 bg-[#2B2B2B] text-white px-6 py-3 md:px-8 md:py-4 rounded-full font-syne font-bold hover:bg-[#C21E56] transition-colors shadow-xl text-sm md:text-base">
            <Mail size={18} className="md:w-5 md:h-5" /> {personalData.footerEmail}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {personalData.socialLinks.map((social) => {
            const IconComponent = ICON_MAP[social.icon];
            return (
              <a
                key={social.label}
                href={social.href}
            target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 md:p-4 bg-white/50 rounded-2xl hover:bg-white transition-colors group"
              >
                <div className={`${social.accent} text-white p-1.5 md:p-2 rounded-full`}>
                  <IconComponent size={16} className="md:w-5 md:h-5" />
                </div>
                <span className="font-syne font-bold text-sm md:text-base text-[#2B2B2B]">{social.label}</span>
              </a>
            );
          })}
        </div>
      </div>

      <div className="border-t border-pink-200 pt-6 md:pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="font-body text-xs md:text-sm text-[#2B2B2B]/50">© 2025 Keocharnai Nget. Designed with 🍒 & ✨</p>

        <div className="flex gap-6 font-syne font-bold text-xs md:text-sm text-[#2B2B2B]/50">
          <a href="/press-kit" className="hover:text-[#C21E56]">
            Press Kit
          </a>

          <a href="/rate-card" className="hover:text-[#C21E56]">
            Rate Card
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Fonts />

      <div
        className={`relative w-full min-h-screen bg-[#FFF5F7] text-[#2B2B2B] selection:bg-[#FFB3C1] selection:text-[#C21E56] transition-opacity duration-700 ease-out ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ willChange: 'opacity', isolation: 'isolate' }}
      >
        <FluidBackground onLoad={() => setLoaded(true)} />

        <main className="relative z-10">
          <Navbar />

          <Hero />

          <StatsBar />

          <AboutSection />

          <CreativeGallery />

          <BentoGrid />

          <VideoCarousel />

          <BrandCollabs />

          <Newsletter />

          <Footer />
        </main>
      </div>
    </>
  );
}
