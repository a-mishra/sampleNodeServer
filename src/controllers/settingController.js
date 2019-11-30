import axios from 'axios';
import https from 'https'
import http from 'http'
import { inspect } from 'util'
const config = require('../config/config.js');
var FormData = require('form-data');
var fs = require('fs');

//import JSON from 'circular-json'

const { Client } = require('pg')


// -------------- dt replica required------------------
export const getSettings = async (req, res) => {

    let sqlQuery = '';
    let values = [];
    if ((req.query.searchable != undefined && req.query.searchable != null)) {
        sqlQuery = `'select cfmms.*, campaign_context.name as campaign_name, campaign_context.type as campaign_type from (SELECT * FROM custom_functional_message_module_settings where ${req.query.searchable}='${req.query.value}') as cfmms left join campaign_context on campaign_context.id = cfmms.campaign_id order by cfmms.date_added desc `;
    } else {
        sqlQuery = 'select cfmms.*, campaign_context.name as campaign_name, campaign_context.type as campaign_type from (SELECT * FROM custom_functional_message_module_settings) as cfmms left join campaign_context on campaign_context.id = cfmms.campaign_id order by cfmms.date_added desc';
    }

    const client = new Client(global.gConfig.connectionProps)

    client.connect()
    try {
        let SQLresult = await client.query(sqlQuery, values);

        let tagToCountMap = [];
        for (let i = 0; i < SQLresult.rows.length; i++) {
            let sqlQuery = `select ${SQLresult.rows[i].tag_code} as tag_code, count(*) from custom_functional_message_module_contacts where tag % ${SQLresult.rows[i].tag_code} = 0`;
            let SQLresultForCustomerCountForTag = await client.query(sqlQuery);
            for (let j = 0; j < SQLresultForCustomerCountForTag.rows.length; j++) {
                tagToCountMap.push(SQLresultForCustomerCountForTag.rows[j]);
                SQLresult.rows[i].records = SQLresultForCustomerCountForTag.rows[j].count;
            }
        }

        res.json({
            msg: 'Success',
            data: SQLresult.rows
        });
    } catch (e) {
        console.error(e.stack)
        res.send({
            msg: 'Error ',
            data: 'Error while query postgres'
        });
    }

};


export const getSettings_dt = async (req, res) => {

    let sqlQuery = '';
    let values = [];
    if ((req.query.searchable != undefined && req.query.searchable != null)) {
        sqlQuery = `'select cfmms.*, campaign_context.name as campaign_name, campaign_context.type as campaign_type from (SELECT * FROM custom_functional_message_module_settings where ${req.query.searchable}='${req.query.value}') as cfmms left join campaign_context on campaign_context.id = cfmms.campaign_id order by cfmms.date_added desc `;
    } else {
        sqlQuery = 'select cfmms.*, campaign_context.name as campaign_name, campaign_context.type as campaign_type from (SELECT * FROM custom_functional_message_module_settings) as cfmms left join campaign_context on campaign_context.id = cfmms.campaign_id order by cfmms.date_added desc';
    }

    const client = new Client(global.gConfig.connectionProps)

    client.connect()
    try {
        let SQLresult = await client.query(sqlQuery, values);

        let tagToCountMap = [];
        for (let i = 0; i < SQLresult.rows.length; i++) {
            let dataTableName = await getDataTableName(SQLresult.rows[i].campaign_id);
            let sqlQuery = `select ${SQLresult.rows[i].tag_code} as tag_code, count(*) from ${dataTableName} where tag % ${SQLresult.rows[i].tag_code} = 0`;
            let SQLresultForCustomerCountForTag = await client.query(sqlQuery);
            SQLresult.rows[i].records = SQLresultForCustomerCountForTag.rows[0].count;
        }

        res.json({
            msg: 'Success',
            data: SQLresult.rows
        });
    } catch (e) {
        console.error(e.stack)
        res.send({
            msg: 'Error ',
            data: 'Error while query postgres'
        });
    }

};



