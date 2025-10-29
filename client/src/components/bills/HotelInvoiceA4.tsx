import { Building2 } from "lucide-react";

/**
 * Props for the HotelInvoiceA4 component
 */
interface HotelInvoiceA4Props {
  /** Hotel information including name, address, contact details */
  hotel: any;
  /** Reservation details including pricing and currency information */
  reservation: any;
  /** Guest information including name, contact, and identification details */
  guest: any;
  /** Calculated bill breakdown including line items, subtotal, taxes, and totals */
  billCalculation: any;
  /** Room details including room number and type */
  room: any;
  /** Date when the guest is checking out */
  checkoutDate: Date;
  /** Unique receipt/invoice number for tracking */
  receiptNumber: string;
  /** Name or username of the staff member processing the checkout */
  servedBy: string;
}

/**
 * HotelInvoiceA4 - Professional A4 format invoice (Hotel Copy)
 * 
 * This component generates a professional hotel copy invoice in A4 format for hotel checkouts.
 * It includes multi-currency support with exchange rate display, detailed billing breakdown,
 * tax calculations, and signature sections.
 * 
 * Features:
 * - A4 standard size (210mm x 297mm) with print-optimized styling
 * - Multi-currency support (displays original currency + NPR conversion)
 * - Detailed line items for room charges, meal plans, food, and services
 * - Tax breakdown with multiple tax types (VAT, Service Tax, etc.)
 * - Professional layout with hotel branding
 * - Signature sections for both guest and authorized personnel
 * 
 * Currency Conversion Logic:
 * - If currency is NPR: Display all amounts in NPR only
 * - If foreign currency: Display original rate in foreign currency and final amount in NPR
 * - Exchange rate column appears only when foreign currency is used
 * 
 * @param {HotelInvoiceA4Props} props - Component props
 * @returns {JSX.Element} Rendered hotel invoice component
 */
