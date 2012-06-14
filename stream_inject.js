(function(){

/**
 * Injection code inspired by https://github.com/mohamedmansour/extended-share-extension
 */

var CONTENT_PANE_ID = '#contentPane';
var STREAM_UPDATE_SELECTOR = 'div[id^="update"]:not([tz_doshare])';

var BUTTON_CLASSNAME = 'Tj';
var BUTTONS_SELECTOR = 'div.esw, div.' + BUTTON_CLASSNAME;
var SPAN_CLASSNAME = 'iq';

var SHARE_BUTTON_CLASSNAME = 'c-b-fa';
var FADED_SHARE_BUTTON_CLASSNAME = 'c-b-D';
var EDIT_BUTTON_CLASSNAME = 'c-b-J';

function onNodeInserted(e) {
  // This happens when a new stream is selected
  if (e.target && e.target.id && e.target.id.indexOf('update') == 0) {
    processPost(e.target);
  } else if (e.relatedNode && e.relatedNode.parentNode && e.relatedNode.parentNode.id == 'contentPane') {
    processAllItems();
  }
  addDoShareButtonOnInsertion(e);
};

function onNotificationNodeInserted(e) {
  var update = e.target && e.target.querySelector && e.target.querySelector(STREAM_UPDATE_SELECTOR);
  if (update) {
    processPost(update);
  }
  addDoShareButtonOnInsertion(e);
}

function addDoShareButtonOnInsertion(e) {
  var ATTRIBUTE = 'ds_added';
  var shareButton = e.relatedNode && e.relatedNode.querySelector &&
      e.relatedNode.querySelector('.' + SHARE_BUTTON_CLASSNAME + '[guidedhelpid=sharebutton]');
  if (shareButton && !shareButton.getAttribute(ATTRIBUTE)) {
    shareButton.setAttribute(ATTRIBUTE, '1');
    var clone = shareButton.cloneNode(true);
    clone.className = clone.className.replace(FADED_SHARE_BUTTON_CLASSNAME, '');
    clone.onclick = function() {
      sendToDoShare(shareButton);
    }
    clone.innerHTML = 'Send to Do Share';
    shareButton.parentElement.appendChild(clone);

    // Workaround for Edit button
    window.setTimeout(function() {
      if (shareButton.className.match(EDIT_BUTTON_CLASSNAME)) {
        shareButton.parentElement.removeChild(clone);
      }
    }, 10);
  }
}

function getShareBox(shareButton) {
  var c = shareButton;
  while (c.parentElement) {
    var sharebox = c.querySelector('[contenteditable]');
    if (sharebox) {
      return sharebox;
    }
    c = c.parentElement;
  }
}

function sendToDoShare(shareButton) {
  var sharebox = getShareBox(shareButton);
  if (!sharebox) {
    return;
  }
  var source = (document.location.toString().match('notifications/frame')) ? 'notificationShareBox' : 'gplusShareBox';
  chrome.extension.sendRequest({type: 'newPost', content: sharebox.innerText, source: source}, function(){});
}

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

  var img = document.createElement('img');
  img.src = chrome.extension.getURL('img/stream_icon.png');
  innerSpan.appendChild(img);
  shareNode.appendChild(innerSpan);

  shareNode.className = BUTTON_CLASSNAME;
  shareNode.onclick = function(){
    var url = itemDOM.querySelector('[target=_blank]').href;
    if (url) {
      sendReshare(url);
    }
  };

  shareNode.setAttribute('data-tooltip', 'Send to Do Share');

  var allButtons = itemDOM.querySelectorAll(BUTTONS_SELECTOR);
  if (allButtons.length == 0) {
    console.error(itemDOM);
    return;
  }
  var lastButton = allButtons[allButtons.length - 1];
  plusOne.parentNode.insertBefore(shareNode, lastButton.nextSibling);
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
  } else if (document.location.toString().match('notifications/frame')) {
    var notificationsContainer = document.querySelector('.jRa');
    if (notificationsContainer) {
      notificationsContainer.addEventListener('DOMNodeInserted', onNotificationNodeInserted);
    }
  }
});
})();
