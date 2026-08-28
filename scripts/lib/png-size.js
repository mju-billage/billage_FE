/** PNG 파일 버퍼에서 IHDR 청크의 width/height를 직접 읽는다(외부 의존성 없이). */
function readPngSize(buffer) {
  const isPng =
    buffer.length > 24 &&
    buffer.readUInt32BE(0) === 0x89504e47 &&
    buffer.readUInt32BE(4) === 0x0d0a1a0a;
  if (!isPng) {
    return null;
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

module.exports = { readPngSize };
