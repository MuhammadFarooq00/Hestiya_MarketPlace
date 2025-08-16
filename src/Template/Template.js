import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { getGasPrice } from "@wagmi/core";
import { config } from "../config/WalletConfig.jsx";
import moment from "moment";
import { images } from "../assets/index.js";

const generateTransactionLink = (hashId) => {
  return `https://polygonscan.com/tx/${hashId}`;
};
const generateAddressLink = (address) => {
  return `https://polygonscan.com/address/${address}`;
};

const currentPaymentDate = moment().format("DD/MM/YYYY");

const gasPricesCalulation = async (usedGas) => {
  try {
    const gasPrice = await getGasPrice(config); // Fetch gas price using wagmi
    const gasCostInWei = usedGas * BigInt(gasPrice.toString()); // Gas used (fees) * Gas price
    const gasCostInEther = Number(gasCostInWei) / 1e18; // Convert wei to Ether

    // Round off to 6 decimal points
    const gasCostRounded = gasCostInEther?.toFixed(6);

    // console.log("Gas Price in Wei:", gasPrice.toString());
    // console.log("Gas Cost in Wei:", gasCostInWei.toString());
    // console.log("Gas Used in Ether (rounded):", gasCostRounded);
    return gasCostRounded;
  } catch (error) {
    console.error("error fatching gas prices");
  }
};

export const generateAndDownloadPurchasePDF = async (pdfData) => {
  // console.log("PDF Data:", pdfData);
  const gasCost = await gasPricesCalulation(pdfData.fees) || pdfData.fees;
  const totalBuyAmount = pdfData.trades?.reduce((sum, trade) => {
    return sum + trade.totalTonnes * trade.pricePerTonne;
  }, 0);
  const percentage = (+totalBuyAmount * +pdfData.hestiyafee) / 100;

  // Create a temporary container for the HTML content
  const element = document.createElement("div");
  element.style.padding = "50px";
  element.style.backgroundColor = "#fff";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.width = "210mm";
  element.style.margin = "0 auto";
  element.style.position = "absolute";
  element.style.top = "-9999px";

    
  // Generate transaction hash display if available
  const transactionHashDisplay = pdfData?.hashId 
    ? `TXN-${pdfData.hashId.slice(0, 5)}...${pdfData.hashId.slice(-5)}`
    : 'None';
  
  // Dynamically generate HTML content matching the receipt style
  element.innerHTML = `
  <div style="max-width: 800px; margin: 0 auto; font-family: Arial, sans-serif;">
    <!-- Header Section -->
    <div style="margin-bottom: 30px;">
      <div style=" border-bottom: 3px solid #7a7977; padding-bottom: 20px;">
       
        <div style="">
          <h1 style="margin: 0; color: #333; font-size: 24px; font-weight: bold;">CARBON CREDIT / I-REC PURCHASE RECEIPT</h1>
          <p style="margin: 15px 0 5px 0; color: #666; font-size: 14px;"><span style="font-weight: bold; text: black; "> Receipt No.: </span> HST-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}</p>
          <p style="margin: 5px 0 0; color: #666; font-size: 14px;"><span style="font-weight: bold; text: black; "> Date: </span> ${currentPaymentDate}</p>
         <p style="margin: 5px 0 0; color: #666; font-size: 14px;">
  <span style="font-weight: bold; color: black;">Transaction ID: </span>
  <span id="transactionLink" style="color: #007bff; text-decoration: underline; cursor: pointer;">
    ${transactionHashDisplay}
  </span>
</p>
        </div>
      </div>
    </div>

    <!-- Buyer Information Section -->
    <div style="margin-bottom: 30px;">
      <h2 style="margin: 0 0 10px; color: #333; font-size: 16px; font-weight: bold;">🔹 Buyer Information:</h2>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; ">
<ul style="list-style: disc; padding-left: 20px; margin: 0;">
<li style="margin: 5px 0; color: #333; list-style-position: outside; display: flex; align-items: center; position: relative;">
    <span style="position: absolute; left: -20px; top: 80%; transform: translateY(-50%); display: inline-block; width: 5px; height: 5px; background-color: #333; border-radius: 50%;"></span>
    <strong> Name:${" "} </strong> ${pdfData.buyerName || '[Full Name / Company Name]'}
</li>
<li style="margin: 5px 0; color: #333; list-style-position: outside; display: flex; align-items: center; position: relative;">
    <span style="position: absolute; left: -20px; top: 80%; transform: translateY(-50%); display: inline-block; width: 5px; height: 5px; background-color: #333; border-radius: 50%;"></span>
    <strong> Email:${" "} </strong> ${pdfData.buyerEmail || '[user@example.com]'}
</li>
</ul>
      </div>
    </div>

    <!-- Purchase Details Section -->
    <div style="margin-bottom: 30px; border-top: 3px solid #7a7977; padding-top: 20px; border-bottom: 3px solid #7a7977; padding-bottom: 20px;">           
      <h2 style="margin: 0 0 30px; color: #333; font-size: 16px; font-weight: bold;">🔹 Purchase Details:</h2>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
        <thead>
          <tr style="background-color: #fff;">
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Total</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Unit Price</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Quantity</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Description</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Item</th>
          </tr>
        </thead>
        <tbody>
         ${pdfData.trades.map((trade, ind) => `
  <tr>
    <td style="padding: 10px; border: 1px solid #ddd;">${pdfData.paymentMethod == "Bank" ? "USD" : "USDT"} ${(trade.totalTonnes * trade.pricePerTonne).toFixed(2)}</td>
    <td style="padding: 10px; border: 1px solid #ddd;">${trade.totalTonnes} Tonnes</td>
    <td style="padding: 10px; border: 1px solid #ddd;">${pdfData.paymentMethod == "Bank" ? "USD" : "USDT"} ${trade.pricePerTonne}</td>
    <td style="padding: 10px; border: 1px solid #ddd;">${trade.projectName} – ${trade.vintageYear}</td>
    <td style="padding: 10px; border: 1px solid #ddd;">${pdfData.itemType[ind] === "IRECS" ? "I-RECs" : pdfData.itemType[ind] }</td>
  </tr>
`).join('')}

        </tbody>
      </table>
      
      <div style="margin-top: 15px;">
        <p style="margin: 15px 0; font-weight: bold; color: #666;"><span style="font-weight: bold; text: black; ">Total Amount Paid: </span> ${pdfData.paymentMethod == "Bank" ? "USD" : "USDT"} ${(+totalBuyAmount + +gasCost + +percentage).toFixed(2)}</p>
        <p style="margin: 5px 0; color: #666;"><span style="font-weight: bold; text: black; "> Payment Mode: </span> ${pdfData.paymentMethod == "Bank" ?  'Through Bank Transfer' : 'Through Wallet'}</p>
        <p style="margin: 5px 0; color: #666; font-weight: bold;"><span style="font-weight: bold; text: black; ">Status: </span> ✅ Paid</p>
      </div>
    </div>

    <!-- Project Details Section -->
    <div style="margin-bottom: 30px;">
      <h2 style="margin: 0 0 10px; color: #333; font-size: 16px; font-weight: bold;">🔹 Project Details:</h2>
      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
      
      <ul style="list-style: disc; padding-left: 20px; margin: 0;">


      


<li style="margin: 5px 0; color: #333; list-style-position: outside; display: flex; align-items: center; position: relative;">
    <span style="position: absolute; left: -20px; top: 80%; transform: translateY(-50%); display: inline-block; width: 5px; height: 5px; background-color: #333; border-radius: 50%;"></span>
    <strong> Registry:${" "} </strong> ${pdfData.registry || 'None'}
</li>

<li style="margin: 5px 0; color: #333; list-style-position: outside; display: flex; align-items: center; position: relative;">
    <span style="position: absolute; left: -20px; top: 80%; transform: translateY(-50%); display: inline-block; width: 5px; height: 5px; background-color: #333; border-radius: 50%;"></span>
    <strong> Certificate ID(s):${" "} </strong> REC-${crypto.randomUUID()}
</li>

</ul>    
      </div>
    </div>

    
  </div>
  `;

  document.body.appendChild(element);

  html2canvas(element).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    // Add transaction hash if available
   // Ensure hashId and transaction link exist
if (pdfData.hashId) {
  const hashLink = generateTransactionLink(pdfData.hashId);

  // Coordinates for positioning (adjust to match the text on your receipt)
  const xPos = 41; // Position near where Transaction ID text appears
  const yPos = 48; // Estimate based on the layout in the canvas
  const linkText = transactionHashDisplay;
  const textWidth = pdf.getStringUnitWidth(linkText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;

  // Add a transparent clickable link over the text
  pdf.setTextColor(0, 0, 255); // Blue for visibility in text overlay
  pdf.setFontSize(10);
 const linkWidth = pdf.getStringUnitWidth(linkText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
const linkHeight = 5; // Approx height of the text line

pdf.link(xPos, yPos - linkHeight + 1, linkWidth, linkHeight, {
  url: hashLink,
});
}


  pdf.save(`receipt_${new Date().getTime()}.pdf`);
  document.body.removeChild(element);
    
  });
};

