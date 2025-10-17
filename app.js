'use strict';

document.addEventListener('DOMContentLoaded', function() {
  const codeBlocks = document.querySelectorAll('pre code');
  codeBlocks.forEach(function(block) {
    let html = block.innerHTML;

    // comments starting with //
    html = html.replace(/^(\s*\/\/.*)$/gm, '<span class="comment">$1</span>');

    // inline comments after cod
    html = html.replace(/(\/\/.*)$/gm, '<span class="comment">$1</span>');

    block.innerHTML = html;
  });
});
