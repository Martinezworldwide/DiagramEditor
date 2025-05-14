// Initialize canvas
const canvas = new fabric.Canvas('canvas', {
    width: 800,
    height: 600,
    selection: true,
    preserveObjectStacking: true,
    controlsAboveOverlay: true
});

// Tool states
let currentTool = 'select';
let isDrawing = false;
let startPoint = null;
let uploadedImage = null;
let selectedObject = null;

// Initialize tools
const tools = {
    select: document.getElementById('selectTool'),
    rectangle: document.getElementById('rectangleTool'),
    arrow: document.getElementById('arrowTool'),
    text: document.getElementById('textTool'),
    delete: document.getElementById('deleteTool'),
    bringForward: document.getElementById('bringForward'),
    sendBackward: document.getElementById('sendBackward'),
    export: document.getElementById('exportBtn'),
    import: document.getElementById('importBtn'),
    upload: document.getElementById('uploadBtn')
};

// Function to create editable text from image
async function createEditableTextFromImage(imageData) {
    try {
        // Create a temporary canvas to process the image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = imageData.width;
        tempCanvas.height = imageData.height;
        tempCtx.drawImage(imageData, 0, 0);

        // Use Tesseract.js for OCR
        const result = await Tesseract.recognize(
            tempCanvas.toDataURL(),
            'eng',
            {
                logger: m => console.log(m)
            }
        );

        // Create editable text objects for each detected word
        result.data.words.forEach(word => {
            const text = new fabric.IText(word.text, {
                left: word.bbox.x0,
                top: word.bbox.y0,
                fontSize: Math.abs(word.bbox.y1 - word.bbox.y0),
                fill: '#000',
                selectable: true,
                hasControls: true,
                hasBorders: true,
                cornerColor: '#0d6efd',
                cornerSize: 10,
                transparentCorners: false,
                padding: 5,
                backgroundColor: 'rgba(255,255,255,0.8)'
            });
            canvas.add(text);
        });
    } catch (error) {
        console.error('Error processing text:', error);
    }
}

// Function to detect and create editable shapes
function detectAndCreateShapes(imageData) {
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = imageData.width;
    tempCanvas.height = imageData.height;
    tempCtx.drawImage(imageData, 0, 0);

    // Get image data for processing
    const imageDataObj = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageDataObj.data;

    // Simple edge detection
    for (let y = 0; y < tempCanvas.height; y++) {
        for (let x = 0; x < tempCanvas.width; x++) {
            const idx = (y * tempCanvas.width + x) * 4;
            
            // Check for significant color changes (edges)
            if (x > 0 && y > 0) {
                const prevIdx = (y * tempCanvas.width + (x - 1)) * 4;
                const aboveIdx = ((y - 1) * tempCanvas.width + x) * 4;
                
                if (Math.abs(data[idx] - data[prevIdx]) > 30 ||
                    Math.abs(data[idx] - data[aboveIdx]) > 30) {
                    // Create a small rectangle at edge points
                    const rect = new fabric.Rect({
                        left: x,
                        top: y,
                        width: 2,
                        height: 2,
                        fill: '#000',
                        selectable: true,
                        hasControls: true,
                        hasBorders: true,
                        cornerColor: '#0d6efd',
                        cornerSize: 10,
                        transparentCorners: false
                    });
                    canvas.add(rect);
                }
            }
        }
    }
}

