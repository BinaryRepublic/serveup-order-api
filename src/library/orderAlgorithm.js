const Helper = require('./helper');

function search (srcStr, searchStr) {
    let result = [];
    let lastIndex = 0;

    let pos = -1;
    let searchSuffix = [
        "", "e", "es", "er", "en", "n"
    ];
    do {
        for (let x = 0; x < searchSuffix.length; x++) {
            let searchVal = searchStr + searchSuffix[x];
            pos = srcStr.indexOf(' ' + searchVal + ' ', lastIndex);
            if (pos !== -1) {
                result.push({
                    pos: pos,
                    val: searchVal
                });
                break;
            }
        }
        lastIndex = pos + 1;
    } while (pos !== -1);
    return result;
}

function searchName (input, drinks, defaultSynonyms, index = [], result = []) {
    function searchForResult (searchStr, menuPos, defaultSynonymsName, result) {
        let searchRes = search(input, searchStr);
        if (searchRes.length) {
            for (let x = 0; x < searchRes.length; x++) {
                let resultObj = {
                    inputPos: searchRes[x].pos,
                    inputVal: searchRes[x].val,
                    name: searchStr
                };
                if (menuPos) {
                    // element from menu
                    resultObj.menuPos = menuPos;
                } else {
                    // defaultSynonym
                    resultObj.defaultSynonymsName = defaultSynonymsName;
                }
                result.push(resultObj);
            }
        }
        return result;
    }
    let defaultSynonymsResults = [];
    if (!index.length) {
        // not recursive!
        // get all defaultSynonyms first
        for (let x = 0; x < defaultSynonyms.length; x++) {
            let currentElem = defaultSynonyms[x];
            for (let y = 0; y < currentElem.synonym.length; y++) {
                let synonym = currentElem.synonym[y];
                defaultSynonymsResults = searchForResult(synonym, false, currentElem.name, defaultSynonymsResults);
            }
        }
    } else {
        // recursive!
        // load defaultSynonymsResult from fct param
        defaultSynonymsResults = defaultSynonyms;
    }

    for (let x = 0; x < drinks.length; x++) {
        let newIndex = index.slice(); // copy by value
        // recursive for getting all childrens
        newIndex.push(x);
        if (drinks[x].child) {
            result = searchName(input, drinks[x].child, defaultSynonymsResults, newIndex, result);
        }
        // search for name
        let drinkName = drinks[x].name;
        result = searchForResult(drinkName, newIndex, false, result);
        if (drinks[x].synonym) {
            for (let y = 0; y < drinks[x].synonym.length; y++) {
                result = searchForResult(drinks[x].synonym[y], newIndex, false, result);
            }
        }
        // search for defaultSynonym <> menu matches
        for (let y = 0; y < defaultSynonymsResults.length; y++) {
            let synonym = defaultSynonymsResults[y];
            if (synonym.defaultSynonymsName === drinkName) {
                result.push({
                    inputPos: synonym.inputPos,
                    inputVal: synonym.inputVal,
                    name: synonym.name,
                    menuPos: index
                });
            }
        }
    }

    // order by inputPos
    result = result.sort((a, b) => {
        return parseInt(a.inputPos) - parseInt(b.inputPos);
    });

    return result;
}
function searchNb (input, nbWords) {
    function searchForResult (searchStr, val, result) {
        let searchRes = search(input, searchStr);
        if (searchRes.length) {
            for (let x = 0; x < searchRes.length; x++) {
                result.push({
                    inputPos: searchRes[x].pos,
                    inputVal: searchRes[x].val,
                    nb: searchStr,
                    val: val
                });
            }
        }
        return result;
    }
    let result = [];
    for (let x = 0; x < nbWords.length; x++) {
        result = searchForResult(nbWords[x].val, nbWords[x].val, result);
        for (let y = 0; y < nbWords[x].synonym.length; y++) {
            result = searchForResult(nbWords[x].synonym[y], nbWords[x].val, result);
        }
    }
    return result;
}
function searchSize (input, sizeObj) {
    function searchByObjKey (objKey, result) {
        function searchForResult (searchStr, sizeVal, result) {
            let searchRes = search(input, searchStr);
            if (searchRes.length) {
                for (let x = 0; x < searchRes.length; x++) {
                    result.push({
                        inputPos: searchRes[x].pos,
                        inputVal: searchRes[x].val,
                        size: searchStr,
                        val: sizeVal
                    });
                }
            }
            return result;
        }
        let searchObj = sizeObj[objKey];
        for (let x = 0; x < searchObj.length; x++) {
            if (objKey === 'var') {
                for (let y = 0; y < searchObj[x].synonym.length; y++) {
                    result = searchForResult(searchObj[x].synonym[y], searchObj[x].val, result);
                }
            } else {
                result = searchForResult(searchObj[x], objKey, result);
            }
        }
        return result;
    }
    let result = [];

    // search for general sizes
    result = searchByObjKey('small', result);
    result = searchByObjKey('big', result);
    // search for specific sizes
    result = searchByObjKey('var', result);

    return result;
}
function searchConj (input, conjObj) {
    function searchForResult (searchStr, type, result) {
        let searchRes = search(input, searchStr);
        if (searchRes.length) {
            for (let x = 0; x < searchRes.length; x++) {
                result.push({
                    inputPos: searchRes[x].pos,
                    inputVal: searchRes[x].val,
                    conj: searchStr,
                    type: type
                });
            }
        }
        return result;
    }
    let result = [];
    for (let key in conjObj) {
        let currentObj = conjObj[key];
        for (let x = 0; x < currentObj.length; x++) {
            result = searchForResult(currentObj[x], key, result);
        }
    }
    return result;
}

