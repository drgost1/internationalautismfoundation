<?php
// Schema: defines the fields each page exposes in the admin UI.
// Each field: ['key' => 'dot.path', 'label' => 'Label', 'type' => 'text|textarea|image|html', 'help' => '']
// Every page automatically gets a "blocks" repeater at the bottom so
// the owner can add unlimited new sections beneath the fixed schema.
return [

  'publications' => [
    ['section' => 'Page hero'],
    ['key' => 'hero.eyebrow',   'label' => 'Eyebrow',   'type' => 'text'],
    ['key' => 'hero.title',     'label' => 'Title (HTML allowed)', 'type' => 'html'],
    ['key' => 'hero.subtitle',  'label' => 'Subtitle',  'type' => 'textarea'],

    ['section' => 'I · The Daily Black & White'],
    ['key' => 'daily_bw.eyebrow',      'label' => 'Eyebrow',        'type' => 'text'],
    ['key' => 'daily_bw.title',        'label' => 'Title (HTML)',   'type' => 'html'],
    ['key' => 'daily_bw.description',  'label' => 'Description',    'type' => 'textarea'],
    ['key' => 'daily_bw.type',         'label' => 'Type',           'type' => 'text'],
    ['key' => 'daily_bw.readership',   'label' => 'Readership',     'type' => 'text'],
    ['key' => 'daily_bw.purpose',      'label' => 'Purpose',        'type' => 'text'],
    ['key' => 'daily_bw.image',        'label' => 'Cover image',    'type' => 'image'],

    ['section' => 'II · The Daily Human Rights'],
    ['key' => 'daily_hr.eyebrow',      'label' => 'Eyebrow',        'type' => 'text'],
    ['key' => 'daily_hr.title',        'label' => 'Title (HTML)',   'type' => 'html'],
    ['key' => 'daily_hr.title_bn',     'label' => 'Bangla title',   'type' => 'text'],
    ['key' => 'daily_hr.description',  'label' => 'Description',    'type' => 'textarea'],
    ['key' => 'daily_hr.languages',    'label' => 'Languages',      'type' => 'text'],
    ['key' => 'daily_hr.focus',        'label' => 'Focus',          'type' => 'text'],
    ['key' => 'daily_hr.circulation',  'label' => 'Circulation',    'type' => 'text'],
    ['key' => 'daily_hr.image',        'label' => 'Cover image',    'type' => 'image'],

    ['section' => 'III · IAF Journal'],
    ['key' => 'journal.eyebrow',      'label' => 'Eyebrow',           'type' => 'text'],
    ['key' => 'journal.title',        'label' => 'Title (HTML)',      'type' => 'html'],
    ['key' => 'journal.description',  'label' => 'Description',       'type' => 'textarea'],
    ['key' => 'journal.founded',      'label' => 'Founded year',      'type' => 'text'],
    ['key' => 'journal.access',       'label' => 'Access',            'type' => 'text'],
    ['key' => 'journal.editor',       'label' => 'Editor',            'type' => 'text'],
    ['key' => 'journal.frequency',    'label' => 'Frequency',         'type' => 'text'],
    ['key' => 'journal.note',         'label' => 'Helper note',       'type' => 'textarea'],
    ['section_note' => 'The PDF is served from <code>assets/pdf/iaf-journal.pdf</code>. To replace it, upload a new PDF with the same filename via SFTP or the Uploads page.'],

    ['section' => 'IV · Black & White Musical Band'],
    ['key' => 'band.eyebrow',      'label' => 'Eyebrow',             'type' => 'text'],
    ['key' => 'band.title',        'label' => 'Title (HTML)',        'type' => 'html'],
    ['key' => 'band.description',  'label' => 'Description',         'type' => 'textarea'],
    ['key' => 'band.quote',        'label' => 'Pull-quote',          'type' => 'textarea'],
    ['key' => 'band.established',  'label' => 'Established',         'type' => 'text'],
    ['key' => 'band.for',          'label' => 'For (audience)',      'type' => 'text'],
    ['key' => 'band.image',        'label' => 'Band photograph',     'type' => 'image'],
  ],

  'autism' => [
    ['section' => 'Page hero'],
    ['key' => 'hero.eyebrow',  'label' => 'Eyebrow',   'type' => 'text'],
    ['key' => 'hero.title',    'label' => 'Title (HTML)', 'type' => 'html'],
    ['key' => 'hero.subtitle', 'label' => 'Subtitle',  'type' => 'textarea'],

    ['section' => '§ 01 — What is autism?'],
    ['key' => 'define.eyebrow', 'label' => 'Eyebrow', 'type' => 'text'],
    ['key' => 'define.title',   'label' => 'Title (HTML)', 'type' => 'html'],
    ['key' => 'define.body',    'label' => 'Body (HTML — use <p> tags)', 'type' => 'html'],

    ['section' => '§ 02 — Signs & traits'],
    ['key' => 'signs.eyebrow', 'label' => 'Eyebrow', 'type' => 'text'],
    ['key' => 'signs.title',   'label' => 'Title (HTML)', 'type' => 'html'],
    ['key' => 'signs.note',    'label' => 'Closing note', 'type' => 'textarea'],

    ['section' => '§ 03 — What we know (stats)'],
    ['key' => 'stats.eyebrow', 'label' => 'Eyebrow', 'type' => 'text'],
    ['key' => 'stats.title',   'label' => 'Title (HTML)', 'type' => 'html'],
    ['key' => 'stats.source',  'label' => 'Sources line', 'type' => 'textarea'],

    ['section' => '§ 04 — Walking alongside'],
    ['key' => 'help.eyebrow', 'label' => 'Eyebrow', 'type' => 'text'],
    ['key' => 'help.title',   'label' => 'Title (HTML)', 'type' => 'html'],

    ['section' => '§ 05 — Next steps'],
    ['key' => 'resources.eyebrow', 'label' => 'Eyebrow', 'type' => 'text'],
    ['key' => 'resources.title',   'label' => 'Title (HTML)', 'type' => 'html'],

    ['section' => 'Final CTA'],
    ['key' => 'cta.title',    'label' => 'Title (HTML)', 'type' => 'html'],
    ['key' => 'cta.subtitle', 'label' => 'Subtitle', 'type' => 'textarea'],
  ],

];
