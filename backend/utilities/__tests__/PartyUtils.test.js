const PartyUtil = require("../PartyUtils")



jest.mock('../../services/AccountAPI', () => {

    return jest.fn(() => {

        return {

            Get : (ID) => {

                const response  = {
                    "CreateDate": "2020-12-03T22:34:32.902Z",
                    "Friends": [
                      {
                        "Username": "SnasUndertale",
                        "Avatar": "https://lan-party-images.s3.amazonaws.com/PeterGriffinPapyrus-F2dPnutgW",
                        "ID": "RV91kfnl7"
                      },
                      {
                        "Username": "thadd4",
                        "Avatar": "https://lan-party-images.s3.amazonaws.com/dead-krillin-1peloYSFc",
                        "ID": "Vxy44jrII"
                      },
                      {
                        "Username": "thadd3",
                        "Avatar": "https://lan-party-images.s3.amazonaws.com/costanza-face-tDYE7E9XY",
                        "ID": "yspbFopc5"
                      }
                    ],
                    "UpdateDate": "2020-12-11T01:06:40.063Z",
                    "Password": "42d9bcd8bea474ff7e258f70aab054481e3e1304e6327f2a05b0366047d946ac",
                    "Avatar": "https://lan-party-images.s3.amazonaws.com/tenor-GG8v4wGZE",
                    "FriendRequests": [
                      {
                        "Sender": false,
                        "ID": "12FL9qi9Y",
                        "Username": "thaddg",
                        "Avatar": "https://lan-party-images.s3.amazonaws.com/bigBird-R5XMICJ2j"
                      }
                    ],
                    "About": "Edited for presentation",
                    "Games": [],
                    "ID": "oBtZI25sW", // call it by passing this id so test passes
                    "Email": "r@r.com",
                    "Username": "Randazzle"
                  }


                  return response;

            }



        }
    }
  )
}
)

describe('Testing isValidUsername function ', () => {

        test("Should return false if theres spaces in the argumernt", () => {
            

                try {

                    expect(PartyUtil.isValidUserName(" randazzle ")).toEqual(false)

                    
                } catch (error) {


                    console.error(error)

                    
                }
            });

            test("Should return true if theres NO spaces in the argumernt", () => {
            

                try {

                    expect(PartyUtil.isValidUserName("randazzle")).toEqual(true)

                    
                } catch (error) {

                    console.error(error)
                    
                }
            });

})

describe('Testing isValidPartyKey function ', () => {

    test("with Key case : PartyName", async () => {
        

            try {

                expect(await PartyUtil.validPartyKeys("PartyName","Randazzle")).toMatchObject({value : {PartyName : "Randazzle"}, isValid : true})

                
            } catch (error) {


                console.error(error)

                
            }
        });
        test("with Key case : PartyLocation", async () => {
        

            try {

                const params = {
                    
                      Name: "Babylon",
                      Longitude: 69,
                      Latitude: 88,
                
                  }

                  const response = {
                    value: {
                      PartyLocation:{
                        Name: "Babylon",
                        Longitude: 69,
                        Latitude: 88,
                      }
                    },
                    isValid: true
                  }


         
                expect(await PartyUtil.validPartyKeys("PartyLocation",params)).toMatchObject(response)

                
            } catch (error) {


                console.error(error)

                
            }
        });


        test("with Key case : Host", async () => {
        

            try {

               

                expect(await PartyUtil.validPartyKeys("Host","12FL9qi9Y")).toMatchObject(await PartyUtil.validPartyKeys("Host","oBtZI25sW", undefined))

                
            } catch (error) {


                console.error(error)

                
            }
        });

        test("with Key case : PartyTime", async () => { 
        

            try {

  


               
               expect(await PartyUtil.validPartyKeys("PartyTime","DECEMBER 14, 2020 12:40 am")).toMatchObject({ value: { PartyTime: 'DECEMBER 14, 2020 12:40 am' }, isValid: true })

                
            } catch (error) {


                console.error(error)

                
            }
        });

        test("with Key case : AgeGate", async () => { 
        

            try {

               

                expect(await PartyUtil.validPartyKeys("AgeGate",12)).toMatchObject({ value: { AgeGate: 12 }, isValid: true })

                
            } catch (error) {


                console.error(error)

                
            }
        });

        //TODO : here
        describe('With Key case : Intent --- Testing different outputs depending on the Intent passed', () => {

        test("When Intent is Casual ", async () => { 
        

            try {

               
               
                expect(await PartyUtil.validPartyKeys("Intent","Casual")).toMatchObject({ value: { Intent: 'Casual' }, isValid: true })

                
            } catch (error) {


                console.error(error)

                
            }
        })

        test("When Intent is Competative ", async () => { 
        

            try {

               
               
                expect(await PartyUtil.validPartyKeys("Intent","Competative")).toMatchObject({ value: { Intent: 'Competative' }, isValid: true })

                
            } catch (error) {


                console.error(error)

                
            }
        })

        test("When Intent is anything invalid ", async () => { 
        

            try {

               
               
                expect(await PartyUtil.validPartyKeys("Intent","gibberish")).toMatchObject({ value: { Intent: 'gibberish' }, isValid: false })

                
            } catch (error) {


                console.error(error)

                
            }
        })
    })

        test("with Key case : RequestLocationChange", async () => {
        

            try {

              
               
             

                expect(await PartyUtil.validPartyKeys("RequestLocationChange","rubbish")).toMatchObject( { value: { RequestLocationChange: null }, isValid: true })

                
            } catch (error) {


                console.error(error)

                
            }
        });

    // LOGAN'S TESTS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // test a valid username
    test('testing to see if a username is okay', () => {
        expect(
        PartyUtil.isValidUserName("david98")
        ).toEqual(true);
    });
  
    // test a invalid username
    test('testing to see if a username is NOT okay', () => {
        expect(
        PartyUtil.isValidUserName("awesome user90")
        ).not.toEqual(true);
    });

    // END OF LOGAN'S TESTS ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
})