window.pdfService = {
    exportElementToPdf: async function (elementId, filename) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error("Element not found: " + elementId);
            return;
        }

        try {
            // Add temp class for better PDF styling
            element.classList.add('pdf-export-mode');
            // Wait a bit for any images or styles to settle
            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(element, {
                scale: 2, // Higher quality
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff"
            });

            element.classList.remove('pdf-export-mode');

            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            const margin = 20; // Increased margin for better look
            const contentWidth = pageWidth - (2 * margin);
            const contentHeight = pageHeight - (2 * margin);

            const imgProps = pdf.getImageProperties(imgData);
            const imgHeightInPdf = (imgProps.height * contentWidth) / imgProps.width;

            let heightLeft = imgHeightInPdf;
            let page = 0;

            while (heightLeft > 0) {
                if (page > 0) pdf.addPage();

                // Draw the image slice
                pdf.addImage(imgData, 'PNG', margin, margin - (page * contentHeight), contentWidth, imgHeightInPdf);

                // Mask Top Margin
                pdf.setFillColor(255, 255, 255);
                pdf.rect(0, 0, pageWidth, margin, 'F');

                // Mask Bottom Margin
                pdf.rect(0, pageHeight - margin, pageWidth, margin, 'F');

                // Optional: Add page number
                pdf.setFontSize(10);
                pdf.setTextColor(150);
                pdf.text(`Strona ${page + 1}`, pageWidth / 2, pageHeight - (margin / 2), { align: 'center' });

                heightLeft -= contentHeight;
                page++;
            }

            pdf.save(filename || 'jadlospis.pdf');
        } catch (error) {
            console.error("PDF Export Error: ", error);
            element.classList.remove('pdf-export-mode');
            throw error;
        }
    }
};
