import { useEffect, useRef, useState } from "react";
import "./Intro.css";
import logo from "/src/assets/syncspace-logo.png";

export default function Intro({ onNavigate }) {
  const canvasRef = useRef(null);
  const [text, setText] = useState("");

  useEffect(() => {
    const fullText = "SYNCSPACE";
    let index = 0;
    setText("");

    const interval = setInterval(() => {
      setText(fullText.substring(0, index + 1));
      index++;

      if (index >= fullText.length) clearInterval(interval);
    }, 80);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray = [];

    const mouse = {
      x: null,
      y: null,
      radius: 120,
    };

    window.addEventListener("mousemove", (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });

    class Particle {
      constructor(x, y, dx, dy, size, color) {
        this.x = x;
        this.y = y;
        this.dx = dx;
        this.dy = dy;
        this.size = size;
        this.color = color;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update() {
        if (this.x > canvas.width || this.x < 0) this.dx *= -1;
        if (this.y > canvas.height || this.y < 0) this.dy *= -1;

        this.x += this.dx;
        this.y += this.dy;

        this.draw();
      }
    }

    function init() {
      particlesArray = [];
      const count = (canvas.width * canvas.height) / 9000;

      for (let i = 0; i < count; i++) {
        const size = Math.random() * 2 + 1;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const dx = Math.random() * 1 - 0.5;
        const dy = Math.random() * 1 - 0.5;

        particlesArray.push(new Particle(x, y, dx, dy, size, "#00FF00"));
      }
    }

    function connect() {
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = dx * dx + dy * dy;

          if (distance < (canvas.width / 7) * (canvas.height / 7)) {
            const mx = particlesArray[a].x - mouse.x;
            const my = particlesArray[a].y - mouse.y;
            const mouseDist = mx * mx + my * my;

            if (mouseDist < 25000) {
              ctx.strokeStyle = "rgba(116, 198, 157, 0.2)";
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
              ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
              ctx.stroke();
            }
          }
        }
      }
    }

    function animate() {
      requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesArray.forEach((p) => p.update());
      connect();
    }

    init();
    animate();

    window.addEventListener("resize", () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    });
  }, []);

  return (
    <div className="full-page">
      <div className="title">
        <h1 id="header">{text}</h1>

        <img src={logo} alt="syncspace" />

        <div className="intro-buttons">
          <button
            className="intro-btn"
            onClick={() => onNavigate('login')}
          >
            LOG IN
          </button>
          <button
            className="intro-btn outline"
            onClick={() => onNavigate('signup')}
          >
            SIGN UP
          </button>
        </div>
      </div>

      <canvas ref={canvasRef} id="particleCanvas"></canvas>
    </div>
  );
}