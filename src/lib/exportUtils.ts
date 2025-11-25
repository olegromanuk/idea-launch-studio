import jsPDF from 'jspdf';

interface CanvasData {
  [key: string]: string;
}

interface CanvasSection {
  key: string;
  title: string;
  subtitle: string;
}

interface CanvasTab {
  id: string;
  title: string;
  sections: CanvasSection[];
}

export const exportToText = (canvasData: CanvasData, canvasTabs: CanvasTab[], projectTitle: string) => {
  let content = `${projectTitle}\n`;
  content += `${'='.repeat(projectTitle.length)}\n\n`;
  content += `Exported on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}\n\n`;

  canvasTabs.forEach((tab) => {
    content += `\n${'─'.repeat(60)}\n`;
    content += `${tab.title.toUpperCase()}\n`;
    content += `${'─'.repeat(60)}\n\n`;

    tab.sections.forEach((section) => {
      const value = canvasData[section.key];
      if (value && value.trim()) {
        content += `${section.title}\n`;
        content += `${'-'.repeat(section.title.length)}\n`;
        content += `${value}\n\n`;
      }
    });
  });

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_canvas.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToPDF = (canvasData: CanvasData, canvasTabs: CanvasTab[], projectTitle: string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(projectTitle, margin, yPosition);
  yPosition += 10;

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Exported on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, margin, yPosition);
  yPosition += 15;

  canvasTabs.forEach((tab) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    // Tab title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(59, 130, 246); // Primary blue color
    doc.text(tab.title, margin, yPosition);
    yPosition += 8;

    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    tab.sections.forEach((section) => {
      const value = canvasData[section.key];
      if (value && value.trim()) {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          doc.addPage();
          yPosition = margin;
        }

        // Section title
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 0);
        doc.text(section.title, margin, yPosition);
        yPosition += 6;

        // Section content
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 60, 60);
        
        const lines = doc.splitTextToSize(value, maxWidth);
        lines.forEach((line: string) => {
          if (yPosition > pageHeight - 20) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += 5;
        });
        
        yPosition += 5;
      }
    });

    yPosition += 5;
  });

  doc.save(`${projectTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_canvas.pdf`);
};
