let net;
async function load(){
    console.log('Loading mobilenet..');
    // Load the model.
    net = await mobilenet.load();
    console.log('Successfully loaded model');

}


function uploadImg(input) {
      console.log('uploadImg');
      if (input.files && input.files[0]) {
           var reader = new FileReader();

           reader.onload = function (e) {
               var img = document.getElementById('img');
               console.log('Loading Image');
               img.src = e.target.result;
               img.width = 224;
               img.height = 224;
               app().catch(function(error) {
                   console.log('%cFailed to classify image', 'color:red')
                   console.log(error)
               });
           };

           reader.readAsDataURL(input.files[0]);
       }
}

async function uploadFolder(input){
      console.log('uploadFolder');
      console.log(input.files);
      const startTime = Date.now();
      if (input.files && input.files[0]) {

          for(let i=0; i<input.files.length; i++){
            console.log('image ' + i)
            var reader = new FileReader();
            reader.onload = function (e) {
                // var img = input.files[i];
                var img = document.createElement("img");
                img.src = e.target.result;
                img.width = 224;
                img.height = 224;
                img.id = "img" + i;
                document.getElementById('batch_test').appendChild(img);
                appFolder(img.id).catch(function(error) {
                    console.log('%cFailed to classify image', 'color:red')
                    console.log(error)
                });
            };
            // console.log(input.files[i]);
            await reader.readAsDataURL(input.files[i]);
          }
      }
      console.log("Batch test time: " + input.files.length + " images done in " + (Date.now() - startTime) + " ms");
}

async function appFolder(id){
    const startTime = Date.now();
    console.log('Folder upload');
    const img = await document.getElementById(id);
    const result = await net.classify(img);
    console.log(result);
    console.log("Time taken for image " + id + ": " + (Date.now() - startTime));
}

async function app() {
  // Make a prediction through the model on our image.
  const startTime = Date.now();
  console.log('Image uploaded successfully')
  const imgEl =  await document.getElementById('img'); //grab image from uploaded image selected
  const result = await net.classify(imgEl)
  console.log(imgEl);
  var caption = document.getElementById('img_caption');
  caption.innerHTML = result[0].className;
  console.log(result);
  console.log("Time taken to classify: " + (Date.now() - startTime));
}

window.onload = function() {
    load()
    // document.getElementById("predict-button").onclick = app;//when the predict button is clicked call function app()
}