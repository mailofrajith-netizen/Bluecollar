<?php
declare(strict_types=1);

namespace Bluecollar\Controllers;

use Bluecollar\Helpers\Response;
use Bluecollar\Models\Product;
use Bluecollar\Models\ProductVariant;

/**
 * Public product endpoints.
 *
 * B-04: GET /api/products
 * B-05: GET /api/products/{id}
 */
class ProductController
{
    // -----------------------------------------------------------------------
    // B-04: Product listing
    // -----------------------------------------------------------------------

    public function index(array $params): void
    {
        // Pagination
        $page  = max(1, (int) ($_GET['page']  ?? 1));
        $limit = min(48, max(1, (int) ($_GET['limit'] ?? 12)));

        // Filters
        $filters = [
            'category'  => trim($_GET['category']  ?? ''),
            'size'      => trim($_GET['size']       ?? ''),
            'color'     => trim($_GET['color']      ?? ''),
            'min_price' => $_GET['min_price'] ?? null,
            'max_price' => $_GET['max_price'] ?? null,
            'search'    => trim($_GET['search']     ?? ''),
            'sort'      => trim($_GET['sort']       ?? 'newest'),
        ];

        // Sanitise empty strings to null
        foreach ($filters as $k => $v) {
            if ($v === '') {
                $filters[$k] = null;
            }
        }

        // Validate sort
        $allowedSorts = ['price_asc', 'price_desc', 'newest', 'featured'];
        if (!in_array($filters['sort'], $allowedSorts, true)) {
            $filters['sort'] = 'newest';
        }

        $result      = Product::list($filters, $page, $limit);
        $totalPages  = (int) ceil($result['total'] / $limit);

        Response::success([
            'items'      => $result['items'],
            'pagination' => [
                'total'       => $result['total'],
                'page'        => $page,
                'limit'       => $limit,
                'total_pages' => $totalPages,
            ],
        ], 'Products retrieved successfully.');
    }

    // -----------------------------------------------------------------------
    // B-05: Product detail
    // -----------------------------------------------------------------------

    public function show(array $params): void
    {
        $idOrSlug = trim($params['id'] ?? '');

        if ($idOrSlug === '') {
            Response::error('Product identifier is required.', 400);
        }

        $product = Product::findByIdOrSlug($idOrSlug);

        if ($product === null) {
            Response::error('Product not found.', 404);
        }

        $productId = (int) $product['id'];
        $images    = Product::getImages($productId);
        $variants  = ProductVariant::forProduct($productId);

        // Group variants by size for convenience
        $groupedVariants = [];
        foreach ($variants as $v) {
            $groupedVariants[$v['size']][] = [
                'id'             => (int) $v['id'],
                'color'          => $v['color'],
                'stock'          => (int) $v['stock'],
                'price_override' => $v['price_override'] !== null ? (float) $v['price_override'] : null,
                'sku'            => $v['sku'],
            ];
        }

        Response::success([
            'product'          => [
                'id'            => $productId,
                'name'          => $product['name'],
                'slug'          => $product['slug'],
                'description'   => $product['description'],
                'base_price'       => (float) $product['base_price'],
                'discount_percent' => (float) ($product['discount_percent'] ?? 0),
                'is_featured'      => (bool) $product['is_featured'],
                'status'        => $product['status'],
                'category_name' => $product['category_name'] ?? null,
                'category_slug' => $product['category_slug'] ?? null,
                'created_at'    => $product['created_at'],
            ],
            'images'           => $images,
            'variants'         => $variants,
            'grouped_variants' => $groupedVariants,
        ], 'Product retrieved successfully.');
    }
}