export const generateAndDownloadPDF = async (pdfData) => {
  const gasCost = await gasPricesCalulation(pdfData.fees) || pdfData.fees;

  const totalBuyAmount = pdfData.trades?.reduce((sum, trade) => {
    return sum + trade.totalTonnes * trade.pricePerTonne;
  }, 0);

  const percentage = (+totalBuyAmount * +pdfData.hestiyafee) / 100;

  // Create a temporary container for the HTML content
  const element = document.createElement("div");
  element.style.padding = "20px";
  element.style.backgroundColor = "#fff";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.border = "1px solid #ccc"; // Added border for better visibility
  element.style.width = "210mm"; // A4 width
  element.style.margin = "0 auto"; // Center the content
  element.style.position = "absolute"; // Position absolutely
  element.style.top = "-9999px"; // Move it off-screen
  // Dynamically generate HTML content as if it's the template
  element.innerHTML = `
  <div style="display: flex; flex-direction: column; justify-content: space-between; min-height: 100vh;">
    <div>
      <div style="justify-content: space-between; display: flex; align-items: start; margin-bottom: 100px;">
      <div>
      <img src="${
        images.hestiyaLogoColor
      }" alt="Your Logo" style="width: 100px; height: 50px; margin-left:-20px" /> <!-- Use the new logo here -->
      </div>
        <div style=" margin-top: 20px;">
          <h1 style="margin: 0;font-weight: bold;">Invoice</h1>
          <p style="margin: 0;font-weight: bold;">Date: <span style="font-weight: normal">${currentPaymentDate}</span></p>
          <p style="margin: 0;font-weight: bold;">Transaction Type:<span style="font-weight: normal"> ${
            pdfData.actionType
          }</span></p>
        </div>
      </div>

      <table border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; margin-top: 80px;">
        <thead>
          <tr style="">
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">No</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Project Name</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Vintage Year</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Quantity (Tonnes)</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Price per Tonne ${pdfData.paymentMethod == "Bank" ? "(USD)" : "(USDT)"}</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Total Price ${pdfData.paymentMethod == "Bank" ? "(USD)" : "(USDT)"}</th>
          </tr>
        </thead>
        <tbody>
          ${pdfData.trades
            .map(
              (trade, index) => `
            <tr>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                index + 1
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.projectName
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.vintageYear
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.totalTonnes
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.pricePerTonne
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.totalTonnes * trade.pricePerTonne
              }</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div style="display: flex; flex-direction: column; border-top: 3px solid gray; align-items: flex-end;">
        <div style="width: 400px; padding-top: 10px;">
          <div style="display: flex; justify-content: space-between; min-width: 400px; align-items: center;">
            <div style="font-weight: bold;">Total Buy Amount:</div>
            <div style="color:gray ; font-size:13px" >${pdfData.paymentMethod == "Bank" ? "USD" : "USDT"} ${totalBuyAmount}</div>
          </div>
          <div style="display: flex; justify-content: space-between; min-width: 400px; align-items: center;">
            <div style="font-weight: bold;">Transaction Fee:</div>
            <div style="color:gray ; font-size:13px" >${pdfData.paymentMethod == "Bank" ? "USD" : "USDT"} ${gasCost}</div>
          </div>
          <div style="display: flex; justify-content: space-between; min-width: 400px; align-items: center;">
            <div style="font-weight: bold;">Hestiya Fee:</div>
            <div style="color:gray ; font-size:13px" >${pdfData.paymentMethod == "Bank" ? "USD" : "USDT"} ${percentage}</div>
          </div>
        </div>
      </div>
      <div style="display: flex;margin-top: 20px; flex-direction: column; border-top: 3px solid gray; align-items: flex-end;">
          <div style="width: 400px; padding-top: 10px;">
            <div style="display: flex; justify-content: space-between; min-width: 400px; align-items: center;">
              <div style="font-weight: bold;">Total Net Amount:</div>
              <div>${pdfData.paymentMethod == "Bank" ? "USD" : "USDT"} ${(+totalBuyAmount + +gasCost + +percentage).toFixed(
                4
              )}</div>
            </div>
          </div>
        </div>

    </div>

    

    
    
    </div>
    
     <!-- Footer Section -->
  <div style="text-align: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ccc;">
  <p style="margin: 0; font-size: 12px; color: #666;">
    Contact Information: 
    <a href="tel:+6531065030" style="color: #666; text-decoration: none;">+65 3106 5030</a> | 
    <a href="mailto:support@hestiya.com" style="color: #666; text-decoration: none;">support@hestiya.com</a>
  </p>
