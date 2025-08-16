// src/services/retirementService.js
import { v4 as uuidv4 } from 'uuid';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import axios from 'axios';
import emailjs from 'emailjs-com';
import QRCode from 'qrcode';

const apiUrl = "https://api.hestiya.com/api/";
// Update the Cloudinary URL to force PNG format
const CLOUDINARY_LOGO_URL = "https://res.cloudinary.com/dzpdqcmxv/image/upload/v1746019483/ieapj6ooqqgwzlgrx8pr.png";

// Initialize EmailJS
emailjs.init('pvrPnVSJckv1cyX3D');

// Utility function to fetch image and convert to proper format
const fetchImageAsBytes = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch image');
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
};

// Utility function to convert image to data URL
const getImageAsDataUrl = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting image to data URL:', error);
    throw error;
  }
};

export const submitRetirement = async (retirementData,type) => {
  try {
    // Generate unique retirement ID
    const retirement_id = uuidv4();
    // console.log("Retirement data:", { ...retirementData, retirement_id });

    // Pre-fetch the logo image
    const logoBytes = await fetchImageAsBytes(CLOUDINARY_LOGO_URL);
    
    // Generate certificate with pre-fetched logo
    const pdfBytes = await generateCertificate({
      ...retirementData,
      retirement_id,
      logoBytes
    }, type);

    // downloadCertificate(pdfBytes, retirement_id); 
    // return;

    // Convert PDF to base64 for API submission
    const pdfBase64 = arrayBufferToBase64(pdfBytes);

    // Prepare form data for API submission
    const formData = new FormData();
    formData.append('order_item_id', retirementData.project_id);
    formData.append('amount', retirementData.amount);
    if(type === "redeem") {
      formData.append('redemption_id', retirement_id);
    }else{
    formData.append('retirement_id', retirement_id);
    }
    formData.append('name', retirementData.user_name);
    formData.append('email', retirementData.user_email);
    formData.append('reason', retirementData.retirement_reason);
    if(type==="redeem") {formData.append('redemption_type', retirementData.retirement_type);}
    else{
    formData.append('retirement_type', retirementData.retirement_type);}

    // Convert base64 to Blob and append to FormData
    const pdfBlob = base64ToBlob(pdfBase64, 'application/pdf');
    if(type === "redeem") {
      formData.append('redemption_certificate', pdfBlob, `${retirement_id}.pdf`);
    }else{
    // For retirement, append retirement_certificate
    formData.append('retirement_certificate', pdfBlob, `${retirement_id}.pdf`);
    }
    // Submit to API
    if(type === "redeem") {
      // console.log("Submitting redemption request with ID:", retirement_id);
  const apiResponse = await axios.post(`${apiUrl}radeem-credits/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });


      if (apiResponse) {
      // console.log("Redeem processed successfully:", apiResponse.data.message);
      // Download certificate only after successful API submission
      // downloadCertificate(pdfBytes, retirement_id);

      // Send email with certificate
      // await sendRetirementEmail(
      //   retirementData.user_email,
      //   retirementData.user_name,
      //   retirement_id,
      //   retirementData.amount,
      //   retirementData.project_name,
      //   retirementData.retirement_date,
      //   pdfBytes
      // );

      return {
        success: true,
        message: "Redeem processed successfully!",
        retirement_id
      };
    } else {
      throw new Error(apiResponse.data.message || "Failed to process Redeemption");
    }
    } else {
    const apiResponse = await axios.post(`${apiUrl}retire-credits/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    if (apiResponse) {
      // console.log("Retirement processed successfully:", apiResponse.data.message);
      // Download certificate only after successful API submission
      // downloadCertificate(pdfBytes, retirement_id);

      // Send email with certificate
      // await sendRetirementEmail(
      //   retirementData.user_email,
      //   retirementData.user_name,
      //   retirement_id,
      //   retirementData.amount,
      //   retirementData.project_name,
      //   retirementData.retirement_date,
      //   pdfBytes
      // );

      return {
        success: true,
        message: "Retirement processed successfully!",
        retirement_id
      };
    } else {
      throw new Error(apiResponse.data.message || "Failed to process retirement");
    }
  }
    
  } catch (error) {
    console.error("Retirement process failed:", error);
    throw new Error(error.response?.data?.error || "Failed to complete retirement process");
  }
};

// const generateCertificate = async (retirementData) => {
//   try {
//     const pdfDoc = await PDFDocument.create();
//     const page = pdfDoc.addPage([842, 695]); // A4 in landscape

//     // Load fonts
//     const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
//     const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
//     const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

//     // Embed the logo using data URL approach
//     let logoImage;
//     try {
//       // Convert image to data URL
//       const dataUrl = await getImageAsDataUrl(CLOUDINARY_LOGO_URL);
//       const base64Data = dataUrl.split(',')[1];
//       const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
//       try {
//         logoImage = await pdfDoc.embedPng(imageBytes);
//       } catch (pngError) {
//         console.warn('PNG embedding failed, trying JPG:', pngError);
//         logoImage = await pdfDoc.embedJpg(imageBytes);
//       }
//     } catch (error) {
//       console.error("Logo embedding failed:", error);
//     }

//     // Page layout configuration
//     const margin = 50;
//     const pageWidth = page.getWidth();
//     const pageHeight = page.getHeight();
//     const contentWidth = pageWidth - (2 * margin);
//     const pageCenter = pageWidth / 2;

//     // Draw border with green color
//     page.drawRectangle({
//       x: margin,
//       y: margin,
//       width: contentWidth,
//       height: pageHeight - (2 * margin),
//       borderColor: rgb(0, 0.5, 0),
//       borderWidth: 3,
//     });

//     // Inner decorative border
//     page.drawRectangle({
//       x: margin + 10,
//       y: margin + 10,
//       width: contentWidth - 20,
//       height: pageHeight - (2 * margin) - 20,
//       borderColor: rgb(0, 0.5, 0),
//       borderWidth: 1,
//     });

//     let currentY = pageHeight - 100; // Start position

//     // Draw logo
//     if (logoImage) {
//       const logoHeight = 80;
//       const aspectRatio = logoImage.width / logoImage.height;
//       const logoWidth = logoHeight * aspectRatio;
      
//       page.drawImage(logoImage, {
//         x: pageCenter - (logoWidth / 2),
//         y: currentY - logoHeight,
//         width: logoWidth,
//         height: logoHeight,
//       });
      
//       currentY -= (logoHeight + 50); // More space after logo
//     }

//     // Title with decorative lines
//     const titleText = 'CERTIFICATE OF CARBON CREDIT RETIREMENT';
//     const titleWidth = boldFont.widthOfTextAtSize(titleText, 28);
//     const titleX = pageCenter - (titleWidth / 2);
    
//     // Draw decorative lines
//     const lineLength = 120;
//     page.drawLine({
//       start: { x: titleX - lineLength - 20, y: currentY + 12 },
//       end: { x: titleX - 20, y: currentY + 12 },
//       thickness: 2,
//       color: rgb(0, 0.5, 0),
//     });

//     page.drawLine({
//       start: { x: titleX + titleWidth + 20, y: currentY + 12 },
//       end: { x: titleX + titleWidth + lineLength + 20, y: currentY + 12 },
//       thickness: 2,
//       color: rgb(0, 0.5, 0),
//     });

//     // Draw title
//     page.drawText(titleText, {
//       x: titleX,
//       y: currentY,
//       size: 28,
//       font: boldFont,
//       color: rgb(0, 0.5, 0),
//     });

//     currentY -= 40; // More space after title

//     // Main content with increased spacing
//     const leftMargin = margin + 40;
//     const contentFontSize = 16;

//     // "This certifies that" text
//     page.drawText('This certifies that', {
//       x: leftMargin,
//       y: currentY,
//       size: contentFontSize,
//       font: regularFont,
//     });

//     currentY -= 35; // Increased spacing

//     // Name in larger font
//     page.drawText(retirementData.user_name, {
//       x: leftMargin,
//       y: currentY,
//       size: 26,
//       font: boldFont,
//     });

//     currentY -= 35; // Increased spacing

//     // Amount retired
//     page.drawText(`has retired ${retirementData.amount} Tonnes CO2e from`, {
//       x: leftMargin,
//       y: currentY,
//       size: contentFontSize,
//       font: regularFont,
//     });

//     currentY -= 35; // Increased spacing

//     // Project name with word wrap
//     const projectNameLines = wrapText(retirementData.project_name, 50);
//     for (const line of projectNameLines) {
//       page.drawText(line, {
//         x: leftMargin,
//         y: currentY,
//         size: 22,
//         font: boldFont,
//         color: rgb(0, 0.5, 0),
//       });
//       currentY -= 35;
//     }

//     currentY -= 20; // More space before details

//     // Details section
//     const detailsX = leftMargin;
//     const detailsCol2X = pageCenter + 50;
//     const detailsFontSize = 14;

//     // Details header
//     page.drawText('Retirement Details:', {
//       x: detailsX,
//       y: currentY,
//       size: 18,
//       font: boldFont,
//     });

//     currentY -= 35; // Increased spacing

//     // Left column
//     page.drawText(`ID: ${retirementData.retirement_id}`, {
//       x: detailsX,
//       y: currentY,
//       size: detailsFontSize,
//       font: regularFont,
//     });

//     // Right column - Date
//     page.drawText(`Date: ${new Date(retirementData.retirement_date).toLocaleDateString()}`, {
//       x: detailsCol2X,
//       y: currentY,
//       size: detailsFontSize,
//       font: regularFont,
//     });

//     currentY -= 30; // Increased spacing

//     // Type
//     page.drawText(`Type: ${retirementData.retirement_type}`, {
//       x: detailsX,
//       y: currentY,
//       size: detailsFontSize,
//       font: regularFont,
//     });

//     // Reason (if provided)
//     if (retirementData.retirement_reason) {
//       const reasonLines = wrapText(`Reason: ${retirementData.retirement_reason}`, 40);
//       reasonLines.forEach((line, index) => {
//         page.drawText(line, {
//           x: detailsCol2X,
//           y: currentY - (index * 25), // Increased line spacing
//           size: detailsFontSize,
//           font: regularFont,
//         });
//       });
//     }

//     // Footer section from bottom up
//     let footerY = margin + 60;

//     // Registry name
//     const registryText = 'Hestiya Logs';
//     const registryWidth = boldFont.widthOfTextAtSize(registryText, 16);
//     page.drawText(registryText, {
//       x: pageCenter - (registryWidth / 2),
//       y: footerY,
//       size: 16,
//       font: boldFont,
//     });

//     footerY += 25;

//     // Thank you message
//     const thankYouText = 'Thank you for your contribution to climate action';
//     const thankYouWidth = italicFont.widthOfTextAtSize(thankYouText, 18);
//     page.drawText(thankYouText, {
//       x: pageCenter - (thankYouWidth / 2),
//       y: footerY,
//       size: 18,
//       font: italicFont,
//       color: rgb(0, 0.5, 0),
//     });

//     footerY -= 45;

//     // Verification text at the bottom
//     const verificationText = 'This certificate is electronically verified and registered in the Hestiya Carbon Registry';
//     const verificationWidth = italicFont.widthOfTextAtSize(verificationText, 12);
//     page.drawText(verificationText, {
//       x: pageCenter - (verificationWidth / 2),
//       y: footerY,
//       size: 12,
//       font: italicFont,
//     });

//     return await pdfDoc.save();
//   } catch (error) {
//     console.error("Certificate generation failed:", error);
//     throw new Error("Failed to generate certificate");
//   }
// };

const generateCertificate = async (retirementData,type) => {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 695]); // A4 in landscape

    // Load fonts
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const italicFont = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

    // Embed the logo using data URL approach
    let logoImage;
    try {
      // Convert image to data URL
      const dataUrl = await getImageAsDataUrl(CLOUDINARY_LOGO_URL);
      const base64Data = dataUrl.split(',')[1];
      const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
      
      try {
        logoImage = await pdfDoc.embedPng(imageBytes);
      } catch (pngError) {
        console.warn('PNG embedding failed, trying JPG:', pngError);
        logoImage = await pdfDoc.embedJpg(imageBytes);
      }
    } catch (error) {
      console.error("Logo embedding failed:", error);
    }

    // Page layout configuration
    const margin = 50;
    const pageWidth = page.getWidth();
    const pageHeight = page.getHeight();
    const contentWidth = pageWidth - (2 * margin);
    const pageCenter = pageWidth / 2;

    // Draw border with green color
    page.drawRectangle({
      x: margin,
      y: margin,
      width: contentWidth,
      height: pageHeight - (2 * margin),
      borderColor: rgb(0, 0.5, 0),
      borderWidth: 3,
    });

    // Inner decorative border
    page.drawRectangle({
      x: margin + 10,
      y: margin + 10,
      width: contentWidth - 20,
      height: pageHeight - (2 * margin) - 20,
      borderColor: rgb(0, 0.5, 0),
      borderWidth: 1,
    });

    let currentY = pageHeight - 100; // Start position

    // Draw logo
    if (logoImage) {
      const logoHeight = 80;
      const aspectRatio = logoImage.width / logoImage.height;
      const logoWidth = logoHeight * aspectRatio;
      
      page.drawImage(logoImage, {
        x: pageCenter - (logoWidth / 2),
        y: currentY - logoHeight,
        width: logoWidth,
        height: logoHeight,
      });
      
      currentY -= (logoHeight + 50); // More space after logo
    }

    // Title with decorative lines
    const titleText = type === "redeem" ? 'CERTIFICATE OF I-RECS REDEMPTION': 'CERTIFICATE OF CARBON CREDIT RETIREMENT';
    const titleWidth = boldFont.widthOfTextAtSize(titleText, 28);
    const titleX = pageCenter - (titleWidth / 2);
    
    // Draw decorative lines
    const lineLength = 120;
    page.drawLine({
      start: { x: titleX - lineLength - 20, y: currentY + 12 },
      end: { x: titleX - 20, y: currentY + 12 },
      thickness: 2,
      color: rgb(0, 0.5, 0),
    });

    page.drawLine({
      start: { x: titleX + titleWidth + 20, y: currentY + 12 },
      end: { x: titleX + titleWidth + lineLength + 20, y: currentY + 12 },
      thickness: 2,
      color: rgb(0, 0.5, 0),
    });

    // Draw title
    page.drawText(titleText, {
      x: titleX,
      y: currentY,
      size: 28,
      font: boldFont,
      color: rgb(0, 0.5, 0),
    });

    currentY -= 40; // More space after title

    // Main content with increased spacing
    const leftMargin = margin + 40;
    const contentFontSize = 16;

    // "This certifies that" text
    page.drawText('This certifies that', {
      x: leftMargin,
      y: currentY,
      size: contentFontSize,
      font: regularFont,
    });

    currentY -= 35; // Increased spacing

    // Name in larger font
    page.drawText(retirementData.user_name, {
      x: leftMargin,
      y: currentY,
      size: 26,
      font: boldFont,
    });

    currentY -= 35; // Increased spacing

    // Amount retired
    page.drawText(`has retired ${retirementData.amount} ${type === "redeem" ? "MWh" :"Tonnes"}  CO2e from`, {
      x: leftMargin,
      y: currentY,
      size: contentFontSize,
      font: regularFont,
    });

    currentY -= 35; // Increased spacing

    // Project name with word wrap
    const projectNameLines = wrapText(retirementData.project_name, 50);
    for (const line of projectNameLines) {
      page.drawText(line, {
        x: leftMargin,
        y: currentY,
        size: 22,
        font: boldFont,
        color: rgb(0, 0.5, 0),
      });
      currentY -= 35;
    }

    currentY -= 10; // More space before details

    // Details section
    const detailsX = 110;
    const detailsCol2X =  pageCenter + 210;
    const detailsFontSize = 14;

    // Details header
    page.drawText(type === "redeem" ? 'Redeem Details' :'Retirement Details:', {
      x: detailsX,
      y: currentY,
      size: 18,
      font: boldFont,
    });

    currentY -= 35; // Increased spacing

    // Generate QR code with transaction details
    const baseUrl = type === "redeem" ? "https://api.hestiya.com/api/redemption-certificate"  : "https://api.hestiya.com/api/retirement-certificate"; 

