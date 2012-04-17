(function(){

/**
 * Injection code inspired by https://github.com/mohamedmansour/extended-share-extension
 */

var CONTENT_PANE_ID = '#contentPane';
var STREAM_UPDATE_SELECTOR = 'div[id^="update"]:not([tz_doshare])';

var BUTTON_CLASSNAME = 'HPvmqf';
var SPAN_CLASSNAME = 'jEMdk';

function onNodeInserted(e) {
  // This happens when a new stream is selected
  if (e.target && e.target.id && e.target.id.indexOf('update') == 0) {
    processPost(e.target);
  } else if (e.relatedNode && e.relatedNode.parentNode && e.relatedNode.parentNode.id == 'contentPane') {
    // We're only interested in the insertion of entire content pane
    processAllItems();
  }
};

/**
 * Process
 */
function processAllItems(subtreeDOM) {
  var posts = document.querySelectorAll(STREAM_UPDATE_SELECTOR);
  for (var i = 0; i < posts.length; i++) {
    processPost(posts[i]);
  }
}

function processPost(itemDOM) {
  if (itemDOM) {
    addButtonToPost(itemDOM);
  }
}

function addButtonToPost(itemDOM) {
  itemDOM.setAttribute('tz_doshare', true);
  var plusOne = itemDOM.querySelector('[g\\:entity]');
  if (!plusOne) {
    console.error('!plusone');
    return;
  }
  var shareNode = document.createElement('div');
  var innerSpan = document.createElement('span');

  innerSpan.className = SPAN_CLASSNAME;
  shareNode.appendChild(innerSpan);
  innerSpan.innerText = 'DS';

  shareNode.className = BUTTON_CLASSNAME;
  shareNode.onclick = function(){
    var url = itemDOM.querySelector('[target=_blank]').href;
    if (url) {
      console.log(url);
      sendReshare(url);
    }
  };

  var parent = plusOne.parentElement;
  var allButtons = parent.querySelectorAll('.' + BUTTON_CLASSNAME);
  plusOne.parentNode.insertBefore(shareNode, allButtons[allButtons.length - 1]);
}

function sendReshare(url) {
  chrome.extension.sendRequest({'type': 'resharePost', 'url': url}, function(){});
}

document.addEventListener("DOMContentLoaded", function() {
  // Listen when the subtree is modified for new posts.
  var googlePlusContentPane = document.querySelector(CONTENT_PANE_ID);
  if (googlePlusContentPane) {
    googlePlusContentPane.parentElement.addEventListener('DOMNodeInserted', onNodeInserted);
    processAllItems();
  }
});
})();
