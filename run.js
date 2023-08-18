const { uint256ToBN } = require("starknet/dist/utils/uint256");
const { callContract } = require("./call");
const express = require("express");
const cors = require('cors');
const mysql = require('mysql');
const { log } = require("console");
const { host, port, user, password, database } = require('./dbConfig');
const { Contract } = require('./config');

const config = {
    connectionLimit: 10000,
    host: host,
    port: port,
    user: user,
    password: password,
    database: database
};

let pool = mysql.createPool(config);

setTimeout(async function () {
    await pool.end();
    pool = await mysql.createPool(config);
}, 150000);

const name = "ERC-721";

const getData = async (
    starknetWalletAddress,
    starknetNetwork = "mainnet"
) => {
    const errorCode = 0;
    if (
        !starknetWalletAddress.startsWith("0x") || // Başında "0x" ile başlamalı
        !/^(0x)?[0-9a-fA-F]/.test(starknetWalletAddress) ||
        starknetWalletAddress.length < 5
    ) {
        return errorCode;
    }

    const result = await callContract({
        starknetNetwork,
        contractAddress: Contract,
        entrypoint: "balanceOf",
        calldata: [starknetWalletAddress],
    });
    const balance = uint256ToBN({ low: result[0], high: result[1] });
    if (balance >= 1) {
        return balance;
    }
    return balance;
};

async function Main() {
    pool.getConnection(function (err, connection) {
        if (err) throw err;
        const query = "SELECT * FROM `accounts`";
        connection.query(query, async (error, results, fields) => {
            if (error) {
                return;
            }

            for (const result of results) {
                const wallet = result.wallet;
                const response = await getData(wallet, "mainnet");

                if(Number(response) == 0 ){
                    const pointQuery = "UPDATE `accounts` SET  `status`=0 `count`=" + (Number(response))  + " WHERE wallet='"+result.wallet+"' "
                        
                    connection.query(pointQuery, async (error, results, fields) => {
                        if (error) {
                            return;
                        }
                        console.log(result.wallet+":: Update Point")

                    });
                }else{
                    if(Number(response) == result.count){
                        const pointQuery = "UPDATE `accounts` SET `point`=" + (Number(result.point)+Number(result.count))  + " WHERE wallet='"+result.wallet+"' "
                        
                        connection.query(pointQuery, async (error, results, fields) => {
                            if (error) {
                                return;
                            }
                            console.log(result.wallet+":: Update Point")
    
                        });
                    }else {
                        const updateQuery = "UPDATE `accounts` SET `count`="+Number(response)+" WHERE wallet='"+result.wallet+"'";
    
                        connection.query(updateQuery, async (error, results, fields) => {
                            if (error) {
                                return;
                            }
                        
                            const pointQuery2 = "UPDATE `accounts` SET `point`=" + (Number(result.point)+Number(response))  + " WHERE wallet='"+result.wallet+"' "
                            connection.query(updateQuery, async (error, results, fields) => {
                                if (error) {
                                    return;
                                }
                                console.log(result.wallet+":: Update Point")
                                
                        });  
                      }); 
                    }
                }
                
            }
            connection.release();
            if (err) throw err;
        });
    });
}

Main();