const qrCodeData = `${baseUrl}/?id=${retirementData.retirement_id}`;
//  {
  // url: 
  // `${baseUrl}/?id=${retirementData.retirement_id}`,
  // id: retirementData.retirement_id,
  // date: retirementData.retirement_date,
  // type: retirementData.retirement_type,
  // reason: retirementData.retirement_reason,
  // user: retirementData.user_name,
  // amount: retirementData.amount,
  // project: retirementData.project_name,
  // registry: "Hestiya Logs"
// };

// Generate QR code as data URL - MODIFIED VERSION
const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrCodeData), {
  width: 300,
  margin: 8,
  color: {
    dark: '#000000', // Dark green dots to match your theme
    light: '#ffffff' // White background
  }
});
    
    // Convert data URL to image bytes
    const base64Data = qrCodeDataUrl.split(',')[1];
    const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const qrCodeImage = await pdfDoc.embedPng(imageBytes);
    
    // Draw QR code (100x100 pixels)
    const qrCodeSize = 100;
    page.drawImage(qrCodeImage, {
      x: detailsCol2X,
      y: currentY -80,
      width: qrCodeSize,
      height: qrCodeSize,
    });

    // Left column - ID text
    // page.drawText('Transaction ID:', {
    //   x: detailsX,
    //   y: currentY,
    //   size: detailsFontSize,
    //   font: regularFont,
    // });

    // Right column - Scan text
    page.drawText('Scan to verify:', {
      x: detailsCol2X,
      y: 257,
      size: detailsFontSize,
      font: regularFont,
    });

    currentY -= 0; // Increased spacing

    // Left column - ID value
    // page.drawText(retirementData.retirement_id, {
    //   x: detailsX,
    //   y: currentY,
    //   size: detailsFontSize,
    //   font: regularFont,
    // });

    currentY -= 0; // Increased spacing

    // Date
    page.drawText(`Date: ${new Date(retirementData.retirement_date).toLocaleDateString()}`, {
      x: detailsX,
      y: currentY,
      size: detailsFontSize,
      font: regularFont,
    });

    currentY -= 30; // Increased spacing

    // Type
    page.drawText(`Type: ${retirementData.retirement_type}`, {
      x: detailsX,
      y: currentY,
      size: detailsFontSize,
      font: regularFont,
    });

    // Reason (if provided)
    if (retirementData.retirement_reason) {
      // Format the reason: replace underscores with spaces and capitalize each word
      const formattedReason = retirementData.retirement_reason
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      const reasonLines = wrapText(`Reason: ${formattedReason}`, 40);
      reasonLines.forEach((line, index) => {
        page.drawText(line, {
          x: detailsX,
          y: currentY - (index * 25) - 30, // Increased line spacing
          size: detailsFontSize,
          font: regularFont,
        });
      });
    }

    // Footer section from bottom up
    let footerY = margin + 60;

    // Registry name
    const registryText = 'Hestiya Logs';
    const registryWidth = boldFont.widthOfTextAtSize(registryText, 16);
    page.drawText(registryText, {
      x: pageCenter - (registryWidth / 2),
      y: footerY,
      size: 16,
      font: boldFont,
    });

    footerY += 25;

    // Thank you message
    const thankYouText = 'Thank you for your contribution to climate action';
    const thankYouWidth = italicFont.widthOfTextAtSize(thankYouText, 18);
    page.drawText(thankYouText, {
      x: pageCenter - (thankYouWidth / 2),
      y: footerY,
      size: 18,
      font: italicFont,
      color: rgb(0, 0.5, 0),
    });

    footerY -= 45;

    // Verification text at the bottom
    const verificationText = 'This certificate is electronically verified and registered in the Hestiya Logs';
    const verificationWidth = italicFont.widthOfTextAtSize(verificationText, 12);
    page.drawText(verificationText, {
      x: pageCenter - (verificationWidth / 2),
      y: footerY,
      size: 12,
      font: italicFont,
    });

    return await pdfDoc.save();
  } catch (error) {
    console.error("Certificate generation failed:", error);
    throw new Error("Failed to generate certificate");
  }
};


