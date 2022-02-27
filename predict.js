//On click of predict button, perform preprocessing of imager and return results
$("#predict-button").click(async_function () {
    let image = $("#selected-image").get(0);
    let tensor = preprocessImage(image);

    let predictions = await model.predict(tensor).data();
    let top5 = Array.from(predictions).map(function (p,i) {
        return{
            probability: p,
            className: IMAGENET_CLASSES[i]
        };
    }).sort(function (a,b) {
        return b.probability - a.probability;
    }).slice(0,5);
    $("prediction_list").empty();
    top5.forEach(function (p) {
        $("#prediction_list").append(`<li>${p.className}: ${p.probability.toFixed(6)}</li>`)
    })
});
