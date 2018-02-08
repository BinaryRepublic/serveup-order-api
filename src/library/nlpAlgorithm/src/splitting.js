const cfg = require('../cfg');
const Helper = require('../helper');

class Splitting {
    constructor (menu, keywords) {
        this.menu = menu;
        this.keywords = keywords;

        this.splitNormalized = this.splitNormalized.bind(this);
        this.splitKeywords = this.splitKeywords.bind(this);

        this.splitRules = cfg.splitRules;

        this.allMatches = [];
    }

    splitNormalized (normalized, preMatch = []) {
        let matches = [];
        for (let x = 0; x < this.splitRules.length; x++) {
            let rule = this.splitRules[x].rule.split('-');
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
                newNormalized.splice(0, this.splitRules[matches[x]].rule.split('-').length);
                newPreMatch.push(matches[x]);
                this.splitNormalized(newNormalized, newPreMatch);
            }
        } else {
            if (!normalized.length) {
                this.allMatches.push(preMatch);
            }
        }
    }

    splitKeywords () {
        let keywords = this.keywords;

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
        keywords = Helper.orderObjArray(merged, 'inputPos');

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

                if (lastName && type === 'name') {
                    // --- handle name kombo
                    let NameOperations = require('./nameOperations');
                    let nameOperations = new NameOperations(this.menu);
                    let testKombo = kombo[kombo.length - 1].slice();
                    testKombo.push(basicSplitElem);
                    let komboResult = nameOperations.getProductByComparison(testKombo);
                    if (!komboResult) {
                        // invalid kombo
                        normalized.push({
                            type: type,
                            komboNb: 1
                        });
                    } else {
                        // valid kombo
                        normalized[normalized.length - 1].komboNb++;
                        kombo[kombo.length - 1].push(basicSplitElem);
                    }
                } else {
                    // --- add new element to normalization,
                    normalized.push({
                        type: type,
                        komboNb: 1 // --- counter of kombos
                    });
                    // --- handle kombo detection
                    if (type === 'name') {
                        kombo.push([basicSplitElem]);
                        lastName = true;
                    } else if (lastName) {
                        if (kombo.length === 1) {
                            kombo = kombo.splice(kombo.length - 1, 1);
                        }
                        lastName = false;
                    }
                }
            }
            if (kombo.length && kombo[kombo.length - 1].length === 1) {
                kombo.splice(kombo.length - 1, 1);
            }

            // split orders
            let normalizedTypes = [];
            normalized.forEach(item => {
                for (let y = 0; y < item.komboNb; y++) {
                    normalizedTypes.push(item.type);
                }
            });
            this.splitNormalized(normalizedTypes);

            if (!this.allMatches.length) {
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
                // calculation normalization pattern with highest probability
                let max = -1;
                let maxIndex = false;
                for (let y = 0; y < this.allMatches.length; y++) {
                    let prob = false;
                    for (let z = 0; z < this.allMatches[y].length; z++) {
                        let newProb = this.splitRules[this.allMatches[y][z]].prob;
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
                    let normalizedIndex = 0;
                    for (let y = 0; y < this.allMatches[maxIndex].length; y++) {
                        let splitRuleIndex = this.allMatches[maxIndex][y];
                        let splitRuleLength = this.splitRules[splitRuleIndex].rule.split('-').length;
                        let newSplitItem = {
                            items: []
                        };
                        let spliceLength = splitRuleLength;
                        for (let z = 0; z < spliceLength && basicSplit[x][z]; z++) {
                            while (normalized[normalizedIndex].komboNb > 1) {
                                spliceLength++;
                                normalized[normalizedIndex].komboNb--;
                            }
                            newSplitItem.items.push(basicSplit[x][z]);
                            normalizedIndex++;
                        }
                        if (x < 0 && y === 0) {
                            // splitItem had an addConj beforehand
                            newSplitItem.splitType = 'conjAdd';
                        } else {
                            // splitItem was split via splitRules
                            newSplitItem.splitType = 'splitRules';
                        }
                        basicSplit[x].splice(0, spliceLength);
                        finalSplit.push(newSplitItem);
                    }
                }
            }
            // reset normalized matches
            this.allMatches = [];
        }

        return finalSplit;
    }
}

module.exports = Splitting;
