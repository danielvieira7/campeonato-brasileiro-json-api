'use strict';

const cheerio = require('cheerio');
const find = require('cheerio-eq');
const got = require('got');
const fs = require('fs');

var express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const url= 'https://www.cbf.com.br/futebol-brasileiro/competicoes/campeonato-brasileiro-serie-a/2020';

app.get("/", (req, res) => {
    ( async () => {
        var dados = await getData()
        console.log("lista: ", dados)
        res.json(dados);
    })();
});

app.get("/create-json", (req, res) => {
    ( async () => {
        
        var dados = await getData()
        let today = new Date().toISOString().slice(0, 10)
        console.log("lista: ", dados)
        
        fs.copyFile('campeonato-brasileiro.json', 'tabelas/campeonato-brasileiro-'+today+'.json', (err) => {
            if (err) throw err;
            console.log('Json Copiado para: ' + 'tabelas/campeonato-brasileiro-'+today+'.json');
            res.send("Json Copiado para: " + 'tabelas/campeonato-brasileiro-'+today+'.json')
        });

        fs.writeFile('campeonato-brasileiro.json', JSON.stringify(dados), (err) => {
            if (err) throw err;
            console.log('Json criado em: ' + 'tabelas/campeonato-brasileiro.json');
            res.send("Json criado em: " + 'tabelas/campeonato-brasileiro.json')
        });
        
    })();
});

app.get("/teste", (req, res) => {
    var exec = require('child_process').exec;
    var cmd = 'git add . && git commit -m "Tabela do Campeonato Brasileiro em JSON" && git push';

    exec(cmd, function(error, stdout, stderr) {
        console.log('error', error);
        console.log('stdout ', stdout);
        console.log('stderr ', stderr);
    }); 
})

async function getData() {
    // ( () => {
        const response = await got(url);
        const $ = cheerio.load(response.body);
    
        var lista = [];
        var time = {}
        $(".tabela-expandir tbody tr.expand-trigger").map((idx, el) => {
            
            time.nome = $(el).find('td span.hidden-xs').text();
            time.pontos = $(el).find('th').text();
            time.jogos = $(el).find('td').eq(1).text();
            time.vitorias = $(el).find('td').eq(2).text();
            time.empates = $(el).find('td').eq(3).text();
            time.derrotas = $(el).find('td').eq(4).text();
            time.gols_pro = $(el).find('td').eq(5).text();
            time.gols_contra = $(el).find('td').eq(6).text();
            time.saldo_gols = $(el).find('td').eq(7).text();
            time.cartoes_amarelo = $(el).find('td').eq(8).text();
            time.cartoes_vermelhos = $(el).find('td').eq(9).text();
            time.aproveitamento = $(el).find('td').eq(10).text();
            time.recentes = $(el).find('td').eq(11).find("span").text();
            time.proximo_adversario = $(el).find('td').eq(12).find("img").attr('title');
    
            lista.push(JSON.parse(JSON.stringify(time)));
        })
        
        return lista
    // })();
}

app.listen(3000, () => {
    console.log(`Server is running`);
});