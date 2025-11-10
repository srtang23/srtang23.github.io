'use strict';

document.addEventListener('DOMContentLoaded', function() {
  // Apply syntax highlighting to all code blocks on the page
  applySyntaxHighlighting();

  const currentPage = window.location.pathname.split('/').pop();
  const pageNumber = currentPage.match(/a(\d+)/);

  if (pageNumber) {
    const assignmentNumber = pageNumber[1];
    const codeFileName = getCodeFileName(assignmentNumber);
    loadCodeFile(codeFileName);
  }
});

/**
 * Get the code file name based on assignment number
 * @param {string} assignmentNumber - The assignment number
 * @returns {string} The file path to the .ino file
 */
function getCodeFileName(assignmentNumber) {
  const fileMap = {
    '1': 'arduino/a1_blink.ino',
    '2': 'arduino/a2_fade.ino',
    '3': 'arduino/a3_input_output/a3_input_output.ino',
    '4': 'arduino/a4_libraries/a4_libraries.ino',
    '5': 'arduino/a5_higher_voltage_and_transistors/a5_higher_voltage_and_transistors.ino'
  };

  return fileMap[assignmentNumber] || `arduino/a${assignmentNumber}_blink.ino`;
}

/**
 * Load code file and display it
 * @param {string} codeFileName - Path to the code file
 */
function loadCodeFile(codeFileName) {
  fetch(codeFileName)
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.text();
    })
    .then(text => {
      const codeBlock = document.getElementById('code-block');
      if (codeBlock) {
        codeBlock.textContent = text;
        applySyntaxHighlighting();
      }
    })
    .catch(error => {
      const codeBlock = document.getElementById('code-block');
      if (codeBlock) {
        codeBlock.textContent = 'Error loading code file: ' + error.message;
      }
      console.error('Error loading code:', error);
    });
}

/**
 * Apply syntax highlighting to all code blocks
 */
function applySyntaxHighlighting() {
  const codeBlocks = document.querySelectorAll('pre code');
  codeBlocks.forEach(function(block) {
    let html = block.innerHTML;

    // comments starting with //
    html = html.replace(/^(\s*\/\/.*)$/gm, '<span class="comment">$1</span>');

    // inline comments after code
    html = html.replace(/(\/\/.*)$/gm, '<span class="comment">$1</span>');

    block.innerHTML = html;
  });
}