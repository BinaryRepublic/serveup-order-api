class Helper {
    static toQueryStr (object) {
        let queryStr = '?';
        for (let key in object) {
            queryStr += key + '=' + object[key] + '&';
        }
        return queryStr.slice(0, -1);
    }
}
module.exports = Helper;