</div>
<!-- End of Footer Section -->
<div style=" padding-top: 10px;">
      <div style="display: flex; justify-content: space-between; width: 100%;">
        <div style="border-bottom: 8px solid red; padding: 5px; flex-grow: 1;"></div>
        <div style="border-bottom: 8px solid blue; padding: 5px; flex-grow: 1;"></div>
        <div style="border-bottom: 8px solid green; padding: 5px; flex-grow: 1;"></div>
      </div>
    </div>
  `;

  document.body.appendChild(element);

  html2canvas(element).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    const shortenedHashId = `${pdfData.hashId.slice(
      0,
      5
    )}...${pdfData.hashId.slice(-5)}`;
    const hashLink = generateTransactionLink(pdfData.hashId);
    const linkY = 47;
    const linkX = 6;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text("Transaction Hash :", linkX, linkY);

    const hashIdX = linkX + pdf.getTextWidth("Transaction Hash : ") + 0;

    pdf.setTextColor(0, 102, 204);
    pdf.textWithLink(shortenedHashId, hashIdX, linkY, { url: hashLink });

    const underlineEndX = hashIdX + pdf.getTextWidth(shortenedHashId);
    pdf.setDrawColor(0, 102, 204);
    pdf.line(hashIdX, linkY + 1, underlineEndX, linkY + 1);

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.text("Hestiya", 15, 16);

    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text("7 TEMASEK BOULEVARD", 8, 24);
    pdf.text("#12-07 SUNTEC TOWER ONE", 8, 28);
    pdf.text("SINGAPORE (038987)", 8, 32);
    pdf.setTextColor(0, 0, 0);

    pdf.save(`receipt_${shortenedHashId}.pdf`);

    // Remove the temporary element from the DOM after use
    document.body.removeChild(element);
  });
};

export const generateAndDownloadPDFListing = async (pdfData) => {
  // console.log("PDF Data:", pdfData);

  const gasCost = await gasPricesCalulation(pdfData.fees) || pdfData.fees;

  // console.log("Gas cost for PDF listing:", gasCost);

  // Create a temporary container for the HTML content
  const element = document.createElement("div");
  element.style.padding = "20px";
  element.style.backgroundColor = "#fff";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.border = "1px solid #ccc"; // Border for visibility
  element.style.width = "210mm"; // A4 width
  element.style.margin = "0 auto"; // Center content
  element.style.position = "absolute"; // Position absolutely
  element.style.top = "-9999px";
  // Dynamically generate the HTML content
  element.innerHTML = `
  <div style="display: flex; flex-direction: column; justify-content: space-between; min-height: 100vh;">
    <div>
      <div style="justify-content: space-between; display: flex; align-items: start; margin-bottom: 100px;">
        <div>
      <img src="${
        images.hestiyaLogoColor
      }" alt="Your Logo" style="width: 100px; height: 50px; margin-left:-20px" /> <!-- Use the new logo here -->
      </div>
        <div style=" margin-top: 20px;">
          <h1 style="margin: 0;font-weight: bold;">Invoice</h1>
          <p style="margin: 0;font-weight: bold;">Date: <span style="font-weight: normal">${currentPaymentDate}</span></p>
          <p style="margin: 0;font-weight: bold;">Action: <span style="font-weight: normal">${
            pdfData.actionType
          }</span></p>
        </div>
        </div>

      <table border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; margin-top: 80px;">
        <thead>
          <tr>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">No</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Project Name</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Vintage Year</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Quantity (Tonnes)</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Price per Tonne (USD)</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Total Price (USD)</th>
          </tr>
        </thead>
        <tbody>
          ${pdfData.trades
            .map(
              (trade, index) => `
            <tr>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                index + 1
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.projectName
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.vintageYear
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.listed_quantity
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.price_per_credit
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${(
                trade.listed_quantity * trade.price_per_credit
              )?.toFixed(2)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div style="display: flex; flex-direction: column; border-top: 3px solid gray; align-items: flex-end;">
        <div style="width: 320px; padding-top: 10px;">
          
          <div style="display: flex; justify-content: space-between; min-width: 320px; align-items: center;">
            <div style="font-weight: bold;">Transaction Fee:</div>
            <div>USD ${gasCost}</div>
          </div>
          
        </div>
      </div>
    </div>

    
  </div>
  
<div style="text-align: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ccc;">
  <p style="margin: 0; font-size: 12px; color: #666;">
    Contact Information: 
    <a href="tel:+6531065030" style="color: #666; text-decoration: none;">+65 3106 5030</a> | 
    <a href="mailto:support@hestiya.com" style="color: #666; text-decoration: none;">support@hestiya.com</a>
  </p>
</div>
<!-- End of Footer Section -->
<div style=" padding-top: 10px;">
      <div style="display: flex; justify-content: space-between; width: 100%;">
        <div style="border-bottom: 8px solid red; padding: 5px; flex-grow: 1;"></div>
        <div style="border-bottom: 8px solid blue; padding: 5px; flex-grow: 1;"></div>
        <div style="border-bottom: 8px solid green; padding: 5px; flex-grow: 1;"></div>
      </div>
    </div>

  `;

  // Append the temporary element to the body
  document.body.appendChild(element);

  // Use html2canvas to convert the dynamic HTML to a canvas
  html2canvas(element).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Add image to PDF
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    const shortenedHashId = `${pdfData.hashId.slice(
      0,
      5
    )}...${pdfData.hashId.slice(-5)}`;
    const shortenedAddresId = `${pdfData.seller.slice(
      0,
      5
    )}...${pdfData.seller.slice(-5)}`;

    const hashLink = generateTransactionLink(pdfData.hashId);
    const linkY = 41;
    const linkX = 6;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text("Transaction Hash :", linkX, linkY);
    const hashIdX = linkX + pdf.getTextWidth("Transaction Hash : ") + 0;
    pdf.setTextColor(0, 102, 204);
    pdf.textWithLink(shortenedHashId, hashIdX, linkY, { url: hashLink });
    const underlineEndX = hashIdX + pdf.getTextWidth(shortenedHashId);
    pdf.setDrawColor(0, 102, 204);
    pdf.line(hashIdX, linkY + 1, underlineEndX, linkY + 1);

    // Adding seller address
    const sellerAddressY = linkY + 6; // Adjust this for vertical spacing
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text("Seller Address :", linkX, sellerAddressY);
    const addressX = linkX + pdf.getTextWidth("Seller Address : ");
    pdf.setTextColor(0, 102, 204);
    pdf.textWithLink(shortenedAddresId, addressX, sellerAddressY, {
      url: generateAddressLink(pdfData.seller),
    });
    const underlineAddressEndX = addressX + pdf.getTextWidth(shortenedAddresId);
    pdf.setDrawColor(0, 102, 204);
    pdf.line(
      addressX,
      sellerAddressY + 1,
      underlineAddressEndX,
      sellerAddressY + 1
    );

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.text("Hestiya", 15, 16);


    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text("7 TEMASEK BOULEVARD", 8, 24);
    pdf.text("#12-07 SUNTEC TOWER ONE", 8, 28);
    pdf.text("SINGAPORE (038987)", 8, 32);
    pdf.setTextColor(0, 0, 0);

    // Save the PDF
    pdf.save(`receipt_${shortenedHashId}.pdf`);

    // Remove the temporary element from the DOM
    document.body.removeChild(element);
  });
};

