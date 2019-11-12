const faker = require('faker')
const { Client } = require('pg')


let primeSequence = generatePrimeSequence(100);
var randomData = [];

for(let i = 0 ; i<100; i++ ){
    let tag = faker.name.jobArea();
    randomData.push({
        "campaign_id": faker.random.number({min:1, max:5}),
        "tag": tag,
        "tag_code": primeSequence[i],
        "msg_type": faker.random.arrayElement(["static","dynamic"]),
        "prompt_name": `play${tag}Message`,
        "start_date": faker.date.recent(),
        "end_date": faker.date.future(),
        "is_enabled": faker.random.boolean(),
        "priority": faker.random.number({min:1, max:5}),
        "frequency": faker.random.arrayElement(["once","always"])
    });
};

async function addFakeSettings() {
    
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
            let sqlQuery = `insert into custom_functional_message_module_settings(campaign_id, tag, tag_code, msg_type, prompt_name, start_date, end_date, is_enabled, priority, frequency) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
            let values = [body.campaign_id, body.tag, body.tag_code, body.msg_type, body.prompt_name, body.start_date, body.end_date, body.is_enabled, body.priority, body.frequency];
            await client.query(sqlQuery,values);
        } catch(e){
            console.log(e);
        }
    }

};

addFakeSettings();

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
