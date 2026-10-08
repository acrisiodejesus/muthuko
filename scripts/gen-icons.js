const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPng(size) {
  const width = size;
  const height = size;
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowSize);
  
  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const isBorder = (x < 12 || x >= width - 12 || y < 12 || y >= height - 12);
      if (isBorder) {
        rawData[pixelOffset] = 245;     // R
        rawData[pixelOffset + 1] = 158; // G
        rawData[pixelOffset + 2] = 11;  // B
        rawData[pixelOffset + 3] = 255; // A
      } else {
        rawData[pixelOffset] = 15;      // R
        rawData[pixelOffset + 1] = 23;  // G
        rawData[pixelOffset + 2] = 42;  // B
        rawData[pixelOffset + 3] = 255; // A
      }
    }
  }

  const deflated = zlib.deflateSync(rawData);
  
  function crc32(buf) {
    let crc = -1;
    for (let i = 0; i < buf.length; i++) {
      let byte = buf[i];
      for (let j = 0; j < 8; j++) {
        if ((crc ^ byte) & 1) {
          crc = (crc >>> 1) ^ 0xEDB88320;
        } else {
          crc = crc >>> 1;
        }
        byte = byte >>> 1;
      }
    }
    return (crc ^ (-1)) >>> 0;
  }

  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'binary');
    const crcBuf = Buffer.alloc(4);
    const checksum = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(checksum, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk('IHDR', ihdrData);
  const idat = chunk('IDAT', deflated);
  const iend = chunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPng(192));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPng(512));
console.log('PNG Icons generated successfully at:', iconsDir);
