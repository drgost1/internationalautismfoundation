<?php
require __DIR__ . '/auth.php';
require_login();

header('Content-Type: application/json');

$files = [];
// 1) Uploads directory
if (is_dir($CFG['uploads_dir'])) {
  foreach (scandir($CFG['uploads_dir']) as $f) {
    if ($f === '.' || $f === '..' || $f[0] === '.') continue;
    $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
    if (!in_array($ext, ['jpg','jpeg','png','webp','gif'], true)) continue;
    $files[] = ['url' => $CFG['uploads_url'] . '/' . $f, 'name' => $f];
  }
}
// 2) Images committed in the site repo (assets/images/*.webp)
$assetsDir = __DIR__ . '/../assets/images';
if (is_dir($assetsDir)) {
  foreach (scandir($assetsDir) as $f) {
    if ($f === '.' || $f === '..' || $f[0] === '.') continue;
    $ext = strtolower(pathinfo($f, PATHINFO_EXTENSION));
    if (!in_array($ext, ['webp','jpg','jpeg','png','gif'], true)) continue;
    // Prefer webp; skip jpg/png if the same name has a .webp sibling
    if (in_array($ext, ['jpg','jpeg','png'], true)) {
      $base = pathinfo($f, PATHINFO_FILENAME);
      if (is_file($assetsDir . '/' . $base . '.webp')) continue;
    }
    $files[] = ['url' => 'assets/images/' . $f, 'name' => $f];
  }
}

// Sort by name, stable
usort($files, fn($a, $b) => strcmp($a['name'], $b['name']));
echo json_encode($files);
