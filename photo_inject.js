(function() {

var PHOTO_BUTTON_CONTAINER_RIGHT_SIDE_SELECTOR = '.WH1rbd.c-wa-Da';

var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

var plusId;
(function() {
  chrome.extension.sendRequest({type: 'getId'}, function(response) {
    plusId = response.id;
  });
})();

function getPhotoId() {
  var url = window.location.toString();
  var property = url.split('photos/')[1].split('/')[0];
  if (property == 'fromphone' || property == plusId) {
    return url.split('/').reverse()[0];
  }
}

function addButton() {
  var container = document.querySelector(".photo-container");
  if (!container) {
    // Retry religiously
    window.setTimeout(addButton, 100);
    return
  }

  var photoId = getPhotoId();
  console.log(photoId);
  if (!photoId) {
    return;
  }

  var buttonArea = document.querySelector(PHOTO_BUTTON_CONTAINER_RIGHT_SIDE_SELECTOR);
  var button1 = buttonArea.childNodes[0];
  var newButton = button1.cloneNode(true);
  newButton.id = "ds-send-photo";
  newButton.querySelector("span").innerText = "Send to Do Share";
  newButton.onclick = function() {
    chrome.extension.sendRequest({type: 'newPost', image_id: photoId});
  };
  buttonArea.insertBefore(newButton, button1);
}

var observer = new MutationObserver(function(mutations) {
  if (mutations.length == 1) {
    var added = mutations[0].addedNodes;
    if (added.length == 1) {
      var menuitems = added[0].querySelectorAll('div[role="menuitem"]');
      for (var key in menuitems) {
        var node = menuitems[key];
        if (node.nodeType == Node.ELEMENT_NODE && node.innerText === "Report photo") {
          window.setTimeout(addButton, 100);
        }
      }
    }
  }
});

observer.observe(document.body, {
    childList: true
});

})();