export const getSettingWithId = (req, res) => {

    let sqlQuery = `select cfmms.*, campaign_context.name as campaign_name, campaign_context.type as campaign_type from (SELECT * FROM custom_functional_message_module_settings where id=${req.params.settingId}) as cfmms left join campaign_context on campaign_context.id = cfmms.campaign_id order by cfmms.date_added desc `;

    const client = new Client(global.gConfig.connectionProps)
    client.connect()

    client.query(sqlQuery)
        .then(SQLresult => {
            res.json({
                msg: 'Success',
                data: SQLresult.rows
            });
        })
        .catch(e => {
            console.error(e.stack)
            res.send({
                msg: 'Error ',
                data: 'Error while query postgres'
            });
        })

};


export const getSettingWithTagCode = async (req, res) => {

    let tagArray = primeFactors(req.params.tagId)
    let returnJSON = {};
    var data = [];

    for (let i = 0; i < tagArray.length; i++) {
        let sqlQuery = `SELECT * FROM custom_functional_message_module_settings where tag_code=${tagArray[i]}`;
        let values = [];

        const client = new Client(global.gConfig.connectionProps)
        client.connect();

        let SQLresult = await client.query(sqlQuery, values);
        for (let j = 0; j < SQLresult.rows.length; j++)
            data.push(SQLresult.rows[j]);
    }

    res.json({
        msg: 'Success',
        data: data
    });
}


