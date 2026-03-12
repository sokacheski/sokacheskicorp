import { useEffect, useRef } from "react";

export default function MarketBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    let width = window.innerWidth;
    let height = window.innerHeight;

    const setSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    setSize();
    window.addEventListener("resize", setSize);

    let offset = 0;

    // ========================
    // PARTICLES
    // ========================
    const particles = Array.from({ length: 120 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2,
    }));

    function drawBackground() {
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        height
      );

      gradient.addColorStop(0, "#0a0f1f");
      gradient.addColorStop(0.5, "#060a14");
      gradient.addColorStop(1, "#03050c");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    function drawPerspectiveGrid() {
      ctx.strokeStyle = "rgba(0,150,255,0.05)";
      ctx.lineWidth = 1;

      const spacing = 80;

      for (let i = 0; i < height; i += spacing) {
        const perspective = i * 0.5;
        ctx.beginPath();
        ctx.moveTo(0 + perspective, i);
        ctx.lineTo(width - perspective, i);
        ctx.stroke();
      }
    }

    function drawNeuralConnections() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.strokeStyle = `rgba(0,200,255,${0.1 - dist / 1200})`;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function drawParticles() {
      particles.forEach((p) => {
        ctx.beginPath();
        ctx.fillStyle = "rgba(0,200,255,0.8)";
        ctx.shadowColor = "#00d4ff";
        ctx.shadowBlur = 15;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
      });
    }

    function drawWaveLayer(amplitude: number, speed: number, opacity: number) {
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = `rgba(0,180,255,${opacity})`;
      ctx.shadowColor = "#0099ff";
      ctx.shadowBlur = 25;

      for (let x = 0; x < width; x++) {
        const y =
          height * 0.7 +
          Math.sin((x + offset * speed) * 0.008) * amplitude;

        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    function drawVignette() {
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        height * 0.4,
        width / 2,
        height / 2,
        height
      );

      gradient.addColorStop(0, "transparent");
      gradient.addColorStop(1, "rgba(0,0,0,0.6)");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      drawBackground();
      drawPerspectiveGrid();
      drawNeuralConnections();
      drawParticles();

      drawWaveLayer(40, 1, 0.2);
      drawWaveLayer(70, 1.5, 0.15);

      drawVignette();

      offset += 1;
      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
      }}
    />
  );
}