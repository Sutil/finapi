const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(express.json());

const customers = []

/**
 * cpf - string
 * name - string 
 * id -uuid
 * statement - [].
 */
app.post('/account', (request, response) => {
    const { cpf, name } = request.body;
    const uuid = uuidv4();

    customers.push({cpf, name, uuid, statement: []});

    return response.status(201).send();
    
})

app.get('/', (req, res) => {
    return res.send("Hello world!")
});

app.listen(3333);