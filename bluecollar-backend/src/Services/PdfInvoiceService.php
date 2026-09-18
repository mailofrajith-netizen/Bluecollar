<?php
declare(strict_types=1);

namespace Bluecollar\Services;

use TCPDF;

/**
 * Generates a Bluecollar order invoice as a PDF binary string using TCPDF.
 *
 * Usage:
 *   $pdf = (new PdfInvoiceService())->generate($order, $items, $settings);
 *   // $pdf is a raw PDF binary string
 */
class PdfInvoiceService
{
    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Generate the invoice PDF and return it as a binary string.
     *
     * @param array $order    Full order row from DB
     * @param array $items    All order_items rows for this order
     * @param array $settings Key-value store settings (company_name, gstin, gst_rate, etc.)
     * @return string         Raw PDF binary
     */
    public function generate(array $order, array $items, array $settings): string
    {
        $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);

        // Document metadata
        $pdf->SetCreator('Bluecollar');
        $pdf->SetAuthor($settings['company_name'] ?? 'Bluecollar');
        $pdf->SetTitle('Invoice ' . $order['order_number']);
        $pdf->SetSubject('Order Invoice');

        // Remove default header/footer
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);

        $pdf->SetMargins(15, 15, 15);
        $pdf->SetAutoPageBreak(true, 20);

        $pdf->AddPage();

        // -----------------------------------------------------------------------
        // Brand Header
        // -----------------------------------------------------------------------
        $pdf->SetFont('helvetica', 'B', 22);
        $pdf->SetTextColor(30, 64, 175); // Bluecollar brand blue
        $pdf->Cell(0, 10, 'BLUECOLLAR', 0, 1, 'L');

        $pdf->SetFont('helvetica', '', 9);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->Cell(0, 5, 'Premium Wrinkle-Free Shirts', 0, 1, 'L');

        // Separator line
        $pdf->SetDrawColor(30, 64, 175);
        $pdf->SetLineWidth(0.5);
        $pdf->Line(15, $pdf->GetY() + 2, 195, $pdf->GetY() + 2);
        $pdf->Ln(6);

        // -----------------------------------------------------------------------
        // Invoice title + company details (two-column layout)
        // -----------------------------------------------------------------------
        $yAfterHeader = $pdf->GetY();

        // Left: Invoice details
        $pdf->SetXY(15, $yAfterHeader);
        $pdf->SetFont('helvetica', 'B', 14);
        $pdf->SetTextColor(30, 64, 175);
        $pdf->Cell(90, 8, 'TAX INVOICE', 0, 0, 'L');

        // Right: Company details
        $pdf->SetXY(110, $yAfterHeader);
        $pdf->SetFont('helvetica', 'B', 9);
        $pdf->SetTextColor(50, 50, 50);
        $pdf->Cell(85, 5, $settings['company_name'] ?? 'Bluecollar', 0, 2, 'R');

        $pdf->SetFont('helvetica', '', 8);
        $pdf->SetTextColor(80, 80, 80);

        $companyLines = [
            $settings['company_address'] ?? '',
            'Email: ' . ($settings['company_email'] ?? ''),
            'Phone: ' . ($settings['company_phone'] ?? ''),
            'GSTIN: ' . ($settings['gstin'] ?? ''),
        ];

        foreach ($companyLines as $line) {
            if (trim($line) === '' || trim($line) === 'Email: ' || trim($line) === 'Phone: ' || trim($line) === 'GSTIN: ') {
                continue;
            }
            $pdf->SetX(110);
            $pdf->Cell(85, 4, $line, 0, 2, 'R');
        }

        // Invoice meta below title
        $pdf->SetXY(15, $yAfterHeader + 10);
        $pdf->SetFont('helvetica', '', 9);
        $pdf->SetTextColor(50, 50, 50);

        $invoiceDate = date('d M Y', strtotime($order['created_at']));
        $pdf->Cell(90, 5, 'Invoice No.: ' . $order['order_number'], 0, 2, 'L');
        $pdf->SetX(15);
        $pdf->Cell(90, 5, 'Date: ' . $invoiceDate, 0, 2, 'L');
        $pdf->SetX(15);
        $pdf->Cell(90, 5, 'Payment: Cash on Delivery', 0, 2, 'L');

        $pdf->Ln(4);

        // -----------------------------------------------------------------------
        // Billing / Shipping Address
        // -----------------------------------------------------------------------
        $yAddress = $pdf->GetY();

        // Customer Name
        $customerName = $order['guest_name'] ?? '';
        if (empty($customerName) && !empty($order['shipping_address'])) {
            $customerName = 'Customer';
        }
        $customerEmail = $order['guest_email'] ?? ($order['user_email'] ?? '');
        $customerPhone = $order['guest_phone'] ?? '';

        $shippingLines = array_filter([
            $order['shipping_address'] ?? '',
            $order['shipping_city'] ?? '',
            trim(($order['shipping_state'] ?? '') . ' - ' . ($order['shipping_pincode'] ?? ''), ' -'),
        ]);

        // Left: Bill To
        $pdf->SetXY(15, $yAddress);
        $pdf->SetFont('helvetica', 'B', 9);
        $pdf->SetTextColor(30, 64, 175);
        $pdf->Cell(85, 5, 'BILL TO / SHIP TO', 0, 2, 'L');

        $pdf->SetFont('helvetica', 'B', 9);
        $pdf->SetTextColor(50, 50, 50);
        $pdf->SetX(15);
        $pdf->Cell(85, 5, $customerName, 0, 2, 'L');

        $pdf->SetFont('helvetica', '', 8);
        foreach ($shippingLines as $line) {
            $pdf->SetX(15);
            $pdf->Cell(85, 4, $line, 0, 2, 'L');
        }
        if ($customerPhone) {
            $pdf->SetX(15);
            $pdf->Cell(85, 4, 'Phone: ' . $customerPhone, 0, 2, 'L');
        }
        if ($customerEmail) {
            $pdf->SetX(15);
            $pdf->Cell(85, 4, 'Email: ' . $customerEmail, 0, 2, 'L');
        }

        $pdf->Ln(6);

        // -----------------------------------------------------------------------
        // Line Items Table
        // -----------------------------------------------------------------------
        $tableY = $pdf->GetY();

        // Header
        $pdf->SetFillColor(30, 64, 175);
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('helvetica', 'B', 8);

        $colWidths = [65, 30, 12, 25, 20, 28]; // Product, Variant, HSN, Qty, Unit Price, Line Total

        $headers = ['Product', 'Size / Color', 'HSN', 'Qty', 'Unit Price', 'Total'];
        foreach ($headers as $i => $header) {
            $align = $i >= 3 ? 'R' : 'L';
            $pdf->Cell($colWidths[$i], 7, $header, 0, 0, $align, true);
        }
        $pdf->Ln();

        // Rows
        $pdf->SetTextColor(50, 50, 50);
        $pdf->SetFont('helvetica', '', 8);
        $rowFill = false;

        foreach ($items as $item) {
            $pdf->SetFillColor(245, 247, 255);

            $pdf->Cell($colWidths[0], 6, $this->truncate((string) $item['product_name'], 40), 0, 0, 'L', $rowFill);
            $pdf->Cell($colWidths[1], 6, (string) ($item['variant_details'] ?? ''), 0, 0, 'L', $rowFill);
            $pdf->Cell($colWidths[2], 6, (string) ($item['hsn_code'] ?? ''), 0, 0, 'L', $rowFill);
            $pdf->Cell($colWidths[3], 6, (string) $item['quantity'], 0, 0, 'R', $rowFill);
            $pdf->Cell($colWidths[4], 6, $this->formatCurrency((float) $item['unit_price']), 0, 0, 'R', $rowFill);
            $pdf->Cell($colWidths[5], 6, $this->formatCurrency((float) $item['line_total']), 0, 0, 'R', $rowFill);
            $pdf->Ln();

            $rowFill = !$rowFill;
        }

        // Separator line
        $pdf->SetDrawColor(200, 200, 200);
        $pdf->SetLineWidth(0.3);
        $pdf->Line(15, $pdf->GetY() + 1, 195, $pdf->GetY() + 1);
        $pdf->Ln(4);

        // -----------------------------------------------------------------------
        // Totals Block
        // -----------------------------------------------------------------------
        $subtotal      = (float) $order['subtotal'];
        $shippingCharge = (float) $order['shipping_charge'];
        $taxAmount     = (float) $order['tax_amount'];
        $totalAmount   = (float) $order['total_amount'];
        $gstRate       = (float) ($settings['gst_rate'] ?? 5);

        $labelX      = 130;
        $valueWidth  = 50;

        $totals = [
            ['Subtotal', $this->formatCurrency($subtotal)],
            ['Shipping Charge', $shippingCharge > 0 ? $this->formatCurrency($shippingCharge) : 'FREE'],
            ['GST (' . $gstRate . '%)', $this->formatCurrency($taxAmount)],
        ];

        $pdf->SetFont('helvetica', '', 9);
        $pdf->SetTextColor(50, 50, 50);

        foreach ($totals as [$label, $value]) {
            $pdf->SetX($labelX);
            $pdf->Cell(45, 6, $label . ':', 0, 0, 'R');
            $pdf->Cell($valueWidth, 6, $value, 0, 1, 'R');
        }

        // Grand total
        $pdf->SetX($labelX);
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetTextColor(30, 64, 175);
        $pdf->Cell(45, 8, 'GRAND TOTAL:', 0, 0, 'R');
        $pdf->Cell($valueWidth, 8, $this->formatCurrency($totalAmount), 0, 1, 'R');

        $pdf->Ln(4);

        // -----------------------------------------------------------------------
        // Terms / Footer note
        // -----------------------------------------------------------------------
        $pdf->SetFont('helvetica', 'I', 8);
        $pdf->SetTextColor(130, 130, 130);
        $pdf->Cell(0, 5, 'Payment Method: Cash on Delivery', 0, 1, 'L');
        $pdf->Cell(0, 5, 'This is a computer-generated invoice and does not require a physical signature.', 0, 1, 'L');

        // Bottom divider
        $pdf->SetDrawColor(30, 64, 175);
        $pdf->SetLineWidth(0.5);
        $pdf->Line(15, $pdf->GetY() + 3, 195, $pdf->GetY() + 3);
        $pdf->Ln(6);

        $pdf->SetFont('helvetica', 'B', 9);
        $pdf->SetTextColor(30, 64, 175);
        $pdf->Cell(0, 6, 'Thank you for shopping with Bluecollar!', 0, 1, 'C');

        $pdf->SetFont('helvetica', '', 8);
        $pdf->SetTextColor(130, 130, 130);
        $pdf->Cell(0, 5, 'For support: ' . ($settings['company_email'] ?? 'orders@bluecollar.in'), 0, 1, 'C');

        // Return binary string
        return $pdf->Output('invoice.pdf', 'S');
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    private function formatCurrency(float $amount): string
    {
        return '₹' . number_format($amount, 2);
    }

    private function truncate(string $text, int $maxLen): string
    {
        if (mb_strlen($text) <= $maxLen) {
            return $text;
        }
        return mb_substr($text, 0, $maxLen - 3) . '...';
    }
}
