import axios from 'axios';
import https from 'https'
import http from 'http'
import { inspect } from 'util'
const config = require('../config/config.js');
var FormData = require('form-data');
var fs = require('fs');

//import JSON from 'circular-json'

const { Client } = require('pg')


export const getContacts = (req, res) => {

    let sqlQuery = '';
    let values = [];
    if ((req.query.searchable != undefined && req.query.searchable != null)) {
        sqlQuery = `SELECT * FROM custom_functional_message_module_contacts where ${req.query.searchable}='${req.query.value}'`;
    } else {
        sqlQuery = 'SELECT * FROM custom_functional_message_module_contacts';
    }

    const client = new Client(connectionProps)

    client.connect()
    client.query(sqlQuery, values)
        .then(SQLresult => {
            res.json({
                msg: null,
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

export const getContactWithID = (req, res) => {

    let sqlQuery = `SELECT * FROM custom_functional_message_module_contacts where id='${req.params.contactId}'`;
    let values = [];

    const client = new Client(connectionProps)

    client.connect()
    client.query(sqlQuery, values)
        .then(SQLresult => {
            res.json({
                msg: null,
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

}


export const getContactWithTagID = async (req, res) => {

    const client = new Client(global.gConfig.connectionProps)
    client.connect()

    let sqlQuery = '';
    let SQLresult = {};
    var tag_code;
    var campaign_id;
    var defaultLeadId;
    let CustomerData = [];

    try {

        let dataTableName = await getDataTableName(campaign_id);
        let sqlQuery = `select tag, phone1, segment, cif_no from ${dataTableName} where tag % ${tag_code} = 0`;
        SQLresult = await client.query(sqlQuery);
        console.log('---> SQL Query : ');
        console.log(sqlQuery);
        console.log('---> SQL Result : ');
        console.log(SQLresult.rows);
        for (let i = 0; i < SQLresult.rows.length; i++) {
            let contact = {};
            contact['phone1'] = SQLresult.rows[i].phone1;
            contact['segment'] = SQLresult.rows[i].segment;
            contact['cif_no'] = SQLresult.rows[i].cif_no;
            CustomerData.push(contact);
        }
        console.log("===> CustomerData : ");
        console.log(CustomerData);

    } catch (e) {
        console.error(e.stack)
    }

    res.json({
        msg: "Success",
        data: response.data
    });

}



export const addNewContact = async (req, res) => {

    let body = req.body;
    let addedCounter = 0;
    let failedToAddCounter = 0;

    const client = new Client(connectionProps)
    client.connect();

    for (let i = 0; i < body.length; i++) {
        try {
            let data = body[i];
            let sqlQuery = `insert into custom_functional_message_module_contacts(phone1, phone2, phone3, cif_no, tag) values($1, $2, $3, $4, $5)`;
            let values = [data.phone1, data.phone2, data.phone3, data.cif_no, data.tag];
            await client.query(sqlQuery, values);
            addedCounter++;
        } catch (e) {
            console.log(e);
            failedToAddCounter++;
        }
    }

    res.json({
        "Added": addedCounter,
        "FailedToAdd": failedToAddCounter
    });

};


export const updateContact = (req, res) => {
    // Contact.findOneAndUpdate({ _id: req.params.contactId}, req.body, { new: true }, (err, contact) => {
    //     if (err) {
    //         res.send(err);
    //     }
    //     res.json(contact);
    // })
}

export const deleteContact = (req, res) => {

    let sqlQuery = `DELETE FROM custom_functional_message_module_contacts where id='${req.params.contactId}'`;
    let values = [];

    const client = new Client(connectionProps)

    client.connect()
    client.query(sqlQuery, values)
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

}