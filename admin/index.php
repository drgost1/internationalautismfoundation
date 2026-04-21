<?php
require __DIR__ . '/auth.php';
require_login();
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Admin · International Autism Foundation</title>
<link rel="stylesheet" href="admin.css" />
</head>
<body>
  <?php include 'partials/header.php'; ?>
  <main class="admin-main">
    <div class="admin-hero">
      <p class="eyebrow">Welcome</p>
      <h1>Foundation Admin</h1>
      <p class="muted">Manage the pages the owner updates regularly. Changes save instantly to <code>/admin/data/*.json</code> and appear on the live site on the next refresh.</p>
    </div>
    <div class="admin-grid">
      <?php foreach ($CFG['pages'] as $slug => $label): ?>
        <a class="admin-card" href="edit.php?page=<?= e($slug) ?>">
          <div class="admin-card-num">§</div>
          <h2><?= e($label) ?></h2>
          <p class="muted">Edit the <?= e(strtolower($label)) ?> page — text, images, captions.</p>
          <span class="admin-card-cta">Open editor →</span>
        </a>
      <?php endforeach; ?>
      <a class="admin-card" href="assets.php">
        <div class="admin-card-num">§</div>
        <h2>Upload images</h2>
        <p class="muted">Add photos and reuse them in any field. Uploads live in <code>/admin/uploads/</code>.</p>
        <span class="admin-card-cta">Open uploads →</span>
      </a>
    </div>
  </main>
</body>
</html>
