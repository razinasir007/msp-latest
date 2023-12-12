
export function loadEnv(){

    const dotenv = require('dotenv');

    if (process.env.NODE_ENV === 'prod') {
        console.log("starting prod")
        dotenv.config({ path: '.env.prod' });
    }
    else if(process.env.NODE_ENV === 'qa'){
        console.log("starting dev")
        dotenv.config({ path: '.env.qa' });
    }
    else if(process.env.NODE_ENV === 'dev'){
        console.log("starting dev")
        dotenv.config({ path: '.env.dev' });
    } 
    else {
        console.log("starting local")
        dotenv.config({ path: '.env.local' });
    }
}