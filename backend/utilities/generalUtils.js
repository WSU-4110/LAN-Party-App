'use strict'

module.exports = {
    isInSortedList: async function(item, list, sortedKey){
        let left = 0;
        let right = list.length - 1;
        console.log(item);
        try {
            console.log(left + " | " + right);
            while (right >= left){
                let middle = Math.round((left + right) / 2);
                console.log(middle);
                console.log(list[middle][sortedKey] + " " + item[sortedKey]);
                if(list[middle][sortedKey] === item[sortedKey]){
                    return middle;
                } else if (list[middle][sortedKey] < item[sortedKey]){
                    left = middle + 1;
                } else {
                    right = middle - 1;
                }
            }

            return false;
        } catch (err) {
            return false;
        }
        
    },

    insertSorted: async function (insertItem, list, sortKey){
        //Make sure that the list isn't empty
        if(list === undefined || list.length === 0){
            list = [insertItem];
            return list;
        }
        
        //If the first item is greater than the new item, put the item in the front
        else if(list[0][sortKey] > insertItem[sortKey]){
            list.unshift(insertItem);
            return list;
        } 
        
        //If the last item is less than the new item, put the item in the back
        else if(list[list.length - 1][sortKey] < insertItem[sortKey]){
            list.push(insertItem);
            return list;
        }

        //It's somewhere in the middle
        else {
            let left = 0;
            let right = list.length - 1;
            while(left < right){
                let middle = Math.round((left + right) / 2);

                //If the current middle is greater
                if(list[middle][sortKey] > insertItem[sortKey]){
                    //If the one below is lesser, insert between
                    if(list[middle - 1][sortKey] < insertItem[sortKey]){
                        list.splice(middle, 0, insertItem);
                        return list;
                    }
                    
                    //Otherwise, move earlier in the list
                    else {
                        right = middle - 1;
                    }
                }

                //If the current middle is lesser
                else {
                    //If the next item is greater, insert between
                    if(list[middle + 1][sortKey] > insertItem[sortKey]){
                        list.splice(middle + 1, 0, insertItem);
                        return list;
                    }

                    //Otherwise, move to later in the list
                    else {
                        left = middle + 1;
                    }
                }
            }
        }

        //If it couldn't be inserted, return false
        return false;
    }
}