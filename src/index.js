const { response, json } = require('express');
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

function getBalance(statement) {
    return statement.reduce((acc, operation) => {
        if(operation.type === 'credit') {
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0);
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
});

app.post('/withdraw', verifyAccountExists, (request, response) => {
    const { amount } = request.body;
    const { customer } = request;

    if(getBalance(customer.statement) < amount) {
        return response.status(400).json({error: "Insufficient funds!"});
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: 'debit'
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();

});

app.get('/statement/date', verifyAccountExists, (request, response) => {
    const { customer } = request;
    const { date } = request.query;

    const dateFormat = date + ' 00:00';

    const statement = customer.statement
        .filter(
            s => s.created_at.toDateString() === new Date(dateFormat).toDateString());    

    return response.json(statement);
});

app.put('/account', verifyAccountExists, (request, response) => {
    const { customer } = request;
    const { name } = request.body;
    
    customer.name = name;

    return response.status(204).send()

});

app.get('/account', verifyAccountExists, (request, response) => {
    const { customer } = request;

    return response.json(customer);
});

app.delete('/account', verifyAccountExists, (request, response) => {
    const { customer } = request;
    const idx = customers.findIndex(c => c.cpf === customer.cpf);

    customers.splice(idx, 1);
    return response.status(204).send();
});

app.get('/balance', verifyAccountExists, (request, response) => {
    const { customer } = request;

    const balance = getBalance(customer.statement);

    return response.json(balance);
})



app.listen(3333);