export const addNewSetting = async (req, res) => {
    let body = req.body;

    const client = new Client(global.gConfig.connectionProps)
    client.connect();
    let sqlQuery = '';
    let values = [];
    let SQLresult = {};
    let addedCounter = 0;
    let failedToAddCounter = 0;
    let tagCode = 1;

    try {
        sqlQuery = `SELECT max(tag_code) as tag_code FROM custom_functional_message_module_settings`;
        SQLresult = await client.query(sqlQuery);
        tagCode = SQLresult.rows[0].tag_code;
        if (SQLresult.rows.length == 0 || tagCode == '' || tagCode == undefined || tagCode == null)
            tagCode = 1;
    } catch (e) {
        console.error(e.stack)
        res.send({
            msg: 'Error ',
            data: e
        });
    }

    let num = tagCode + 1
    while (!(isPrime(num)))
        num++

    tagCode = num;

    //insert setting
    //--------------------------------
    try {
        sqlQuery = `insert into custom_functional_message_module_settings(campaign_id, tag, tag_code, msg_type, prompt_name, start_date, end_date, is_enabled, priority, frequency) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
        values = [body.campaign_id, body.tag, tagCode, body.msg_type, body.prompt_name, body.start_date, body.end_date, body.is_enabled, body.priority, body.frequency];
        SQLresult = await client.query(sqlQuery, values);
    } catch (e) {
        console.error(e.stack)
        res.send({
            msg: 'Error ',
            data: e
        });
    }

    // now contact insertion..
    //------------------------------------
    let contacts = body.contacts;
    let lengthOfContacts = contacts.length;
    Object.keys(contacts).forEach(async (key, index) => {
        let previoustTag = 1;
        let customerFound = false;

        try {
            sqlQuery = `SELECT tag FROM custom_functional_message_module_contacts where cif_no='${contacts[key].cif_no}'`;
            SQLresult = await client.query(sqlQuery);
            if (SQLresult.rows.length > 0) {
                previoustTag = SQLresult.rows[0].tag;
                customerFound = true;
            }
        } catch (e) {
            //console.error(e.stack)
            res.send({
                msg: 'Error ',
                data: e
            });
        }

        try {
            let values = [];

            if (customerFound == true) {

                let setArray = [];
                let currentContact = contacts[key];
                console.log(currentContact);
                Object.keys(currentContact).forEach((key1, index1) => {
                    setArray.push(`${key1} = $${index1+1}`);
                    values.push(currentContact[key1]);
                })
                let tag = tagCode * previoustTag;
                sqlQuery = `update custom_functional_message_module_contacts set ${setArray.join(', ')}, tag = ${tag} where cif_no = '${contacts[key].cif_no}'`;
                console.log(sqlQuery);
                console.log(values);

            } else {
                sqlQuery = `insert into custom_functional_message_module_contacts(phone1, phone2, phone3, cif_no, tag) values($1, $2, $3, $4, $5)`;
                values = [contacts[key].phone1, contacts[key].phone2, contacts[key].phone3, contacts[key].cif_no, tagCode];
                console.log(sqlQuery);

            }

            await client.query(sqlQuery, values);
            addedCounter++;
            if (index == lengthOfContacts - 1) {
                res.json({
                    "Added": addedCounter,
                    "FailedToAdd": failedToAddCounter
                });
            }
        } catch (e) {
            // console.log(e);
            failedToAddCounter++;
            if (index == lengthOfContacts - 1) {
                res.json({
                    "Added": addedCounter,
                    "FailedToAdd": failedToAddCounter
                });
            }
        }
    })

};


// ---------------------------------------  add new setting with dataTable as customerData table -------------------------------------

export const addNewSetting_dt = async (req, res) => {
    let body = req.body;

    const client = new Client(global.gConfig.connectionProps)
    client.connect();
    let sqlQuery = '';
    let values = [];
    let SQLresult = {};
    let addedCounter = 0;
    let failedToAddCounter = 0;
    let tagCode = 1;
    let dataTableName = await getDataTableName(body.campaign_id);
    let defaultLeadId = await getDefaultLeadId(body.campaign_id);
    let customerDataTableName = dataTableName ; // custom_functional_message_module_contacts
    console.log(customerDataTableName);


    try {
        sqlQuery = `SELECT max(tag_code) as tag_code FROM custom_functional_message_module_settings`;
        SQLresult = await client.query(sqlQuery);
        tagCode = SQLresult.rows[0].tag_code;
        if (SQLresult.rows.length == 0 || tagCode == '' || tagCode == undefined || tagCode == null)
            tagCode = 1;
    } catch (e) {
        console.error(e.stack)
        res.send({
            msg: 'Error ',
            data: e
        });
    }

    let num = tagCode + 1
    while (!(isPrime(num)))
        num++

    tagCode = num;

    //insert setting
    //--------------------------------
    try {
        sqlQuery = `insert into custom_functional_message_module_settings(campaign_id, tag, tag_code, msg_type, prompt_name, start_date, end_date, is_enabled, priority, frequency) values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`;
        values = [body.campaign_id, body.tag, tagCode, body.msg_type, body.prompt_name, body.start_date, body.end_date, body.is_enabled, body.priority, body.frequency];
        SQLresult = await client.query(sqlQuery, values);
    } catch (e) {
        console.error(e.stack)
        res.send({
            msg: 'Error ',
            data: e
        });
    }

    // now contact insertion..
    //------------------------------------
    let contacts = req.body.contacts;
    console.log(`contacts: ${contacts}`);
    console.log(contacts);
    let lengthOfContacts = contacts.length;
    let customerAndCallbackRecords = [];

    console.log(`length of contacts: ${lengthOfContacts}`);

    Object.keys(contacts).forEach(async (key, index) => {
        console.log(`contacts at key ${key} : ${contacts[key]}`);
        let previoustTag = 1;
        let customerFound = false;

        console.log("-------------------------Quering Customer in the database-------------------");
        try {

            sqlQuery = `SELECT tag FROM ${customerDataTableName} where cif_no='${contacts[key].cif_no}'`;
            console.log(`sqlQuery : ${sqlQuery}`);

            SQLresult = await client.query(sqlQuery);
            
            console.log(`sqlResut : ${SQLresult.rows}`);
            if (SQLresult.rows.length > 0) {
                previoustTag = SQLresult.rows[0].tag;
                customerFound = true;
            }
            contacts[key].tag = tagCode * previoustTag;
            // contacts[key].segment = "1";

            let customerRecord = {};
            customerRecord['customerRecord'] = contacts[key];
            customerAndCallbackRecords.push(contacts[key]);

        } catch (e) {
            console.error(e.stack)
            res.send({
                msg: 'Error ',
                data: e
            });
        }

        if(index == lengthOfContacts - 1) {

            let dataForUploadContacts = {
                "campaignId": Number(body.campaign_id),
                "leadId": Number(defaultLeadId),
                "customerRecords": customerAndCallbackRecords,
                "properties": {
                    "update.customer": true,
                    "migrate.customer": false
                }
            }

            console.log(dataForUploadContacts);
            let baseURL =  global.gConfig.application_base_url;
            let CMHeaders = global.gConfig.CMHeaders; 

            const getData = async (baseURL, dataForUploadContacts, CMHeaders) => {
                try {

                    const response = await axios({
                            method: 'post',
                            url: `/dacx/jsonCommand`,
                            baseURL:baseURL,
                            headers: CMHeaders,
                            data: {
                                "command": "remote.processor.voiceCampaignConfigurationService.uploadContacts",
                                "data": dataForUploadContacts
                            },

                            httpsAgent: new https.Agent({rejectUnauthorized: false, keepAlive: true, keepAliveMsecs: 50000}),
                            httpAgent: new http.Agent({rejectUnauthorized: false})
                        })
                        .then(function (response) {
                            console.log(inspect(response.data))
                            res.json({msg:"Success", data: response.data});
                        });

                    client.end();

                } catch (error) {
                    console.log(error);
                    client.end();
                }
            };

            getData(baseURL, dataForUploadContacts, CMHeaders);

        }
    })

};





//-------- dt replica needed ---------------------------------------
export const updateSetting = async (req, res) => {

    // Will need a third action button 'Download' that would provide the list of all contacts in the this.tag_code and upon recieving 
    // it will get the list of all the customers for this.tag_code and drop all those customers then will reUpload the list of new customers in the list
    const client = new Client(global.gConfig.connectionProps)
    client.connect();

    let data = req.body;
    let values = [];
    let setArray = [];
    let counter = 0;
    let currentId = req.params.settingId;

    Object.keys(data).forEach( (key, index) => {
        if(key == 'id') {
            currentId = data[key];
        } else {
            counter++;
            setArray.push(`${key} = $${counter}`);
            values.push(data[key]);
        }
    })

    let sqlQuery = `update custom_functional_message_module_settings set ${setArray.join(', ')} where id = ${currentId}`;

    try{
        let SQLresult = await client.query(sqlQuery,values);
        res.json({ msg: 'Success ', data: [] });
    } catch(e) {
        console.error(e.stack)
        res.send({ msg: 'Error ', data: e });
    }

}




//-------- dt replica needed ---------------------------------------
export const updateSetting_dt = async (req, res) => {

    /*
        Request URL: https://redhat.ameyo.net:9801/setting/3
        Request Method: PUT
        Status Code: 200 OK

        {
            "id": 179,
            "campaign_id": 10,
            "tag": "Personal Loan",
            "tag_code": 3,
            "msg_type": "dynamic",
            "prompt_name": "Message1",
            "start_date": "2014-08-30 00:00:00",
            "end_date": "2014-08-31 00:00:00",
            "is_enabled": false,
            "priority": "2",
            "frequency": "always",
            "contacts":
            [
                {"phone1":"78387353","phone2":"7838733336","phone3":"347347737","cif_no":"767654563512"},
                {"phone1":"78387354","phone2":"7838733336","phone3":"347347737","cif_no":"767654563513"},
                {"phone1":"78387355","phone2":"7838733336","phone3":"347347737","cif_no":"767654563514"},
                {"phone1":"78387356","phone2":"7838733336","phone3":"347347737","cif_no":"767654563515"},
                {"phone1":"78387357","phone2":"7838733336","phone3":"347347737","cif_no":"767654563516"},
                {"phone1":"78387358","phone2":"7838733336","phone3":"347347737","cif_no":"767654563517"},
                {"phone1":"78387354","phone2":"7838733336","phone3":"347347737","cif_no":"767654563518"},
                {"phone1":"78387355","phone2":"7838733336","phone3":"347347737","cif_no":"767654563519"},
                {"phone1":"78387356","phone2":"7838733336","phone3":"347347737","cif_no":"767654563520"},
                {"phone1":"78387357","phone2":"7838733336","phone3":"347347737","cif_no":"767654563521"},
                {"phone1":"78387358","phone2":"7838733336","phone3":"347347737","cif_no":"767654563522"}
            ]
        }
    */

    // Remove all the customer in current setting; 

    const client = new Client(global.gConfig.connectionProps)
    client.connect()

    let sqlQuery = '';
    let SQLresult = {};
    var tag_code;
    var campaign_id;
    var defaultLeadId;

    let setArray = [];
    setArray["msg_type"] = req.body.msg_type;
    setArray["prompt_name"] = req.body.prompt_name;
    setArray["start_date"] = req.body.start_date;
    setArray["end_date"] = req.body.end_date;
    setArray["is_enabled"] = req.body.is_enabled;
    setArray["priority"] = req.body.priority;
    setArray["frequency"] = req.body.frequency;

    sqlQuery = `update custom_functional_message_module_settings set ${setArray.join(', ')} where tag_code = ${req.body.tag_code}`;

    console.log(`----> Query for settings update : ${sqlQuery}`);

    try {
        SQLresult = await client.query(sqlQuery);
    } catch (e) {
        console.error(e.stack)
    }



    // sqlQuery = `SELECT * FROM custom_functional_message_module_settings where id=${req.params.settingId}`;
    // console.log(sqlQuery);
    try {
        // SQLresult = await client.query(sqlQuery);
        // tag_code = SQLresult.rows[0].tag_code;
        tag_code = req.body.tag_code;
        campaign_id = req.body.campaign_id;
        defaultLeadId = await getDefaultLeadId(campaign_id);

        let customerAndCallbackRecords = [];
        try {

            let dataTableName = await getDataTableName(campaign_id);
            let sqlQuery = `select tag, phone1, segment, cif_no from ${dataTableName} where tag % ${tag_code} = 0`;
            SQLresult = await client.query(sqlQuery);
            console.log('---> SQL Query : ');
            console.log(sqlQuery);
            console.log('---> SQL Result : ');
            console.log(SQLresult.rows);
            for (let i = 0; i < SQLresult.rows.length; i++) {
                let customerRecord = {};
                let contact = {};
                contact['phone1'] = SQLresult.rows[i].phone1;
                contact['segment'] = SQLresult.rows[i].segment;
                contact['cif_no'] = SQLresult.rows[i].cif_no;
                contact['tag'] = SQLresult.rows[i].tag / tag_code;
                customerRecord['customerRecord'] = contact;
                customerAndCallbackRecords.push(contact);
                console.log(contact);
            }
            console.log("===> customerAndCallbackRecords : ");
            console.log(customerAndCallbackRecords);

        } catch (e) {
            console.error(e.stack)
        }


        try {


            // call CM api now;
            // now contact insertion..
            //------------------------------------

            let dataForUploadContacts = {
                "campaignId": Number(campaign_id),
                "leadId": Number(defaultLeadId),
                "customerRecords": customerAndCallbackRecords,
                "properties": {
                    "update.customer": true,
                    "migrate.customer": false
                }
            }

            console.log("===> dataForUploadContacts : ");
            console.log(JSON.stringify(dataForUploadContacts));

            let baseURL = global.gConfig.application_base_url;
            let CMHeaders = global.gConfig.CMHeaders;

            const getData = async (baseURL, dataForUploadContacts, CMHeaders) => {
                try {

                    const response = await axios({
                            method: 'post',
                            url: `/dacx/jsonCommand`,
                            baseURL: baseURL,
                            headers: CMHeaders,
                            data: {
                                "command": "remote.processor.voiceCampaignConfigurationService.uploadContacts",
                                "data": dataForUploadContacts
                            },

                            httpsAgent: new https.Agent({
                                rejectUnauthorized: false,
                                keepAlive: true,
                                keepAliveMsecs: 50000
                            }),
                            httpAgent: new http.Agent({
                                rejectUnauthorized: false
                            })
                        })
                        .then(function (response) {
                            console.log(inspect(response.data))
                            res.json({
                                msg: "Success",
                                data: response.data
                            });
                        });

                    client.end();

                } catch (error) {
                    console.log(error);
                    client.end();
                }
            };

            if(customerAndCallbackRecords != [])
                getData(baseURL, dataForUploadContacts, CMHeaders);

                console.log("------------------ Removed Contacts association with current tag, NOW UPDATING THE CONTACTS ---------------------------------");

        } catch (e) {
            console.error(e.stack)
            res.send({
                msg: 'Error ',
                data: 'Error while query postgres : Erro while updating details while disassociating the customer with tag, CM API CALL ISSUE'
            });
        }

    } catch (e) {
        console.error(e.stack)
        res.send({
            msg: 'Error ',
            data: 'Error while query postgres, error while deleting data of older tag_code customer'
        });
    }


    // add new customers in the same settings ( ie for same tag_code);
    //----------------------------------------------------------------------------------------------------------

    let body = req.body;
    let values = [];
    let addedCounter = 0;
    let failedToAddCounter = 0;
    let dataTableName = await getDataTableName(body.campaign_id);
    defaultLeadId = await getDefaultLeadId(body.campaign_id);
    let customerDataTableName = dataTableName ; // custom_functional_message_module_contacts
    console.log(customerDataTableName);

    // now contact insertion..
    //------------------------------------
    let contacts = req.body.contacts;
    console.log(`contacts: ${contacts}`);
    console.log(contacts);
    let lengthOfContacts = contacts.length;
    let customerAndCallbackRecords = [];

    console.log(`length of contacts: ${lengthOfContacts}`);

    Object.keys(contacts).forEach(async (key, index) => {
        console.log(`contacts at key ${key} : ${contacts[key]}`);
        let previoustTag = 1;
        let customerFound = false;

        console.log("-------------------------Quering Customer in the database-------------------");
        try {

            sqlQuery = `SELECT tag FROM ${customerDataTableName} where cif_no='${contacts[key].cif_no}'`;
            console.log(`sqlQuery : ${sqlQuery}`);

            SQLresult = await client.query(sqlQuery);
            
            console.log(`sqlResut : ${SQLresult.rows}`);
            if (SQLresult.rows.length > 0) {
                previoustTag = SQLresult.rows[0].tag;
                customerFound = true;
            }
            contacts[key].tag = tag_code * previoustTag;
            // contacts[key].segment = "1";

            let customerRecord = {};
            customerRecord['customerRecord'] = contacts[key];
            customerAndCallbackRecords.push(contacts[key]);

        } catch (e) {
            console.error(e.stack)
            res.send({
                msg: 'Error ',
                data: e
            });
        }

        if(index == lengthOfContacts - 1) {

            let dataForUploadContacts = {
                "campaignId": Number(body.campaign_id),
                "leadId": Number(defaultLeadId),
                "customerRecords": customerAndCallbackRecords,
                "properties": {
                    "update.customer": true,
                    "migrate.customer": false
                }
            }

            console.log(dataForUploadContacts);
            let baseURL =  global.gConfig.application_base_url;
            let CMHeaders = global.gConfig.CMHeaders; 

            const getData = async (baseURL, dataForUploadContacts, CMHeaders) => {
                try {

                    const response = await axios({
                            method: 'post',
                            url: `/dacx/jsonCommand`,
                            baseURL:baseURL,
                            headers: CMHeaders,
                            data: {
                                "command": "remote.processor.voiceCampaignConfigurationService.uploadContacts",
                                "data": dataForUploadContacts
                            },

                            httpsAgent: new https.Agent({rejectUnauthorized: false, keepAlive: true, keepAliveMsecs: 50000}),
                            httpAgent: new http.Agent({rejectUnauthorized: false})
                        })
                        .then(function (response) {
                            console.log(inspect(response.data))
                            res.json({msg:"Success", data: response.data});
                        });

                    client.end();

                } catch (error) {
                    console.log(error);
                    client.end();
                }
            };

            getData(baseURL, dataForUploadContacts, CMHeaders);

        }
    })

}




//-------- dt replica NOT needed (contacts won't be altered in this case)---------------------------------------
export const updateMultipleSetting = async (req, res) => {

    const client = new Client(global.gConfig.connectionProps)
    client.connect();

    let updatedCounter = 0;
    let failedToUpdateCounter = 0;

    for (let i = 0; i < req.body.length; i++) {
        let data = req.body[i];
        let values = [];
        let setArray = [];
        let counter = 0;
        let currentId = req.params.settingId;

        Object.keys(data).forEach((key, index) => {
            if (key == 'id') {
                currentId = data[key];
            } else {
                counter++;
                setArray.push(`${key} = $${counter}`);
                values.push(data[key]);
            }
        })

        let sqlQuery = `update custom_functional_message_module_settings set ${setArray.join(', ')} where id = ${currentId}`;

        try {
            let SQLresult = await client.query(sqlQuery, values);
            updatedCounter++;
        } catch (e) {
            console.error(e.stack)
            failedToUpdateCounter++;
        }
    }

    res.json({
        "Updated": updatedCounter,
        "FailedToUpdate": failedToUpdateCounter
    });
}



//-------- dt replica needed ---------------------------------------
export const deleteSetting = async (req, res) => {

    const client = new Client(global.gConfig.connectionProps)
    client.connect()

    let sqlQuery = '';
    let SQLresult = {};
    var tag_code;

    sqlQuery = `SELECT * FROM custom_functional_message_module_settings where id=${req.params.settingId}`;
    console.log(sqlQuery);
    try{
        let SQLresult = await client.query(sqlQuery);
            tag_code = SQLresult.rows[0].tag_code;
    } catch(e) {
        console.error(e.stack)
        res.send({ msg: 'Error ', data: 'Error while query postgres' });
    }

    sqlQuery = `DELETE FROM custom_functional_message_module_settings where id=${req.params.settingId}`;
    console.log(sqlQuery);
    try{
        let SQLresult = await client.query(sqlQuery);
    } catch(e) {
        console.error(e.stack)
        res.send({ msg: 'Error ', data: 'Error while query postgres' });
    }

    sqlQuery = `update custom_functional_message_module_contacts set tag = tag/${tag_code} where tag%${tag_code} = 0;`;
    console.log(sqlQuery);
    try{
        let SQLresult = await client.query(sqlQuery);
        console.log(SQLresult);
        client.end();
        res.json({ msg: 'Success ', contactsUpdated : SQLresult.rowCount, tagDeleted : tag_code });
    } catch(e) {
        console.error(e.stack)
        client.end();
        res.send({ msg: 'Error ', data: 'Error while query postgres' });
    }

}



export const deleteSetting_dt = async (req, res) => {

    // ToDo : Add the Handling to delete the Customer from the given list -------------------------------
    //---------------------------------------------------------------------------------------------------
    const client = new Client(global.gConfig.connectionProps)
    client.connect()

    let sqlQuery = '';
    let SQLresult = {};
    var tag_code;
    var campaign_id;
    var defaultLeadId;

    sqlQuery = `SELECT * FROM custom_functional_message_module_settings where id=${req.params.settingId}`;
    console.log(sqlQuery);
    try{
            SQLresult = await client.query(sqlQuery);
            tag_code = SQLresult.rows[0].tag_code;
            campaign_id = SQLresult.rows[0].campaign_id;
            defaultLeadId = await getDefaultLeadId(campaign_id);

            let customerAndCallbackRecords = [];
            try {

                    let dataTableName = await getDataTableName(campaign_id);
                    let sqlQuery = `select tag, phone1, segment, cif_no from ${dataTableName} where tag % ${tag_code} = 0`;
                    SQLresult = await client.query(sqlQuery);
                    console.log('SQL Query : ');console.log(sqlQuery);
                    console.log('SQL Result : ');console.log(SQLresult);
                    for(let i = 0; i <  SQLresult.rows.length; i++) {
                        let customerRecord = {};
                        let contact = {};
                        contact['phone1'] = SQLresult.rows[i].phone1;
                        contact['segment'] = SQLresult.rows[i].segment;
                        contact['cif_no'] = SQLresult.rows[i].cif_no;
                        contact['tag'] = SQLresult.rows[i].tag / tag_code;
                        customerRecord['customerRecord'] = contact;
                        customerAndCallbackRecords.push(contact);
                        console.log(contact);
                    }
                    console.log("customerAndCallbackRecords : ");
                    console.log(customerAndCallbackRecords);

            } catch (e) {
                console.error(e.stack)
            }

            sqlQuery = `DELETE FROM custom_functional_message_module_settings where id=${req.params.settingId}`;
            console.log(sqlQuery);
            try{
                let SQLresult = await client.query(sqlQuery);


                            // ---- call cm api now;
                            // now contact insertion..
                        //------------------------------------
                        console.log("------------------ DELETED SETTING NOW UPDATING THE CONTACTS ---------------------------------");

                        let dataForUploadContacts = {
                            "campaignId": Number(campaign_id),
                            "leadId": Number(defaultLeadId),
                            "customerRecords": customerAndCallbackRecords,
                            "properties": {
                                "update.customer": true,
                                "migrate.customer": false
                            }
                        }

                        console.log(dataForUploadContacts);

                        let baseURL =  global.gConfig.application_base_url;
                        let CMHeaders = global.gConfig.CMHeaders; 

                        const getData = async (baseURL, dataForUploadContacts, CMHeaders) => {
                            try {

                                const response = await axios({
                                    method: 'post',
                                    url: `/dacx/jsonCommand`,
                                    baseURL:baseURL,
                                    headers: CMHeaders,
                                    data: {
                                        "command": "remote.processor.voiceCampaignConfigurationService.uploadContacts",
                                        "data": dataForUploadContacts
                                    },
        
                                    httpsAgent: new https.Agent({rejectUnauthorized: false, keepAlive: true, keepAliveMsecs: 50000}),
                                    httpAgent: new http.Agent({rejectUnauthorized: false})
                                })
                                .then(function (response) {
                                    console.log(inspect(response.data))
                                    res.json({msg:"Success", data: response.data});
                                });

                                client.end();

                            } catch (error) {
                                console.log(error);
                                client.end();
                            }
                        };

                        getData(baseURL, dataForUploadContacts, CMHeaders);



            } catch(e) {
                console.error(e.stack)
                res.send({ msg: 'Error ', data: 'Error while query postgres' });
            }

    } catch(e) {
        console.error(e.stack)
        res.send({ msg: 'Error ', data: 'Error while query postgres' });
    }

    
}




function primeFactors(n){
    let factors = [];
    let divisor = 2;

    if(n == 2 )
        factors.push(2);

    while(n>2){
        if(n % divisor == 0){
            factors.push(divisor); 
            n= n/ divisor;
        }
        else{
        divisor++;
        }     
    }
    return factors;
}


function isPrime (num) {
    if (num <= 1) {
        return true
    } else if (num <= 3) {
        return true
    } else if (num%2 === 0 || num%3 === 0) {
        return false
    }

    let i = 5
    while (i*i <= num) {
        if (num%i === 0 || num%(i+2) === 0) {
            return false
        }
        i += 6
    }
    return true
}



async function getDataTableName(campaignId) {
    const client = new Client(global.gConfig.connectionProps);
    client.connect()      
    try{
        let sqlQuery = `select cc.id as camapign_id, cc.name as campaign_name, cc.type as camapign_type, (lower(dt.name) ||'_'||cc.process_id) as dt_name from (select * from campaign_context) as cc join data_table dt on cc.process_id = dt.process_id where cc.id = ${campaignId}`;
        let SQLresult = await client.query(sqlQuery);
        let dataTableName = SQLresult.rows[0].dt_name;
        client.end()
        return dataTableName;
    }
    catch(e) {
        console.error(e.stack)
        client.end();
        return 'Error quering DB for process name';
    }
}



async function getDefaultLeadId(campaignId) {
    let leadId = '';
    const client = new Client(global.gConfig.connectionProps);
    client.connect()      
    try{
        let sqlQuery = `select cld.campaign_context_id as camapign_id, cld.lead_id, cld.enabled, lead.name as lead_name from (select * from campaign_lead_details where campaign_context_id = ${campaignId}) as cld left join lead on cld.lead_id = lead.id`;
        let SQLresult = await client.query(sqlQuery);

        Object.keys(SQLresult.rows).forEach( (key,  index) => {
            if(SQLresult.rows[key].lead_name == 'DefaultLead') {
                leadId = SQLresult.rows[key].lead_id;
            }
        }) 
        client.end()
        return leadId;
    }
    catch(e) {
        console.error(e.stack)
        client.end();
        return 'Error quering DB for DefaultLead';
    }
}





