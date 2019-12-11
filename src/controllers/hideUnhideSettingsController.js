import axios from 'axios';
import https from 'https'
import http from 'http'
import {
    inspect
} from 'util'
const config = require('../config/config.js');
var FormData = require('form-data');
var fs = require('fs');

const {
    Client
} = require('pg')


export const getSettingForHideUnhide = async (req, res) => {

    var data = [];

    let sqlQuery = `select t1.*, t2.name, t2.type, t2.id as campaign_id from (select state.id, state.campaign_id, state.node_id, map.node_name, state.subnode_id, map.subnode_name, state.start_date::DATE , state.end_date::DATE , state.is_enabled, state.date_added, state.date_modified from custom_hide_unhide_module_state as state left join custom_hide_unhide_module_node_subnode_map as map on map.node_id  = state.node_id and map.subnode_id = state.subnode_id and map.campaign_id = state.campaign_id) as t1 left join campaign_context as t2 on t1.campaign_id = cast(t2.id as varchar) order by t1.date_added`;
    let values = [];

    const client = new Client(global.gConfig.connectionProps)
    client.connect();

    let SQLresult = await client.query(sqlQuery, values);
    for (let j = 0; j < SQLresult.rows.length; j++)
        data.push(SQLresult.rows[j]);


    let filteredData = [];
    let impurities = data.filter((element) => {
        return element.subnode_id == 'allOptions'
    });

    for (let i = 0; i < data.length; i++) {
        let shouldAdd = true;
        for (let j = 0; j < impurities.length; j++) {
            if (data[i].campaign_id == impurities[j].campaign_id && data[i].node_id == impurities[j].node_id && data[i].subnode_id != 'allOptions') {
                shouldAdd = false;
            }
        }
        if (shouldAdd) {
            filteredData.push(data[i]);
        }
    }

    let filteredDataLevel2 = [];
    for (let i = 0; i < filteredData.length; i++) {
        let startDate = new Date(filteredData[i].start_date);
        let endDate = new Date(filteredData[i].end_date);
        let currentDate = Date.now();

        if (filteredData[i].is_enabled = true && endDate > currentDate && startDate < currentDate) {
            filteredDataLevel2.push(filteredData[i]);
        }
    }


    res.json({
        msg: 'Success',
        data: filteredDataLevel2
    });
}
