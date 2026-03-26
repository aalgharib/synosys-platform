import { useEffect } from "react";
import type { RefObject } from "react";

interface HtmlToImage {
  toPng: (
    element: HTMLElement,
    options?: {
      quality?: number;
      pixelRatio?: number;
      cacheBust?: boolean;
      width?: number;
      height?: number;
      canvasWidth?: number;
      canvasHeight?: number;
      backgroundColor?: string;
      style?: Partial<CSSStyleDeclaration>;
    },
  ) => Promise<string>;
}

interface ExportOptions {
  width: number;
  height: number;
  backgroundColor?: string;
}

export const useImageExport = () => {
  useEffect(() => {
    const scriptId = "html-to-image-script";

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html-to-image/1.11.11/html-to-image.min.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const exportElement = async (
    ref: RefObject<HTMLDivElement | null>,
    filename: string,
    setIsExporting: (value: boolean) => void,
    options?: ExportOptions,
  ) => {
    const htmlToImage = (window as unknown as { htmlToImage: HtmlToImage })
      .htmlToImage;

    if (!ref.current || !htmlToImage) {
      console.error("Export library not loaded yet");
      return;
    }

    setIsExporting(true);

    try {
      const sourceWidth = ref.current.offsetWidth;
      const sourceHeight = ref.current.offsetHeight;
      const exportWidth = options?.width ?? sourceWidth;
      const exportHeight = options?.height ?? sourceHeight;

      const dataUrl = await htmlToImage.toPng(ref.current, {
        quality: 1,
        pixelRatio: 1,
        cacheBust: true,
        width: sourceWidth,
        height: sourceHeight,
        canvasWidth: exportWidth,
        canvasHeight: exportHeight,
        backgroundColor: options?.backgroundColor,
        style: {
          width: `${sourceWidth}px`,
          height: `${sourceHeight}px`,
        },
      });

      const link = document.createElement("a");
      link.download = `${filename}-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Export failed", error);
    } finally {
      setIsExporting(false);
    }
  };

  return { exportElement };
};