function createBlocksByNameObj (orderBlock) {
    // filter names from orderBlock
    let nameObj = orderBlock.filter((x) => {
        return x.name;
    }, orderBlock);
    // create nameObj blocks > with same inputPos
    let blocks = [];
    let newBlocks = [];
    let inputPos = -1;
    for (let x = 0; x < nameObj.length; x++) {
        if (inputPos === -1) {
            inputPos = nameObj[x].inputPos;
        }
        if (inputPos !== nameObj[x].inputPos) {
            inputPos = nameObj[x].inputPos;
            blocks.push(newBlocks);
            newBlocks = [];
        }
        newBlocks.push(nameObj[x]);
    }
    if (newBlocks.length) {
        blocks.push(newBlocks);
    }
    return blocks;
}


function splitOrdersByKeywords (keywords, splitRules, menu) {
    // merge all keywords
    let merged = [];
    for (let key in keywords) {
        for (let x = 0; x < keywords[key].length; x++) {
            // check if inputPos already exist > remove duplicates
            let duplicate = false;
            for (let y = 0; y < merged.push; y++) {
                if (keywords[key][x].inputPos === merged[y].inputPos) {
                    duplicate = true;
                    break;
                }
            }
            if (!duplicate) {
                merged.push(keywords[key][x]);
            }
        }
    }
    // order keywords
    keywords = Helper.orderObjArray(merged, "inputPos");

    // BASIC SPLIT > split by conj-add
    let basicSplit = [];
    let orderElem = [];
    while (keywords.length) {
        if (keywords[0].conj) {
            if (keywords[0].type === 'add') {
                basicSplit.push(orderElem);
                orderElem = [];
            }
        } else {
            orderElem.push(keywords[0]);
        }
        keywords.splice(0, 1);
    }
    if (orderElem.length) {
        basicSplit.push(orderElem);
    }

    // NORMALIZATION AND CHECK KOMBO
    let finalSplit = [];
    for (let x = 0; x < basicSplit.length; x++) {
        let normalized = [];
        // check name kombo > normalize multiple names with same chain to one name
        let kombo = [];
        let lastName = false;
        for (let y = 0; y < basicSplit[x].length; y++) {
            // basic split element
            let basicSplitElem = basicSplit[x][y];

            // get type
            let type = false;
            if (basicSplitElem.name) {
                type = 'name';
            } else if (basicSplitElem.size) {
                type = 'size';
            } else if (basicSplitElem.nb) {
                type = 'nb';
            }

            // add new element to normalization
            if (normalized[normalized.length-1] !== type || type !== 'name') {
                normalized.push(type);
            }

            if (lastName && type === 'name') {
                kombo[kombo.length-1].push(basicSplitElem);
            } else {
                if (type === 'name') {
                    kombo.push([basicSplitElem]);
                    lastName = true;
                } else if (lastName) {
                    if (kombo.length === 1) {
                        kombo = kombo.splice(kombo.length-1, 1);
                    }
                    lastName = false;
                }
            }
        }
        if (kombo[kombo.length-1].length === 1) {
            kombo.splice(kombo.length-1, 1);
        }

        // compare nameKombo
        if (kombo.length) {
            let komboResult = compareNames(kombo, menu);
            if (!komboResult) {
                // ÜBERARBEITEN > RESPONSE
                console.log('could not understand you');
            }
        }

        // split orders

        // let splitOpportunities = matchSplitRules(normalized);
        let allMatches = [];
        function splitNormalized (normalized, preMatch = []) {
            let matches = [];
            for (let x = 0; x < splitRules.length; x++) {
                let rule = splitRules[x].rule.split('-');
                let match = true;
                if (rule.length <= normalized.length) {
                    for (let y = 0; y < rule.length; y++) {
                        if (rule[y] !== normalized[y]) {
                            match = false;
                        }
                    }
                } else {
                    match = false;
                }
                if (match) {
                    matches.push(x);
                }
            }
            if (matches.length) {
                for (let x = 0; x < matches.length; x++) {
                    let newNormalized = normalized.slice();
                    let newPreMatch = preMatch.slice();
                    newNormalized.splice(0, splitRules[matches[x]].rule.split('-').length);
                    newPreMatch.push(matches[x]);
                    splitNormalized(newNormalized, newPreMatch);
                }
            } else {
                if (!normalized.length) {
                    allMatches.push(preMatch);
                }
            }
        }
        splitNormalized(normalized);

        if (!allMatches.length) {
            // couldn't understand
            // try to remove nb kombos
            let lastItem = false;
            let prevBasicSplit = basicSplit[x].slice();
            for (let y = 0; y < basicSplit[x].length; y++) {
                let basicSplitItem = basicSplit[x][y];
                if (lastItem && basicSplitItem.nb && basicSplitItem.val === 1) {
                    basicSplit[x].splice(y, 1);
                    y--;
                }
                lastItem = (basicSplitItem.nb);
            }
            if (prevBasicSplit.length !== basicSplit[x].length) {
                x--;
            }
        } else {
            let max = -1;
            let maxIndex = false;
            for (let y = 0; y < allMatches.length; y++) {
                let prob = false;
                for (let z = 0; z < allMatches[y].length; z++) {
                    let newProb = splitRules[allMatches[y][z]].prob;
                    if (prob === false) {
                        prob = newProb;
                    } else {
                        prob = ((z * prob) + newProb) / (z + 1);
                    }
                }
                if (prob > max) {
                    max = prob;
                    maxIndex = y;
                }
            }

            // final split
            if (maxIndex !== false) {
                for (let y = 0; y < allMatches[maxIndex].length; y++) {
                    let splitRuleIndex = allMatches[maxIndex][y];
                    let splitRuleLength = splitRules[splitRuleIndex].rule.split('-').length;
                    let newSplitItem = [];
                    let spliceLength = splitRuleLength;
                    for (let z = 0; z < spliceLength; z++) {
                        if ((z + 1) < splitRuleLength && basicSplit[x][z].name && basicSplit[x][z + 1].name) {
                            spliceLength++;
                        }
                        newSplitItem.push(basicSplit[x][z]);
                    }
                    basicSplit[x].splice(0, spliceLength);
                    finalSplit.push(newSplitItem);
                }
            }
        }
    }
    // let result = orderArr;
    return finalSplit;
}

