const swaggerAutogen = require('swagger-autogen');

const doc = {
    info: {
        title:"The Pet Store Backend",
        description:"This is The Pet Store"
    },
    host:"192.168.0.162",
    schemes:['http']
}

const outputFile = './swagger-output.json'
const endPonintFiles = ['../index.js']

swaggerAutogen(outputFile,endPonintFiles,doc).then(()=>{
    require('../index.js')
})