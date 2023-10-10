import { Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import * as PDFDocument from 'pdfkit';
import { Order } from './entities/order.entity';

@Injectable()
export class PdfService {
  async generatePdf(order: Order): Promise<string> {
    const pdfStream = new PDFDocument();
    const pdfFileName = 'order_details.pdf';

    // Create a write stream to save the PDF
    const pdfWriteStream = createWriteStream(pdfFileName);

    // Pipe the PDF content to the write stream
    pdfStream.pipe(pdfWriteStream);

    // Add content to the PDF
    pdfStream.fontSize(16).text('Détails de la commande', { align: 'center' });
    pdfStream.moveDown();

    // Add order information
    pdfStream.text('Informations sur la commande', {
      fontSize: 14,
      underline: true,
    });
    pdfStream.text(`Reférence: ${order.reference}`);
    pdfStream.text(`Email: ${order.email}`);
    pdfStream.text(`Nom et Prénom: ${order.firstName} ${order.lastName}`);
    pdfStream.text(`Numéro de téléphone: ${order.phoneNumber}`);
    pdfStream.text(`Prix Total: ${order.totalPrice} DT`);
    pdfStream.text(
      `Date de Commande: ${order.created_at.toLocaleString('fr-FR')}`,
    );
    pdfStream.moveDown();

    // Add table headers
    const tableHeaders = [
      'Reférence',
      'Nom',
      'Couleur',
      'Prix Unitaire',
      'Quantité',
      'Prix Total',
    ];

    // Define column widths
    const columnWidths = [100, 100, 100, 100, 100, 100];

    // Position and format the headers
    pdfStream.fontSize(12);
    pdfStream.text(tableHeaders.join('\t'), { columns: columnWidths });

    // Add order items to the table
    for (const item of order.orderItems) {
      const rowData = [
        item.reference,
        item.title,
        item.colorName,
        `${item.unitPrice} DT`,
        item.quantity.toString(),
        `${item.totalPrice} DT`,
      ];
      pdfStream.text(rowData.join('\t'), { columns: columnWidths });
    }

    // Finalize and close the PDF
    pdfStream.end();

    return pdfFileName;
  }
}
