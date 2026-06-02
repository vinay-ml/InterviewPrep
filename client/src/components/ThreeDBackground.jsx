import React, { useEffect, useRef } from 'react';
import './ThreeDBackground.css';

const ThreeDBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // 3D parameters
    const particleCount = 85;
    const connectionDistance = 110;
    const perspective = 300;
    const particles = [];

    // Mouse coordinates (centered)
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    // Rotation angles
    let angleX = 0.001;
    let angleY = 0.001;

    // Initialize particles in a 3D sphere
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const radius = 120 + Math.random() * 150; // spread radius

      particles.push({
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
        // Random drift speed
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        vz: (Math.random() - 0.5) * 0.3,
        // Particle base color (mint green or soft blue)
        color: Math.random() > 0.3 ? 'rgba(134, 239, 172' : 'rgba(56, 189, 248',
        size: Math.random() * 2 + 1,
      });
    }

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      // Mouse coordinates relative to window center
      mouse.targetX = e.clientX - window.innerWidth / 2;
      mouse.targetY = e.clientY - window.innerHeight / 2;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    // 3D rotation functions
    const rotateX = (point, rad) => {
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const y1 = point.y * cos - point.z * sin;
      const z1 = point.y * sin + point.z * cos;
      point.y = y1;
      point.z = z1;
    };

    const rotateY = (point, rad) => {
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const x1 = point.x * cos + point.z * sin;
      const z1 = -point.x * sin + point.z * cos;
      point.x = x1;
      point.z = z1;
    };

    // Main animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Create a subtle dark background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, width, height);
      bgGrad.addColorStop(0, '#0a0d14');
      bgGrad.addColorStop(1, '#10141d');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Smooth mouse follow (easing)
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Determine rotation speeds based on mouse position
      const currentAngleY = angleY + mouse.x * 0.00002;
      const currentAngleX = angleX + mouse.y * 0.00002;

      // Project and store screen positions
      const projected = [];
      const centerX = width / 2;
      const centerY = height / 2;

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];

        // Apply automatic and mouse-driven rotation
        rotateY(p, currentAngleY);
        rotateX(p, currentAngleX);

        // Apply subtle random drift/motion
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Keep them bounded in a sphere (pull back if they drift too far)
        const dist = Math.sqrt(p.x * p.x + p.y * p.y + p.z * p.z);
        if (dist > 300) {
          p.vx -= (p.x / dist) * 0.01;
          p.vy -= (p.y / dist) * 0.01;
          p.vz -= (p.z / dist) * 0.01;
        }

        // Perspective projection
        // Map Z coordinate to range where perspective is active
        const zDepth = p.z + 400; // Offset Z to be in front of the camera

        if (zDepth > 0) {
          const scale = perspective / zDepth;
          const sx = p.x * scale + centerX;
          const sy = p.y * scale + centerY;

          projected.push({
            x: sx,
            y: sy,
            z: p.z,
            scale: scale,
            color: p.color,
            size: p.size,
          });
        }
      }

      // Draw connections/lines in 3D-aware depth order
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];

          // Compute 2D distance
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist2D = Math.sqrt(dx * dx + dy * dy);

          if (dist2D < connectionDistance) {
            // Draw connection line with depth-based alpha
            const avgScale = (p1.scale + p2.scale) / 2;
            const alpha = (1 - dist2D / connectionDistance) * 0.15 * Math.min(avgScale, 1.2);
            
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            
            // Create gradient line between green and blue particles
            ctx.strokeStyle = `rgba(134, 239, 172, ${alpha})`;
            ctx.lineWidth = 0.5 * avgScale;
            ctx.stroke();
          }
        }
      }

      // Sort by depth so closer particles render on top of lines
      projected.sort((a, b) => b.z - a.z);

      // Draw projected particles
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        
        // Calculate size and opacity based on depth scale
        const radius = Math.max(0.1, p.size * p.scale);
        const alpha = Math.min(1.0, 0.3 + (p.scale * 0.4));

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
        
        // Add a subtle bloom glow for closer/larger particles
        if (p.scale > 0.8) {
          ctx.shadowBlur = 8 * p.scale;
          ctx.shadowColor = p.color === 'rgba(134, 239, 172' ? '#86efac' : '#38bdf8';
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `${p.color}, ${alpha})`;
        ctx.fill();
      }

      // Reset shadow for next frame
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="three-d-canvas" />;
};

export default ThreeDBackground;
