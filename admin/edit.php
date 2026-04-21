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
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.snow.css" />
<style>
/* Override Quill's default fonts to match admin typography */
.ql-container.ql-snow, .ql-editor { font-family: "Inter", -apple-system, sans-serif; font-size: 0.98rem; line-height: 1.55; }
.ql-editor { min-height: 80px; background: var(--paper); border-radius: 0 0 8px 8px; }
.ql-editor.single-line { min-height: 54px; padding: 0.9rem 1rem; }
.ql-editor.single-line p { margin: 0; }
.ql-toolbar.ql-snow { background: var(--warm); border: 1px solid var(--line); border-bottom: none; border-radius: 8px 8px 0 0; }
.ql-container.ql-snow { border: 1px solid var(--line); border-top: none; border-radius: 0 0 8px 8px; }
.ql-editor .accent { color: var(--gold-deep); font-style: italic; font-weight: 300; }
.ql-toolbar button.ql-accent { width: auto; padding: 0 0.55rem !important; font-size: 0.8rem; font-family: "Georgia", serif; font-style: italic; color: var(--gold-deep); }
.ql-toolbar button.ql-accent:hover { color: var(--ink); }
.ql-toolbar button.ql-accent.ql-active { background: var(--gold); color: var(--ink); border-radius: 4px; }
.rich-single .ql-toolbar { padding: 0.35rem 0.5rem !important; }

/* Upload picker modal */
.picker {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: none; place-items: center; z-index: 1000;
  padding: 1rem;
}
.picker.open { display: grid; }
.picker-inner {
  background: var(--paper); border-radius: 14px;
  max-width: 900px; width: 100%; max-height: 80vh;
  display: flex; flex-direction: column;
  overflow: hidden;
}
.picker-head { padding: 1rem 1.4rem; border-bottom: 1px solid var(--line); display: flex; justify-content: space-between; align-items: center; }
.picker-body { padding: 1rem; overflow-y: auto; }
.picker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 0.7rem; }
.picker-tile {
  cursor: pointer;
  border: 1px solid var(--line);
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  transition: border-color 0.2s, transform 0.2s;
}
.picker-tile:hover { border-color: var(--gold); transform: translateY(-2px); }
.picker-tile img { width: 100%; height: 100%; object-fit: cover; display: block; }
.picker-close { cursor: pointer; width: 32px; height: 32px; border-radius: 50%; border: 1px solid var(--line); background: transparent; display: grid; place-items: center; }
.img-controls .pick-btn { font-size: 0.78rem; padding: 0.35rem 0.7rem; }
</style>
</head>
<body>
  <?php include 'partials/header.php'; ?>
  <main class="admin-main">
    <div class="admin-hero">
      <p class="eyebrow">Editing</p>
      <h1><?= e($label) ?></h1>
      <p class="muted">Highlight a word in a title and press <em>Accent</em> to paint it in italic gold. Everything saves instantly to JSON and shows on the live page on next refresh.</p>
      <p><a class="btn-ghost" target="_blank" href="../<?= e($slug) ?>.html">Preview live page ↗</a></p>
    </div>
    <?php if ($saved): ?><div class="alert alert-ok">Saved. Refresh the live page to see the changes.</div><?php endif; ?>
    <?php if ($error): ?><div class="alert alert-err"><?= e($error) ?></div><?php endif; ?>
    <form method="post" enctype="multipart/form-data" class="editor-form" id="editor-form">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
      <?php foreach ($schema as $row): ?>
        <?php if (!empty($row['section'])): ?>
          <h2 class="editor-section"><?= e($row['section']) ?></h2>
        <?php elseif (!empty($row['section_note'])): ?>
          <p class="editor-note"><?= $row['section_note'] /* trusted */ ?></p>
        <?php else:
          $key = $row['key']; $type = $row['type']; $val = get_by_path($data, $key, '');
          $id  = 'f_' . preg_replace('/[^a-z0-9]/i', '_', $key);
        ?>
          <div class="editor-field">
            <div class="editor-label"><?= e($row['label']) ?> <code><?= e($key) ?></code></div>
            <?php if ($type === 'text'): ?>
              <input type="text" name="f[<?= e($key) ?>]" value="<?= e($val) ?>">
            <?php elseif ($type === 'textarea'): ?>
              <textarea name="f[<?= e($key) ?>]" rows="4"><?= e($val) ?></textarea>
            <?php elseif ($type === 'html'):
              // Detect whether this is a long-form body field vs a short title.
              // Long-form fields: key ends with "body"; others are single-line titles.
              $isBody = preg_match('/\.body$/', $key) || preg_match('/\.description$/', $key);
            ?>
              <div class="rich-wrap <?= $isBody ? 'rich-body' : 'rich-single' ?>"
                   data-rich
                   data-single="<?= $isBody ? '0' : '1' ?>"
                   data-target="<?= e($id) ?>"></div>
              <textarea name="f[<?= e($key) ?>]" id="<?= e($id) ?>" hidden><?= e($val) ?></textarea>
            <?php elseif ($type === 'image'): ?>
              <div class="img-row">
                <img class="img-preview" src="<?= $val ? '../'.e($val) : '' ?>" alt="" data-img-preview="<?= e($key) ?>" style="<?= $val ? '' : 'visibility:hidden' ?>">
                <div class="img-controls">
                  <input type="file" name="img[<?= e($key) ?>]" accept="image/*" data-img-file="<?= e($key) ?>">
                  <input type="text" name="imgurl[<?= e($key) ?>]" placeholder="assets/images/x.webp — or paste a path" value="<?= e($val) ?>" data-img-url="<?= e($key) ?>">
                  <button type="button" class="btn-ghost pick-btn" data-pick-from-library="<?= e($key) ?>">Pick from library</button>
                </div>
              </div>
            <?php endif; ?>
          </div>
        <?php endif; ?>
      <?php endforeach; ?>
      <div class="editor-save">
        <button type="submit" class="btn-primary">Save changes</button>
        <a href="index.php" class="btn-ghost">Cancel</a>
      </div>
    </form>
  </main>

  <!-- Image picker modal -->
  <div class="picker" data-picker aria-hidden="true">
    <div class="picker-inner">
      <header class="picker-head">
        <div><strong>Pick an image</strong><div class="muted" style="font-size:0.8rem">Click any tile to use it. New files show up here after uploading via the Uploads page.</div></div>
        <button type="button" class="picker-close" data-picker-close aria-label="Close">×</button>
      </header>
      <div class="picker-body">
        <div class="picker-grid" data-picker-grid>Loading…</div>
      </div>
    </div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/quill@2.0.2/dist/quill.js"></script>
  <script src="editor.js?v=7307365"></script>
</body>
</html>
