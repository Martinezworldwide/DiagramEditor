# Diagram Editor

A powerful web-based diagram editor that allows you to edit existing diagrams and create new ones. Built with HTML5 Canvas and Fabric.js, this tool makes it easy to modify and enhance diagrams with precision.

## Main Features

- **Upload Existing Diagrams**: Upload any diagram image and convert it into editable elements
- **Automatic Text Detection**: Uses OCR (Tesseract.js) to detect and extract text from diagrams
- **Shape Detection**: Automatically detects shapes and lines in uploaded diagrams
- **Edit Existing Elements**: Modify any detected or created element:
  - Move, resize, and rotate
  - Edit text content
  - Change colors and styles
  - Delete unwanted elements
- **Add New Elements**:
  - Rectangles
  - Arrows
  - Text
- **Layer Management**: Control element stacking order (bring forward, send backward)
- **Export Options**: Save your diagrams as:
  - PNG images
  - JSON files (for later editing)
- **Import**: Load previously saved diagrams for further editing

## Live Demo

Visit the live demo at: [https://martinezworldwide.github.io/DiagramEditor](https://martinezworldwide.github.io/DiagramEditor)

## How to Use

1. **Upload a Diagram**:
   - Click the upload button (image icon)
   - Select your diagram image
   - The app will process the image and make elements editable

2. **Edit Existing Elements**:
   - Click any element to select it
   - Drag to move
   - Use corner handles to resize
   - Double-click text to edit
   - Use the delete button to remove elements

3. **Add New Elements**:
   - Select a tool (rectangle, arrow, text)
   - Click and drag to create shapes
   - Click to add text
   - Use layer controls to adjust stacking order

4. **Save Your Work**:
   - Export as PNG for sharing
   - Export as JSON to continue editing later
   - Import JSON files to resume editing

## Technologies Used

- HTML5 Canvas
- Fabric.js for canvas manipulation
- Tesseract.js for OCR
- Bootstrap 5 for UI
- Font Awesome for icons
- JavaScript (ES6+)

## License

MIT License
