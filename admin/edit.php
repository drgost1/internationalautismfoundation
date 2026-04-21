<?php
require __DIR__ . '/auth.php';
require_login();
$schemas = require __DIR__ . '/schemas.php';

$slug = $_GET['page'] ?? '';
if (!isset($CFG['pages'][$slug]) || !isset($schemas[$slug])) {
  http_response_code(404);
  exit('Unknown page.');
}
$label  = $CFG['pages'][$slug];
$schema = $schemas[$slug];
$data   = load_data($slug, $CFG['data_dir']);
$saved  = false;
$error  = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  csrf_check();
  // Text / textarea / html fields
  foreach ($schema as $row) {
    if (empty($row['key'])) continue;
    if (in_array($row['type'] ?? '', ['text', 'textarea', 'html'], true)) {
      $val = trim((string)($_POST['f'][$row['key']] ?? ''));
      set_by_path($data, $row['key'], $val);
    }
  }
  // Image uploads
  if (!empty($_FILES['img']) && is_array($_FILES['img']['name'])) {
    foreach ($_FILES['img']['name'] as $path => $name) {
      if ($_FILES['img']['error'][$path] !== UPLOAD_ERR_OK) continue;
      $tmp = $_FILES['img']['tmp_name'][$path];
      $ext = strtolower(pathinfo($name, PATHINFO_EXTENSION));
      if (!in_array($ext, ['jpg','jpeg','png','webp','gif'], true)) continue;
      if (!is_dir($CFG['uploads_dir'])) mkdir($CFG['uploads_dir'], 0775, true);
      $safeBase = preg_replace('/[^a-z0-9\-_]/i', '-', pathinfo($name, PATHINFO_FILENAME));
      $final = $safeBase . '-' . substr(md5(uniqid('', true)), 0, 6) . '.' . $ext;
      $target = $CFG['uploads_dir'] . '/' . $final;
      if (move_uploaded_file($tmp, $target)) {
        set_by_path($data, $path, $CFG['uploads_url'] . '/' . $final);
      }
    }
  }
  // Image-by-URL inputs (e.g. paste in an existing assets/images/ path)
  if (!empty($_POST['imgurl']) && is_array($_POST['imgurl'])) {
    foreach ($_POST['imgurl'] as $path => $url) {
      $url = trim((string)$url);
      if ($url !== '') set_by_path($data, $path, $url);
    }
  }

  try {
    save_data($slug, $data, $CFG['data_dir']);
    $saved = true;
  } catch (Throwable $e) {
    $error = 'Could not save: ' . $e->getMessage();
  }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Edit <?= e($label) ?> · Admin</title>
<link rel="stylesheet" href="admin.css" />
</head>
<body>
  <?php include 'partials/header.php'; ?>
  <main class="admin-main">
    <div class="admin-hero">
      <p class="eyebrow">Editing</p>
      <h1><?= e($label) ?></h1>
      <p class="muted">Every field here is rendered on the live page. HTML is allowed in title fields so you can keep the <em>italic-accent</em> spans.</p>
      <p><a class="btn-ghost" target="_blank" href="../<?= e($slug) ?>.html">Preview live page ↗</a></p>
    </div>
    <?php if ($saved): ?><div class="alert alert-ok">Saved. Refresh the live page to see the changes.</div><?php endif; ?>
    <?php if ($error): ?><div class="alert alert-err"><?= e($error) ?></div><?php endif; ?>
    <form method="post" enctype="multipart/form-data" class="editor-form">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
      <?php foreach ($schema as $row): ?>
        <?php if (!empty($row['section'])): ?>
          <h2 class="editor-section"><?= e($row['section']) ?></h2>
        <?php elseif (!empty($row['section_note'])): ?>
          <p class="editor-note"><?= $row['section_note'] /* trusted */ ?></p>
        <?php else:
          $key = $row['key']; $type = $row['type']; $val = get_by_path($data, $key, '');
        ?>
          <label class="editor-field">
            <span class="editor-label"><?= e($row['label']) ?> <code><?= e($key) ?></code></span>
            <?php if ($type === 'text'): ?>
              <input type="text" name="f[<?= e($key) ?>]" value="<?= e($val) ?>">
            <?php elseif ($type === 'textarea'): ?>
              <textarea name="f[<?= e($key) ?>]" rows="4"><?= e($val) ?></textarea>
            <?php elseif ($type === 'html'): ?>
              <textarea name="f[<?= e($key) ?>]" rows="3" class="mono"><?= e($val) ?></textarea>
            <?php elseif ($type === 'image'): ?>
              <div class="img-row">
                <?php if ($val): ?>
                  <img class="img-preview" src="../<?= e($val) ?>" alt="">
                <?php endif; ?>
                <div class="img-controls">
                  <input type="file" name="img[<?= e($key) ?>]" accept="image/*">
                  <input type="text" name="imgurl[<?= e($key) ?>]" placeholder="Or paste image path e.g. assets/images/x.webp" value="<?= e($val) ?>">
                </div>
              </div>
            <?php endif; ?>
          </label>
        <?php endif; ?>
      <?php endforeach; ?>
      <div class="editor-save">
        <button type="submit" class="btn-primary">Save changes</button>
        <a href="index.php" class="btn-ghost">Cancel</a>
      </div>
    </form>
  </main>
</body>
</html>
