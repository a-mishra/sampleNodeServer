import { 
    getHelper
} from '../controllers/helperController';

const helperRoutes = (app) => {
    
    app.route('/helper/:helperType')
        .get((req, res, next) => {
            // middleware
            console.log(`Request from: ${req.originalUrl}`)
            console.log(`Request type: ${req.method}`)
            next();
        }, getHelper);

    app.route('/helper/:helperType/:id')
    .get((req, res, next) => {
        // middleware
        console.log(`Request from: ${req.originalUrl}`)
        console.log(`Request type: ${req.method}`)
        next();
    }, getHelper);


    
}

export default helperRoutes;
