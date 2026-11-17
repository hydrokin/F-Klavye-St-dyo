// Bağımlılıksız simge üretici: 256x256 PNG + ICO (PNG gömülü)
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const S = 256, SS = 4; // süper örnekleme
const px = Buffer.alloc(S * S * 4);

function inRoundRect(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r);
  const cy = Math.min(Math.max(y, y0 + r), y1 - r);
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r;
}
// "F" harfi + altında klavye tuşu çizgisi
const F = [
  [84, 58, 120, 176, 10],   // dikey gövde
  [84, 58, 182, 92, 10],    // üst kol
  [84, 106, 164, 138, 10],  // orta kol
];
const bar = [70, 190, 186, 204, 7];

for (let y = 0; y < S; y++) {
  for (let x = 0; x < S; x++) {
    let r = 0, g = 0, b = 0, a = 0;
    for (let sy = 0; sy < SS; sy++) for (let sx = 0; sx < SS; sx++) {
      const fx = x + (sx + 0.5) / SS, fy = y + (sy + 0.5) / SS;
      if (!inRoundRect(fx, fy, 8, 8, 248, 248, 56)) continue;
      // degrade: mor -> camgöbeği
      const t = (fx + fy) / (2 * S);
      let cr = 99 + (34 - 99) * t, cg = 102 + (211 - 102) * t, cb = 241 + (238 - 241) * t;
      let white = F.some(([x0, y0, x1, y1, rr]) => inRoundRect(fx, fy, x0, y0, x1, y1, rr));
      let barHit = inRoundRect(fx, fy, ...bar);
      if (white) { cr = 255; cg = 255; cb = 255; }
      else if (barHit) { cr = 255; cg = 255; cb = 255; cr = cr * 0.75 + 99 * 0.25; cg = cg * 0.75 + 102 * 0.25; cb = cb * 0.75 + 241 * 0.25; }
      r += cr; g += cg; b += cb; a += 255;
    }
    const n = SS * SS, i = (y * S + x) * 4;
    const cov = a / n;
    px[i] = cov ? Math.round(r / (a / 255)) : 0;
    px[i + 1] = cov ? Math.round(g / (a / 255)) : 0;
    px[i + 2] = cov ? Math.round(b / (a / 255)) : 0;
    px[i + 3] = Math.round(cov);
  }
}

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}
const raw = Buffer.alloc((S * 4 + 1) * S);
for (let y = 0; y < S; y++) { raw[y * (S * 4 + 1)] = 0; px.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4); }
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4); ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))
]);

const hdr = Buffer.alloc(6); hdr.writeUInt16LE(0, 0); hdr.writeUInt16LE(1, 2); hdr.writeUInt16LE(1, 4);
const ent = Buffer.alloc(16);
ent[0] = 0; ent[1] = 0; ent[2] = 0; ent[3] = 0; ent.writeUInt16LE(1, 4); ent.writeUInt16LE(32, 6);
ent.writeUInt32LE(png.length, 8); ent.writeUInt32LE(22, 12);
const ico = Buffer.concat([hdr, ent, png]);

const root = path.join(__dirname, '..');
fs.writeFileSync(path.join(__dirname, 'icon.ico'), ico);
fs.writeFileSync(path.join(__dirname, 'icon.png'), png);
fs.mkdirSync(path.join(root, 'app'), { recursive: true });
fs.writeFileSync(path.join(root, 'app', 'icon.png'), png);
console.log('Simge oluşturuldu.');