// Helper function to generate QR code
async function generateQRCode(data) {
  // You can use any QR code generation service or library
  // Here's an example using the Google Charts API
  const encodedData = encodeURIComponent(data);
  return `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${encodedData}`;
}

// Helper function to wrap text
function wrapText(text, maxLength) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    if (currentLine.length + words[i].length + 1 <= maxLength) {
      currentLine += ' ' + words[i];
    } else {
      lines.push(currentLine);
      currentLine = words[i];
    }
  }
  lines.push(currentLine);
  return lines;
}

// // Helper function to get image as data URL
// async function getImageAsDataUrl(url) {
//   const response = await fetch(url);
//   const blob = await response.blob();
//   return new Promise((resolve) => {
//     const reader = new FileReader();
//     reader.onloadend = () => resolve(reader.result);
//     reader.readAsDataURL(blob);
//   });
// }

// Utility function to wrap text
// const wrapText = (text, maxLength) => {
//   if (!text) return [];
//   const words = text.split(' ');
//   const lines = [];
//   let currentLine = '';

//   words.forEach(word => {
//     const testLine = currentLine ? `${currentLine} ${word}` : word;
//     if (testLine.length <= maxLength) {
//       currentLine = testLine;
//     } else {
//       lines.push(currentLine);
//       currentLine = word;
//     }
//   });
  
