exports.main = function (menu, input) {
    var inputChange = input.replace(/[&\/\\#,+()$~%.'":*?<>{}!]/g,'');
    inputChange = inputChange.toLowerCase();
    var inputArray = inputChange.split(" ");
    var order = [];


    for(var x = 0; x<inputArray.length; x++) {
        for(var y = 0; y<menu.length; y++) {
            if(inputArray[x] === menu[y].toLowerCase()) {
                order.push(inputArray[x]);
            }
        }
    }

    return order;
};