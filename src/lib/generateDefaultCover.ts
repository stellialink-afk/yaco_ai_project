/**
 * Generate a default cover image client-side when the user doesn't upload one.
 * Returns a File (PNG, 1200x1200) that can be uploaded to the covers bucket.
 *
 * Design: dark gallery palette, minimal music-note motif, title centered.
 */
export async function generateDefaultCover(title: string): Promise<File> {
  const size = 1200;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // ───── background ─────
  // soft radial gradient on a near-black canvas
  const bg = ctx.createRadialGradient(
    size / 2,
    size * 0.35,
    0,
    size / 2,
    size * 0.35,
    size * 0.7
  );
  bg.addColorStop(0, "rgba(184,148,92,0.18)"); // gold glow
  bg.addColorStop(1, "rgba(10,9,8,1)"); // bg
  ctx.fillStyle = "#0a0908";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // ───── thin border frame ─────
  ctx.strokeStyle = "rgba(184,148,92,0.35)";
  ctx.lineWidth = 1;
  const inset = 60;
  ctx.strokeRect(inset, inset, size - inset * 2, size - inset * 2);

  // ───── music-note motif (quarter note, minimalist) ─────
  // Centered slightly above middle so title sits below comfortably.
  drawQuarterNote(ctx, size / 2, size * 0.42, 240);

  // ───── tiny divider ─────
  ctx.strokeStyle = "rgba(184,148,92,0.5)";
  ctx.lineWidth = 1;
  const divCx = size / 2;
  const divCy = size * 0.62;
  ctx.beginPath();
  ctx.moveTo(divCx - 50, divCy);
  ctx.lineTo(divCx + 50, divCy);
  ctx.stroke();

  // ───── title text ─────
  ctx.fillStyle = "#efeae0";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const safeTitle = (title || "Untitled").trim().slice(0, 40);
  const fontSize = pickFontSize(safeTitle);
  // Use system serifs; on most browsers this falls back gracefully.
  ctx.font = `300 ${fontSize}px "Cormorant Garamond", "Noto Serif JP", Georgia, serif`;
  wrapText(ctx, safeTitle, size / 2, size * 0.72, size - 240, fontSize * 1.25);

  // ───── brand tag (bottom) ─────
  ctx.fillStyle = "rgba(110,104,89,0.85)"; // ink-mute
  ctx.font = `italic 22px "Cormorant Garamond", Georgia, serif`;
  ctx.textAlign = "center";
  ctx.fillText("— Sotto. —", size / 2, size - 110);

  // ───── convert to file ─────
  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("toBlob failed"))),
      "image/jpeg",
      0.92
    );
  });

  const safeName =
    safeTitle.replace(/[^a-zA-Z0-9-_]+/g, "-").slice(0, 32) || "default";
  return new File([blob], `default-${safeName}.jpg`, { type: "image/jpeg" });
}

// ───── helpers ─────

function pickFontSize(text: string): number {
  if (text.length <= 10) return 84;
  if (text.length <= 18) return 72;
  if (text.length <= 28) return 56;
  return 44;
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  maxWidth: number,
  lineHeight: number
) {
  // Simple wrap — split by characters because Japanese has no spaces.
  // We treat each character as a unit.
  const chars = Array.from(text);
  const lines: string[] = [];
  let current = "";
  for (const ch of chars) {
    const test = current + ch;
    if (ctx.measureText(test).width > maxWidth && current.length > 0) {
      lines.push(current);
      current = ch;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);

  // Vertical centering around cy
  const totalHeight = lines.length * lineHeight;
  const startY = cy - totalHeight / 2 + lineHeight / 2;
  lines.forEach((line, i) => {
    ctx.fillText(line, cx, startY + i * lineHeight);
  });
}

/**
 * Draw a minimalist quarter note centered at (cx, cy) with given visual size.
 * Style: thin lines, gold ink, no fill body (just an ellipse outline).
 */
function drawQuarterNote(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  visualSize: number
) {
  const noteHeadRx = visualSize * 0.18;
  const noteHeadRy = visualSize * 0.13;
  const stemHeight = visualSize * 0.95;
  const stemWidth = 3;

  // Stem rises from the right side of the note head, going up.
  const stemX = cx + noteHeadRx - 4;
  const stemTop = cy - stemHeight + noteHeadRy * 0.3;
  const stemBottom = cy - noteHeadRy * 0.3;

  // ───── note head (filled, slightly tilted) ─────
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.35); // slight tilt
  ctx.fillStyle = "#b8945c";
  ctx.beginPath();
  ctx.ellipse(0, 0, noteHeadRx, noteHeadRy, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ───── stem ─────
  ctx.fillStyle = "#b8945c";
  ctx.fillRect(stemX - stemWidth / 2, stemTop, stemWidth, stemBottom - stemTop);

  // ───── flag (single curved line) ─────
  ctx.strokeStyle = "#b8945c";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(stemX, stemTop);
  ctx.quadraticCurveTo(
    stemX + visualSize * 0.18,
    stemTop + visualSize * 0.1,
    stemX + visualSize * 0.06,
    stemTop + visualSize * 0.32
  );
  ctx.stroke();
}
