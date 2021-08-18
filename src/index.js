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
    
    const accountAlreadyExists = customers.some(customer => customer.cpf === cpf);

    if(accountAlreadyExists) {
        return response.status(400).send({error: "Customer already exists!"})
    }

    customers.push({
        cpf, 
        name, 
        id: uuidv4(), 
        statement: []});

    return response.status(201).send();
    
})

app.get('/statement/:cpf', (request, response) => {
    
    const { cpf } = request.params;

    const findedCustomer = customers.find(customer => customer.cpf === cpf);

    return response.json(findedCustomer.statement);
});

app.listen(3333);