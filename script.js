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

  Tesseract.recognize(uploadedImg.getSrc(), 'eng', {
    logger: m => console.log(m)
  }).then(({ data }) => {
    data.words.forEach(word => {
      const { text, bbox } = word;
      const textbox = new fabric.Textbox(text, {
        left: bbox.x0,
        top: bbox.y0,
        width: bbox.x1 - bbox.x0,
        fontSize: 14,
        fill: '#000',
        backgroundColor: 'rgba(255,255,255,0.8)',
        editable: true
      });
      canvas.add(textbox);
    });
    canvas.renderAll();
  });
}

