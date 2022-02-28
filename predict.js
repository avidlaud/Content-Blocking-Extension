let net;
async function load(){
    console.log('Loading mobilenet..');
    // Load the model.
    net = await mobilenet.load();
    console.log('Successfully loaded model');

}


function uploadImg(input) {
       if (input.files && input.files[0]) {
           var reader = new FileReader();

           reader.onload = function (e) {
               var img = document.getElementById('img');
               img.src = e.target.result;
               img.width = 224;
               img.heigh = 224;
           };

           reader.readAsDataURL(input.files[0]);
       }

           app().catch(function(error) {
               console.log('%cFailed to classify image', 'color:red')
               console.log(error)
           });


   }

async function app() {
  // Make a prediction through the model on our image.
  console.log('Image uploaded successfully')
  const imgEl = document.getElementById('img'); //grab image from uploaded image selected
  const result = await net.classify(imgEl);
  console.log(result);
}

window.onload = function() {
    load()
    // document.getElementById("predict-button").onclick = app;//when the predict button is clicked call function app()
}
