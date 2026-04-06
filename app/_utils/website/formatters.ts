export function formatBytes(bytes: bigint | number): string {
  const byteNumber = typeof bytes === 'bigint' ? Number(bytes) : bytes;
  
  if (byteNumber === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'kB', 'MB', 'GB', 'TB'];

  // Use Math.floor to match standard size descriptions rather than generic floats
  const i = Math.floor(Math.log(byteNumber) / Math.log(k));

  return `${parseFloat((byteNumber / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
