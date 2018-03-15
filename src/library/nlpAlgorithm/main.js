module.exports = function (menu, input) {
    // normalize
    input = input.replace(/[&\/\\#,+()$~%.'":*?!<>{}]/g, '');
    input = input.replace('-', ' ');
    input = input.toLowerCase();
    input = ' ' + input + ' ';

    // keywords
    let KeywordsFilter = require('./src/keywordFilter');
    let keywordsFilter = new KeywordsFilter(menu, input);

    let keywordsObj = {
        name: [],
        nb: [],
        size: [],
        conj: []
    };
    keywordsObj.name = keywordsFilter.searchName();
    keywordsObj.nb = keywordsFilter.searchNb();
    keywordsObj.size = keywordsFilter.searchSize();
    keywordsObj.conj = keywordsFilter.searchConj();

    // split products
    let Splitting = require('./src/splitting');
    let splitting = new Splitting(menu, keywordsObj);
    let orderBlocks = splitting.splitKeywords();

    // name operations
    let NameOperations = require('./src/nameOperations');
    let nameOperations = new NameOperations(menu);

    for (let x = 0; x < orderBlocks.length; x++) {
        // create name blocks
        let nameBlocks = nameOperations.createNameBlocks(orderBlocks[x].items);

        // --- single nameBlock per orderBlock
        // get default product by nameBlock

        if (nameBlocks.length === 1) {
            orderBlocks[x].product = nameOperations.getProductByDefault(nameBlocks[0]);
        }

        // --- multiple nameBlocks per orderBlock
        // match multiple nameBlocks
        if (nameBlocks.length > 1) {
            orderBlocks[x].product = nameOperations.getProductByComparison(nameBlocks);
            if (!orderBlocks[x].product) {
                // ÜBERARBEITEN
                console.log('could not understand you!');
            }
        }
    }

    // create final order by orderBlock
    // or create response
    let FinalOrder = require('./src/finalOrder');
    let finalOrder = new FinalOrder(menu, orderBlocks);

    let order = finalOrder.createOrder();

    return order;
};
