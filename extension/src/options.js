function save_options() {
    var color = document.getElementById('color').value;
    var likesColor = document.getElementById('like').checked;
    //creating a list of models
    
    
    chrome.storage.sync.set({
      favoriteColor: color,
      likesColor: likesColor
    }, function() {
        document.body.style.background = color;
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  }
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.sync.get({
      favoriteColor: 'red',
      likesColor: true
    }, function(items) {
      document.getElementById('color').value = items.favoriteColor;
      document.getElementById('like').checked = items.likesColor;
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click',
      save_options);
  
  function get_models() {
    //var models = downloadController.listModels;
    /*let list = document.getElementById("listModels");
    models.forEach((item)=>{
      let li = document.createElement("li");
      li.innerText = item;
      list.appendChild(li);
    })*/
  }