export const generateAndDownloadPDFRetire = async (pdfData) => {
  // console.log("PDF Data:", pdfData);

  const gasCost = await gasPricesCalulation(pdfData.fees) || pdfData.fees;
  // console.log("Gas cost for PDF listing:", gasCost);

  // Create a temporary container for the HTML content
  const element = document.createElement("div");
  element.style.padding = "20px";
  element.style.backgroundColor = "#fff";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.border = "1px solid #ccc"; // Border for visibility
  element.style.width = "210mm"; // A4 width
  element.style.margin = "0 auto"; // Center content
  element.style.position = "absolute"; // Position absolutely
  element.style.top = "-9999px";

  // Dynamically generate the HTML content
  element.innerHTML = `
  <div style="display: flex; flex-direction: column; justify-content: space-between; min-height: 100vh;">
    <div>
      <div style="justify-content: space-between; display: flex; align-items: start; margin-bottom: 100px;">
        <div>
      <img src="${
        images.hestiyaLogoColor
      }" alt="Your Logo" style="width: 100px; height: 50px; margin-left:-20px" /> <!-- Use the new logo here -->
      </div>
        <div style=" margin-top: 20px;">
          <h1 style="margin: 0;font-weight: bold;">Invoice</h1>
          <p style="margin: 0;font-weight: bold;">Date: <span style="font-weight: normal">${currentPaymentDate}</span></p>
          <p style="margin: 0;font-weight: bold;">Action: <span style="font-weight: normal">${
            pdfData.actionType
          }</span></p>
        </div>
      </div>

      <table border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; margin-bottom: 20px;margin-top: 80px;">
        <thead>
          <tr>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">No</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Project Name</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Vintage Year</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Retire Quantity (Tonnes)</th>
          </tr>
        </thead>
        <tbody>
          ${pdfData.trades
            .map(
              (trade, index) => `
            <tr>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                index + 1
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.projectName
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.vintageYear
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.retired_credits
              }</td>
            </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div style="display: flex; flex-direction: column; border-top: 3px solid gray; align-items: flex-end;">
        <div style="width: 320px; padding-top: 10px;">
          <div style="display: flex; justify-content: space-between; min-width: 320px; align-items: center;">
            <div style="font-weight: bold;">Transaction Fee:</div>
            <div style="font-size:13px">USD ${gasCost}</div>
          </div>
        </div>
      </div>
    </div>

    
  </div>


  <div style="text-align: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ccc;">
  <p style="margin: 0; font-size: 12px; color: #666;">
    Contact Information: 
    <a href="tel:+6531065030" style="color: #666; text-decoration: none;">+65 3106 5030</a> | 
    <a href="mailto:support@hestiya.com" style="color: #666; text-decoration: none;">support@hestiya.com</a>
  </p>
