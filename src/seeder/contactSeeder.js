const faker = require('faker')
const { Client } = require('pg')


let primeSequence = generatePrimeSequence(30);
var randomData = [];

let maxNumberOfTagsForaContact = 4;

for(let i = 0 ; i<10000; i++ ){

    let numberOfTagsForContact = faker.random.number({min:1, max:maxNumberOfTagsForaContact});
    let tag = 1;

    for(let j = 0; j < numberOfTagsForContact; j++) {
        let currentTag = faker.random.arrayElement(primeSequence);
        tag *= currentTag; 
    }

    
    randomData.push({
        "phone1": faker.random.number({min:7000000000, max:9999999999}),
        "phone2": faker.random.number({min:7000000000, max:9999999999}),
        "phone3": faker.random.number({min:7000000000, max:9999999999}),
        "cif_no": faker.finance.account(),
        "tag": tag
    });
};


async function addFakeContacts() {
    
    const client = new Client({
        user: 'postgres',
        host: '127.0.0.1',
        database: 'ameyodb',
        password: '',
        port: 5432
    })
    client.connect();

    for(let i=0; i< randomData.length; i++) {
        try{
            let body = randomData[i];
            let sqlQuery = `insert into custom_functional_message_module_contacts(phone1, phone2, phone3, cif_no, tag) values($1, $2, $3, $4, $5)`;
            let values = [body.phone1, body.phone2, body.phone3, body.cif_no, body.tag];
            await client.query(sqlQuery,values);
        } catch(e) {
            console.log(e);
        }
    }

};

addFakeContacts();

//----------------------------------------------------------------------------------------------------------------------------------------
// Inline functions ----------------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------------------------

function isprime(n){
    if(n == 2)
        return true
    if(n == 3)
        return true
    if(n % 2 == 0)
        return false
    if(n % 3 == 0)
        return false
    
    if(n%6 == 1 || n%6 == 5){
        for(let i = 1 ; i< (n/6); i++ )
            if(n/(6*i-1)==0 || n/(6*i+1)==0)        
                return false
    } else{
        return False
    }
        return true
}

function generatePrimeSequence(numberOfPrimes) {
    let returnArray = [];
    let i = 2;
    let countOfPrimes = 0;
    while(countOfPrimes < numberOfPrimes) {
        if(isprime(i) == true) {
            countOfPrimes++;
            returnArray.push(i);
        } else {

        }
        i++
    }
    return returnArray;
}
