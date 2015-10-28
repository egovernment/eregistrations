<!--
<head> element contents, affect all public pages.
Important notes:
- Do not set <title> here, it's decided in view configuration: /public/view/index.js
- Do not add here extra CSS files, they should be listed in /public/client/css.index list
  After that they're automatically concanated into /public.css
- External JS libs (provided via scripts) may be added here, or at the end of body.html.
  If JS lib you want to add is provided in a CJS module format, then instead just require it in
  /public/legacy.js
-->

<!-- Below line assures that SPA style rendering takes over in modern browsers -->
${ spaTakeOver }

<link href="${ stRoot }public.css" rel="stylesheet" />

<!-- Script needed for login/register modals to work properly. Additionally assures some hacks for
IE8 so HTML5 elements and custom fonts render properly -->
<script src="${ stRoot }public.legacy.js"></script>