</div>
<!-- End of Footer Section -->
<div style=" padding-top: 10px;">
      <div style="display: flex; justify-content: space-between; width: 100%;">
        <div style="border-bottom: 8px solid red; padding: 5px; flex-grow: 1;"></div>
        <div style="border-bottom: 8px solid blue; padding: 5px; flex-grow: 1;"></div>
        <div style="border-bottom: 8px solid green; padding: 5px; flex-grow: 1;"></div>
      </div>
    </div>
  `;

  // Append the temporary element to the body
  document.body.appendChild(element);

  // Use html2canvas to convert the dynamic HTML to a canvas
  html2canvas(element).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Add image to PDF
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    const shortenedHashId = `${pdfData.hashId.slice(
      0,
      5
    )}...${pdfData.hashId.slice(-5)}`;
    const hashLink = generateTransactionLink(pdfData.hashId);
    const linkY = 47;
    const linkX = 6;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text("Transaction Hash :", linkX, linkY);

    const hashIdX = linkX + pdf.getTextWidth("Transaction Hash : ") + 0;

    pdf.setTextColor(0, 102, 204);
    pdf.textWithLink(shortenedHashId, hashIdX, linkY, { url: hashLink });

    const underlineEndX = hashIdX + pdf.getTextWidth(shortenedHashId);
    pdf.setDrawColor(0, 102, 204);
    pdf.line(hashIdX, linkY + 1, underlineEndX, linkY + 1);

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.text("Hestiya", 15, 16);

    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text("7 TEMASEK BOULEVARD", 8, 24);
    pdf.text("#12-07 SUNTEC TOWER ONE", 8, 28);
    pdf.text("SINGAPORE (038987)", 8, 32);
    pdf.setTextColor(0, 0, 0);

    // Save the PDF
    pdf.save(`receipt_${shortenedHashId}.pdf`);

    // Remove the temporary element from the DOM
    document.body.removeChild(element);
  });
};

export const generateAndDownloadPDFCancelListing = async (pdfData) => {
  // console.log("PDF Data:", pdfData);

  const gasCost = await gasPricesCalulation(pdfData.fees) || pdfData.fees;
  // console.log("Gas cost for PDF listing:", gasCost);

  // Create a temporary container for the HTML content
  const element = document.createElement("div");
  element.style.padding = "20px";
  element.style.backgroundColor = "#fff";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.border = "1px solid #ccc"; // Border for visibility
  element.style.width = "210mm"; // A4 width
  element.style.margin = "0 auto";
  element.style.position = "absolute"; // Position absolutely
  element.style.top = "-9999px"; // Center content

  // Dynamically generate the HTML content
  element.innerHTML = `
  <div style="display: flex; flex-direction: column; justify-content: space-between; min-height: 100vh;">
    <div>
      <div style="justify-content: space-between; display: flex; align-items: start; margin-bottom: 100px;">
        <div>
      <img src="${
        images.hestiyaLogoColor
      }" alt="Your Logo" style="width: 100px; height: 50px; margin-left:-20px" /> <!-- Use the new logo here -->
      </div>
        <div style=" margin-top: 20px;">
          <h1 style="margin: 0;font-weight: bold;">Invoice</h1>
          <p style="margin: 0;font-weight: bold;">Date: <span style="font-weight: normal">${currentPaymentDate}</span></p>
          <p style="margin: 0;font-weight: bold;">Action: <span style="font-weight: normal">${
            pdfData.actionType
          }</span></p>
        </div>
      </div>
      

      <table border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; margin-top: 80px;">
        <thead>
          <tr>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">No</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Project Name</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Vintage Year</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Cancel Quantity (Tonnes)</th>
          </tr>
        </thead>
        <tbody>
          ${pdfData.trades
            .map(
              (trade, index) => `
            <tr>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                index + 1
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.projectName
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.vintageYear
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.retired_credits
              }</td>
            </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div style="display: flex; flex-direction: column; border-top: 3px solid gray; align-items: flex-end;">
        <div style="width: 320px; padding-top: 10px;">
          <div style="display: flex; justify-content: space-between; min-width: 320px; align-items: center;">
            <div style="font-weight: bold;">Transaction Fee:</div>
            <div>USD ${gasCost}</div>
          </div>
        </div>
      </div>
    </div>

   
  </div>
  
  <div style="text-align: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ccc;">
  <p style="margin: 0; font-size: 12px; color: #666;">
    Contact Information: 
    <a href="tel:+6531065030" style="color: #666; text-decoration: none;">+65 3106 5030</a> | 
    <a href="mailto:support@hestiya.com" style="color: #666; text-decoration: none;">support@hestiya.com</a>
  </p>
</div>
<!-- End of Footer Section -->
<div style=" padding-top: 10px;">
      <div style="display: flex; justify-content: space-between; width: 100%;">
        <div style="border-bottom: 8px solid red; padding: 5px; flex-grow: 1;"></div>
        <div style="border-bottom: 8px solid blue; padding: 5px; flex-grow: 1;"></div>
        <div style="border-bottom: 8px solid green; padding: 5px; flex-grow: 1;"></div>
      </div>
    </div>
  
  `;

  // Append the temporary element to the body
  document.body.appendChild(element);

  // Use html2canvas to convert the dynamic HTML to a canvas
  html2canvas(element).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Add image to PDF
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    const shortenedHashId = `${pdfData.hashId.slice(
      0,
      5
    )}...${pdfData.hashId.slice(-5)}`;
    const hashLink = generateTransactionLink(pdfData.hashId);
    const linkY = 47;
    const linkX = 6;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text("Transaction Hash :", linkX, linkY);

    const hashIdX = linkX + pdf.getTextWidth("Transaction Hash : ") + 0;

    pdf.setTextColor(0, 102, 204);
    pdf.textWithLink(shortenedHashId, hashIdX, linkY, { url: hashLink });

    const underlineEndX = hashIdX + pdf.getTextWidth(shortenedHashId);
    pdf.setDrawColor(0, 102, 204);
    pdf.line(hashIdX, linkY + 1, underlineEndX, linkY + 1);

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.text("Hestiya", 15, 16);

    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text("7 TEMASEK BOULEVARD", 8, 24);
    pdf.text("#12-07 SUNTEC TOWER ONE", 8, 28);
    pdf.text("SINGAPORE (038987)", 8, 32);
    pdf.setTextColor(0, 0, 0);

    // Save the PDF
    pdf.save(`receipt_${shortenedHashId}.pdf`);

    // Remove the temporary element from the DOM
    document.body.removeChild(element);
  });
};

