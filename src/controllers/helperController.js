const { Client } = require('pg')
const config = require('../config/config.js');


export const getHelper = async (req, res) => {

    let helperType = req.params.helperType;
    let id = req.params.id;
    let sqlQuery = '';
    let values = [];

    if (helperType == 'campaignList') {
        sqlQuery = 'select id, name, type from campaign_context order by name';
    } else if (helperType == 'campaignVoicePromptMap') {
        sqlQuery = 'select id, context_id as campaign_id, name, file_name from voice_prompts';
        if (id != null)
            sqlQuery = `select id, context_id as campaign_id, name, file_name from voice_prompts where context_id = ${id}`;
    } else
        res.send({
            msg: 'Error ',
            data: 'No route for /helper'
        });


    const client = new Client(global.gConfig.connectionProps);
    client.connect();

    try {
        let SQLresult = await client.query(sqlQuery, values);
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
