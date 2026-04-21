<?php
$CFG = require __DIR__ . '/config.php';
session_name($CFG['session_name']);
session_start();

function is_logged_in(): bool {
  return !empty($_SESSION['iaf_admin']);
}
function require_login(): void {
  if (!is_logged_in()) {
    header('Location: login.php');
    exit;
  }
}
function csrf_token(): string {
  if (empty($_SESSION['csrf'])) {
    $_SESSION['csrf'] = bin2hex(random_bytes(16));
  }
  return $_SESSION['csrf'];
}
function csrf_check(): void {
  if (!hash_equals($_SESSION['csrf'] ?? '', $_POST['csrf'] ?? '')) {
    http_response_code(419);
    exit('CSRF token mismatch. Reload and try again.');
  }
}
function e($s): string { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }

function load_data(string $slug, string $dataDir): array {
  $file = $dataDir . '/' . basename($slug) . '.json';
  if (!is_file($file)) return [];
  $raw = file_get_contents($file);
  $data = json_decode($raw, true);
  return is_array($data) ? $data : [];
}
function save_data(string $slug, array $data, string $dataDir): void {
  if (!is_dir($dataDir)) mkdir($dataDir, 0775, true);
  $file = $dataDir . '/' . basename($slug) . '.json';
  file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
}
function set_by_path(array &$data, string $path, $val): void {
  $keys = explode('.', $path);
  $ref = &$data;
  foreach ($keys as $k) {
    if (!isset($ref[$k]) || !is_array($ref[$k])) $ref[$k] = [];
    $ref = &$ref[$k];
  }
  $ref = $val;
}
function get_by_path(array $data, string $path, $default = null) {
  foreach (explode('.', $path) as $k) {
    if (!is_array($data) || !array_key_exists($k, $data)) return $default;
    $data = $data[$k];
  }
  return $data;
}