export const generateAndDownloadPDFBuyP2P = async (pdfData) => {
  // console.log("dsfdsfdsfdsf", pdfData);

  const gasCost = await gasPricesCalulation(pdfData.fees) || pdfData.fees;

  // console.log("Gas cost for PDF listing:", gasCost);

  const totalBuyAmount = pdfData.trades?.reduce((sum, trade) => {
    return sum + trade.totalTonnes * trade.pricePerTonne;
  }, 0);

  // Create a temporary container for the HTML content
  const element = document.createElement("div");
  element.style.padding = "20px";
  element.style.backgroundColor = "#fff";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.border = "1px solid #ccc"; // Added border for better visibility
  element.style.width = "210mm"; // A4 width
  element.style.margin = "0 auto"; // Center the content
  element.style.position = "absolute"; // Position absolutely
  element.style.top = "-9999px";

  // Dynamically generate HTML content as if it's the template
  element.innerHTML = `
  <div style="display: flex; flex-direction: column; justify-content: space-between; min-height: 100vh;">
    <div>
      <div style="justify-content: space-between; display: flex; align-items: start; margin-bottom: 100px;">
        <div>
      <img src="${
        images.hestiyaLogoColor
      }" alt="Your Logo" style="width: 100px; height: 50px; margin-left:-20px" /> <!-- Use the new logo here -->
      </div>
        <div style=" margin-top: 20px;">
          <h1 style="margin: 0;font-weight: bold;">Invoice</h1>
          <p style="margin: 0;font-weight: bold;">Date:<span style="font-weight: normal"> ${currentPaymentDate}</span></p>
          <p style="margin: 0;font-weight: bold;">Action:<span style="font-weight: normal"> ${
            pdfData.actionType
          }</span></p>
        </div>
      </div>

      <table border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; margin-top: 80px;">
        <thead>
          <tr>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">No</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Project Name</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Vintage Year</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Quantity (Tonnes)</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Price per Tonne (USD)</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Total Price (USD)</th>
          </tr>
        </thead>
        <tbody>
          ${pdfData.trades
            .map(
              (trade, index) => `
            <tr>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                index + 1
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.projectName
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.vintageYear
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.totalTonnes
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.pricePerTonne
              }</td>
              <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                trade.totalTonnes * trade.pricePerTonne
              }</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>

      <div style="display: flex; flex-direction: column; border-top: 3px solid gray; align-items: flex-end;">
        <div style="width: 400px; padding-top: 10px;">
          <div style="display: flex; justify-content: space-between; min-width: 400px; align-items: center;">
            <div style="font-weight: bold;">Total Buy Amount:</div>
            <div>USD ${totalBuyAmount}</div>
          </div>
          <div style="display: flex; justify-content: space-between; min-width: 400px; align-items: center;">
            <div style="font-weight: bold;">Transaction Fee:</div>
            <div>USD ${gasCost}</div>
          </div>
        </div>
      </div>


       <div style="display: flex;margin-top: 20px; flex-direction: column; border-top: 3px solid gray; align-items: flex-end;">
          <div style="width: 400px; padding-top: 10px;">
            <div style="display: flex; justify-content: space-between; min-width: 400px; align-items: center;">
              <div style="font-weight: bold;">Total Net Amount:</div>
              <div>USD ${(+totalBuyAmount + +gasCost).toFixed(4)}</div>
            </div>
          </div>
        </div>


    </div>
