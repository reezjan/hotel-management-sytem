interface GuestInvoiceA4Props {
  hotel: any;
  reservation: any;
  guest: any;
  billCalculation: any;
  room: any;
  checkoutDate: Date;
  receiptNumber: string;
  servedBy: string;
}

export function GuestInvoiceA4({
  hotel,
  reservation,
  guest,
  billCalculation,
  room,
  checkoutDate,
  receiptNumber,
  servedBy,
}: GuestInvoiceA4Props) {
  const formatCurrency = (amount: string | number) => {
    return parseFloat(amount?.toString() || "0").toFixed(2);
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const formatDateTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    }) + " " + d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const numberToWords = (num: number): string => {
    const ones = ["", "ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];
    const tens = ["", "", "TWENTY", "THIRTY", "FORTY", "FIFTY", "SIXTY", "SEVENTY", "EIGHTY", "NINETY"];
    const teens = ["TEN", "ELEVEN", "TWELVE", "THIRTEEN", "FOURTEEN", "FIFTEEN", "SIXTEEN", "SEVENTEEN", "EIGHTEEN", "NINETEEN"];

    if (num === 0) return "ZERO";

    const convertLessThanThousand = (n: number): string => {
      if (n === 0) return "";
      if (n < 10) return ones[n];
      if (n < 20) return teens[n - 10];
      if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
      return ones[Math.floor(n / 100)] + " HUNDRED" + (n % 100 ? " " + convertLessThanThousand(n % 100) : "");
    };

    if (num < 1000) return convertLessThanThousand(num);
    if (num < 100000) {
      return convertLessThanThousand(Math.floor(num / 1000)) + " THOUSAND" + (num % 1000 ? " " + convertLessThanThousand(num % 1000) : "");
    }
    return num.toString();
  };

  const lineItems = billCalculation?.lineItems || [];
  const subTotal = billCalculation?.subTotal || "0";
  const taxBreakdown = billCalculation?.taxBreakdown || {};
  const totalTax = billCalculation?.totalTax || "0";
  const totalAmount = billCalculation?.totalAmount || "0";

  const currency = reservation?.currency || "NPR";
  const exchangeRate = reservation?.exchangeRate || "1.0000";
  const showExchangeRate = currency !== "NPR" && parseFloat(exchangeRate) !== 1.0;

  const totalInWords = numberToWords(Math.floor(parseFloat(totalAmount)));
  const roundOff = (Math.ceil(parseFloat(totalAmount)) - parseFloat(totalAmount)).toFixed(2);
  const grandTotal = Math.ceil(parseFloat(totalAmount));
  const grandTotalUSD = showExchangeRate ? (grandTotal / parseFloat(exchangeRate)).toFixed(2) : "0.00";

  const checkInDate = new Date(reservation?.checkInDate);
  const checkOutDate = new Date(reservation?.checkOutDate);
  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

  const getDatesArray = () => {
    const dates = [];
    for (let i = 0; i < nights; i++) {
      const date = new Date(checkInDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const roomCharges = getDatesArray();

  return (
    <div className="invoice-container bg-white text-black">
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            .invoice-container,
            .invoice-container * {
              visibility: visible;
            }
            .invoice-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 210mm;
              height: 297mm;
              margin: 0;
              padding: 0;
              background: white;
            }
            @page {
              size: A4;
              margin: 0;
            }
          }
          
          .invoice-container {
            width: 210mm;
            min-height: 297mm;
            padding: 10mm;
            margin: 0 auto;
            background: white;
            color: black;
            font-family: 'Courier New', monospace;
            font-size: 9pt;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            line-height: 1.2;
          }

          .header-section {
            margin-bottom: 3mm;
          }

          .tpin-right {
            text-align: right;
            font-size: 9pt;
            margin-bottom: 2mm;
          }

          .hotel-name {
            font-size: 16pt;
            font-weight: bold;
            font-style: italic;
            font-family: 'Times New Roman', serif;
            margin-bottom: 5mm;
          }

          .invoice-title {
            text-align: center;
            font-size: 11pt;
            font-weight: bold;
            margin: 5mm 0;
          }

          .info-section {
            font-size: 8pt;
            margin-bottom: 3mm;
          }

          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1mm;
            margin-bottom: 2mm;
          }

          .info-line {
            display: flex;
            gap: 2mm;
          }

          .info-label {
            min-width: 35mm;
          }

          .billing-instruction {
            margin-top: 2mm;
            font-size: 8pt;
            display: flex;
            gap: 2mm;
          }

          .billing-table {
            width: 100%;
            border-collapse: collapse;
            margin: 3mm 0;
            font-size: 8pt;
          }

          .billing-table th,
          .billing-table td {
            padding: 1mm;
            text-align: left;
            border: none;
          }

          .billing-table th {
            font-weight: bold;
            border-bottom: 1px solid black;
          }

          .billing-table td.right {
            text-align: right;
          }

          .billing-table td.center {
            text-align: center;
          }

          .totals-section {
            margin-top: 5mm;
            font-size: 8pt;
          }

          .total-line {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1mm;
            padding-right: 20mm;
          }

          .amount-words {
            margin: 3mm 0;
            font-size: 8pt;
            font-weight: bold;
          }

          .footer-info {
            display: flex;
            justify-content: space-between;
            margin-top: 8mm;
            font-size: 8pt;
          }

          .disclaimer {
            margin-top: 5mm;
            font-size: 7pt;
            text-align: center;
            border: 1px solid black;
            padding: 2mm;
          }

          .signature-area {
            margin-top: 3mm;
            text-align: right;
            font-size: 8pt;
          }

          .thank-you {
            margin-top: 3mm;
            text-align: center;
            font-size: 8pt;
          }
        `}
      </style>

      <div className="header-section">
        <div className="tpin-right">TPIN: {hotel?.vatNo}</div>
        <div className="hotel-name">
          Hotel
          <br />
          {hotel?.name}
        </div>
      </div>

      <div className="invoice-title">INVOICE</div>

      <div className="info-section">
        <div className="info-grid">
          <div>
            <div className="info-line">
              <span className="info-label">Guest Name</span>
              <span>: {reservation?.guestName || (guest?.firstName + " " + guest?.lastName)}</span>
            </div>
            <div className="info-line">
              <span className="info-label">Second Guest Name</span>
              <span>: {reservation?.secondGuestName || ""}</span>
            </div>
            <div className="info-line">
              <span className="info-label">Address</span>
              <span>: {guest?.address}</span>
            </div>
          </div>
          <div>
            <div className="info-line">
              <span className="info-label">Bill No.</span>
              <span>: {receiptNumber}</span>
            </div>
            <div className="info-line">
              <span className="info-label">Room No.</span>
              <span>: {room?.roomNumber}</span>
            </div>
            <div className="info-line">
              <span className="info-label">Page No.</span>
              <span>: 1</span>
            </div>
            <div className="info-line">
              <span className="info-label">Arrival Date</span>
              <span>: {formatDateTime(reservation?.checkInDate)}</span>
            </div>
            <div className="info-line">
              <span className="info-label">Transaction Date</span>
              <span>: {formatDateTime(new Date())}</span>
            </div>
            <div className="info-line">
              <span className="info-label">Departure Date</span>
              <span>: {formatDateTime(reservation?.checkOutDate)}</span>
            </div>
            <div className="info-line">
              <span className="info-label">Inv. Issue Date</span>
              <span>: {formatDateTime(checkoutDate)}</span>
            </div>
          </div>
        </div>

        <div className="billing-instruction">
          <span style={{ minWidth: "35mm" }}>Company Name</span>
          <span>: {guest?.company}</span>
        </div>
        <div className="billing-instruction">
          <span style={{ minWidth: "35mm" }}>Contact PAN</span>
          <span>: {guest?.panNo}</span>
        </div>
        <div className="billing-instruction">
          <span style={{ minWidth: "35mm" }}>Group ID</span>
          <span>: {reservation?.groupId}</span>
        </div>
        <div className="billing-instruction">
          <span style={{ minWidth: "35mm" }}>BILLING INSTRUCTION:</span>
          <span>: {reservation?.billingInstruction}</span>
        </div>
      </div>

      <table className="billing-table">
        <thead>
          <tr>
            <th style={{ width: "15mm" }}>Date</th>
            <th style={{ width: "15mm" }}>HS Code</th>
            <th>Description</th>
            <th style={{ width: "20mm" }}>Room<br />STATUS</th>
            <th style={{ width: "15mm" }}>Rate</th>
            <th style={{ width: "15mm" }}>Exc.Rate</th>
            <th style={{ width: "25mm" }} className="right">Amount in<br />LCL.CURRENCY</th>
          </tr>
        </thead>
        <tbody>
          {roomCharges.map((date, index) => (
            <tr key={index}>
              <td>{formatDate(date)}</td>
              <td></td>
              <td>ROOM CHARGE ER #{room?.roomNumber} {reservation?.roomType}</td>
              <td>{reservation?.mealPlan}</td>
              <td className="right">{formatCurrency(parseFloat(reservation?.roomPrice || "0") / nights)}</td>
              <td className="right">{showExchangeRate ? `${currency} ${formatCurrency(exchangeRate)}` : ""}</td>
              <td className="right">{formatCurrency(parseFloat(reservation?.roomPrice || "0") / nights)}</td>
            </tr>
          ))}
          {lineItems.filter((item: any) => item.category !== "room").map((item: any, index: number) => (
            <tr key={`item-${index}`}>
              <td>{formatDate(new Date())}</td>
              <td></td>
              <td>{item.description}</td>
              <td></td>
              <td className="right">{formatCurrency(item.rate)}</td>
              <td className="right">{showExchangeRate ? `${currency} ${formatCurrency(exchangeRate)}` : ""}</td>
              <td className="right">{formatCurrency(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="totals-section">
        <div className="total-line">
          <span>Total</span>
          <span>{formatCurrency(subTotal)}</span>
        </div>
        <div className="total-line">
          <span>13% VAT</span>
          <span>{formatCurrency(totalTax)}</span>
        </div>
        <div className="total-line">
          <span>Round Off</span>
          <span>{roundOff}</span>
        </div>
        <div className="total-line">
          <span>Grand Total (NRS)</span>
          <span>{formatCurrency(grandTotal)}</span>
        </div>
        {showExchangeRate && (
          <div className="total-line">
            <span>Grand Total ({currency})</span>
            <span>{grandTotalUSD}</span>
          </div>
        )}
      </div>

      <div className="amount-words">
        {totalInWords} ONLY
      </div>

      <div className="footer-info">
        <div>CASHIERID: {servedBy}</div>
        <div>DATE/TIME : {formatDateTime(checkoutDate)}</div>
      </div>

      <div className="disclaimer">
        "I agree that my liability for this bill is not waived and I agree to be held personally liable in the
        indicated person, company or association fails to pay for all or part these charges."
      </div>

      <div className="signature-area">
        GUEST SIGNATURE
        <div style={{ marginTop: "10mm", borderTop: "1px solid black", width: "50mm", marginLeft: "auto" }}></div>
      </div>

      <div className="thank-you">
        Thank you for staying at {hotel?.name?.toUpperCase()}. We look forward to welcoming you back.
      </div>
    </div>
  );
}
