"use client";

import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

type PdfViewerProps = {
  url: string;
  allowDownload: boolean;
};

export default function PdfViewer({
  url,
  allowDownload,
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function renderPdf() {
      if (!containerRef.current) {
        return;
      }

      setLoading(true);
      setError("");

      try {
        const pdf = await pdfjsLib
          .getDocument({
            url,
            disableAutoFetch: false,
            disableStream: false,
          })
          .promise;

        if (cancelled) {
          return;
        }

        const container = containerRef.current;

        container.innerHTML = "";

        for (
          let pageNumber = 1;
          pageNumber <= pdf.numPages;
          pageNumber++
        ) {
          if (cancelled) {
            return;
          }

          const pdfPage = await pdf.getPage(pageNumber);

          const containerWidth = container.clientWidth || 800;

          const baseViewport = pdfPage.getViewport({
            scale: 1,
          });

          const availableWidth = Math.max(
            containerWidth - 24,
            300
          );

          const scale = Math.min(
            availableWidth / baseViewport.width,
            1.8
          );

          const viewport = pdfPage.getViewport({
            scale: Math.max(scale, 0.5),
          });

          const canvas = document.createElement("canvas");

          const context = canvas.getContext("2d");

          if (!context) {
            continue;
          }

          const devicePixelRatio =
            window.devicePixelRatio || 1;

          canvas.width = Math.floor(
            viewport.width * devicePixelRatio
          );

          canvas.height = Math.floor(
            viewport.height * devicePixelRatio
          );

          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;

          canvas.className =
            "mx-auto mb-4 block max-w-full bg-white shadow-sm";

          container.appendChild(canvas);

          const renderViewport = pdfPage.getViewport({
            scale:
              Math.max(scale, 0.5) *
              devicePixelRatio,
          });

          await pdfPage.render({
            canvasContext: context,
            viewport: renderViewport,
            canvas,
          }).promise;
        }

        if (!cancelled) {
          setLoading(false);
        }
      } catch (err) {
        console.error("PDF viewer error:", err);

        if (!cancelled) {
          setError("Unable to display this PDF.");
          setLoading(false);
        }
      }
    }

    renderPdf();

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="relative">
      {/* Viewer header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <span className="text-sm font-medium text-slate-600">
          PDF Viewer
        </span>

        {allowDownload && (
          <a
            href={url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            📥 Download
          </a>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-sm text-slate-500">
            Loading PDF…
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="flex min-h-[50vh] items-center justify-center px-6 text-center">
          <div>
            <div className="text-4xl">📄</div>

            <p className="mt-4 text-sm font-medium text-red-600">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* PDF pages */}
      <div
      ref={containerRef}
      className="h-[75vh] overflow-y-auto overflow-x-hidden bg-slate-100 p-3 md:h-[82vh]"
      onContextMenu={(event) => {
      event.preventDefault();
       }}
      />
    </div>
  );
}