//   if (currentLine) {
//     lines.push(currentLine);
//   }
  
//   return lines;
// };

const sendRetirementEmail = async (email, name, retirementId, amount, projectName, retirementDate, pdfBytes) => {
  try {
    // Convert PDF to base64
    const pdfBase64 = arrayBufferToBase64(pdfBytes);

    // Create email parameters
    const templateParams = {
      to_email: email,
      to_name: name,
      retirement_id: retirementId,
      amount: amount,
      project_name: projectName,
      retirement_date: new Date(retirementDate).toLocaleDateString(),
      attachment: pdfBase64 // EmailJS will handle this as attachment
    };

    // Send email with attachment
    const response = await emailjs.send(
      'service_13h27nh',
      'template_c1lpsqu',
      templateParams
    );

    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new Error("Failed to send email with certificate");
  }
};





const downloadCertificate = (pdfBytes, retirementId) => {
  try {
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Hestiya_Retirement_Certificate_${retirementId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error("Download failed:", error);
  }
};

// Helper function to convert array buffer to base64
const arrayBufferToBase64 = (buffer) => {
  const bytes = new Uint8Array(buffer);
  const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
  return btoa(binary);
};

// Helper function to convert base64 to Blob
const base64ToBlob = (base64, type = 'application/pdf') => {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type });
};