export function HotelInvoiceA4({
  hotel,
  reservation,
  guest,
  billCalculation,
  room,
  checkoutDate,
  receiptNumber,
  servedBy,
}: HotelInvoiceA4Props) {
  /**
   * Formats a number to currency format with 2 decimal places
   * @param amount - Amount to format (string or number)
   * @returns Formatted currency string (e.g., "1234.56")
   */
  const formatCurrency = (amount: string | number) => {
    return parseFloat(amount?.toString() || "0").toFixed(2);
  };

  /**
   * Formats a date to DD/MM/YYYY format
   * @param date - Date to format (Date object or string)
   * @returns Formatted date string in DD/MM/YYYY format
   */
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const lineItems = billCalculation?.lineItems || [];
  const subTotal = billCalculation?.subTotal || "0";
  const taxBreakdown = billCalculation?.taxBreakdown || {};
  const totalTax = billCalculation?.totalTax || "0";
  const totalAmount = billCalculation?.totalAmount || "0";
  const advancePaid = reservation?.paidAmount || "0";
  const balanceAmount = billCalculation?.balanceAmount || "0";

  // Multi-currency handling with fallback to NPR
  const currency = reservation?.currency || "NPR";
  const exchangeRate = reservation?.exchangeRate || "1.0000";
  const showExchangeRate = currency !== "NPR" && parseFloat(exchangeRate) !== 1.0;

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
            padding: 15mm;
            margin: 0 auto;
            background: white;
            color: black;
            font-family: 'Arial', sans-serif;
            font-size: 11pt;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          
          .invoice-border {
            border: 2px solid black;
            padding: 10mm;
            min-height: 267mm;
          }
          
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 8mm;
            padding-bottom: 5mm;
            border-bottom: 2px solid black;
          }
          
          .logo-section {
            width: 70mm;
            height: 25mm;
            border: 1px dashed #666;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #666;
          }
          
          .hotel-details {
            text-align: right;
            flex: 1;
            margin-left: 10mm;
          }
          
          .hotel-name {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 2mm;
          }
          
          .invoice-title {
            text-align: center;
            font-size: 16pt;
            font-weight: bold;
            margin: 5mm 0;
            text-decoration: underline;
          }
          
          .tpin-number {
            text-align: center;
            font-size: 11pt;
            margin-bottom: 5mm;
          }
          
          .invoice-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3mm;
            margin-bottom: 5mm;
          }
          
          .info-row {
            display: flex;
            gap: 5mm;
            margin-bottom: 2mm;
          }
          
          .info-label {
            font-weight: bold;
            min-width: 30mm;
          }
          
          .billing-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 5mm;
          }
          
          .billing-table th,
          .billing-table td {
            border: 1px solid black;
            padding: 2mm;
            text-align: left;
          }
          
          .billing-table th {
            background-color: #f0f0f0;
            font-weight: bold;
            text-align: center;
          }
          
          .billing-table td.number {
            text-align: right;
          }
          
          .billing-table td.center {
            text-align: center;
          }
          
          .totals-section {
            margin-left: auto;
            width: 70mm;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 1.5mm 3mm;
            border-bottom: 1px solid #ccc;
          }
          
          .total-row.grand-total {
            font-weight: bold;
            font-size: 12pt;
            border: 2px solid black;
            background-color: #f0f0f0;
          }
          
          .payment-section {
            margin-top: 5mm;
            margin-left: auto;
            width: 70mm;
          }
          
          .footer-section {
            margin-top: 10mm;
            padding-top: 5mm;
            border-top: 1px solid #ccc;
          }
          
          .terms-section {
            margin-bottom: 5mm;
          }
          
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 8mm;
          }
          
          .signature-box {
            text-align: center;
          }
          
          .signature-line {
            border-top: 1px solid black;
            width: 50mm;
            margin-top: 15mm;
            margin-bottom: 2mm;
          }
          
          .jurisdiction {
            text-align: center;
            font-weight: bold;
            margin-top: 5mm;
            font-size: 10pt;
          }
        `}
      </style>

      <div className="invoice-border">
        {/* Header Section */}
        <div className="invoice-header">
          <div className="logo-section">
            <Building2 size={48} />
          </div>
          <div className="hotel-details">
            <div className="hotel-name">{hotel?.name || "HOTEL NAME"}</div>
            <div>{hotel?.address || "Hotel Address"}</div>
            <div>Phone: {hotel?.phone || "N/A"}</div>
            {hotel?.email && <div>Email: {hotel.email}</div>}
          </div>
        </div>

        {/* Title */}
        <div className="invoice-title">TAX INVOICE</div>
        <div className="tpin-number">
          TPIN: {hotel?.vatNo || "N/A"}
        </div>

        {/* Invoice Details */}
        <div className="invoice-info">
          <div>
            <div className="info-row">
              <span className="info-label">Bill No:</span>
              <span>{receiptNumber || reservation?.id?.substring(0, 8)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Date:</span>
              <span>{formatDate(checkoutDate)}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Guest Name:</span>
              <span>{reservation?.guestName || guest?.firstName + " " + guest?.lastName}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Room No:</span>
              <span>{room?.roomNumber || "N/A"}</span>
            </div>
          </div>
          <div>
            <div className="info-row">
              <span className="info-label">Address:</span>
              <span>{guest?.address || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Pan No:</span>
              <span>{guest?.panNo || "N/A"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Mobile No:</span>
              <span>{reservation?.guestPhone || guest?.phone}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Check-in:</span>
              <span>{formatDate(reservation?.checkInDate)}</span>
            </div>
          </div>
        </div>

        {/* Billing Table */}
        <table className="billing-table">
          <thead>
            <tr>
              <th style={{ width: "10mm" }}>S.N.</th>
              <th>Particulars</th>
              <th style={{ width: "15mm" }}>Days</th>
              <th style={{ width: "25mm" }}>Rate</th>
              {showExchangeRate && <th style={{ width: "20mm" }}>Exc Rate</th>}
              <th style={{ width: "30mm" }}>Amount (NPR)</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.length > 0 ? (
              lineItems.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="center">{index + 1}</td>
                  <td>{item.description}</td>
                  <td className="center">{item.days || item.quantity || "-"}</td>
                  <td className="number">
                    {showExchangeRate && item.originalRate 
                      ? `${currency} ${formatCurrency(item.originalRate)}`
                      : formatCurrency(item.rate)}
                  </td>
                  {showExchangeRate && (
                    <td className="number">{formatCurrency(exchangeRate)}</td>
                  )}
                  <td className="number">{formatCurrency(item.amount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="center">1</td>
                <td>Room Charges</td>
                <td className="center">
                  {Math.ceil((new Date(reservation?.checkOutDate).getTime() - new Date(reservation?.checkInDate).getTime()) / (1000 * 60 * 60 * 24))}
                </td>
                <td className="number">
                  {showExchangeRate && reservation?.originalRoomRate
                    ? `${currency} ${formatCurrency(reservation.originalRoomRate)}`
                    : formatCurrency(reservation?.roomPrice || "0")}
                </td>
                {showExchangeRate && (
                  <td className="number">{formatCurrency(exchangeRate)}</td>
                )}
                <td className="number">{formatCurrency(reservation?.roomPrice || "0")}</td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="totals-section">
          <div className="total-row">
            <span>Sub Total:</span>
            <span>NPR {formatCurrency(subTotal)}</span>
          </div>
          {Object.entries(taxBreakdown).map(([name, tax]: [string, any]) => (
            <div key={name} className="total-row">
              <span>{name} ({tax.rate}%):</span>
              <span>NPR {formatCurrency(tax.amount)}</span>
            </div>
          ))}
          {parseFloat(totalTax) > 0 && (
            <div className="total-row" style={{ fontWeight: "bold" }}>
              <span>Total Tax:</span>
              <span>NPR {formatCurrency(totalTax)}</span>
            </div>
          )}
          <div className="total-row grand-total">
            <span>Grand Total:</span>
            <span>NPR {formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Payment Details */}
        <div className="payment-section">
          <div className="total-row">
            <span>Advance Paid:</span>
            <span>NPR {formatCurrency(advancePaid)}</span>
          </div>
          <div className="total-row grand-total">
            <span>Balance:</span>
            <span>NPR {formatCurrency(balanceAmount)}</span>
          </div>
        </div>

        {/* Footer Section */}
        <div className="footer-section">
          <div className="terms-section">
            <strong>Terms & Conditions:</strong>
            <ul style={{ marginLeft: "5mm", marginTop: "2mm" }}>
              <li>All payments are non-refundable</li>
              <li>Check-out time is 12:00 PM</li>
              <li>Guests are responsible for any damage to hotel property</li>
            </ul>
          </div>

          <div className="signature-section">
            <div className="signature-box">
              <div style={{ fontWeight: "bold" }}>Guest Signature</div>
              <div className="signature-line"></div>
            </div>
            <div className="signature-box">
              <div style={{ fontWeight: "bold" }}>Authorized Signature</div>
              <div className="signature-line"></div>
              <div style={{ fontSize: "9pt" }}>Served by: {servedBy}</div>
            </div>
          </div>

          <div className="jurisdiction">
            SUBJECT TO {hotel?.city?.toUpperCase() || "KATHMANDU"} JURISDICTION
          </div>
        </div>
      </div>
    </div>
  );
}
