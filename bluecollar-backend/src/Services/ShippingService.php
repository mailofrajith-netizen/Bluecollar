<?php
declare(strict_types=1);

namespace Bluecollar\Services;

/**
 * Calculates shipping charges based on order subtotal and store settings.
 *
 * Rules (from settings table):
 *   - If subtotal >= shipping_free_threshold → shipping = 0
 *   - Otherwise                              → shipping = shipping_charge
 */
class ShippingService
{
    /**
     * Calculate the shipping charge for a given subtotal.
     *
     * @param float $subtotal  Order subtotal (before shipping and tax)
     * @return float           Shipping charge (0.00 if free)
     */
    public static function calculate(float $subtotal): float
    {
        $freeThreshold = SettingsService::getFloat('shipping_free_threshold', 1999.0);
        $flatCharge    = SettingsService::getFloat('shipping_charge', 99.0);

        if ($subtotal >= $freeThreshold) {
            return 0.0;
        }

        return $flatCharge;
    }

    /**
     * Calculate GST (tax) amount on the subtotal.
     *
     * @param float $subtotal
     * @return float
     */
    public static function calculateTax(float $subtotal): float
    {
        $gstRate = SettingsService::getFloat('gst_rate', 5.0);
        return round(($subtotal * $gstRate) / 100, 2);
    }
}
