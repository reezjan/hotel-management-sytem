import { useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Printer, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import type { SelectHallBooking, Hall, Hotel } from "@shared/schema";

interface HallQuotationProps {
  booking: SelectHallBooking;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HallQuotation({ booking, open, onOpenChange }: HallQuotationProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const { data: hall } = useQuery<Hall>({
    queryKey: ["/api/halls", booking?.hallId],
    enabled: !!booking?.hallId
  });

  const { data: hotel } = useQuery<Hotel>({
    queryKey: ["/api/hotels", booking?.hotelId],
    enabled: !!booking?.hotelId
  });

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hall Booking Quotation - ${booking.id}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
              }
              .no-print {
                display: none;
              }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #1a1a1a;
              background: white;
            }
            .page {
              width: 210mm;
              min-height: 297mm;
              padding: 15mm;
              margin: 0 auto;
              background: white;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
              border-bottom: 2px solid #2c3e50;
              padding-bottom: 12px;
              margin-bottom: 15px;
            }
            .hotel-name {
              font-size: 22px;
              font-weight: 700;
              color: #2c3e50;
              margin-bottom: 6px;
              letter-spacing: 0.5px;
            }
            .hotel-details {
              font-size: 9px;
              color: #555;
              line-height: 1.4;
            }
            .quotation-title {
              text-align: center;
              font-size: 18px;
              font-weight: 600;
              color: #2c3e50;
              margin: 12px 0;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .meta-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 15px;
              font-size: 9px;
            }
            .meta-box {
              flex: 1;
            }
            .meta-label {
              font-weight: 600;
              color: #2c3e50;
              margin-bottom: 3px;
            }
            .section {
              margin-bottom: 15px;
            }
            .section-title {
              font-size: 11px;
              font-weight: 600;
              color: #2c3e50;
              border-bottom: 1px solid #ecf0f1;
              padding-bottom: 5px;
              margin-bottom: 10px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 8px;
              font-size: 9px;
            }
            .info-item {
              display: flex;
              gap: 6px;
            }
            .info-label {
              font-weight: 600;
              color: #555;
              min-width: 100px;
            }
            .info-value {
              color: #1a1a1a;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 10px 0;
              font-size: 9px;
            }
            thead {
              background: #2c3e50;
              color: white;
            }
            th {
              padding: 8px;
              text-align: left;
              font-weight: 600;
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            td {
              padding: 6px 8px;
              border-bottom: 1px solid #ecf0f1;
            }
            tbody tr:hover {
              background: #f8f9fa;
            }
            .text-right {
              text-align: right;
            }
            .summary-table {
              margin-top: 10px;
              width: 100%;
              max-width: 350px;
              margin-left: auto;
            }
            .summary-table td {
              padding: 5px 8px;
              border: none;
            }
            .summary-row {
              font-size: 9px;
            }
            .total-row {
              font-size: 11px;
              font-weight: 700;
              border-top: 2px solid #2c3e50;
              color: #2c3e50;
            }
            .terms {
              margin-top: 15px;
              padding: 10px;
              background: #f8f9fa;
              border-left: 3px solid #2c3e50;
              font-size: 7px;
              line-height: 1.4;
            }
            .terms-title {
              font-weight: 600;
              margin-bottom: 5px;
              color: #2c3e50;
              font-size: 8px;
            }
            .terms ul {
              margin-left: 15px;
              margin-top: 4px;
            }
            .terms li {
              margin-bottom: 2px;
            }
            .footer {
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px solid #ecf0f1;
              text-align: center;
              font-size: 8px;
              color: #777;
            }
            .signature-section {
              margin-top: 20px;
              display: flex;
              justify-content: space-between;
            }
            .signature-box {
              text-align: center;
              flex: 1;
            }
            .signature-line {
              border-top: 1px solid #000;
              margin-top: 40px;
              padding-top: 6px;
              font-size: 9px;
              font-weight: 600;
            }
            .status-badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 10px;
              font-weight: 600;
              text-transform: uppercase;
            }
            .status-quotation {
              background: #3498db;
              color: white;
            }
            .status-confirmed {
              background: #27ae60;
              color: white;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  // Parse food and services from the text format stored in foodServices field
  const foodServicesText = booking.foodServices as any;
  let parsedFoodServices: any[] = [];
  let parsedOtherServices: any[] = [];
  
  // Try to parse the foodServices field which contains food and services as text
  if (typeof foodServicesText === 'string' && foodServicesText) {
    const parts = foodServicesText.split(' | ');
    
    // Extract food service (first part usually contains "Food:")
    const foodPart = parts.find((p: string) => p.includes('Food:'));
    if (foodPart) {
      const match = foodPart.match(/Food: (.+?) \((\d+) persons × ₹([\d,]+(?:\.\d+)?) = ₹([\d,]+(?:\.\d+)?)\)/);
      if (match) {
        parsedFoodServices.push({
          name: 'Food Buffet',
          description: match[1],
          quantity: parseInt(match[2]),
          pricePerPerson: parseFloat(match[3].replace(/,/g, '')),
          total: parseFloat(match[4].replace(/,/g, ''))
        });
      }
    }
    
    // Extract other services (remaining parts)
    const serviceParts = parts.filter((p: string) => !p.includes('Food:'));
    serviceParts.forEach((servicePart: string) => {
      const match = servicePart.match(/(.+?) \((\d+) × ₹([\d,]+(?:\.\d+)?) = ₹([\d,]+(?:\.\d+)?)\)/);
      if (match) {
        parsedOtherServices.push({
          name: match[1],
          quantity: parseInt(match[2]),
          price: parseFloat(match[3].replace(/,/g, '')),
          total: parseFloat(match[4].replace(/,/g, ''))
        });
      }
    });
  }
  
  // Use parsed services or fallback to empty arrays
  const foodServices = parsedFoodServices.length > 0 ? parsedFoodServices : [];
  const otherServices = parsedOtherServices.length > 0 ? parsedOtherServices : [];
  
  const hallPrice = parseFloat(booking.hallBasePrice || "0");
  const foodTotal = foodServices.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
  const servicesTotal = otherServices.reduce((sum: number, item: any) => sum + (item.total || 0), 0);

  const subtotal = hallPrice + foodTotal + servicesTotal;
  const tax = subtotal * 0.13; // 13% VAT
  const total = parseFloat(booking.totalAmount || "0");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10 no-print">
          <h2 className="text-lg font-semibold">Hall Booking Quotation</h2>
          <div className="flex gap-2">
            <Button onClick={handlePrint} data-testid="button-print-quotation">
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="icon" onClick={() => onOpenChange(false)} data-testid="button-close-quotation">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div ref={printRef}>
          <div className="page">
            {/* Header */}
            <div className="header">
              <div className="hotel-name">{hotel?.name || "Hotel Name"}</div>
              <div className="hotel-details">
                {hotel?.address && <div>{hotel.address}</div>}
                {hotel?.phone && <div>Phone: {hotel.phone}</div>}
                {hotel?.vatNo && <div>VAT No: {hotel.vatNo}</div>}
              </div>
            </div>

            {/* Quotation Title */}
            <div className="quotation-title">Hall Booking Quotation</div>

            {/* Meta Information */}
            <div className="meta-info">
              <div className="meta-box">
                <div className="meta-label">Quotation No:</div>
                <div>{booking.id.substring(0, 8).toUpperCase()}</div>
              </div>
              <div className="meta-box">
                <div className="meta-label">Date:</div>
                <div>{format(new Date(booking.createdAt!), "PPP")}</div>
              </div>
              <div className="meta-box">
                <div className="meta-label">Status:</div>
                <div>
                  <span className={`status-badge status-${booking.status}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="section">
              <div className="section-title">Customer Information</div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Name:</span>
                  <span className="info-value">{booking.customerName}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{booking.customerPhone}</span>
                </div>
                {booking.customerEmail && (
                  <div className="info-item">
                    <span className="info-label">Email:</span>
                    <span className="info-value">{booking.customerEmail}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Event Details */}
            <div className="section">
              <div className="section-title">Event Details</div>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Hall:</span>
                  <span className="info-value">{hall?.name || "N/A"}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Capacity:</span>
                  <span className="info-value">{hall?.capacity || "N/A"} persons</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Event Date:</span>
                  <span className="info-value">
                    {booking.bookingStartTime ? format(new Date(booking.bookingStartTime), "PPP") : "N/A"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Event Time:</span>
                  <span className="info-value">
                    {booking.bookingStartTime && booking.bookingEndTime
                      ? `${format(new Date(booking.bookingStartTime), "p")} - ${format(new Date(booking.bookingEndTime), "p")}`
                      : "N/A"}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Number of Guests:</span>
                  <span className="info-value">{booking.numberOfPeople || 0} persons</span>
                </div>
                {booking.duration && (
                  <div className="info-item">
                    <span className="info-label">Duration:</span>
                    <span className="info-value">{booking.duration} hours</span>
                  </div>
                )}
              </div>
            </div>

            {/* Services Breakdown */}
            <div className="section">
              <div className="section-title">Services & Pricing</div>
              
              <table>
                <thead>
                  <tr>
                    <th style={{ width: "10%" }}>#</th>
                    <th style={{ width: "45%" }}>Description</th>
                    <th style={{ width: "15%" }} className="text-right">Quantity</th>
                    <th style={{ width: "15%" }} className="text-right">Unit Price</th>
                    <th style={{ width: "15%" }} className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td><strong>Hall Rental</strong><br/>{hall?.name || "Hall"}</td>
                    <td className="text-right">1</td>
                    <td className="text-right">{formatCurrency(hallPrice)}</td>
                    <td className="text-right">{formatCurrency(hallPrice)}</td>
                  </tr>
                  
                  {foodServices.length > 0 && foodServices.map((item: any, index: number) => (
                    <tr key={`food-${index}`}>
                      <td>{index + 2}</td>
                      <td>
                        <strong>{item.name || "Food Service"}</strong>
                        {item.description && <br/>}
                        {item.description && <span style={{ fontSize: "8px", color: "#666" }}>{item.description}</span>}
                      </td>
                      <td className="text-right">{item.quantity} persons</td>
                      <td className="text-right">{formatCurrency(item.pricePerPerson || 0)}</td>
                      <td className="text-right">{formatCurrency(item.total || 0)}</td>
                    </tr>
                  ))}
                  
                  {otherServices.length > 0 && otherServices.map((item: any, index: number) => (
                    <tr key={`service-${index}`}>
                      <td>{index + 2 + foodServices.length}</td>
                      <td>
                        <strong>{item.name || "Additional Service"}</strong>
                        {item.description && <br/>}
                        {item.description && <span style={{ fontSize: "8px", color: "#666" }}>{item.description}</span>}
                      </td>
                      <td className="text-right">{item.quantity || 1}</td>
                      <td className="text-right">{formatCurrency(item.price || 0)}</td>
                      <td className="text-right">{formatCurrency(item.total || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <table className="summary-table">
                <tbody>
                  <tr className="summary-row">
                    <td>Subtotal:</td>
                    <td className="text-right">{formatCurrency(subtotal)}</td>
                  </tr>
                  <tr className="summary-row">
                    <td>Tax (13% VAT):</td>
                    <td className="text-right">{formatCurrency(tax)}</td>
                  </tr>
                  <tr className="total-row">
                    <td>Total Amount:</td>
                    <td className="text-right">{formatCurrency(total)}</td>
                  </tr>
                  {parseFloat(booking.advancePaid || "0") > 0 && (
                    <>
                      <tr className="summary-row">
                        <td>Advance Paid:</td>
                        <td className="text-right" style={{ color: "#27ae60" }}>
                          -{formatCurrency(parseFloat(booking.advancePaid || "0"))}
                        </td>
                      </tr>
                      <tr className="total-row">
                        <td>Balance Due:</td>
                        <td className="text-right" style={{ color: "#e74c3c" }}>
                          {formatCurrency(parseFloat(booking.balanceDue || "0"))}
                        </td>
                      </tr>
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Special Requests */}
            {booking.specialRequests && (
              <div className="section">
                <div className="section-title">Special Requests</div>
                <div style={{ fontSize: "9px", lineHeight: "1.4", padding: "6px", background: "#f8f9fa", borderRadius: "4px" }}>
                  {booking.specialRequests}
                </div>
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="terms">
              <div className="terms-title">Terms & Conditions</div>
              <ul>
                <li>This quotation is valid for 30 days from the date of issue.</li>
                <li>A minimum advance payment of 50% is required to confirm the booking.</li>
                <li>The balance amount must be paid before or on the event date.</li>
                <li>Cancellation must be notified at least 7 days in advance for a full refund of the advance.</li>
                <li>Any additional services requested on the event day will be charged separately.</li>
                <li>The hall must be vacated by the agreed end time. Overtime charges may apply.</li>
                <li>The client is responsible for any damage to hotel property during the event.</li>
                <li>All prices are inclusive of applicable taxes unless stated otherwise.</li>
              </ul>
            </div>

            {/* Signature Section */}
            <div className="signature-section">
              <div className="signature-box">
                <div className="signature-line">Authorized Signature</div>
                <div style={{ fontSize: "10px", marginTop: "4px", color: "#666" }}>
                  {hotel?.name || "Hotel Management"}
                </div>
              </div>
              <div className="signature-box">
                <div className="signature-line">Customer Signature</div>
                <div style={{ fontSize: "10px", marginTop: "4px", color: "#666" }}>
                  {booking.customerName}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="footer">
              <div>Thank you for choosing {hotel?.name || "our hotel"}!</div>
              <div style={{ marginTop: "8px" }}>
                For any queries, please contact us at {hotel?.phone || "our reception desk"}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