function splitNameBlocks (nameBlocks) {
    let result = [];
    for (let x = 0; x < nameBlocks.length; x++) {
        for (let y = 0; y < nameBlocks[x].length; y++) {
            result.push(nameBlocks[x][y]);
        }
    }
    return result;
}
function compareNames (nameBlocks, menu) {
    // nameBlocks is an array of different product elements which
    // have to be compared > find similarities

    // split nameBlocks
    let nameKeywords = splitNameBlocks(nameBlocks);
    // build similarity array
    let similarities = [];
    for (let x = 0; x < nameKeywords.length; x++) {
        similarities[x] = [nameKeywords[x]];
        for (let y = x+1; y < nameKeywords.length; y++) {
            // compare by menuPos
            let matching = true;
            for (let z = 0; z < nameKeywords[x].menuPos.length; z++) {
                if (nameKeywords[y].menuPos[z] !== undefined && nameKeywords[x].menuPos[z] !== nameKeywords[y].menuPos[z]) {
                    // no matching
                    matching = false;
                }
            }
            if (matching) {
                similarities[x].push(nameKeywords[y]);
            }
        }
    }
    // compare similarity arrays (find biggest)
    let max = 0;
    let maxIndex = false;
    let maxCounter = 0;

    for (let x = 0; x < similarities.length; x++) {
        let simLength = similarities[x].length;
        if (max === simLength) {
            maxCounter++;
        }
        if (max < simLength) {
            max = simLength;
            maxIndex = x;
            maxCounter = 1;
        }
    }
    // check if there is only ONE longest chain
    if (maxCounter === 1) {
        let resultSim = similarities[maxIndex];
        // find longest menuPos
        let maxMenuPosLength = 0;
        let maxMenuPos = [];
        for (let x = 0; x < resultSim.length; x++) {
            let menuPosLength = resultSim[x].menuPos.length;
            if (menuPosLength > maxMenuPosLength) {
                maxMenuPosLength = menuPosLength;
                maxIndex = x;
                maxMenuPos = resultSim[x].menuPos;
            }
        }
        // get product from menu
        let product = menu[maxMenuPos[0]];
        for (let x = 1; x < maxMenuPos.length; x++) {
            product = product.child[maxMenuPos[x]];
        }
        // find lowest child
        while (product.child) {
            if (product.default) {
                for (let x = 0; x < product.child.length; x++) {
                    if (product.child[x].name === product.default) {
                        product = product.child[x];
                        maxMenuPos.push(x);
                        break;
                    }
                }
            } else {
                // choose first child as default
                product = product.child[0];
                maxMenuPos.push(0);
            }
        }
        // add menuPos to find element later
        product.menuPos = maxMenuPos;
        // product is final match
        return product;
    } else {
        // not understandable
        return false;
    }
}
function getDefaultByBlock (nameBlock, menu, defaultParent) {
    function getParent (name) {
        for (let x = 0; x < defaultParent.length; x++) {
            if (defaultParent[x].name === name) {
                return defaultParent[x].parent;
            }
        }
        return false;
    }

    // layer from nameBlockObj
    let layer = 0;

    // get parent name
    let parentName = getParent(nameBlock[0].name);

    do {
        // search for parent in left nameBlockObj
        layer++;
        for (let x = 0; x < nameBlock.length; x++) {
            // get next parent
            let menuPos = nameBlock[x].menuPos;
            let parentObj = menu[menuPos[0]];
            for (let y = 1; y < menuPos.length - layer; y++) {
                parentObj = parentObj.child[menuPos[y]];
            }
            // check if parent matches defaultParent > remove nameBlock if false
            if (parentObj.name !== parentName && nameBlock.length > 1) {
                nameBlock.splice(x, 1);
                x--;
            }
        }
        // search for next parent
        parentName = getParent(parentName);
    } while (parentName && nameBlock.length > 1);

    // default from blocks created
    let defaultObj = nameBlock[0];

    // get product by menuPos
    let menuPos = defaultObj.menuPos;
    let result = menu[menuPos[0]];
    for (let x = 1; x < menuPos.length; x++) {
        result = result.child[menuPos[x]];
    }

    // find default childs
    while (result.default || result.child) {
        if (result.default) {
            for (let x = 0; x < result.child.length; x++) {
                if (result.child[x].name === result.default) {
                    result = result.child[x];
                    menuPos.push(x);
                    break;
                }
            }
        } else {
            result = result.child[0];
            menuPos.push(0);
        }
    }
    // add menuPos to find full name later
    result.menuPos = menuPos;

    return result;
}

