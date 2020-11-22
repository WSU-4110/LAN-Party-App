'use strict'

module.exports = {
    //=====================================================================
    // Checks if item is in a list that's sorted by sortedKey
    // returns the index if it's present, false if not
    //=====================================================================
    isInSortedList: async function(item, list, sortedKey = "ID"){
        if(list === undefined || !Array.isArray(list) || list.length === 0){
            return false;
        }
        
        let left = 0;
        let right = list.length - 1;
        try {
            while (right >= left){
                let middle = Math.round((left + right) / 2);
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
    
    //================================================================================
    // Inserts an item such that it's sorted in ascending order by sortKey
    // returns the list if it was inserted, false if not.
    // False probably indicates an item with the same value at sortKey
    //================================================================================
    insertSorted: async function (insertItem, list, sortKey = "ID"){
        //Make sure that the list isn't empty
        console.log(list);
        if(list === undefined || !Array.isArray(list) ||list.length === 0){
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