import { 
    addNewSetting,
    addNewSetting_dt,
    getSettings, 
    getSettings_dt, 
    getSettingWithId,
    getSettingWithTagCode, 
    updateSetting,
    updateSetting_dt,
    updateMultipleSetting,
    deleteSetting,
    deleteSetting_dt
} from '../controllers/settingController';
//const config = require('../config/config.js');
import {
    getSettingForHideUnhide
} from '../controllers/hideUnhideSettingsController'
//console.log(global.gConfig);

const settingRoutes = (app) => {
    
    app.route('/setting')
        .get((req, res, next) => {
            // middleware
            console.log(`Request from: ${req.originalUrl}`)
            console.log(`Request type: ${req.method}`)
            next();
        }, global.gConfig.customerTable == 'customTable' ? getSettings : getSettings_dt)
        
        // POST endpoint
        .post( (req,res,next) => {
            // middleware
            console.log(`Request from: ${req.originalUrl}`);
            console.log(`Request from: ${req.method}`);
            //console.log(req);
            next();
        } , global.gConfig.customerTable == 'customTable' ? addNewSetting : addNewSetting_dt)
        
        // put request
        .put(updateMultipleSetting);


    app.route('/setting/:settingId')
        // get Settings For Id
        .get(getSettingWithId)
        
        // put request
        .put(global.gConfig.customerTable == 'customTable' ? updateSetting : updateSetting_dt)

        // delete request
        .delete(global.gConfig.customerTable == 'customTable' ? deleteSetting : deleteSetting_dt);

    app.route('/settingfortag/:tagId')
    // get Settings For TagCode
    .get(getSettingWithTagCode);

    app.route('/hideunhidesetting')
    // get settings for hideunhide module
    .get(getSettingForHideUnhide);

}

export default settingRoutes;