<div style="text-align: center; margin-top: 680px; padding-top: 10px; border-top: 1px solid #ccc;">
  <p style="margin: 0; font-size: 12px; color: #666;">
    Contact Information: 
    <a href="tel:+6531065030" style="color: #666; text-decoration: none;">+65 3106 5030</a> | 
    <a href="mailto:support@hestiya.com" style="color: #666; text-decoration: none;">support@hestiya.com</a>
  </p>
</div>
<!-- End of Footer Section -->
<div style=" padding-top: 10px;">
      <div style="display: flex; justify-content: space-between; width: 100%;">
        <div style="border-bottom: 8px solid red; padding: 5px; flex-grow: 1;"></div>
        <div style="border-bottom: 8px solid blue; padding: 5px; flex-grow: 1;"></div>
        <div style="border-bottom: 8px solid green; padding: 5px; flex-grow: 1;"></div>
      </div>
    </div>
   
  </div>


  `;

  // Append the temporary element to the body (but hidden)
  document.body.appendChild(element);

  // Use html2canvas to convert the dynamic HTML to a canvas
  html2canvas(element).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Add image to PDF
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    const shortenedHashId = `${pdfData.hashId.slice(
      0,
      5
    )}...${pdfData.hashId.slice(-5)}`;
    const hashLink = generateTransactionLink(pdfData.hashId);
    const linkY = 47;
    const linkX = 6;

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text("Transaction Hash :", linkX, linkY);

    const hashIdX = linkX + pdf.getTextWidth("Transaction Hash : ") + 0;

    pdf.setTextColor(0, 102, 204);
    pdf.textWithLink(shortenedHashId, hashIdX, linkY, { url: hashLink });

    const underlineEndX = hashIdX + pdf.getTextWidth(shortenedHashId);
    pdf.setDrawColor(0, 102, 204);
    pdf.line(hashIdX, linkY + 1, underlineEndX, linkY + 1);

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.text("Hestiya", 15, 16);
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text("7 TEMASEK BOULEVARD", 8, 24);
    pdf.text("#12-07 SUNTEC TOWER ONE", 8, 28);
    pdf.text("SINGAPORE (038987)", 8, 32);
    pdf.setTextColor(0, 0, 0);

    // Save the PDF
    pdf.save(`receipt_${shortenedHashId}.pdf`);

    // Remove the temporary element from the DOM after use
    document.body.removeChild(element);
  });
};

export const generateAndDownloadHistory = async (pdfData) => {
  console.log("dsfdsfdsfdsf", pdfData);

  // Create a temporary container for the HTML content
  const element = document.createElement("div");
  element.style.padding = "20px";
  element.style.backgroundColor = "#fff";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.border = "1px solid #ccc"; // Added border for better visibility
  element.style.width = "210mm"; // A4 width
  element.style.margin = "0 auto"; // Center the content
  element.style.position = "absolute"; // Position absolutely
  element.style.top = "-9999px";
  //  element.style.maxHeight = "500px"

  // Dynamically generate HTML content as if it's the template
  element.innerHTML = `
  <div style="display: flex; flex-direction: column; justify-content: space-between; min-height: 100vh;">
    <div>
      <div style="justify-content: space-between; display: flex; align-items: start; margin-bottom: 120px;">
        <div>
      <img src="${
        images.hestiyaLogoColor
      }" alt="Your Logo" style="width: 100px; height: 50px; margin-left:-20px" /> <!-- Use the new logo here -->
      </div>
        <div style=" margin-top: 20px;">
          <h1 style="margin: 0;font-weight: bold;">History</h1>
          <p style="margin: 0;font-weight: bold;">Transaction Date:<span style="font-weight: normal"> ${moment(
            pdfData.timestamp
          ).format("YYYY-MM-DD")}</span></p>
          <p style="margin: 0;font-weight: bold;">Transaction Details<span style="font-weight: normal"> ${
            pdfData.action_type
          }</span></p>
        </div>
      </div>

      <table border="1" cellpadding="10" style="width: 100%; border-collapse: collapse; margin-bottom: 20px; margin-top: 80px;">
        <thead>
          <tr>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">No</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Project Name</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Vintage Year</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Total Credits</th>
            <th style="background-color: #f2f2f2; padding: 10px 4px; font-size: 14px;">Total Price (USD)</th>
          </tr>
        </thead>
        <tbody>
              <tr>
                <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${1}</td>
                
                <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                  pdfData.project_name
                }</td>
                <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                  pdfData.vintage_year
                }</td>
                <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                  pdfData.total_credits
                }</td>
                <td style="padding: 10px 4px; font-size: 13px; color:gray; text-align: center">${
                  pdfData.total_price
                }</td>
              </tr>
        </tbody>
      </table>

      <div style="display: flex;margin-top: 20px; flex-direction: column; border-top: 3px solid gray; align-items: flex-end;">
          
        </div>




    </div>
