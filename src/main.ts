const API_KEY = "Ggd66wC6K5UEcrekGSA7LRzk";

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("fileInput") as HTMLInputElement | null;
  const processBtn = document.getElementById("processBtn") as HTMLButtonElement | null;
  const gallery = document.getElementById("gallery") as HTMLDivElement | null;
  const bgPicker = document.getElementById("bgColor") as HTMLInputElement | null;

  if (!input || !processBtn || !gallery || !bgPicker) return;

  processBtn.addEventListener("click", async () => {
    if (!input.files || input.files.length === 0) {
      alert("Please select image");
      return;
    }

    gallery.innerHTML = "";

    for (const file of Array.from(input.files)) {
      const card = document.createElement("div");
      card.className = "card";

      const originalLabel = document.createElement("div");
      originalLabel.className = "label original-label";
      originalLabel.textContent = "Original";

      const originalImg = document.createElement("img");
      const originalUrl = URL.createObjectURL(file);
      originalImg.src = originalUrl;

      const resultLabel = document.createElement("div");
      resultLabel.className = "label result-label";
      resultLabel.textContent = "Result";

      const resultImg = document.createElement("img");

      const downloadBtn = document.createElement("a");
      downloadBtn.className = "download-btn";
      downloadBtn.textContent = "Download";
      downloadBtn.download = "edited.png";

      card.append(
        originalLabel,
        originalImg,
        resultLabel,
        resultImg,
        downloadBtn
      );

      gallery.appendChild(card);

      const formData = new FormData();
      formData.append("image_file", file);
      formData.append("size", "auto");

      let res: Response;

      try {
        res = await fetch("https://api.remove.bg/v1.0/removebg", {
          method: "POST",
          headers: {
            "X-Api-Key": API_KEY
          },
          body: formData
        });
      } catch {
        resultImg.alt = "Request failed";
        URL.revokeObjectURL(originalUrl);
        continue;
      }

      if (!res.ok) {
        resultImg.alt = "Failed";
        URL.revokeObjectURL(originalUrl);
        continue;
      }

      const transparentBlob = await res.blob();
      const finalBlob = await applyBackground(
        transparentBlob,
        bgPicker.value
      );

      const resultUrl = URL.createObjectURL(finalBlob);
      resultImg.src = resultUrl;
      downloadBtn.href = resultUrl;

      resultImg.onload = () => {
        URL.revokeObjectURL(originalUrl);
      };
    }
  });
});

async function applyBackground(
  transparentBlob: Blob,
  bgColor: string
): Promise<Blob> {
  const img = new Image();
  const url = URL.createObjectURL(transparentBlob);
  img.src = url;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);

  URL.revokeObjectURL(url);

  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b as Blob), "image/png");
  });
}
