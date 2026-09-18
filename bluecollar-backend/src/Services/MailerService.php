<?php
declare(strict_types=1);

namespace Bluecollar\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception as MailerException;

/**
 * Wraps PHPMailer for sending transactional emails.
 *
 * SMTP config is read from constants defined in config.php (sourced from .env).
 * All send methods return bool — they never throw; a failed email must not
 * prevent order placement from completing.
 */
class MailerService
{
    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Send an order confirmation email to the customer.
     *
     * @param array $order  Full order row from DB
     * @param array $items  All order_items rows
     * @return bool         true on success, false on any failure
     */
    public function sendOrderConfirmation(array $order, array $items): bool
    {
        $to      = $order['guest_email'] ?? ($order['user_email'] ?? '');
        $toName  = $order['guest_name']  ?? 'Valued Customer';

        if (empty($to)) {
            return false;
        }

        $subject = 'Order Confirmed — ' . $order['order_number'] . ' | Bluecollar';
        $body    = $this->buildOrderConfirmationHtml($order, $items);

        return $this->send($to, $toName, $subject, $body);
    }

    /**
     * Send an email verification link to a newly registered user.
     */
    public function sendEmailVerification(array $user, string $verifyLink): bool
    {
        $to      = $user['email'] ?? '';
        $toName  = $user['name']  ?? 'Customer';

        if (empty($to)) {
            return false;
        }

        $subject = 'Verify your Bluecollar email address';
        $body    = $this->buildVerificationHtml($toName, $verifyLink);

        return $this->send($to, $toName, $subject, $body);
    }

    // -----------------------------------------------------------------------
    // Internal send helper
    // -----------------------------------------------------------------------