// Enhanced image upload handling
document.getElementById('imageUpload').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = async function(event) {
            const img = new Image();
            img.onload = async function() {
                // Clear existing content
                canvas.clear();
                
                // Create fabric image
                const fabricImage = new fabric.Image(img, {
                    left: 0,
                    top: 0,
                    selectable: true,
                    hasControls: true,
                    hasBorders: true,
                    lockMovementX: false,
                    lockMovementY: false,
                    lockRotation: false,
                    lockScalingX: false,
                    lockScalingY: false,
                    cornerColor: '#0d6efd',
                    cornerSize: 10,
                    transparentCorners: false,
                    opacity: 0.5 // Make the background image semi-transparent
                });
                
                // Scale image to fit canvas while maintaining aspect ratio
                const scale = Math.min(
                    canvas.width / img.width,
                    canvas.height / img.height
                );
                
                fabricImage.scale(scale);
                
                // Center the image
                fabricImage.set({
                    left: (canvas.width - img.width * scale) / 2,
                    top: (canvas.height - img.height * scale) / 2
                });
                
                canvas.add(fabricImage);
                canvas.setActiveObject(fabricImage);
                uploadedImage = fabricImage;
                
                // Process the image to create editable assets
                await createEditableTextFromImage(img);
                detectAndCreateShapes(img);
                
                canvas.renderAll();
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Enhanced text tool
function setupTextTool() {
    canvas.on('mouse:down', (o) => {
        const pointer = canvas.getPointer(o.e);
        const text = new fabric.IText('Double click to edit', {
            left: pointer.x,
            top: pointer.y,
            fontSize: 20,
            fill: '#000',
            selectable: true,
            hasControls: true,
            hasBorders: true,
            cornerColor: '#0d6efd',
            cornerSize: 10,
            transparentCorners: false,
            padding: 5,
            backgroundColor: 'rgba(255,255,255,0.8)'
        });
        
        canvas.add(text);
        canvas.setActiveObject(text);
        text.enterEditing();
    });
}

// Enhanced rectangle tool
function setupRectangleTool() {
    canvas.on('mouse:down', (o) => {
        isDrawing = true;
        const pointer = canvas.getPointer(o.e);
        startPoint = { x: pointer.x, y: pointer.y };
        
        const rect = new fabric.Rect({
            left: startPoint.x,
            top: startPoint.y,
            width: 0,
            height: 0,
            fill: 'transparent',
            stroke: '#000',
            strokeWidth: 2,
            selectable: true,
            hasControls: true,
            hasBorders: true,
            cornerColor: '#0d6efd',
            cornerSize: 10,
            transparentCorners: false
        });
        
        canvas.add(rect);
        canvas.setActiveObject(rect);
    });
    
    canvas.on('mouse:move', (o) => {
        if (!isDrawing) return;
        const pointer = canvas.getPointer(o.e);
        const rect = canvas.getActiveObject();
        
        if (rect) {
            const width = pointer.x - startPoint.x;
            const height = pointer.y - startPoint.y;
            
            rect.set({
                width: Math.abs(width),
                height: Math.abs(height),
                left: width > 0 ? startPoint.x : pointer.x,
                top: height > 0 ? startPoint.y : pointer.y
            });
            
            canvas.renderAll();
        }
    });
    
    canvas.on('mouse:up', () => {
        isDrawing = false;
    });
}

// Enhanced arrow tool
function setupArrowTool() {
    canvas.on('mouse:down', (o) => {
        isDrawing = true;
        const pointer = canvas.getPointer(o.e);
        startPoint = { x: pointer.x, y: pointer.y };
        
        const line = new fabric.Line([startPoint.x, startPoint.y, startPoint.x, startPoint.y], {
            stroke: '#000',
            strokeWidth: 2,
            selectable: true,
            hasControls: true,
            hasBorders: true,
            cornerColor: '#0d6efd',
            cornerSize: 10,
            transparentCorners: false
        });
        
        canvas.add(line);
        canvas.setActiveObject(line);
    });
    
    canvas.on('mouse:move', (o) => {
        if (!isDrawing) return;
        const pointer = canvas.getPointer(o.e);
        const line = canvas.getActiveObject();
        
        if (line) {
            line.set({
                x2: pointer.x,
                y2: pointer.y
            });
            
            // Add arrow head
            const angle = Math.atan2(pointer.y - startPoint.y, pointer.x - startPoint.x);
            const arrowLength = 20;
            
            const arrow = new fabric.Triangle({
                left: pointer.x,
                top: pointer.y,
                angle: (angle * 180 / Math.PI) + 90,
                width: 20,
                height: 20,
                fill: '#000',
                selectable: true,
                hasControls: true,
                hasBorders: true,
                cornerColor: '#0d6efd',
                cornerSize: 10,
                transparentCorners: false
            });
            
            canvas.add(arrow);
            canvas.renderAll();
        }
    });
    
    canvas.on('mouse:up', () => {
        isDrawing = false;
    });
}

// Enhanced object selection
canvas.on('selection:created', function(e) {
    selectedObject = e.target;
});

canvas.on('selection:updated', function(e) {
    selectedObject = e.target;
});

canvas.on('selection:cleared', function() {
    selectedObject = null;
});

// Enhanced delete tool
tools.delete.addEventListener('click', () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.remove(activeObject);
        canvas.renderAll();
    }
});

// Enhanced layer management
tools.bringForward.addEventListener('click', () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.bringForward(activeObject);
        canvas.renderAll();
    }
});

tools.sendBackward.addEventListener('click', () => {
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
        canvas.sendBackwards(activeObject);
        canvas.renderAll();
    }
});

// Enhanced export functionality
tools.export.addEventListener('click', () => {
    // Export as JSON
    const json = JSON.stringify(canvas.toJSON());
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.json';
    a.click();
    URL.revokeObjectURL(url);
    
    // Export as PNG
    const dataURL = canvas.toDataURL({
        format: 'png',
        quality: 1
    });
    const imgBlob = dataURLtoBlob(dataURL);
    const imgUrl = URL.createObjectURL(imgBlob);
    const imgLink = document.createElement('a');
    imgLink.href = imgUrl;
    imgLink.download = 'diagram.png';
    imgLink.click();
    URL.revokeObjectURL(imgUrl);
});

// Helper function to convert Data URL to Blob
function dataURLtoBlob(dataURL) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// Enhanced import functionality
tools.import.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const json = JSON.parse(event.target.result);
            canvas.loadFromJSON(json, () => {
                canvas.renderAll();
            });
        };
        reader.readAsText(file);
    };
    input.click();
});

// Set up tool buttons
Object.keys(tools).forEach(tool => {
    if (tools[tool]) {
        tools[tool].addEventListener('click', () => {
            if (tool !== 'delete' && tool !== 'bringForward' && tool !== 'sendBackward' && tool !== 'export' && tool !== 'import' && tool !== 'upload') {
                setActiveTool(tool);
            }
        });
    }
});

// Tool activation
function setActiveTool(tool) {
    currentTool = tool;
    Object.keys(tools).forEach(t => {
        if (tools[t]) {
            tools[t].classList.remove('active');
        }
    });
    tools[tool].classList.add('active');
    
    // Update canvas behavior
    canvas.isDrawingMode = false;
    canvas.selection = tool === 'select';
    
    // Remove any existing event listeners
    canvas.off('mouse:down');
    canvas.off('mouse:move');
    canvas.off('mouse:up');
    
    // Add new event listeners based on tool
    switch(tool) {
        case 'rectangle':
            setupRectangleTool();
            break;
        case 'arrow':
            setupArrowTool();
            break;
        case 'text':
            setupTextTool();
            break;
    }
}

// Initialize with select tool
setActiveTool('select');

