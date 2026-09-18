<?php
declare(strict_types=1);

namespace Bluecollar\Router;

use Bluecollar\Helpers\Response;

/**
 * Lightweight HTTP router.
 *
 * Supports named URL parameters via {param} syntax.
 * Handlers may be a Closure or a [ClassName::class, 'methodName'] array.
 *
 * Usage:
 *   $router->get('/api/products/{id}', [ProductController::class, 'show']);
 *   $router->post('/api/auth/login',   fn() => ...);
 *   $router->dispatch();
 */
class Router
{
    /** @var array<array{method: string, pattern: string, paramNames: string[], handler: callable|array}> */
    private array $routes = [];

    // -----------------------------------------------------------------------
    // Route registration helpers
    // -----------------------------------------------------------------------

    public function get(string $path, callable|array $handler): void
    {
        $this->addRoute('GET', $path, $handler);
    }

    public function post(string $path, callable|array $handler): void
    {
        $this->addRoute('POST', $path, $handler);
    }

    public function put(string $path, callable|array $handler): void
    {
        $this->addRoute('PUT', $path, $handler);
    }

    public function delete(string $path, callable|array $handler): void
    {
        $this->addRoute('DELETE', $path, $handler);
    }

    // -----------------------------------------------------------------------
    // Core internals
    // -----------------------------------------------------------------------

    /**
     * Convert a route path with {param} placeholders into a named regex pattern
     * and store the route.
     */
    private function addRoute(string $method, string $path, callable|array $handler): void
    {
        $paramNames = [];

        // Replace {param} with a named capture group (?P<param>[^/]+)
        $pattern = preg_replace_callback(
            '/\{([a-zA-Z_][a-zA-Z0-9_]*)\}/',
            static function (array $m) use (&$paramNames): string {
                $paramNames[] = $m[1];
                return '(?P<' . $m[1] . '>[^/]+)';
            },
            $path
        );

        $this->routes[] = [
            'method'     => strtoupper($method),
            'pattern'    => '#^' . $pattern . '$#',
            'paramNames' => $paramNames,
            'handler'    => $handler,
        ];
    }

    /**
     * Match the current request against registered routes and call the handler.
     * Falls through to a 404 response if no route matches.
     */
    public function dispatch(): void
    {
        $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

        // Strip query string from URI
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $uri = '/' . trim((string) $uri, '/');

        foreach ($this->routes as $route) {
            if ($route['method'] !== $method) {
                continue;
            }

            if (!preg_match($route['pattern'], $uri, $matches)) {
                continue;
            }

            // Build params array from named captures
            $params = [];
            foreach ($route['paramNames'] as $name) {
                $params[$name] = $matches[$name] ?? '';
            }

            $this->callHandler($route['handler'], $params);
            return;
        }

        Response::error('Not found', 404);
    }

    /**
     * Resolve and call the route handler.
     *
     * @param callable|array $handler  Closure or [ClassName::class, 'method']
     * @param array          $params   Extracted URL parameters
     */
    private function callHandler(callable|array $handler, array $params): void
    {
        if (is_callable($handler)) {
            call_user_func($handler, $params);
            return;
        }

        // Array handler: [ClassName::class, 'methodName']
        if (is_array($handler) && count($handler) === 2) {
            [$class, $method] = $handler;

            if (!class_exists($class)) {
                Response::error("Controller class [{$class}] not found.", 500);
            }

            $instance = new $class();

            if (!method_exists($instance, $method)) {
                Response::error("Method [{$method}] not found on [{$class}].", 500);
            }

            $instance->$method($params);
            return;
        }

        Response::error('Invalid route handler.', 500);
    }
}