    private function send(string $to, string $toName, string $subject, string $htmlBody): bool
    {
        try {
            $mail = $this->createMailer();

            $mail->addAddress($to, $toName);
            $mail->Subject = $subject;
            $mail->Body    = $htmlBody;
            $mail->AltBody = strip_tags(str_replace(['<br>', '<br/>', '<br />', '</p>', '</li>'], "\n", $htmlBody));

            return $mail->send();
        } catch (MailerException $e) {
            // Log silently — never propagate mail failure
            error_log('[MailerService] PHPMailer exception: ' . $e->getMessage());
            return false;
        } catch (\Throwable $e) {
            error_log('[MailerService] Unexpected error: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Build and configure a PHPMailer instance from env/config constants.
     */
    private function createMailer(): PHPMailer
    {
        $mail = new PHPMailer(true);

        $host     = defined('MAIL_HOST')     ? MAIL_HOST     : '';
        $port     = defined('MAIL_PORT')     ? MAIL_PORT     : 587;
        $username = defined('MAIL_USERNAME') ? MAIL_USERNAME : '';
        $password = defined('MAIL_PASSWORD') ? MAIL_PASSWORD : '';
        $from     = defined('MAIL_FROM_ADDRESS') ? MAIL_FROM_ADDRESS : 'orders@bluecollar.in';
        $fromName = defined('MAIL_FROM_NAME')    ? MAIL_FROM_NAME    : 'Bluecollar';

        if (!empty($host)) {
            $mail->isSMTP();
            $mail->Host       = $host;
            $mail->Port       = (int) $port;
            $mail->SMTPAuth   = !empty($username);
            $mail->Username   = $username;
            $mail->Password   = $password;
            $mail->SMTPSecure = ((int) $port === 465)
                ? PHPMailer::ENCRYPTION_SMTPS
                : PHPMailer::ENCRYPTION_STARTTLS;
        }

        $mail->setFrom($from, $fromName);
        $mail->isHTML(true);
        $mail->CharSet = 'UTF-8';

        return $mail;
    }

    // -----------------------------------------------------------------------
    // HTML template
    // -----------------------------------------------------------------------

    private function buildOrderConfirmationHtml(array $order, array $items): string
    {
        $orderNumber   = htmlspecialchars($order['order_number'] ?? '');
        $customerName  = htmlspecialchars($order['guest_name'] ?? 'Valued Customer');
        $orderDate     = date('d M Y', strtotime($order['created_at'] ?? 'now'));
        $totalAmount   = '&#8377;' . number_format((float) ($order['total_amount'] ?? 0), 2);
        $shippingCharge = (float) ($order['shipping_charge'] ?? 0);
        $taxAmount     = (float) ($order['tax_amount'] ?? 0);
        $subtotal      = (float) ($order['subtotal'] ?? 0);

        $shippingLine = $shippingCharge > 0
            ? '&#8377;' . number_format($shippingCharge, 2)
            : 'FREE';

        $shippingAddr  = implode(', ', array_filter([
            $order['shipping_address'] ?? '',
            $order['shipping_city'] ?? '',
            $order['shipping_state'] ?? '',
            $order['shipping_pincode'] ?? '',
        ]));

        // Build items rows
        $itemsHtml = '';
        foreach ($items as $item) {
            $pName   = htmlspecialchars((string) ($item['product_name'] ?? ''));
            $variant = htmlspecialchars((string) ($item['variant_details'] ?? ''));
            $qty     = (int) ($item['quantity'] ?? 1);
            $price   = '&#8377;' . number_format((float) ($item['unit_price'] ?? 0), 2);
            $total   = '&#8377;' . number_format((float) ($item['line_total'] ?? 0), 2);

            $itemsHtml .= "
                <tr>
                    <td style='padding:8px 10px;border-bottom:1px solid #e5e7eb;'>
                        <strong>{$pName}</strong><br>
                        <span style='color:#6b7280;font-size:12px;'>{$variant}</span>
                    </td>
                    <td style='padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:center;'>{$qty}</td>
                    <td style='padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;'>{$price}</td>
                    <td style='padding:8px 10px;border-bottom:1px solid #e5e7eb;text-align:right;'>{$total}</td>
                </tr>";
        }

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Order Confirmation — {$orderNumber}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">

          <!-- Header -->
          <tr>
            <td style="background:#1e40af;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;letter-spacing:2px;">BLUECOLLAR</h1>
              <p style="margin:4px 0 0;color:#bfdbfe;font-size:13px;">Premium Wrinkle-Free Shirts</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">

              <h2 style="color:#1e40af;margin:0 0 8px;">Order Confirmed!</h2>
              <p style="color:#374151;margin:0 0 24px;">Hi {$customerName}, thank you for your order. We&#39;ve received it and will begin processing shortly.</p>

              <!-- Order Meta -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;border-radius:6px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%">
                      <tr>
                        <td style="color:#6b7280;font-size:13px;">Order Number</td>
                        <td style="color:#1e40af;font-weight:bold;text-align:right;">{$orderNumber}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:13px;padding-top:6px;">Order Date</td>
                        <td style="color:#374151;text-align:right;padding-top:6px;">{$orderDate}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:13px;padding-top:6px;">Payment Method</td>
                        <td style="color:#374151;text-align:right;padding-top:6px;">Cash on Delivery</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Items Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:24px;">
                <thead>
                  <tr style="background:#1e40af;">
                    <th style="padding:10px;color:#fff;text-align:left;font-size:13px;">Product</th>
                    <th style="padding:10px;color:#fff;text-align:center;font-size:13px;">Qty</th>
                    <th style="padding:10px;color:#fff;text-align:right;font-size:13px;">Price</th>
                    <th style="padding:10px;color:#fff;text-align:right;font-size:13px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {$itemsHtml}
                </tbody>
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="color:#6b7280;padding:4px 0;">Subtotal</td>
                  <td style="text-align:right;color:#374151;padding:4px 0;">&#8377;{$subtotal}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;padding:4px 0;">Shipping</td>
                  <td style="text-align:right;color:#374151;padding:4px 0;">{$shippingLine}</td>
                </tr>
                <tr>
                  <td style="color:#6b7280;padding:4px 0;">GST</td>
                  <td style="text-align:right;color:#374151;padding:4px 0;">&#8377;{$taxAmount}</td>
                </tr>
                <tr style="border-top:2px solid #1e40af;">
                  <td style="color:#1e40af;font-weight:bold;font-size:16px;padding-top:8px;">Grand Total</td>
                  <td style="text-align:right;color:#1e40af;font-weight:bold;font-size:16px;padding-top:8px;">{$totalAmount}</td>
                </tr>
              </table>

              <!-- Shipping Address -->
              <div style="background:#f9fafb;border-radius:6px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0 0 6px;font-weight:bold;color:#374151;">Shipping Address</p>
                <p style="margin:0;color:#6b7280;font-size:13px;">{$shippingAddr}</p>
              </div>

              <p style="color:#374151;font-size:14px;margin:0;">We&#39;ll notify you once your order is shipped. For any queries, reply to this email or contact us at <a href="mailto:orders@bluecollar.in" style="color:#1e40af;">orders@bluecollar.in</a>.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f3f4f6;padding:20px 32px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">Thank you for shopping with <strong>Bluecollar</strong></p>
              <p style="margin:4px 0 0;color:#9ca3af;font-size:11px;">&copy; {$this->currentYear()} Bluecollar. All rights reserved.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;
    }

    private function buildVerificationHtml(string $name, string $verifyLink): string
    {
        $safeName = htmlspecialchars($name);
        $safeLink = htmlspecialchars($verifyLink);
        $year     = $this->currentYear();

        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Verify your email — Bluecollar</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:600px;">
          <tr>
            <td style="background:#1e40af;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;letter-spacing:2px;">BLUECOLLAR</h1>
              <p style="margin:4px 0 0;color:#bfdbfe;font-size:13px;">Premium Wrinkle-Free Shirts</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="color:#1e40af;margin:0 0 12px;">Verify your email address</h2>
              <p style="color:#374151;margin:0 0 20px;">Hi {$safeName}, thank you for creating a Bluecollar account. Please verify your email address by clicking the button below.</p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                <tr>
                  <td style="background:#e8722a;border-radius:8px;padding:14px 28px;">
                    <a href="{$safeLink}" style="color:#ffffff;font-weight:bold;text-decoration:none;font-size:15px;">Verify Email Address</a>
                  </td>
                </tr>
              </table>
              <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">Or copy this link into your browser:</p>
              <p style="color:#1e40af;font-size:12px;word-break:break-all;margin:0 0 24px;">{$safeLink}</p>
              <p style="color:#9ca3af;font-size:12px;margin:0;">This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#f3f4f6;padding:20px 32px;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;">&copy; {$year} Bluecollar. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
HTML;
    }

    private function currentYear(): string
    {
        return date('Y');
    }
}
