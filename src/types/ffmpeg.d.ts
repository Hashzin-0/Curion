/**
 * @fileOverview Declarações de tipos para módulos que não possuem definições oficiais ou completas.
 */

declare module '@ffmpeg-installer/ffmpeg' {
  interface FfmpegInstaller {
    path: string;
    version: string;
    url: string;
  }
  const ffmpegInstaller: FfmpegInstaller;
  export default ffmpegInstaller;
}
