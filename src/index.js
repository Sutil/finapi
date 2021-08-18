const express = require('express');
const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(express.json());

const customers = []

function verifyAccountExists(request, response, next) {
    const { cpf } = request.headers;
    const findedCustomer = customers.find(customer => customer.cpf === cpf);

    if(!findedCustomer) {
        return response.status(400).send({error: "Customer not found."})
    }

    request.customer = findedCustomer;
    return next();
}

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

app.get('/statement', verifyAccountExists, (request, response) => {
    const customer = request.customer;
    return response.json(customer.statement);
});

app.post('/deposit', verifyAccountExists, (request, response) => {
    const { description, amount } = request.body;
    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: 'credit'
    };

    customer.statement.push(statementOperation);
    return response.status(201).send();
})

app.listen(3333);