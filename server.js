'use strict';

const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');
const app = express();

require('dotenv').config();

app.set('view engine', 'ejs');
app.use(cors());
app.use(express.static('./public'));
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3030;

// const client = new pg.Client(process.env.DATABASE_URL);
const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

app.use(methodOverride('_method'));


app.get('/', homePage);
app.get('/getCountryResult', getCountryResultHandle);
app.get('/AllCountries', AllCountriesHandle);
app.post('/MyRecords', MyRecordsHandle);
app.get('/MyRecords', MyRecordsResult);
app.post('/RecordDetails/:id', recordHandle);
app.delete('/delete/:id', deleteHandle);




function homePage(req, res) {
    let url = `https://api.covid19api.com/world/total`;
    superagent.get(url)
        .then(result => {
            res.render('pages/index', { data: result.body });

        })
}

function getCountryResultHandle(req, res) {
    let { country, from, to } = req.query;
    let url = `https://api.covid19api.com/country/${country}/status/confirmed?from=${from}T00:00:00Z&to=${to}T00:00:00Z`;

    superagent.get(url)
        .then(result => {
            let newArray = result.body.map(val => {
                return new Covid(val);
            })
            res.render('pages/getCountryResult', { data: newArray });
        })

}

function AllCountriesHandle(req, res) {
    let url = `https://api.covid19api.com/summary`;
    superagent.get(url)
        .then(result => {
            let arrayNew = result.body.Countries.map(val => {
                return new All(val);
            })
            res.render('pages/AllCountries', { data: arrayNew });
        })
}

function MyRecordsHandle(req, res) {
    let sql = `insert into counrty (country,totalconfirmed,totaldeaths,totalrecovered,date) values ($1,$2,$3,$4,$5) returning id; `;
    let { country, totalconfirmed, totaldeaths, totalrecovered, date } = req.body;
    let values = [country, totalconfirmed, totaldeaths, totalrecovered, date];
    client.query(sql, values)
        .then(result => {
            res.redirect('/MyRecords');
        })
}
function MyRecordsResult(req, res) {
    let sql = `select * from counrty;`
    client.query(sql)
        .then(result => {
            res.render('pages/MyRecords', { data: result.rows });
        })
}

function recordHandle(req, res) {
    let sql = `select * from counrty where id=$1;`
    let id = req.params.id;
    let value = [id];
    client.query(sql, value)
        .then(result => {
            res.render('pages/RecordDetails', { data: result.rows[0] });
        })
}

function deleteHandle(req, res) {
    let sql = `delete from counrty where id=$1; `
    let value = [req.params.id];
    client.query(sql, value)
        .then(result => {
            res.redirect('/MyRecords');
        })
}

function All(data) {
    this.country = data.Country;
    this.totalconfirmed = data.TotalConfirmed;
    this.totaldeaths = data.TotalDeaths;
    this.totalrecovered = data.TotalRecovered;
    this.date = data.Date;
}

function Covid(data) {
    this.date = data.Date;
    this.cases = data.Cases;
}



client.connect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Listening on port ${PORT}`);
        })
    })