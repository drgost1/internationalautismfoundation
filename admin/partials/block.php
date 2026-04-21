<?php /** Expects: $idx, $b */ ?>
<div class="block-item" data-block data-idx="<?= e($idx) ?>">
  <div class="block-head">
    <span class="block-handle" title="Drag to reorder">⋮⋮</span>
    <strong class="block-title-display">New section</strong>
    <div class="block-tools">
      <button type="button" class="btn-ghost btn-sm" data-block-up title="Move up">↑</button>
      <button type="button" class="btn-ghost btn-sm" data-block-down title="Move down">↓</button>
      <button type="button" class="btn-ghost btn-sm btn-danger" data-block-delete title="Delete">×</button>
    </div>
  </div>
  <div class="block-body">
    <div class="block-field">
      <label>Layout</label>
      <select name="blocks[<?= e($idx) ?>][layout]">
        <option value="text-left"  <?= ($b['layout'] ?? '') === 'text-left'  ? 'selected' : '' ?>>Image left, text right</option>
        <option value="text-right" <?= ($b['layout'] ?? '') === 'text-right' ? 'selected' : '' ?>>Text left, image right</option>
        <option value="text-only"  <?= ($b['layout'] ?? '') === 'text-only'  ? 'selected' : '' ?>>Text only (no image)</option>
      </select>
    </div>
    <div class="block-field">
      <label>Eyebrow <span class="muted-small">(small label above the title)</span></label>
      <input type="text" name="blocks[<?= e($idx) ?>][eyebrow]" value="<?= e($b['eyebrow'] ?? '') ?>" placeholder="§ V — New section">
    </div>
    <div class="block-field">
      <label>Title <span class="muted-small">(use the Accent button for italic-gold)</span></label>
      <?php $tid = 'bt_' . $idx; ?>
      <div class="rich-wrap rich-single" data-rich data-single="1" data-target="<?= e($tid) ?>"></div>
      <textarea name="blocks[<?= e($idx) ?>][title]" id="<?= e($tid) ?>" hidden><?= e($b['title'] ?? '') ?></textarea>
    </div>
    <div class="block-field">
      <label>Body <span class="muted-small">(paragraphs, lists, links)</span></label>
      <?php $bid = 'bb_' . $idx; ?>
      <div class="rich-wrap rich-body" data-rich data-single="0" data-target="<?= e($bid) ?>"></div>
      <textarea name="blocks[<?= e($idx) ?>][body]" id="<?= e($bid) ?>" hidden><?= e($b['body'] ?? '') ?></textarea>
    </div>
    <div class="block-field block-image-field">
      <label>Image <span class="muted-small">(optional — hidden automatically in Text-only layout)</span></label>
      <div class="img-row">
        <img class="img-preview" src="<?= !empty($b['image']) ? '../'.e($b['image']) : '' ?>" alt="" data-img-preview="blocks.<?= e($idx) ?>.image" style="<?= !empty($b['image']) ? '' : 'visibility:hidden' ?>">
        <div class="img-controls">
          <input type="text" name="blocks[<?= e($idx) ?>][image]" value="<?= e($b['image'] ?? '') ?>" placeholder="assets/images/x.webp — or pick from library" data-img-url="blocks.<?= e($idx) ?>.image">
          <button type="button" class="btn-ghost pick-btn" data-pick-from-library="blocks.<?= e($idx) ?>.image">Pick from library</button>
        </div>
      </div>
    </div>
  </div>
</div>