<div style="text-align: center; margin-top: 680px; padding-top: 10px; border-top: 1px solid #ccc;">
  <p style="margin: 0; font-size: 12px; color: #666;">
    Contact Information: 
    <a href="tel:+6531065030" style="color: #666; text-decoration: none;">+65 3106 5030</a> | 
    <a href="mailto:support@hestiya.com" style="color: #666; text-decoration: none;">support@hestiya.com</a>
  </p>
</div>
<!-- End of Footer Section -->
<div style=" padding-top: 10px;">
      <div style="display: flex; justify-content: space-between; width: 100%;">
        <div style="border-bottom: 8px solid red; padding: 5px; flex-grow: 1;"></div>
        <div style="border-bottom: 8px solid blue; padding: 5px; flex-grow: 1;"></div>
        <div style="border-bottom: 8px solid green; padding: 5px; flex-grow: 1;"></div>
      </div>
    </div>
  
  </div>


  
  `;

  // Append the temporary element to the body (but hidden)
  document.body.appendChild(element);

  // Use html2canvas to convert the dynamic HTML to a canvas
  html2canvas(element).then((canvas) => {
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    // Add image to PDF
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    const linkX = 6;

    if (pdfData.buyer_address) {

      const shortenedHashId = `${pdfData.buyer_address.slice(
        0,
        5
      )}...${pdfData.buyer_address.slice(-5)}`;
      const hashLink = generateAddressLink(pdfData.buyer_address);
      const linkY = 42;
      const linkX = 6;
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.text("Buyer Address :", linkX, linkY);
      
      const hashIdX = linkX + pdf.getTextWidth("Buyer Address : ") + 0;
      
      pdf.setTextColor(0, 102, 204);
      pdf.textWithLink(shortenedHashId, hashIdX, linkY, { url: hashLink });
      
      const underlineEndX = hashIdX + pdf.getTextWidth(shortenedHashId);
      pdf.setDrawColor(0, 102, 204);
      pdf.line(hashIdX, linkY + 1, underlineEndX, linkY + 1);
    
    }



    const shortenedAddresId = `${pdfData.sender_address.slice(
      0,
      5
    )}...${pdfData.sender_address.slice(-5)}`;

    const sellerAddressY = pdfData.buyer_address ? 48 : 42;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);
    pdf.text("Sender Address :", linkX, sellerAddressY);
    const addressX = linkX + pdf.getTextWidth("Sender Address : ");
    pdf.setTextColor(0, 102, 204);
    pdf.textWithLink(shortenedAddresId, addressX, sellerAddressY, {
      url: generateAddressLink(pdfData.sender_address),
    });
    const underlineAddressEndX = addressX + pdf.getTextWidth(shortenedAddresId);
    pdf.setDrawColor(0, 102, 204);
    pdf.line(
      addressX,
      sellerAddressY + 1,
      underlineAddressEndX,
      sellerAddressY + 1
    );

    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(16);
    pdf.text("Hestiya", 15, 16);

    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text("7 TEMASEK BOULEVARD", 8, 24);
    pdf.text("#12-07 SUNTEC TOWER ONE", 8, 28);
    pdf.text("SINGAPORE (038987)", 8, 32);
    pdf.setTextColor(0, 0, 0);

    // Save the PDF
    pdf.save(`receipt_${1}.pdf`);

    // Remove the temporary element from the DOM after use
    document.body.removeChild(element);
  });
};












//   <div style="text-align: center; margin-top: 10px; padding-top: 10px; border-top: 1px solid #ccc;">
//   <p style="margin: 0; font-size: 12px; color: #666;">
//     Contact Information: 
//     <a href="tel:+6531065030" style="color: #666; text-decoration: none;">+65 3106 5030</a> | 
//     <a href="mailto:support@hestiya.com" style="color: #666; text-decoration: none;">support@hestiya.com</a>
//   </p>
// </div>
// <!-- End of Footer Section -->
// <div style=" padding-top: 10px;">
//       <div style="display: flex; justify-content: space-between; width: 100%;">
//         <div style="border-bottom: 8px solid red; padding: 5px; flex-grow: 1;"></div>
//         <div style="border-bottom: 8px solid blue; padding: 5px; flex-grow: 1;"></div>
//         <div style="border-bottom: 8px solid green; padding: 5px; flex-grow: 1;"></div>
//       </div>
//     </div>