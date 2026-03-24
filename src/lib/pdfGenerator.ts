import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateReceipt = (pago: any, miembro: any) => {
  // Create a new PDF document (A5 size for receipts)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5"
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Draw Header / Branding
  doc.setFillColor(142, 36, 170); // Purple bg for header
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("EVOLUTION", pageWidth / 2, 20, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("FITNESS GYM", pageWidth / 2, 28, { align: "center" });

  // Receipt Details Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("RECIBO DE PAGO", pageWidth / 2, 55, { align: "center" });

  // Receipt Metadata
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const dateStr = pago.fecha || new Date().toLocaleDateString('es-ES');
  const receiptId = pago.id ? pago.id.slice(0, 8).toUpperCase() : Math.floor(Math.random() * 1000000).toString();
  
  doc.text(`Nº de Recibo: #${receiptId}`, 15, 70);
  doc.text(`Fecha: ${dateStr}`, pageWidth - 15, 70, { align: "right" });

  // Customer Information Box
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(245, 245, 245);
  doc.roundedRect(15, 75, pageWidth - 30, 30, 3, 3, "FD");

  doc.setFont("helvetica", "bold");
  doc.text("DETALLES DEL CLIENTE", 20, 83);
  
  doc.setFont("helvetica", "normal");
  doc.text(`Nombre: ${miembro?.nombre || "Cliente General"}`, 20, 92);
  doc.text(`Cédula: ${pago.matricula || miembro?.matricula || "N/A"}`, 20, 100);

  // Payment Details Table
  const tableData = [
    [
      pago.membresia ? `Membresía: ${pago.membresia}` : "Mensualidad General",
      "1",
      `$${pago.monto || "0.00"}`
    ]
  ];

  (doc as any).autoTable({
    startY: 115,
    head: [['Concepto', 'Cantidad', 'Importe']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [142, 36, 170], textColor: [255, 255, 255] },
    styles: { fontSize: 10, cellPadding: 5 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 25, halign: 'center' },
      2: { cellWidth: 35, halign: 'right' }
    }
  });

  // Total Section
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL PAGADO:", pageWidth - 50, finalY);
  doc.setTextColor(0, 150, 0);
  doc.text(`$${pago.monto || "0.00"}`, pageWidth - 15, finalY, { align: "right" });

  // Footer Message
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("¡Gracias por su preferencia e inversión en su salud!", pageWidth / 2, finalY + 30, { align: "center" });

  // Save the PDF
  doc.save(`Recibo_Evolution_${receiptId}.pdf`);
};
