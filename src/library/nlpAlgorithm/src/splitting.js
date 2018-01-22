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
            if (kombo.length && kombo[kombo.length-1].length === 1) {
                kombo.splice(kombo.length-1, 1);
            }

            // compare nameKombo
            if (kombo.length) {
                let NameOperations = require('./nameOperations');
                let nameOperations = new NameOperations(this.menu);

                let komboResult = nameOperations.getProductByComparison(kombo);
                if (!komboResult) {
                    // ÜBERARBEITEN > RESPONSE
                    console.log('could not understand you');
                }
            }

            // split orders

            // let splitOpportunities = matchSplitRules(normalized);
            this.splitNormalized(normalized);

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
                    for (let y = 0; y < this.allMatches[maxIndex].length; y++) {
                        let splitRuleIndex = this.allMatches[maxIndex][y];
                        let splitRuleLength = this.splitRules[splitRuleIndex].rule.split('-').length;
                        let newSplitItem = [];
                        let spliceLength = splitRuleLength;
                        for (let z = 0; z < spliceLength && basicSplit[x][z]; z++) {
                            if (basicSplit[x][z + 1] && basicSplit[x][z].name && basicSplit[x][z + 1].name) {
                                spliceLength++;
                            }
                            newSplitItem.push(basicSplit[x][z]);
                        }
                        basicSplit[x].splice(0, spliceLength);
                        finalSplit.push(newSplitItem);
                    }
                }
            }
            // check whether only name is given
            if (normalized.length === 1 && normalized[0] === 'name') {
                finalSplit.push(basicSplit[x]);
            }
        }
        return finalSplit;
    }
}

module.exports = Splitting;