function createOrderByBlock (orderBlocks, menu) {
    let order = [];
    for (let x = 0; x < orderBlocks.length; x++) {
        function getTypeVal (type) {
            let worker = orderBlocks.slice();
            return worker[x].filter((x) => {
                return x[type]
            }, worker[x])[0];
        }
        let nb = getTypeVal('nb');
        let size = getTypeVal('size');
        let product = orderBlocks[x].product;

        let newOrder = {};

        if (product) {
            // generate product name
            let menuPos = product.menuPos;
            let menuObj = menu[menuPos[0]];
            for (let y = 1; y < menuPos.length; y++) {
                menuObj = menuObj.child[menuPos[y]];
            }
            newOrder.name = menuObj.productName;
            // number
            if (nb) {
                newOrder.nb = nb.val;
            } else {
                // default 1
                newOrder.nb = 1;
            }
            // size
            if (size) {
                let variations = Helper.orderObjArray(menuObj.var, "size");
                newOrder.size = false;
                if (size.val === 'big') {
                    newOrder.size = variations[variations.length-1].size;
                } else if (size.val === 'small') {
                    newOrder.size = variations[0].size;
                } else if (!isNaN(size.val)) {
                    newOrder.size = size.val;
                }
                if (!newOrder.size) {
                    // QUESTION size not available
                }
            } else {
                // search for default
                menuObj.var.filter((x) => {
                    return x.default;
                }, menuObj.var);
                if (menuObj.var.length) {
                    newOrder.size = menuObj.var[0].size;
                } else {
                    // QUESTION no default size defined
                }
            }
            order.push(newOrder);
        } else {
            // WEITERMACHEN
            // QUESTION product not defined > should be impossible because of splitting
        }
    }
    return order;
}

