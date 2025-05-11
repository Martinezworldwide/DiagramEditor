const canvas = new fabric.Canvas('canvas');
let uploadedImg;

document.getElementById('imageUpload').addEventListener('change', function (e) {
  const reader = new FileReader();
  reader.onload = function (event) {
    fabric.Image.fromURL(event.target.result, function (img) {
      uploadedImg = img;
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        scaleX: canvas.width / img.width,
        scaleY: canvas.height / img.height,
      });
    });
  };
  reader.readAsDataURL(e.target.files[0]);
});

function runOCR() {
  if (!uploadedImg) {
    alert("Upload an image first.");
    return;
  }

  Tesseract.recognize(uploadedImg.getSrc(), 'eng').then(({ data: { text } }) => {
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      if (line.trim() !== '') {
        const textbox = new fabric.Textbox(line.trim(), {
          left: 50,
          top: 30 + i * 30,
          fontSize: 16,
          fill: '#000',
          backgroundColor: '#fff',
          editable: true
        });
        canvas.add(textbox);
      }
    });
  });
}
