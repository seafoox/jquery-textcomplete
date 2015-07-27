+function ($) {
  'use strict';


  // Adapter for contenteditable elements that 
  // allow insertion of html elements
  // 
  function HTMLContentEditable (element, completer, option) {
    this.initialize(element, completer, option);

    if ((typeof Range !== "undefined") && !Range.prototype.createContextualFragment)
    {
      Range.prototype.createContextualFragment = function(html)
      {
        var frag = document.createDocumentFragment(), 
        div = document.createElement("div");
        frag.appendChild(div);
        div.outerHTML = html;
        return frag;
      };
    }
  }

  $.extend(HTMLContentEditable.prototype, $.fn.textcomplete.ContentEditable.prototype, {
    // Public methods
    // --------------

    // Update the content with the given HTML value and strategy.
    // When an dropdown item is selected, it is executed.
    select: function (value, strategy, e) {
      var pre = this.getTextFromHeadToCaret();
      var sel = window.getSelection()
      var range = sel.getRangeAt(0);
      var selection = range.cloneRange();
      selection.selectNodeContents(range.startContainer);
      var content = selection.toString();
      var post = content.substring(range.startOffset);
      var newSubstr = strategy.replace(value, e);
      if ($.isArray(newSubstr)) {
        post = newSubstr[1] + post;
        newSubstr = newSubstr[0];
      }
      
      var matching = strategy.match.exec(content);
      var initialText = matching.length && matching[0];
      initialText = $.trim(initialText);

      pre = pre.replace(initialText, newSubstr);

      range.selectNodeContents(range.startContainer);
      range.deleteContents();

      var dummy = document.createElement('span');
      dummy.innerHTML = '&nbsp;';
      range.insertNode(dummy);

      var fullText = pre + post;
      var elIdx = fullText.indexOf(newSubstr);

      // insertNode places nodes at the beginning of the range,
      // so insert everything after the new node first
      var postElTextNode = document.createTextNode(fullText.substr(elIdx + fullText.length + 1));
      range.insertNode(postElTextNode);

      // insert the new node
      var node = range.createContextualFragment(newSubstr);
      range.insertNode(node);

      // insert everything before the new node
      var preElTextNode = document.createTextNode(fullText.substr(0, elIdx));
      range.insertNode(preElTextNode);

      range.setStartAfter(dummy);
      range.collapse(true);

      sel.removeAllRanges();
      sel.addRange(range);
    }

  });

  $.fn.textcomplete.HTMLContentEditable = HTMLContentEditable;
}(jQuery);
