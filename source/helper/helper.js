let Helper =
{
    traverse: function (o, fn, typeFilter)
    {
        for (var i in o)
        {
            fn.apply(this, [i, o[i]]);

            if (o[i] !== null && typeof (o[i]) === 'object')
            {
                if (!typeFilter || !(o[i] instanceof typeFilter))
                    Helper.traverse(o[i], fn, typeFilter);
            }
        }
    },

    find: function (object, attributeName, attributeContent, deepness = 5, depth = 0)
    {
        for (let i in object)
        {
            let item = object[i];

            if (item && typeof item === 'object')
            {
                if (attributeName in item && item[attributeName] == attributeContent)
                    return item;

                //recursive
                if (depth < deepness)
                {
                    let inner = Helper.find(item, attributeName, attributeContent, deepness, depth + 1);

                    if (inner)
                        return inner;
                }
            }
        }

        return null;
    },

    findAll: function (object, attributeName, attributeContent, deepness = 5, depth = 0)
    {
        let items = [];

        for (let i in object)
        {
            let item = object[i];

            if (item && typeof item === 'object' && Helper.typeCheck(item, typeFilter))
            {
                if (attributeName in item && item[attributeName] == attributeContent && !('__findAll_added' in item))
                {
                    //add a flag (if this object occures in some way in a child item again)
                    item['__findAll_added'] = true;
                    items.push(item);
                }

                //recursive
                if (depth < deepness)
                {
                    let inner = Helper.findAll(item, attributeName, attributeContent, deepness, depth + 1);

                    if (inner && inner.length > 0)
                        items = items.concat(inner);
                }
            }
        }

        // clear __findAll_added flags
        if (items.length > 0 && depth == 0)
        {
            items.forEach(item =>
            {
                delete item['__findAll_added'];
            });
        }

        return items;
    },

    deepCopy: function (o)
    {
        var output, v, key;

        output = Array.isArray(o) ? [] : {};

        for (key in o)
        {
            v = o[key];
            output[key] = (typeof v === "object") ? Helper.deepCopy(v) : v;
        }
        return output;
    },

    copyObjectWithoutInnerObjects: function(o)
    {
        let res = {};

        for (key in o)
        {
            v = o[key];

            if (typeof v !== "object")
                res[key] = v;
        }

        return res;
    },

    deleteById(object, id, typeFilter)
    {
        for (var i in object)
        {
            if (object[i] !== null && typeof (object[i]) === 'object')
            {
                if ('id' in object[i] && object[i].id == id)
                {
                    delete object[i];
                    object.splice(i, 1);
                }
                else if (!(object[i] instanceof typeFilter))
                    Helper.deleteById(object[i], id, typeFilter);
            }
        }
    },

    countArrayElementsInObject(object)
    {
        let amount = 0;
        for (var i in object)
        {
            if (object[i] !== null && typeof (object[i]) === 'object' && object[i] instanceof Array)
                amount += object[i].length;
        }

        return amount;
    },

    capitalizeFirstLetter(string)
    {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },

    getRandomInt(min, max)
    {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    getRandom(min, max)
    {
        return Math.random() * (max - min) + min;
    },

    getRandomIndexByProbability(probabilitys)
    {
        if (!probabilitys || probabilitys.length == 0)
            return null;

        if (probabilitys.length == 1)
            return 0;

        let totalProbability = 0.0;
        probabilitys.forEach((p)  =>
        {
            totalProbability += p;
        });

        let p = Math.random() * totalProbability;

        let current = 0;

        while ((p -= probabilitys[current]) > 0)
        {
            ++current;

            if (current >= probabilitys.length)
                return probabilitys.length - 1;
        }

        return current;
    },

    getRandomPosInCircle(circlePos, circleRadius, offset)
    {
        if (!offset)
            offset = 0.0;

        let radius = Helper.getRandom(offset, circleRadius);
        let angle = Helper.getRandom(0.0, 2.0 * Math.PI);

        let x = (radius * Math.cos(angle)) + circlePos.x;
        let y = (radius * Math.sin(angle)) + circlePos.y;

        return {x: x, y: y};
    },

    numKeys(object)
    {
        let amount = 0;
        for(let key in object)
            amount++;

        return amount;
    },

    objectAsArray(obj)
    {
        return Object.keys(obj).map(key => obj[key])
    },

    getObjectKeyByPos(object, pos)
    {
        let amount = 0;
        for(let key in object)
        {
            if (pos == amount)
                return key;

            amount++;
        }

        return null;
    },

    getObjectByPos(object, pos)
    {
        let amount = 0;
        for(let key in object)
        {
            if (pos == amount)
                return object[key];

            amount++;
        }

        return null;
    },

    //https://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
    flatten(data)
    {
        var result = {};
        function recurse (cur, prop)
        {
            if (Object(cur) !== cur)
            {
                result[prop] = cur;
            }
            else if (Array.isArray(cur))
            {
                 for(var i=0, l=cur.length; i<l; i++)
                     recurse(cur[i], prop + "[" + i + "]");

                if (l == 0)
                    result[prop] = [];
            }
            else
            {
                var isEmpty = true;

                for (var p in cur)
                {
                    isEmpty = false;
                    recurse(cur[p], prop ? prop+"."+p : p);
                }

                if (isEmpty && prop)
                    result[prop] = {};
            }
        }

        recurse(data, "");
        return result;
    },

    //https://stackoverflow.com/questions/19098797/fastest-way-to-flatten-un-flatten-nested-json-objects
    unflatten(data)
    {
        "use strict";
        if (Object(data) !== data || Array.isArray(data))
            return data;

        var regex = /\.?([^.\[\]]+)|\[(\d+)\]/g,
            resultholder = {};

        for (var p in data)
        {
            var cur = resultholder,
                prop = "",
                m;

            while (m = regex.exec(p))
            {
                cur = cur[prop] || (cur[prop] = (m[2] ? [] : {}));
                prop = m[2] || m[1];
            }
            cur[prop] = data[p];
        }

        return resultholder[""] || resultholder;
    },

    getObjectByFlattenKey(object,key)
    {
        let splits = key.split('.');

        let resObject = object;

        for(let i=0;i<splits.length;++i)
        {
            if (!resObject)
                return null;

           let name = splits[i];
           resObject = resObject[name];
        }

        return resObject;
    },

    padLeft(nr, n, str)
    {
        if ((''+nr).length > n)
            return ''+nr;

        //https://stackoverflow.com/questions/5366849/convert-1-to-0001-in-javascript
        return Array(n-String(nr).length+1).join(str||'0')+nr;
    },

    randomStr(len)
    {
        let text = "";
        const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (let i = 0; i < len; ++i)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    },

    hasArg(name)
    {
        for(let i in process.argv)
        {
            if (process.argv[i] == name)
                return true;
        }

        return false;
    },

    getFlattenObjectKeysByDepth(inputData, maxDepth, depth, inputKey, result)
    {
        if (!inputKey)
            inputKey = '';

        if (!result)
            result = [];

        if (!depth)
            depth = 0;

        for(let key in inputData)
        {
            let obj = inputData[key];

            let newKey = inputKey ? (inputKey+'.'+key) : key;

            if (obj instanceof Object && depth < maxDepth)
                Helper.getFlattenObjectKeysByDepth(obj, maxDepth, depth+1, newKey, result);
            //append to reslut object/list
            else
                result.push(newKey);
        }

        return result;
    },

    getFlattenObjectKeyMappingWithIds(inputData, startOffset, inputKey, result)
    {
        if (!inputKey)
            inputKey = '';

        if (!result)
            result = {};

        if (!startOffset)
            startOffset = 0;

        for(let key in inputData)
        {
            let obj = inputData[key];

            if (obj instanceof Object)
            {
                let newKey = inputKey ? (inputKey+'.'+key) : key;
                Helper.getFlattenObjectKeyMappingWithIds(obj, startOffset, newKey, result);
            }
            else
            {
                //append to reslut object/list
                if (!(inputKey in result))
                {
                    //get id based on amount
                    let newId = Helper.numKeys(result);
                    result[inputKey] = newId + startOffset;
                }
            }
        }

        return result;
    },

    swapObjectKeyValue(keys)
    {
        let newKeys = {};

        for(let key in keys)
            newKeys[keys[key]] = key;

        return newKeys;
    },

    arrayEqual(array1, array2, sortFunc, equalFunc)
    {
        if (!Array.isArray(array1) || ! Array.isArray(array2) || array1.length !== array2.length)
            return false;

        if (!equalFunc)
            equalFunc = (item1, item2) => { return item1 === item2; };

        var arr1 = array1.concat();
        var arr2 = array2.concat();

        if (sortFunc)
        {
            arr1.sort(sortFunc);
            arr2.sort(sortFunc);
        }
        else
        {
            arr1.sort();
            arr2.sort();
        }

        for (var i = 0; i < arr1.length; i++)
        {
            if (!equalFunc(arr1[i], arr2[i]))
                return false;
        }

        return true;
    },

    sleep(ms)
    {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    bytesToSize(bytes)
    {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0)
            return '0 Byte';

        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));

        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
     },

     toHHMMSS(secs)
     {
        //https://stackoverflow.com/a/34841026
        var sec_num = parseInt(secs, 10);
        var hours   = Math.floor(sec_num / 3600) % 24;
        var minutes = Math.floor(sec_num / 60) % 60;
        var seconds = sec_num % 60;

        return [hours,minutes,seconds]
            .map(v => v < 10 ? "0" + v : v)
            .filter((v,i) => v !== "00" || i > 0)
            .join(":");
    },

    colorHexToInt(color)
    {
        color = color.replace("#","0x");
        color = parseInt(color);

        return color;
    },

    colorIntToHex(d)
    {
        var hex = Number(d).toString(16);
        hex = "000000".substr(0, 6 - hex.length) + hex;
        return '#'+hex;
    },

    colorRGBToInt(rgb)
    {
        return (rgb.r << 16) + (rgb.g << 8) + (rgb.b);
    }
}


module.exports = Helper;