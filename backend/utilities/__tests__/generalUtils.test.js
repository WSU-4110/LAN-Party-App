'use strict'
const genUtils = require('../generalUtils');

let item = {ID: 6};

let array = [];
for(let i = 1; i <= 10; i++){
    array.push({ID: i});
}

//TESTS FOR isInSortedList=================================================================
describe("Tests for isInSorted list", () =>{ 

    test('Checking if 6 is found in an empty array', async function() {
        expect(await genUtils.isInSortedList(item, [])).toBe(false);
    });
    
    
    test('Checking if 6 is found in an ascending array  1-5', async function() {
        expect(await genUtils.isInSortedList(item, array.slice(0, 5))).toBe(false);
    });
    
    test('Checking if 6 is found in an ascending array  1-6', async function() {
        expect(await genUtils.isInSortedList(item, array.slice(0, 6))).toBe(5);
    });
    
    
    test('Checking if 6 is found in an ascending array  1-10', async function() {
        expect(await genUtils.isInSortedList(item, array)).toBe(5);
    });
    
    
    test('Checking if 6 is found in an ascending array  6-10', async function() {
        expect(await genUtils.isInSortedList(item, array.slice(5, 10))).toBe(0);
    });
    
    test('Checking if 6 is found in an  array [6]', async function() {
        expect(await genUtils.isInSortedList(item, array.slice(5, 6))).toBe(0);
    });
})


//TESTS FOR insertSorted=================================================================
describe("Tests for insertSorted", () => {
    test("Inserting 6 into an empty array such that it's sorted", async function() {
        expect(await genUtils.insertSorted(item, [])).toEqual([item]);
    });
    
    test("Inserting 6 into an array [1] such that it's sorted", async function() {
        expect(await genUtils.insertSorted(item, array.slice(0, 1))).toEqual([{ID: 1}, item]);
    });
    
    test("Inserting 6 into an array [10] such that it's sorted", async function() {
        expect(await genUtils.insertSorted(item, array.slice(9, 10))).toEqual([item, {ID: 10}]);
    });
    
    test("Inserting 6 into an array 1-5 + 7-10 such that it's sorted", async function() {
        expect(await genUtils.insertSorted(item, array.slice(0, 5).concat(array.slice(6,10)))).toEqual(array);
    });
    
    test("Inserting 6 into an array 1-4 + 6-10 such that it's sorted", async function() {
        expect(await genUtils.insertSorted({ID: 5}, array.slice(0, 4).concat(array.slice(5,10)))).toEqual(array);
    });
    
    test("Inserting 6 into an array 1-10 such that it's sorted. Should not work due to duplicates", async function() {
        expect(await genUtils.insertSorted(item, array.slice(0, 10))).toEqual(false);
    });
})
