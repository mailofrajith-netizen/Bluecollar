<?php
declare(strict_types=1);

namespace Bluecollar\Services;

use Bluecollar\Bootstrap\Database;
use Bluecollar\Helpers\OrderNumber;
use Bluecollar\Models\Order;
use Bluecollar\Models\OrderItem;
use Bluecollar\Models\Product;
use Bluecollar\Models\ProductVariant;
use PDO;

/**
 * Orchestrates order placement with stock locking inside a DB transaction.
 *
 * Flow:
 *  1. BEGIN transaction
 *  2. For each item: SELECT FOR UPDATE the variant → validate stock
 *  3. Compute subtotal → shipping → tax → total
 *  4. INSERT order row
 *  5. INSERT order_items rows
 *  6. Decrement variant stocks
 *  7. INSERT initial status history entry
 *  8. COMMIT
 *
 * On any error the transaction is rolled back and an exception is thrown.
 */
class OrderService
{
    /**
     * Place an order.
     *
     * @param array      $input    Validated input from the controller
     * @param int|null   $userId   Authenticated user id (null = guest)
     * @return array               The newly created order + items
     * @throws \RuntimeException   With user-facing message on stock/validation failure
     */
    public function place(array $input, ?int $userId): array
    {
        $pdo      = Database::getInstance();
        $settings = SettingsService::all();
        $hsnCode  = $settings['hsn_code'] ?? '6205';

        $pdo->beginTransaction();

        try {
            $lockedVariants = [];
            $subtotal       = 0.0;
            $resolvedItems  = [];

            foreach ($input['items'] as $lineInput) {
                $variantId = (int) $lineInput['variant_id'];
                $qty       = (int) $lineInput['quantity'];

                // Lock the variant row to prevent concurrent oversell
                $variant = ProductVariant::findForUpdate($variantId);

                if ($variant === null) {
                    throw new \RuntimeException("Variant ID {$variantId} not found.");
                }

                if ((int) $variant['stock'] < $qty) {
                    throw new \RuntimeException(
                        "Insufficient stock for variant ID {$variantId}. Available: {$variant['stock']}, requested: {$qty}."
                    );
                }

                // Resolve unit price: variant price_override OR product base_price
                $unitPrice = $variant['price_override'] !== null
                    ? (float) $variant['price_override']
                    : (float) $this->getProductBasePrice((int) $variant['product_id']);

                $lineTotal = round($unitPrice * $qty, 2);
                $subtotal += $lineTotal;

                $product = Product::findById((int) $variant['product_id']);

                $resolvedItems[] = [
                    'variant_id'      => $variantId,
                    'product_id'      => (int) $variant['product_id'],
                    'product_name'    => $product['name'] ?? 'Unknown Product',
                    'variant_details' => $variant['size'] . ' / ' . $variant['color'],
                    'quantity'        => $qty,
                    'unit_price'      => $unitPrice,
                    'line_total'      => $lineTotal,
                    'hsn_code'        => $hsnCode,
                    'stock_before'    => (int) $variant['stock'],
                ];

                $lockedVariants[] = ['id' => $variantId, 'qty' => $qty];
            }

            $subtotal      = round($subtotal, 2);
            $shippingCharge = ShippingService::calculate($subtotal);
            $taxAmount     = ShippingService::calculateTax($subtotal);
            $totalAmount   = round($subtotal + $shippingCharge + $taxAmount, 2);

            $orderNumber            = OrderNumber::generate();
            $invoiceToken           = bin2hex(random_bytes(32));
            $invoiceTokenExpiresAt  = date('Y-m-d H:i:s', strtotime('+30 days'));

            // Build order data
            $orderData = [
                'order_number'    => $orderNumber,
                'user_id'         => $userId,
                'guest_name'      => $input['name'] ?? null,
                'guest_email'     => $input['email'] ?? null,
                'guest_phone'     => $input['phone'] ?? null,
                'shipping_address' => $input['shipping_address'],
                'shipping_line2'  => $input['shipping_line2'] ?? null,
                'shipping_city'   => $input['shipping_city'],
                'shipping_state'  => $input['shipping_state'],
                'shipping_pincode' => $input['shipping_pincode'],
                'subtotal'        => $subtotal,
                'shipping_charge' => $shippingCharge,
                'tax_amount'      => $taxAmount,
                'total_amount'    => $totalAmount,
                'invoice_token'            => $invoiceToken,
                'invoice_token_expires_at' => $invoiceTokenExpiresAt,
                'notes'                    => $input['notes'] ?? null,
            ];

            $orderId = Order::create($orderData);

            // Insert line items
            foreach ($resolvedItems as $item) {
                OrderItem::create($orderId, $item);
            }

            // Decrement stocks (while still inside transaction with FOR UPDATE locks)
            foreach ($lockedVariants as $lv) {
                ProductVariant::decrementStock($lv['id'], $lv['qty']);
            }

            // Initial status history entry
            Order::addStatusHistory($orderId, 'pending', 'system', 'Order placed successfully.');

            $pdo->commit();

            // Build response payload
            $orderRow   = Order::findByIdOrToken((string) $orderId);
            $orderItems = OrderItem::forOrder($orderId);

            return [
                'order' => $orderRow,
                'items' => $orderItems,
            ];

        } catch (\Throwable $e) {
            $pdo->rollBack();
            throw $e;
        }
    }

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    private function getProductBasePrice(int $productId): float
    {
        $product = Product::findById($productId);
        return $product !== null ? (float) $product['base_price'] : 0.0;
    }
}
