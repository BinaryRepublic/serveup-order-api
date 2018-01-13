function search (srcStr, searchStr) {
    let result = [];
    let lastIndex = 0;

    let pos = -1;
    let searchSuffix = [
        "", "e", "es", "er", "en"
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
        let newIndex = index.slice();
        // recursive for getting all childrens
        newIndex.push(x);
        if (drinks[x].child) {
            result = searchName(input, drinks[x].child, defaultSynonymsResults, newIndex, result);
        }
        // search for name
        let drinkName = drinks[x].name;
        result = searchForResult(drinkName, newIndex, false, result);
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

function createBlocksByNameObj (nameObj) {
    // create nameObj blocks > with same inputPos
    let blocks = [];
    let newBlocks = [];
    let inputPos = 0;
    for (let x = 0; x < nameObj.length; x++) {
        if (inputPos !== nameObj[x].inputPos) {
            inputPos = nameObj[x].inputPos;
            blocks.push(newBlocks);
            newBlocks = [];
        }
        newBlocks.push(nameObj[x]);
    }
    blocks.push(newBlocks);
    return blocks;
}

function getProductByMatchingBlocks (blocks, drinks) {

}
function getDefaultByBlock (nameObj, drinks, defaultParent) {
    /*
    let result = [];

    for (let x = 0; x < nameBlocks.length; x++) {
        // find correct product in block
        let correctIndex = false;
        // get default parents first
        // then get default child

        // go up
        let parentName = false;
        let indexLevel = 1;
        do {
            for (let y = 0; y < defaultParent.length; y++) {
                if (defaultParent[y].name === nameBlocks[x][0].name) {
                    parentName = defaultParent[y].name;
                }
            }
            for (let y = 0; y < nameBlocks[x].length; y++) {
                let parentObj = drinks[y];

                if (nameBlocks[x][y].menuPos.length > indexLevel) {
                    let menuPos = nameBlocks[x][y].menuPos;
                    for (let z = 1; z < menuPos.length - indexLevel; z++) {
                        parentObj = parentObj.child[menuPos[z]];
                    }
                    if (parentObj.name === parentName) {
                        console.log('Object: ' + parentName);
                    }
                }
            }

        } while (parentName);
    }
    return result;
    */
}


exports.main = function (menu, input) {
    let drinksMenu = require('./testJSON/menu');
    let cfg = require('./testJSON/algorithm');

    let order = [];

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
    keywords.name = searchName(input, drinksMenu.drinks, cfg.defaultSynonyms);
    keywords.nb = searchNb(input, cfg.numbers.content);
    keywords.size = searchSize(input, cfg.size);
    keywords.conj = searchConj(input, cfg.conjunction);

    // create name blocks
    // let nameBlocks = createBlocksByNameObj(keywords.name);
    // console.log(nameBlocks);

    // product matching
    // let products = matchNameWithProduct(keywords.name, drinksMenu.drinks, drinksMenu.defaultParent);
    // console.log(products);
    return JSON.stringify(keywords);
};
