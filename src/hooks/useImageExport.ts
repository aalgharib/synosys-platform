import { useEffect } from "react";
import type { RefObject } from "react";

interface HtmlToImage {
  toPng: (
    element: HTMLElement,
    options?: { quality?: number; pixelRatio?: number; cacheBust?: boolean },
  ) => Promise<string>;
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
  ) => {
    const htmlToImage = (window as unknown as { htmlToImage: HtmlToImage })
      .htmlToImage;

    if (!ref.current || !htmlToImage) {
      console.error("Export library not loaded yet");
      return;
    }

    setIsExporting(true);

    try {
      const dataUrl = await htmlToImage.toPng(ref.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
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