export const sendAccountDeletionEmail = async (userEmail, userName) => {
    try {
      const templateParams = {
        user_email: userEmail,
        user_name: userName,
        deletion_date: new Date(Date.now() + 48 * 60 * 60 * 1000).toLocaleDateString()
      };
    
        const response = await emailjs.send(
        'service_13h27nh',
        'template_5zy2jal',
        templateParams
        );
    
        console.log('Email sent successfully:', response);
        return true;
    } catch (error) {
        console.error("Email sending failed:", error);
        throw new Error("Failed to send email with certificate");
    }
    }





   const handleDelete = async () => {
     try {
       const finalReason = selectedReason === 'other' ? otherReason : selectedReason;
      //  console.log("Delete reason:", finalReason);
       
       // Send both the account deletion request and reason to the API
       const res = await axios.delete(
         `${apiUrl}user-signup/${hasAddress}/`,
         { 
           data: { 
             reason: finalReason 
           } 
         }
       );
       
       if (res) {
         await sendAccountDeletionEmail(userDetails?.email, userDetails?.first_name);
         toast.success("Account Deleted");
         setTimeout(() => {
           setUserDetails(null);
           localStorage.clear();
           disconnect();
           navigate("/");
         }, 1000);
       }
     } catch (error) {
       console.error("error", error);
       toast.error("Failed to delete account");
     } finally {
       setDeleteWarningOpen(false);
       setSelectedReason('');
       setOtherReason('');
     }
   };