exports.main = function (menu, input, test = false) {
    let cfg = require('./testJSON/algorithm');

    input = input.replace(/[&\/\\#,+()$~%.'":*?<>{}!]/g,'');
    input = input.toLowerCase();
    input = ' ' + input + ' ';

    // keywords
    let keywords = {
        name: [],
        nb: [],
        size: [],
        conj: []
    };
    keywords.name = searchName(input, menu.drinks, cfg.defaultSynonyms);
    keywords.nb = searchNb(input, cfg.numbers.content);
    keywords.size = searchSize(input, cfg.size);
    keywords.conj = searchConj(input, cfg.conjunction);

    // split products
    let orderBlocks = splitOrdersByKeywords(keywords, cfg.splitRules, menu.drinks);

    for (let x = 0; x < orderBlocks.length; x++) {
        // create name blocks
        let nameBlocks = createBlocksByNameObj(orderBlocks[x]);
        // --- single nameBlock per orderBlock
        // get default product by nameBlock
        if (nameBlocks.length === 1) {
            orderBlocks[x].product = getDefaultByBlock(nameBlocks[0], menu.drinks, menu.defaultParent);
        }
        // --- multiple nameBlocks per orderBlock
        // match multiple nameBlocks
        if (nameBlocks.length > 1) {
            orderBlocks[x].product = compareNames(nameBlocks, menu.drinks);
            if (!orderBlocks[x].product) {
                // ÜBERARBEITEN
                console.log('could not understand you!');
            }
        }
    }

    // create final order by orderBlock
    // or create response
    let order = createOrderByBlock(orderBlocks, menu.drinks);

    let response;
    if (test) {
        response = keywords;
        console.log('order: ' + order);
    } else {
        response = order;
    }

    return response;
};
